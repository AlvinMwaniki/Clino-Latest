const express = require('express');
const router = express.Router();
const patientController = require('../controller/patientController');
router.post('/register', patientController.registerPatient);
// Get total patient count
router.get('/stats/total', patientController.getTotalPatientsCount);

// Get patients admitted today
router.get('/stats/today', patientController.getTodayAdmittedPatients);

router.get('/stats/critical', patientController.getCriticalPatientsCount);

// Get all patients
router.get('/', patientController.getAllPatients);
router.get('/critical-list', patientController.getCriticalPatients);

module.exports = router;