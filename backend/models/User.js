const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['doctor', 'patient', 'assistant'], required: true },
  licenseNumber: String,  // for doctors
  departmentId: String,   // for assistants
  patientId: String,      // e.g. PAT-2024-9921
  doctorId: String,       // e.g. MDV-2024-0847
  staffId: String,        // e.g. MED-8842
  profile: {
    age: Number,
    gender: String,
    bloodGroup: String,
    height: String,
    weight: String,
    allergies: [String],
    insurance: String,
    department: String,
    specialty: String,
    qualification: String,
    experience: String,
    hospital: String,
    fee: String,
    opRoom: String,
    bio: String,
    contact: String,
    initials: String,
    certifications: [String],
    shift: String,
    block: String,
    floor: String
  },
  createdAt: { type: Date, default: Date.now }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
