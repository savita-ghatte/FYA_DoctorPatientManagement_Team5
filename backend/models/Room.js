const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true },
  block: String,
  floor: String,
  type: { type: String, enum: ['OPD', 'ICU', 'Ward', 'Emergency', 'Lab', 'Pharmacy'], default: 'OPD' },
  status: { type: String, enum: ['Available', 'Occupied'], default: 'Available' },
  assignedDoctor: String,
  assignedPatient: String,
  equipment: [String]
});

module.exports = mongoose.model('Room', roomSchema);
