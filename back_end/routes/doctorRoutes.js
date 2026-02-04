const express = require('express');
const { getAllDoctors, getDoctorById, getDoctorAvailability, getTotalDoctorsCount, registerDoctor } = require('../controller/doctorController');
const router = express.Router();
router.post('/register', registerDoctor);
router.get('/', getAllDoctors);                   // GET all doctors
router.get('/:id', getDoctorById);                // GET doctor by ID
router.get('/:id/availability', getDoctorAvailability); // GET doctor availability
router.get('/stats/total', getTotalDoctorsCount);


module.exports = router;