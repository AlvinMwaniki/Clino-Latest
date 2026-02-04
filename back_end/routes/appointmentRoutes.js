const express = require('express');
const router = express.Router();
const {
  getAllAppointments,
  createAppointment,
  getAppointmentsByDoctor,
  getAppointmentsByPatient,
  updateAppointmentStatus,
  submitFeedback,
  getTotalAppointmentsCount,
  getTotalBillingCount
} = require('../controller/appointmentController');

// ongeza these routes
router.post('/', createAppointment); // POST /api/appointments
router.post('/feedback', submitFeedback); // POST /api/appointments/feedback
router.get('/doctor/:doctorId', getAppointmentsByDoctor);
router.get('/patient/:patientId', getAppointmentsByPatient);
router.put('/:id/status', updateAppointmentStatus);
router.get('/stats/total', getTotalAppointmentsCount);
router.get('/stats/billing', getTotalBillingCount);
router.get('/', getAllAppointments);

module.exports = router;