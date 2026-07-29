const express = require('express');
const {
  getDashboard,
  getQueue,
  getPatients,
  getAlerts,
  getDoctorProfile,
  getAllDoctors,
  createPrescription,
  getPatientEHR
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/list', getAllDoctors);
router.get('/:id/profile', protect, getDoctorProfile);

// Protected routes for doctor role
router.use(protect);
router.use(authorize('doctor'));

router.get('/dashboard', getDashboard);
router.get('/queue', getQueue);
router.get('/patients', getPatients);
router.get('/alerts', getAlerts);
router.post('/prescription', createPrescription);
router.get('/ehr/:patientId', getPatientEHR);

module.exports = router;
