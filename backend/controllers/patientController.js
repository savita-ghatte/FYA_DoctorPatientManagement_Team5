const Vital = require('../models/Vital');
const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

exports.getDashboard = async (req, res) => {
  try {
    const vitals = await Vital.find({ patient: req.user._id })
      .sort({ timestamp: -1 })
      .limit(1);

    const latestPrescription = await Prescription.findOne({ patient: req.user._id })
      .sort({ createdAt: -1 });
    
    const medicines = latestPrescription ? latestPrescription.medicines : [];

    const appointments = await Appointment.find({ 
      patient: req.user._id,
      status: { $nin: ['Completed', 'Cancelled'] }
    }).populate('doctor', 'fullName profile');

    res.status(200).json({
      success: true,
      data: {
        vitals: vitals.length > 0 ? vitals[0] : null,
        medicines,
        appointments,
        profile: req.user,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyVitals = async (req, res) => {
  try {
    const vitals = await Vital.find({ patient: req.user._id })
      .sort({ timestamp: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      data: vitals,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyMedicines = async (req, res) => {
  try {
    const latestPrescription = await Prescription.findOne({ patient: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: latestPrescription ? latestPrescription.medicines : [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyDoctors = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id });
    const doctorIds = [...new Set(appointments.map(app => app.doctor.toString()))];

    const doctors = await User.find({ _id: { $in: doctorIds } })
      .select('fullName email profile');

    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user._id })
      .populate({
        path: 'doctor',
        select: 'fullName profile.specialty profile.department'
      });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.payInvoice = async (req, res) => {
  try {
    const { invoiceId, paymentMethod } = req.body;
    const BillingInvoice = require('../models/BillingInvoice');

    const filter = {
      patient: req.user._id,
      $or: [{ invoiceId: invoiceId }]
    };
    if (require('mongoose').Types.ObjectId.isValid(invoiceId)) {
      filter.$or.push({ _id: invoiceId });
    }

    const invoice = await BillingInvoice.findOneAndUpdate(
      filter,
      { paymentStatus: 'Paid', paymentMethod: paymentMethod || 'UPI/Card' },
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.status(200).json({
      success: true,
      data: invoice,
      message: 'Payment completed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
