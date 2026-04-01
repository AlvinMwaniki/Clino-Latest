import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Login from "./components/UI/pages/Login.jsx";
import AdminDashboard from "./components/UI/pages/AdminDashboard.jsx";
import AdminUsers from "./components/UI/pages/AdminUsers.jsx";
import AdminDoctors from "./components/UI/pages/AdminDoctors.jsx";
import AdminPatients from "./components/UI/pages/AdminPatients.jsx";
import AdminAppointments from "./components/UI/pages/AdminAppointments.jsx";
import AdminPharmacy from "./components/UI/pages/AdminPharmacy.jsx";
import AdminLabs from "./components/UI/pages/AdminLabs.jsx";
import AdminBilling from "./components/UI/pages/AdminBilling.jsx";
import AdminAmbulances from "./components/UI/pages/AdminAmbulances.jsx";
import AdminFeedback from "./components/UI/pages/AdminFeedback.jsx";
import AdminWards from "./components/UI/pages/AdminWards.jsx";
import AdminAuditLogs from "./components/UI/pages/AdminAuditLogs.jsx";
import DoctorDashboard from "./components/UI/pages/DoctorDashboard.jsx";
import PatientDashboard from "./components/UI/pages/PatientDashboard.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/users" element={<PrivateRoute roles={['admin']}><AdminUsers /></PrivateRoute>} />
        <Route path="/admin/doctors" element={<PrivateRoute roles={['admin']}><AdminDoctors /></PrivateRoute>} />
        <Route path="/admin/patients" element={<PrivateRoute roles={['admin']}><AdminPatients /></PrivateRoute>} />
        <Route path="/admin/appointments" element={<PrivateRoute roles={['admin']}><AdminAppointments /></PrivateRoute>} />
        <Route path="/admin/pharmacy" element={<PrivateRoute roles={['admin']}><AdminPharmacy /></PrivateRoute>} />
        <Route path="/admin/labs" element={<PrivateRoute roles={['admin']}><AdminLabs /></PrivateRoute>} />
        <Route path="/admin/billing" element={<PrivateRoute roles={['admin']}><AdminBilling /></PrivateRoute>} />
        <Route path="/admin/ambulances" element={<PrivateRoute roles={['admin']}><AdminAmbulances /></PrivateRoute>} />
        <Route path="/admin/feedback" element={<PrivateRoute roles={['admin']}><AdminFeedback /></PrivateRoute>} />
        <Route path="/admin/wards" element={<PrivateRoute roles={['admin']}><AdminWards /></PrivateRoute>} />
        <Route path="/admin/audit" element={<PrivateRoute roles={['admin']}><AdminAuditLogs /></PrivateRoute>} />

        <Route path="/doctor" element={<PrivateRoute roles={['doctor']}><DoctorDashboard /></PrivateRoute>} />
        <Route path="/doctor/appointments" element={<PrivateRoute roles={['doctor']}><DoctorDashboard /></PrivateRoute>} />
        <Route path="/doctor/patients" element={<PrivateRoute roles={['doctor']}><DoctorDashboard /></PrivateRoute>} />
        <Route path="/doctor/labs" element={<PrivateRoute roles={['doctor']}><DoctorDashboard /></PrivateRoute>} />
        <Route path="/doctor/pharmacy" element={<PrivateRoute roles={['doctor']}><DoctorDashboard /></PrivateRoute>} />
        <Route path="/doctor/prescriptions" element={<PrivateRoute roles={['doctor']}><DoctorDashboard /></PrivateRoute>} />

        <Route path="/patient" element={<PrivateRoute roles={['patient']}><PatientDashboard /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;