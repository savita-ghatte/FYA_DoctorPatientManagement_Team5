const Appointment = require('../models/Appointment');
const Vital = require('../models/Vital');
const LabReport = require('../models/LabReport');
const User = require('../models/User');

exports.getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.countDocuments({
      doctor: req.user._id,
      date: { $gte: today, $lt: tomorrow }
    });

    const pendingConsults = await Appointment.countDocuments({
      doctor: req.user._id,
      status: { $in: ['Scheduled', 'Checked-In'] }
    });

    const criticalAlerts = await Vital.countDocuments({
      timestamp: { $gte: today, $lt: tomorrow },
      $or: [
        { heartRate: { $gt: 100 } },
        { oxygenSaturation: { $lt: 92 } },
        { bloodSugar: { $gt: 200 } }
      ]
    });

    // Getting unique patients for this doctor to find their lab reports
    const doctorAppointments = await Appointment.find({ doctor: req.user._id });
    const patientIds = [...new Set(doctorAppointments.map(app => app.patient.toString()))];

    const pendingLabReports = await LabReport.countDocuments({
      patient: { $in: patientIds },
      status: 'Pending'
    });

    res.status(200).json({
      success: true,
      data: {
        todayPatients: todayAppointments,
        pendingConsults,
        criticalAlerts,
        pendingLabReports
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getQueue = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const queue = await Appointment.find({
      doctor: req.user._id,
      date: { $gte: today, $lt: tomorrow }
    })
      .populate('patient', 'fullName email profile')
      .sort({ tokenNumber: 1 });

    res.status(200).json({
      success: true,
      data: queue,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPatients = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctor: req.user._id })
      .populate('patient', 'fullName email profile');

    // Get unique patients
    const patientsMap = new Map();
    appointments.forEach(app => {
      if (app.patient && !patientsMap.has(app.patient._id.toString())) {
        patientsMap.set(app.patient._id.toString(), app.patient);
      }
    });

    const patients = Array.from(patientsMap.values());

    res.status(200).json({
      success: true,
      data: patients,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    // Assuming we want alerts for the doctor's patients
    const appointments = await Appointment.find({ doctor: req.user._id });
    const patientIds = [...new Set(appointments.map(app => app.patient.toString()))];

    const alerts = await Vital.find({
      patient: { $in: patientIds },
      $or: [
        { heartRate: { $gt: 100 } },
        { oxygenSaturation: { $lt: 92 } },
        { bloodSugar: { $gt: 200 } },
        { systolic: { $gt: 140 } }
      ]
    })
      .populate('patient', 'fullName')
      .sort({ timestamp: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDoctorProfile = async (req, res) => {
  try {
    const doctor = await User.findOne({ _id: req.params.id, role: 'doctor' })
      .select('-password');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('fullName profile email');

    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPrescription = async (req, res) => {
  try {
    const { patientId, appointmentId, diagnosis, medicines, notes } = req.body;
    const Prescription = require('../models/Prescription');
    const User = require('../models/User');

    let targetPatientId = patientId;
    if (patientId && !require('mongoose').Types.ObjectId.isValid(patientId)) {
      const foundUser = await User.findOne({ patientId: patientId });
      if (foundUser) targetPatientId = foundUser._id;
    }

    const prescription = await Prescription.create({
      patient: targetPatientId,
      doctor: req.user._id,
      appointment: appointmentId,
      diagnosis,
      medicines,
      notes
    });

    if (appointmentId && require('mongoose').Types.ObjectId.isValid(appointmentId)) {
      await Appointment.findByIdAndUpdate(appointmentId, { status: 'Completed' });
    }

    res.status(201).json({
      success: true,
      data: prescription,
      message: 'E-Prescription saved successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPatientEHR = async (req, res) => {
  try {
    const { patientId } = req.params;
    const User = require('../models/User');
    const Vital = require('../models/Vital');
    const Prescription = require('../models/Prescription');
    const LabReport = require('../models/LabReport');
    const Appointment = require('../models/Appointment');

    let patient = null;
    if (require('mongoose').Types.ObjectId.isValid(patientId)) {
      patient = await User.findById(patientId);
    }
    if (!patient) {
      patient = await User.findOne({ patientId: patientId });
    }

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient record not found' });
    }

    const pId = patient._id;
    const [vitals, prescriptions, labs, appointments] = await Promise.all([
      Vital.find({ patient: pId }).sort({ timestamp: -1 }).limit(20),
      Prescription.find({ patient: pId }).populate('doctor', 'fullName profile').sort({ date: -1 }),
      LabReport.find({ patient: pId }).sort({ date: -1 }),
      Appointment.find({ patient: pId }).populate('doctor', 'fullName profile').sort({ date: -1 })
    ]);

    res.status(200).json({
      success: true,
      data: {
        patient,
        vitals,
        prescriptions,
        labReports: labs,
        appointments
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('fullName email phone profile doctorId licenseNumber');
    res.status(200).json({
      success: true,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
