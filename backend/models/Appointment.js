const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tokenNumber: { type: String, required: true },
  specialty: String,
  timeSlot: String,
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['Scheduled', 'Checked-In', 'In-Consultation', 'Completed', 'Cancelled'], default: 'Scheduled' },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
