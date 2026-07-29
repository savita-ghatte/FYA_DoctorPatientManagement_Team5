const Appointment = require('../models/Appointment');

const createAppointment = async (req, res) => {
    try {
        const { doctorId, specialty, timeSlot, date, notes } = req.body;
        
        // Count today's appointments for that doctor
        const today = new Date(date);
        today.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        const count = await Appointment.countDocuments({
            doctor: doctorId,
            date: { $gte: today, $lte: endOfDay }
        });
        
        const tokenNumber = `TKN-${String(count + 1).padStart(3, '0')}`;
        
        const appointment = new Appointment({
            patient: req.user._id,
            doctor: doctorId,
            specialty,
            timeSlot,
            date,
            notes,
            tokenNumber,
            status: 'Scheduled'
        });
        
        await appointment.save();
        
        return res.status(201).json({
            success: true,
            data: appointment,
            message: 'Appointment created successfully'
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getAppointments = async (req, res) => {
    try {
        let filter = {};
        
        if (req.user.role === 'patient') {
            filter.patient = req.user._id;
        } else if (req.user.role === 'doctor') {
            filter.doctor = req.user._id;
        } else if (req.user.role === 'assistant') {
            if (req.query.date) {
                const queryDate = new Date(req.query.date);
                const nextDay = new Date(queryDate);
                nextDay.setDate(nextDay.getDate() + 1);
                filter.date = { $gte: queryDate, $lt: nextDay };
            }
        }
        
        const appointments = await Appointment.find(filter)
            .populate('patient', 'fullName patientId')
            .populate('doctor', 'fullName profile.specialty')
            .sort({ date: -1 });
            
        return res.status(200).json({ success: true, data: appointments });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Scheduled', 'Checked-In', 'In-Consultation', 'Completed', 'Cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );
        
        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        
        return res.status(200).json({ success: true, data: appointment });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createAppointment,
    getAppointments,
    updateStatus
};
