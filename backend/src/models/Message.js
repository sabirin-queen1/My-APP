const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: { type: String, required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, required: true },
  senderModel: { type: String, enum: ['User', 'Worker'], required: true },
  senderName: { type: String },
  text: { type: String, required: true, maxlength: 1000 },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

// chatId = sorted combo of both user IDs e.g. "id1_id2"
messageSchema.statics.getChatId = function (id1, id2) {
  return [id1, id2].sort().join('_');
};

module.exports = mongoose.model('Message', messageSchema);
