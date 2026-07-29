const mongoose = require('mongoose');

const vitalSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bloodPressure: { systolic: Number, diastolic: Number },
  heartRate: Number,
  temperature: Number,
  oxygenSaturation: Number,
  bloodSugar: Number,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vital', vitalSchema);
