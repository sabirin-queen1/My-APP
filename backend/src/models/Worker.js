const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const workerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String },
  avatar: { type: String, default: '' },
  nationality: { type: String, default: 'Somalia' },
  languages: [{ type: String }],
  location: { type: String, default: 'Mogadishu, Somalia' },
  skills: [{
    type: String,
    enum: ['Cleaning', 'Cooking', 'Child Care', 'Laundry', 'Ironing', 'Elder Care', 'Gardening', 'Security']
  }],
  jobTypes: [{
    type: String,
    enum: ['House Cleaning', 'Cooking', 'Babysitter', 'Nanny', 'Driver', 'Gardener', 'Security Guard', 'Elder Care']
  }],
  experience: { type: Number, default: 0 },
  salary: {
    min: { type: Number, default: 150 },
    max: { type: Number, default: 300 },
    currency: { type: String, default: 'USD' }
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  isAvailable: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  bio: { type: String, default: '' },
  idDocument: { type: String, default: '' },
}, { timestamps: true });

workerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

workerSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Worker', workerSchema);
