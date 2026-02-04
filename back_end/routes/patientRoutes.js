const express = require('express');
const { createPatient } = require('../controller/patientController');
const router = express.Router();
router.post('/register', patientController.registerPatient);
router.post('/', createPatient);
module.exports = router;