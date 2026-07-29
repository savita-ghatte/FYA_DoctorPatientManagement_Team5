const express = require('express');
const {
  getDashboard,
  getMyVitals,
  getMyMedicines,
  getMyDoctors,
  getMyAppointments,
  payInvoice
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('patient'));

router.get('/dashboard', getDashboard);
router.get('/vitals', getMyVitals);
router.get('/medicines', getMyMedicines);
router.get('/doctors', getMyDoctors);
router.get('/appointments', getMyAppointments);
router.patch('/pay-invoice', payInvoice);

module.exports = router;
