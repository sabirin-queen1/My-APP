const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, required: true },
  recipientModel: { type: String, enum: ['User', 'Worker'], required: true },
  type: {
    type: String,
    enum: ['contract_expiry', 'new_job_request', 'worker_verified', 'new_review', 'contract_confirmed', 'contract_cancelled', 'job_request'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  isImportant: { type: Boolean, default: false },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  relatedModel: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
