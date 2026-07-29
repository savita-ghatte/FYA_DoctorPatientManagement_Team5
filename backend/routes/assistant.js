const express = require('express');
const router = express.Router();
const assistantController = require('../controllers/assistantController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('assistant'));

router.get('/dashboard', assistantController.getDashboard);
router.get('/triage', assistantController.getTriage);
router.get('/opd-appointments', assistantController.getOPDAppointments);
router.get('/labs', assistantController.getLabSamples);
router.patch('/labs/:id/dispatch', assistantController.dispatchLabSample);
router.get('/rooms', assistantController.getRooms);
router.get('/billing', assistantController.getBillingQueue);
router.post('/billing', assistantController.createInvoice);
router.post('/emergency', assistantController.triggerEmergency);
router.patch('/emergency/:id/respond', assistantController.respondEmergency);

module.exports = router;
