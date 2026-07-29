const Appointment = require('../models/Appointment');
const Vital = require('../models/Vital');
const User = require('../models/User');
const LabReport = require('../models/LabReport');
const Room = require('../models/Room');
const BillingInvoice = require('../models/BillingInvoice');
const EmergencyAlert = require('../models/EmergencyAlert');

const getDashboard = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        
        const checkedInCount = await Appointment.countDocuments({
            date: { $gte: today, $lte: endOfDay },
            status: { $in: ['Checked-In', 'In-Consultation', 'Completed'] }
        });
        
        const vitalsDoneCount = await Vital.countDocuments({
            timestamp: { $gte: today, $lte: endOfDay }
        });
        
        const patientsWaiting = await Appointment.countDocuments({
            date: { $gte: today, $lte: endOfDay },
            status: 'Checked-In'
        });
        
        return res.status(200).json({
            success: true,
            data: {
                checkedIn: checkedInCount,
                vitalsDone: vitalsDoneCount,
                avgWaitTime: 11,
                patientsWaiting
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getTriage = async (req, res) => {
    try {
        // Aggregate to get latest vitals for each patient
        const latestVitals = await Vital.aggregate([
            { $sort: { timestamp: -1 } },
            {
                $group: {
                    _id: "$patient",
                    vital: { $first: "$$ROOT" }
                }
            }
        ]);
        
        await User.populate(latestVitals, { path: '_id', select: 'fullName patientId profile.age' });
        
        const triageData = {
            high: [],
            moderate: [],
            low: []
        };
        
        for (const record of latestVitals) {
            const patient = record._id;
            const vital = record.vital;
            if (!patient) continue; // skip if user not found
            
            const systolic = vital.bloodPressure ? vital.bloodPressure.systolic : 0;
            
            let triageLevel = 'low';
            
            if (
                vital.heartRate > 110 ||
                vital.oxygenSaturation < 90 ||
                vital.bloodSugar > 250 ||
                systolic > 160
            ) {
                triageLevel = 'high';
            } else if (
                vital.heartRate > 90 ||
                vital.oxygenSaturation < 95 ||
                vital.bloodSugar > 150 ||
                systolic > 130
            ) {
                triageLevel = 'moderate';
            }
            
            const patientData = {
                name: patient.fullName,
                patientId: patient.patientId,
                age: patient.profile?.age,
                latestVitals: vital,
                triageLevel
            };
            
            if (triageLevel === 'high') {
                triageData.high.push(patientData);
            } else if (triageLevel === 'moderate') {
                triageData.moderate.push(patientData);
            } else {
                triageData.low.push(patientData);
            }
        }
        
        return res.status(200).json({ success: true, data: triageData });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getOPDAppointments = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        
        const appointments = await Appointment.find({
            date: { $gte: today, $lte: endOfDay }
        })
        .populate('patient', 'fullName')
        .populate('doctor', 'fullName profile.specialty');
        
        const formattedAppointments = appointments.map(app => ({
            tokenNumber: app.tokenNumber,
            patientName: app.patient?.fullName || 'Unknown',
            doctorName: app.doctor?.fullName || 'Unknown',
            specialty: app.specialty || app.doctor?.profile?.specialty,
            timeSlot: app.timeSlot,
            status: app.status
        }));
        
        return res.status(200).json({ success: true, data: formattedAppointments });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getLabSamples = async (req, res) => {
    try {
        const labSamples = await LabReport.find()
            .populate('patient', 'fullName patientId');
            
        return res.status(200).json({ success: true, data: labSamples });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const dispatchLabSample = async (req, res) => {
    try {
        const labReport = await LabReport.findByIdAndUpdate(
            req.params.id,
            { status: 'Dispatched' },
            { new: true }
        );
        
        if (!labReport) {
            return res.status(404).json({ success: false, message: 'Lab report not found' });
        }
        
        return res.status(200).json({ success: true, data: labReport });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        return res.status(200).json({ success: true, data: rooms });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getBillingQueue = async (req, res) => {
    try {
        const invoices = await BillingInvoice.find()
            .populate('patient', 'fullName patientId');
            
        return res.status(200).json({ success: true, data: invoices });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const triggerEmergency = async (req, res) => {
    try {
        const { code, location, description } = req.body;
        
        const alert = new EmergencyAlert({
            code,
            location,
            description,
            triggeredBy: req.user._id,
            status: 'Active'
        });
        
        await alert.save();
        
        return res.status(201).json({
            success: true,
            data: alert,
            message: 'Emergency alert triggered'
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const respondEmergency = async (req, res) => {
    try {
        const { status } = req.body;
        const alert = await EmergencyAlert.findByIdAndUpdate(
            req.params.id,
            { status: status || 'Responding' },
            { new: true }
        );

        if (!alert) {
            return res.status(404).json({ success: false, message: 'Emergency alert not found' });
        }

        return res.status(200).json({
            success: true,
            data: alert,
            message: `Emergency response updated to ${alert.status}`
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createInvoice = async (req, res) => {
    try {
        const { patientId, services, totalAmount, paymentMethod } = req.body;
        const User = require('../models/User');
        
        let targetPatientId = patientId;
        if (patientId && !require('mongoose').Types.ObjectId.isValid(patientId)) {
            const user = await User.findOne({ patientId });
            if (user) targetPatientId = user._id;
        }

        const count = await BillingInvoice.countDocuments();
        const invoiceId = `INV-2024-${String(count + 1).padStart(3, '0')}`;

        const invoice = await BillingInvoice.create({
            invoiceId,
            patient: targetPatientId,
            services,
            totalAmount: parseFloat(totalAmount),
            paymentStatus: 'Pending',
            paymentMethod: paymentMethod || 'UPI/Card'
        });

        return res.status(201).json({
            success: true,
            data: invoice,
            message: 'Billing invoice generated successfully'
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getDashboard,
    getTriage,
    getOPDAppointments,
    getLabSamples,
    dispatchLabSample,
    getRooms,
    getBillingQueue,
    triggerEmergency,
    respondEmergency,
    createInvoice
};
