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
    if (existing) return res.status(400).json({ message: 'This email is already registered. Please use a different one.' });
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
    const { name, email, password, phone, skills, jobTypes, experience, salary, nationality, languages, bio, idNumber, guarantor } = req.body;

    // Email must be unique across workers
    const existing = await Worker.findOne({ email });
    if (existing) return res.status(400).json({ message: 'This email is already registered. Please use a different one.' });

    // Guarantor (damiin) is required for workers
    if (!guarantor || !guarantor.name?.trim() || !guarantor.idName?.trim() || !guarantor.idNumber?.trim()) {
      return res.status(400).json({ message: 'Guarantor name, ID name, and ID number are required.' });
    }

    // The name written for the guarantor must match the name on the guarantor's ID
    const normalize = (s) => s.trim().toLowerCase().replace(/\s+/g, ' ');
    if (normalize(guarantor.name) !== normalize(guarantor.idName)) {
      return res.status(400).json({ message: 'Guarantor name does not match the name on the ID. Registration rejected.' });
    }

    const worker = await Worker.create({
      name, email, password, phone, skills, jobTypes, experience, salary,
      nationality, languages, bio, idNumber, guarantor
    });
    const token = generateToken(worker._id, 'worker');
    res.status(201).json({ token, user: { id: worker._id, name: worker.name, email: worker.email, role: 'worker' } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login — auto-detects the role from the account (no role selection needed)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Look the email up across all account types and pick whichever matches
    let user = null;
    let userRole = null;

    const userAccount = await User.findOne({ email }); // household or admin
    if (userAccount) {
      user = userAccount;
      userRole = userAccount.role; // 'household' or 'admin'
    } else {
      const workerAccount = await Worker.findOne({ email });
      if (workerAccount) {
        user = workerAccount;
        userRole = 'worker';
      }
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
