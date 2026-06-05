const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Worker = require('../models/Worker');
const { protect } = require('../middleware/auth');

// Get chat history between two users
router.get('/:otherId', protect, async (req, res) => {
  try {
    const chatId = Message.getChatId(req.user._id.toString(), req.params.otherId);
    const messages = await Message.find({ chatId }).sort({ createdAt: 1 }).limit(200);

    // Mark messages from other user as read
    await Message.updateMany(
      { chatId, sender: req.params.otherId, isRead: false },
      { isRead: true }
    );

    // Get other user info
    let otherUser = await User.findById(req.params.otherId).select('name avatar role');
    if (!otherUser) otherUser = await Worker.findById(req.params.otherId).select('name avatar');

    res.json({ messages, otherUser, chatId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send a message
router.post('/:otherId', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Message cannot be empty' });

    const chatId = Message.getChatId(req.user._id.toString(), req.params.otherId);
    const message = await Message.create({
      chatId,
      sender: req.user._id,
      senderModel: req.userType === 'worker' ? 'Worker' : 'User',
      senderName: req.user.name,
      text: text.trim(),
    });

    // Emit via socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(req.params.otherId).emit('new_message', {
        ...message.toObject(),
        chatId,
      });
    }

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all conversations for current user
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // Get all unique chatIds where this user is part of
    const messages = await Message.aggregate([
      { $match: { chatId: { $regex: userId } } },
      { $sort: { createdAt: -1 } },
      { $group: {
        _id: '$chatId',
        lastMessage: { $first: '$text' },
        lastTime: { $first: '$createdAt' },
        lastSender: { $first: '$sender' },
        unreadCount: {
          $sum: { $cond: [{ $and: [{ $ne: ['$sender', req.user._id] }, { $eq: ['$isRead', false] }] }, 1, 0] }
        }
      }},
      { $sort: { lastTime: -1 } }
    ]);

    // Resolve other user info
    const conversations = await Promise.all(messages.map(async (m) => {
      const ids = m._id.split('_');
      const otherId = ids[0] === userId ? ids[1] : ids[0];
      let otherUser = await User.findById(otherId).select('name avatar role').lean();
      if (!otherUser) {
        const worker = await Worker.findById(otherId).select('name avatar').lean();
        otherUser = worker ? { ...worker, role: 'worker' } : { name: 'Unknown', role: 'unknown' };
      }
      return {
        chatId: m._id,
        otherUser: { _id: otherId, ...otherUser },
        lastMessage: m.lastMessage,
        lastTime: m.lastTime,
        unreadCount: m.unreadCount,
      };
    }));

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
