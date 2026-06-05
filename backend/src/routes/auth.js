const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Worker = require('../models/Worker');

const generateToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// Register Household
router.post('/register/household', async (req, res) => {
  try {
    const { name, email, password, phone, location } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, phone, location, role: 'household' });
    const token = generateToken(user._id, 'household');
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Register Worker
router.post('/register/worker', async (req, res) => {
  try {
    const { name, email, password, phone, skills, jobTypes, experience, salary, nationality, languages, bio } = req.body;
    const existing = await Worker.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const worker = await Worker.create({ name, email, password, phone, skills, jobTypes, experience, salary, nationality, languages, bio });
    const token = generateToken(worker._id, 'worker');
    res.status(201).json({ token, user: { id: worker._id, name: worker.name, email: worker.email, role: 'worker' } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    let user;
    let userRole;

    if (role === 'worker') {
      user = await Worker.findOne({ email });
      userRole = 'worker';
    } else if (role === 'admin') {
      user = await User.findOne({ email, role: 'admin' });
      userRole = 'admin';
    } else {
      user = await User.findOne({ email, role: 'household' });
      userRole = 'household';
    }

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isActive) return res.status(403).json({ message: 'Account is deactivated' });

    const token = generateToken(user._id, userRole);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: userRole, isVerified: user.isVerified }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
  res.json({ user: req.user, role: req.userType });
});

module.exports = router;
