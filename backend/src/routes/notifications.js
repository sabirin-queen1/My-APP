const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// Get notifications
router.get('/', protect, async (req, res) => {
  try {
    const model = req.userType === 'worker' ? 'Worker' : 'User';
    const { filter } = req.query;
    let query = { recipient: req.user._id, recipientModel: model };
    if (filter === 'unread') query.isRead = false;
    if (filter === 'important') query.isImportant = true;

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, recipientModel: model, isRead: false });
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark all as read
router.put('/read-all', protect, async (req, res) => {
  try {
    const model = req.userType === 'worker' ? 'Worker' : 'User';
    await Notification.updateMany({ recipient: req.user._id, recipientModel: model }, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
