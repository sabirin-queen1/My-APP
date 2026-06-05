const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Worker = require('../models/Worker');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// Create review
router.post('/', protect, async (req, res) => {
  try {
    if (req.userType !== 'household') return res.status(403).json({ message: 'Only households can leave reviews' });
    const { worker, rating, comment, contract } = req.body;

    const existing = await Review.findOne({ household: req.user._id, worker, contract });
    if (existing) return res.status(400).json({ message: 'Review already submitted for this contract' });

    const review = await Review.create({ household: req.user._id, worker, rating, comment, contract });

    // Update worker's average rating
    const allReviews = await Review.find({ worker });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Worker.findByIdAndUpdate(worker, { rating: Math.round(avgRating * 10) / 10, totalReviews: allReviews.length });

    await Notification.create({
      recipient: worker, recipientModel: 'Worker',
      type: 'new_review', title: 'New Review Received',
      message: `You received a new ${rating}-star review.`,
      relatedId: review._id, relatedModel: 'Review'
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get reviews for a worker
router.get('/worker/:workerId', async (req, res) => {
  try {
    const reviews = await Review.find({ worker: req.params.workerId, isVisible: true })
      .populate('household', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
