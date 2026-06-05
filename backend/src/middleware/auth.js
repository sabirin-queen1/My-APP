const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Worker = require('../models/Worker');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === 'worker') {
      req.user = await Worker.findById(decoded.id).select('-password');
      req.userType = 'worker';
    } else {
      req.user = await User.findById(decoded.id).select('-password');
      req.userType = decoded.role || 'household';
    }
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (err) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.userType !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const workerOnly = (req, res, next) => {
  if (req.userType !== 'worker') {
    return res.status(403).json({ message: 'Worker access required' });
  }
  next();
};

module.exports = { protect, adminOnly, workerOnly };
