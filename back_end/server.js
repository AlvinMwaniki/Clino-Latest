const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/db');

const app = express();

// ── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:8082'],
  credentials: true
}));

app.use(express.json());

// ── ROUTES (public) ─────────────────────────────────────────────────────────
const userRoutes = require('./routes/userRoutes'); // login is public
app.use('/api/users', userRoutes);

// ── ROUTES (protected — all require valid JWT) ──────────────────────────────
const { authenticate } = require('./middleware/authMiddleware');
const { auditLog } = require('./middleware/auditMiddleware');

const pharmacyRoutes = require('./routes/pharmacy_routes');
const labRoutes = require('./routes/lab_routes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const apptPatientRoutes = require('./routes/app_pateint_router');
const patientRoutes = require('./routes/patient_routes');
const billingRoutes = require('./routes/billingRoutes');
const ambulanceRoutes = require('./routes/ambulanceRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const wardRoutes = require('./routes/wardRoutes');
const auditRoutes = require('./routes/auditRoutes');
const mpesaRoutes = require('./routes/mpesaRoutes');
const smsRoutes = require('./routes/smsRoutes');

// Apply auth + audit to all protected routes
app.use('/api/pharmacy', authenticate, auditLog, pharmacyRoutes);
app.use('/api/lab', authenticate, auditLog, labRoutes);
app.use('/api/doctors', authenticate, auditLog, doctorRoutes);
app.use('/api/appointments', authenticate, auditLog, appointmentRoutes);
app.use('/api/appoint_patients', authenticate, apptPatientRoutes);
app.use('/api/patients', authenticate, auditLog, patientRoutes);
app.use('/api/billing', authenticate, auditLog, billingRoutes);
app.use('/api/ambulances', authenticate, auditLog, ambulanceRoutes);
app.use('/api/prescriptions', authenticate, auditLog, prescriptionRoutes);
app.use('/api/wards', authenticate, auditLog, wardRoutes);
app.use('/api/audit', authenticate, auditRoutes);
app.use('/api/mpesa', authenticate, mpesaRoutes);
app.use('/api/sms', authenticate, smsRoutes);

// ── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.send('🚀 MediSoft Backend Running'));

// ── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server started on http://localhost:${PORT}`));