const Vital = require('../models/Vital');
const User = require('../models/User');

const recordVitals = async (req, res) => {
    try {
        const { patientId, bloodPressure, heartRate, temperature, oxygenSaturation, bloodSugar } = req.body;
        
        let finalPatientId = patientId;
        
        // Check if patientId is string format 'PAT-xxxx'
        if (typeof patientId === 'string' && patientId.startsWith('PAT-')) {
            const user = await User.findOne({ patientId: patientId, role: 'patient' });
            if (!user) {
                return res.status(404).json({ success: false, message: 'Patient not found' });
            }
            finalPatientId = user._id;
        }
        
        // Parse blood pressure '120/80' -> { systolic: 120, diastolic: 80 }
        let bpObj = null;
        if (bloodPressure) {
            const [systolic, diastolic] = bloodPressure.split('/').map(num => parseInt(num));
            if (!isNaN(systolic) && !isNaN(diastolic)) {
                bpObj = { systolic, diastolic };
            }
        }
        
        const vital = new Vital({
            patient: finalPatientId,
            recordedBy: req.user._id,
            bloodPressure: bpObj,
            heartRate,
            temperature,
            oxygenSaturation,
            bloodSugar
        });
        
        await vital.save();
        
        return res.status(201).json({
            success: true,
            data: vital,
            message: 'Vitals recorded successfully'
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getPatientVitals = async (req, res) => {
    try {
        let targetPatientId = req.params.patientId;
        
        if (targetPatientId.startsWith('PAT-')) {
             const user = await User.findOne({ patientId: targetPatientId });
             if (user) targetPatientId = user._id;
        }

        const vitals = await Vital.find({ patient: targetPatientId })
            .sort({ timestamp: -1 })
            .limit(50);
            
        return res.status(200).json({ success: true, data: vitals });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getLatestVitals = async (req, res) => {
    try {
        let targetPatientId = req.params.patientId;
        
        if (targetPatientId.startsWith('PAT-')) {
             const user = await User.findOne({ patientId: targetPatientId });
             if (user) targetPatientId = user._id;
        }
        
        const vital = await Vital.findOne({ patient: targetPatientId })
            .sort({ timestamp: -1 });
            
        return res.status(200).json({ success: true, data: vital });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    recordVitals,
    getPatientVitals,
    getLatestVitals
};
