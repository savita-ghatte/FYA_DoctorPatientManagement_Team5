const express = require('express');
const router = express.Router();
const vitalsController = require('../controllers/vitalsController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('assistant', 'doctor'), vitalsController.recordVitals);
router.get('/:patientId', protect, vitalsController.getPatientVitals);
router.get('/:patientId/latest', protect, vitalsController.getLatestVitals);

module.exports = router;
