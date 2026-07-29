const mongoose = require('mongoose');

const emergencyAlertSchema = new mongoose.Schema({
  code: { type: String, enum: ['Blue', 'Red', 'Trauma'], required: true },
  triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: String,
  description: String,
  status: { type: String, enum: ['Active', 'Responding', 'Resolved'], default: 'Active' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmergencyAlert', emergencyAlertSchema);
