const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const { protect, workerOnly } = require('../middleware/auth');

// Search & filter workers (public)
router.get('/', async (req, res) => {
  try {
    const { jobType, location, salaryMin, salaryMax, contractPeriod, skills, page = 1, limit = 10 } = req.query;
    const filter = { isVerified: true, isActive: true, isAvailable: true };

    if (jobType) filter.jobTypes = { $in: [jobType] };
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (skills) filter.skills = { $in: Array.isArray(skills) ? skills : [skills] };
    if (salaryMin || salaryMax) {
      filter['salary.min'] = {};
      if (salaryMin) filter['salary.min'].$gte = Number(salaryMin);
      if (salaryMax) filter['salary.max'] = { $lte: Number(salaryMax) };
    }

    const total = await Worker.countDocuments(filter);
    const workers = await Worker.find(filter)
      .select('-password')
      .sort({ rating: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ workers, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single worker
router.get('/:id', async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id).select('-password');
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    res.json(worker);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update worker profile
router.put('/profile', protect, workerOnly, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    delete updates.isVerified;
    delete updates.verificationStatus;
    const worker = await Worker.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password');
    res.json(worker);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get worker dashboard stats
router.get('/dashboard/stats', protect, workerOnly, async (req, res) => {
  try {
    const Contract = require('../models/Contract');
    const Review = require('../models/Review');
    const Notification = require('../models/Notification');

    const activeContracts = await Contract.countDocuments({ worker: req.user._id, status: 'active' });
    const totalContracts = await Contract.countDocuments({ worker: req.user._id });
    const reviews = await Review.find({ worker: req.user._id }).sort({ createdAt: -1 }).limit(5);
    const unreadNotifications = await Notification.countDocuments({ recipient: req.user._id, recipientModel: 'Worker', isRead: false });

    res.json({ activeContracts, totalContracts, rating: req.user.rating, totalReviews: req.user.totalReviews, recentReviews: reviews, unreadNotifications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
