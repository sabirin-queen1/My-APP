const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Worker = require('../models/Worker');
const Contract = require('../models/Contract');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const { protect, adminOnly } = require('../middleware/auth');

// Dashboard stats
router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    const totalWorkers = await Worker.countDocuments();
    const totalHouseholds = await User.countDocuments({ role: 'household' });
    const totalContracts = await Contract.countDocuments();
    const totalReviews = await Review.countDocuments();
    const pendingVerifications = await Worker.countDocuments({ verificationStatus: 'pending' });
    const activeContracts = await Contract.countDocuments({ status: 'active' });
    res.json({
      totalUsers: totalHouseholds + totalWorkers,
      totalWorkers, totalHouseholds, totalContracts,
      totalReviews, pendingVerifications, activeContracts, reports: totalContracts
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get all users (households + workers combined)
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const households = await User.find({ role: 'household' }).select('-password').lean();
    const workers = await Worker.find().select('-password').lean();
    const allUsers = [
      ...households.map(u => ({ ...u, userType: 'household' })),
      ...workers.map(w => ({ ...w, userType: 'worker' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(allUsers);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get all workers
router.get('/workers', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.verificationStatus = status;
    const workers = await Worker.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ workers, total: workers.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get all households
router.get('/households', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: 'household' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get all contracts (admin view)
router.get('/contracts', protect, adminOnly, async (req, res) => {
  try {
    const contracts = await Contract.find()
      .populate('household', 'name email')
      .populate('worker', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json(contracts);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get all reviews (admin view)
router.get('/reviews', protect, adminOnly, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('household', 'name email')
      .populate('worker', 'name email')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get pending verifications
router.get('/verifications', protect, adminOnly, async (req, res) => {
  try {
    const workers = await Worker.find({ verificationStatus: 'pending' }).select('-password').sort({ createdAt: -1 });
    res.json(workers);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Verify or reject worker
router.put('/workers/:id/verify', protect, adminOnly, async (req, res) => {
  try {
    const { action } = req.body;
    const isVerified = action === 'approve';
    const worker = await Worker.findByIdAndUpdate(
      req.params.id,
      { isVerified, verificationStatus: isVerified ? 'verified' : 'rejected' },
      { new: true }
    ).select('-password');
    if (isVerified) {
      await Notification.create({
        recipient: worker._id, recipientModel: 'Worker',
        type: 'worker_verified', title: 'Profile Verified',
        message: 'Your profile has been verified by admin. You are now visible to families.',
        isImportant: true
      });
    }
    res.json(worker);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete household user
router.delete('/households/:id', protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Contract.updateMany({ household: req.params.id }, { status: 'cancelled' });
    await Notification.deleteMany({ recipient: req.params.id, recipientModel: 'User' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete worker
router.delete('/workers/:id', protect, adminOnly, async (req, res) => {
  try {
    await Worker.findByIdAndDelete(req.params.id);
    await Contract.updateMany({ worker: req.params.id }, { status: 'cancelled' });
    await Review.deleteMany({ worker: req.params.id });
    await Notification.deleteMany({ recipient: req.params.id, recipientModel: 'Worker' });
    res.json({ message: 'Worker deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete contract (admin)
router.delete('/contracts/:id', protect, adminOnly, async (req, res) => {
  try {
    await Contract.findByIdAndDelete(req.params.id);
    res.json({ message: 'Contract deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete review (admin)
router.delete('/reviews/:id', protect, adminOnly, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (review) {
      const allReviews = await Review.find({ worker: review.worker });
      const avg = allReviews.length ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length : 0;
      await Worker.findByIdAndUpdate(review.worker, { rating: Math.round(avg * 10) / 10, totalReviews: allReviews.length });
    }
    res.json({ message: 'Review deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Toggle user active status
router.put('/households/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save();
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Toggle worker active status
router.put('/workers/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    worker.isActive = !worker.isActive;
    await worker.save();
    res.json(worker);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Seed admin
router.post('/seed', async (req, res) => {
  try {
    const existing = await User.findOne({ role: 'admin' });
    if (existing) return res.status(400).json({ message: 'Admin already exists' });
    await User.create({ name: 'Admin', email: 'admin@homecare.so', password: 'admin123456', role: 'admin', isVerified: true });
    res.json({ message: 'Admin created: admin@homecare.so / admin123456' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
