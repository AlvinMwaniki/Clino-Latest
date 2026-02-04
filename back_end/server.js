const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
require('./config/db'); // connect DB

const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  // Check for the "Preflight" request
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
app.use(cors({
  origin: ['http://localhost:8082', 'https://your-cloudflare-link.trycloudflare.com'],
  credentials: true
}));
app.use(express.json());


const pharmacyRoutes = require('./routes/pharmacy_routes');
const labRoutes = require('./routes/lab_routes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const appoint_patient_routes=require('./routes/app_pateint_router');
const userRoutes = require('./routes/userRoutes');
const patientRoutes = require('./routes/patient_routes');

app.use('/api/appoint_patients',appoint_patient_routes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/lab', labRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.get('/', (req, res) => {
    res.send("🚀 MediSoft Backend Running");
});


const PORT = 5001; // Was 5000
app.listen(PORT, () => {
  console.log(`🚀 Server started on http://localhost:${PORT}`);
});
