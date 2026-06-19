const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  household: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker', required: true },
  jobType: { type: String, required: true },
  duties: { type: String, default: '' }, // description of the work / job duties
  salary: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  contractPeriod: { type: String },
  termsAndConditions: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled', 'expired'],
    default: 'pending'
  },
  familySignature: { type: String, default: '' },
  workerSignature: { type: String, default: '' },
  familySigned: { type: Boolean, default: false },
  workerSigned: { type: Boolean, default: false },
  confirmedAt: { type: Date },
  notes: { type: String, default: '' },
}, { timestamps: true });

contractSchema.virtual('isExpired').get(function () {
  return this.endDate < new Date();
});

module.exports = mongoose.model('Contract', contractSchema);
