const express = require('express');
const router = express.Router();
const { sendAppointmentReminder, sendBillNotification, sendCustomSMS } = require('../controller/smsController');
const { authorize } = require('../middleware/authMiddleware');

router.post('/appointment-reminder', authorize('admin', 'doctor'), sendAppointmentReminder);
router.post('/bill-notification', authorize('admin'), sendBillNotification);
router.post('/custom', authorize('admin'), sendCustomSMS);

module.exports = router;