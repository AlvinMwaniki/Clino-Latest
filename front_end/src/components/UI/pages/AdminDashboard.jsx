import { useEffect, useState } from 'react';
import {
  Stethoscope, User, Calendar, Activity, Pill, Ambulance,
  DollarSign, MessageSquare, ClipboardList, Users, AlertCircle
} from 'lucide-react';
import Layout from '../../Layout/Layout';
import StatCard from '../StatCard';
import DataTable from '../DataTable';
import StatusBadge from '../StatusBadge';
import { api } from '../../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [criticalList, setCriticalList] = useState([]);
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [pharmacy, setPharmacy] = useState([]);
  const [labs, setLabs] = useState([]);
  const [billing, setBilling] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        const [
          statsData, critData, usersData, doctorsData,
          patientsData, apptsData, pharmacyData, labsData,
          billingData, ambulancesData, feedbackData
        ] = await Promise.allSettled([
          api.get('/users/stats'),
          api.get('/patients/critical-list'),
          api.get('/users'),
          api.get('/doctors'),
          api.get('/patients'),
          api.get('/appointments'),
          api.get('/pharmacy'),
          api.get('/lab'),
          api.get('/billing'),
          api.get('/ambulances'),
          api.get('/feedback'),
        ]);

        if (statsData.status === 'fulfilled') setStats(statsData.value || {});
        if (critData.status === 'fulfilled') setCriticalList(critData.value || []);
        if (usersData.status === 'fulfilled') setUsers(usersData.value || []);
        if (doctorsData.status === 'fulfilled') setDoctors(doctorsData.value || []);
        if (patientsData.status === 'fulfilled') setPatients(patientsData.value || []);
        if (apptsData.status === 'fulfilled') setAppointments(apptsData.value || []);
        if (pharmacyData.status === 'fulfilled') setPharmacy(pharmacyData.value || []);
        if (labsData.status === 'fulfilled') setLabs(labsData.value || []);
        if (billingData.status === 'fulfilled') setBilling(billingData.value || []);
        if (ambulancesData.status === 'fulfilled') setAmbulances(ambulancesData.value || []);
        if (feedbackData.status === 'fulfilled') setFeedback(feedbackData.value || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const statsConfig = [
    { label: 'Doctors', key: 'doctors', icon: Stethoscope, color: 'blue' },
    { label: 'Patients', key: 'patients', icon: User, color: 'green' },
    { label: 'Critical', key: 'critical', icon: AlertCircle, color: 'red' },
    { label: 'Appointments', key: 'appointments', icon: Calendar, color: 'purple' },
    { label: 'Billing (KES)', key: 'billing', icon: DollarSign, color: 'yellow' },
    { label: 'Pharmacy', key: 'pharmacy', icon: Pill, color: 'pink' },
    { label: 'Lab Tests', key: 'labs', icon: Activity, color: 'indigo' },
    { label: 'Feedbacks', key: 'feedbacks', icon: MessageSquare, color: 'orange' },
  ];

  const tabs = [
    { id: 'overview', icon: ClipboardList, label: 'Overview' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'doctors', icon: Stethoscope, label: 'Doctors' },
    { id: 'patients', icon: User, label: 'Patients' },
    { id: 'appointments', icon: Calendar, label: 'Appointments' },
    { id: 'pharmacy', icon: Pill, label: 'Pharmacy' },
    { id: 'labs', icon: Activity, label: 'Labs' },
    { id: 'billing', icon: DollarSign, label: 'Billing' },
    { id: 'ambulances', icon: Ambulance, label: 'Ambulances' },
    { id: 'feedback', icon: MessageSquare, label: 'Feedback' },
  ];

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-green-800 flex items-center">
          <ClipboardList className="mr-3 w-6 h-6 md:w-8 md:h-8" />
          Admin Dashboard
        </h1>
        <div className="text-sm md:text-lg text-gray-500 font-medium">System Overview</div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex-shrink-0 flex items-center px-4 py-2 text-sm ${activeTab === tab.id
                ? 'border-b-2 border-green-600 text-green-700 font-medium'
                : 'text-gray-600 hover:text-green-600'
              }`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statsConfig.map(({ label, key, icon, color }) => (
              <StatCard
                key={label}
                icon={icon}
                title={label}
                value={loading ? '...' : stats[key] ?? 0}
                color={color}
              />
            ))}
          </div>

          {/* Critical Patients */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <AlertCircle className="mr-2 text-red-600" />
              Critical Patients
            </h2>
            <DataTable
              columns={[
                { header: 'Patient ID', accessor: 'id' },
                { header: 'Name', accessor: 'name' },
                { header: 'Condition', accessor: 'condition' },
                { header: 'Status', accessor: 'status', cell: (v) => <StatusBadge status={v || 'critical'} /> }
              ]}
              data={criticalList}
              loading={loading}
              emptyMessage="No critical patients currently"
            />
          </div>

          {/* Recent Appointments */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Calendar className="mr-2 text-blue-600" />
              Recent Appointments
            </h2>
            <DataTable
              columns={[
                { header: 'ID', accessor: 'appointment_id' },
                { header: 'Patient', accessor: 'patient_name' },
                { header: 'Doctor', accessor: 'doctor_name' },
                { header: 'Date', accessor: 'appointment_date', cell: (v) => new Date(v).toLocaleString() },
                { header: 'Status', accessor: 'status', cell: (v) => <StatusBadge status={v} /> }
              ]}
              data={appointments.slice(0, 5)}
              loading={loading}
              emptyMessage="No recent appointments"
            />
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Users Management</h2>
          <DataTable
            columns={[
              { header: 'ID', accessor: 'user_id' },
              { header: 'Name', accessor: 'full_name' },
              { header: 'Role', accessor: 'role' },
              { header: 'Email', accessor: 'email' },
            ]}
            data={users} loading={loading} emptyMessage="No users found"
          />
        </div>
      )}

      {activeTab === 'doctors' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Doctors Management</h2>
          <DataTable
            columns={[
              { header: 'Name', accessor: 'full_name' },
              { header: 'Specialty', accessor: 'specialization' },
              { header: 'Feedback Score', accessor: 'feedback_score' },
            ]}
            data={doctors} loading={loading} emptyMessage="No doctors found"
          />
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Patients Management</h2>
          <DataTable
            columns={[
              { header: 'ID', accessor: 'patient_id' },
              { header: 'Name', accessor: 'full_name' },
              { header: 'Status', accessor: 'status', cell: (v) => v ? <StatusBadge status={v} /> : '—' },
              { header: 'Room', accessor: 'room' },
            ]}
            data={patients} loading={loading} emptyMessage="No patients found"
          />
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Appointments Management</h2>
          <DataTable
            columns={[
              { header: 'ID', accessor: 'appointment_id' },
              { header: 'Patient', accessor: 'patient_name' },
              { header: 'Doctor', accessor: 'doctor_name' },
              { header: 'Date', accessor: 'appointment_date', cell: (v) => new Date(v).toLocaleString() },
              { header: 'Status', accessor: 'status', cell: (v) => <StatusBadge status={v} /> },
            ]}
            data={appointments} loading={loading} emptyMessage="No appointments found"
          />
        </div>
      )}

      {activeTab === 'pharmacy' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Pharmacy Management</h2>
          <DataTable
            columns={[
              { header: 'Medicine', accessor: 'medicine_name' },
              { header: 'Stock', accessor: 'stock_quantity' },
              { header: 'Expiry', accessor: 'expiry_date' },
            ]}
            data={pharmacy} loading={loading} emptyMessage="No medicines found"
          />
        </div>
      )}

      {activeTab === 'labs' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Laboratory Management</h2>
          <DataTable
            columns={[
              { header: 'Test ID', accessor: 'test_id' },
              { header: 'Test Name', accessor: 'test_name' },
              { header: 'Patient', accessor: 'patientName' },
              { header: 'Date', accessor: 'test_date', cell: (v) => new Date(v).toLocaleDateString() },
            ]}
            data={labs} loading={loading} emptyMessage="No lab tests found"
          />
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Billing Management</h2>
          <DataTable
            columns={[
              { header: 'Invoice #', accessor: 'billing_id' },
              { header: 'Patient', accessor: 'patient_name' },
              { header: 'Amount', accessor: 'total_amount', cell: (v) => `KES ${Number(v).toLocaleString()}` },
              { header: 'Patient Owes', accessor: 'patient_owes', cell: (v) => `KES ${Number(v).toLocaleString()}` },
              { header: 'Status', accessor: 'payment_status', cell: (v) => <StatusBadge status={v} /> },
            ]}
            data={billing} loading={loading} emptyMessage="No bills found"
          />
        </div>
      )}

      {activeTab === 'ambulances' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Ambulance Services</h2>
          <DataTable
            columns={[
              { header: 'Vehicle #', accessor: 'vehicle_number' },
              { header: 'Driver', accessor: 'driver_name' },
              { header: 'Status', accessor: 'status' },
              { header: 'Location', accessor: 'current_location' },
            ]}
            data={ambulances} loading={loading} emptyMessage="No ambulances found"
          />
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Patient Feedback</h2>
          <DataTable
            columns={[
              { header: 'Patient', accessor: 'patient_name' },
              { header: 'Rating', accessor: 'rating' },
              { header: 'Comments', accessor: 'comments' },
              { header: 'Date', accessor: 'submitted_date', cell: (v) => v ? new Date(v).toLocaleDateString() : '—' },
            ]}
            data={feedback} loading={loading} emptyMessage="No feedback found"
          />
        </div>
      )}
    </Layout>
  );
}