const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true },
  userModel: { type: String, enum: ['User', 'Worker'], required: true },
  userName: { type: String },
  userRole: { type: String }, // household / worker
  type: { type: String, enum: ['deposit', 'commission'], required: true },
  amount: { type: Number, required: true },        // amount of this transaction
  balanceAfter: { type: Number },                  // wallet balance after the transaction
  contract: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' }, // for commission payments
  note: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
