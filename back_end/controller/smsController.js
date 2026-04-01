const { sendSMS } = require('../services/smsService');

// ── SEND APPOINTMENT REMINDER ─────────────────────────────────────────────────
const sendAppointmentReminder = async (req, res) => {
  const { patient_phone, patient_name, doctor_name, appointment_date } = req.body;

  const date = new Date(appointment_date).toLocaleString('en-KE', {
    dateStyle: 'full', timeStyle: 'short', timeZone: 'Africa/Nairobi'
  });

  const message =
    `Dear ${patient_name}, this is a reminder for your appointment with Dr. ${doctor_name} ` +
    `on ${date} at MediSoft Hospital. Call 0800-MEDISOFT if you need to reschedule.`;

  try {
    const result = await sendSMS(patient_phone, message);
    res.json({ message: 'Reminder sent', result });
  } catch (err) {
    res.status(500).json({ message: 'SMS failed', error: err.message });
  }
};

// ── SEND BILL PAYMENT SMS ─────────────────────────────────────────────────────
const sendBillNotification = async (req, res) => {
  const { patient_phone, patient_name, amount, billing_id } = req.body;

  const message =
    `Dear ${patient_name}, your hospital bill of KES ${amount} (Invoice #${billing_id}) is ready. ` +
    `Pay via M-Pesa Paybill 247247 Account ${billing_id}. Queries: 0800-MEDISOFT.`;

  try {
    const result = await sendSMS(patient_phone, message);
    res.json({ message: 'Bill notification sent', result });
  } catch (err) {
    res.status(500).json({ message: 'SMS failed', error: err.message });
  }
};

// ── SEND OTP / GENERAL MESSAGE ────────────────────────────────────────────────
const sendCustomSMS = async (req, res) => {
  const { phone, message } = req.body;
  try {
    const result = await sendSMS(phone, message);
    res.json({ message: 'SMS sent', result });
  } catch (err) {
    res.status(500).json({ message: 'SMS failed', error: err.message });
  }
};

module.exports = { sendAppointmentReminder, sendBillNotification, sendCustomSMS, sendSMS };