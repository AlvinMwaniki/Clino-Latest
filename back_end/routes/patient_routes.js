const express = require('express');
const router = express.Router();
const patientController = require('../controller/patientController'); // FIX: was missing
const { authenticate, authorize } = require('../middleware/authMiddleware');

// All patient routes require authentication
router.post('/register', authenticate, authorize('admin'), patientController.registerPatient);
router.get('/stats/total', authenticate, patientController.getTotalPatientsCount);
router.get('/stats/today', authenticate, patientController.getTodayAdmittedPatients);
router.get('/stats/critical', authenticate, patientController.getCriticalPatientsCount);
router.get('/critical-list', authenticate, patientController.getCriticalPatients);
router.get('/', authenticate, patientController.getAllPatients);

module.exports = router;