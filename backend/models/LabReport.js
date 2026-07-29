const mongoose = require('mongoose');

const labReportSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  barcode: { type: String, required: true },
  testCategory: String,
  collectionTime: String,
  destination: String,
  status: { type: String, enum: ['Pending', 'Dispatched', 'Completed'], default: 'Pending' },
  results: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LabReport', labReportSchema);
