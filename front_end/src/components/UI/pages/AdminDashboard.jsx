import { useEffect, useState } from 'react';
import {
    Stethoscope, User, Calendar, Activity, Pill, Ambulance,
    DollarSign, MessageSquare, ClipboardList, Users, AlertCircle
} from 'lucide-react';
import Layout from '../components/Layout/Layout';
import StatCard from '../components/UI/StatCard';
import DataTable from '../components/UI/DataTable';
import StatusBadge from '../components/UI/StatusBadge';
import AdminFeedback from './AdminFeedback';
import AdminAmbulances from './AdminAmbulances';
import AdminBilling from './AdminBilling';
import AdminLabs from './AdminLabs';
import AdminPharmacy from './AdminPharmacy';
import AdminAppointments from './AdminAppointments';
import AdminPatients from './AdminPatients';
import AdminDoctors from './AdminDoctors';
import AdminUsers from './AdminUsers';

// Sample data for demonstration (replace with actual API calls)
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
  // 2. Simplified Fetch Logic
  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        // 1. Fetch the Card Stats (This fills the top row of cards)
        const statsRes = await fetch('/api/users/stats');
        const statsData = await statsRes.json();
        setStats(statsData);

        // 2. Fetch the Critical Patients List (This fills the table)
        const critRes = await fetch('/api/patients/critical-list');
        const critData = await critRes.json();
        setCriticalList(critData);
        // 2. Fetch Tab Data (Admin Style - Direct API calls)
        const resUsers = await fetch('/api/users');
        setUsers(await resUsers.json());

        const resDoctors = await fetch('/api/doctors');
        setDoctors(await resDoctors.json());

        const resPatients = await fetch('/api/patients');
        setPatients(await resPatients.json());

        const resAppts = await fetch('/api/appointments');
        setAppointments(await resAppts.json());
        const resPharmacy = await fetch('/api/pharmacy');
        setPharmacy(await resPharmacy.json());
        const resLabs = await fetch('/api/lab');
        setLabs(await resLabs.json());
        const resBilling = await fetch('/api/billing');
        setBilling(await resBilling.json());
        const resAmbulances = await fetch('/api/ambulances');
        setAmbulances(await resAmbulances.json());
        const resFeedback = await fetch('/api/feedback');
        setFeedback(await resFeedback.json());

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);
const sampleRecentAppointments = [
    { id: 'A1001', patient: 'John Doe', doctor: 'Dr. Smith', date: '2025-07-25T10:00:00', status: 'completed' },
    { id: 'A1002', patient: 'Jane Smith', doctor: 'Dr. Johnson', date: '2025-07-25T14:30:00', status: 'confirmed' },
];

const statsConfig = [
  { label: 'Doctors', key: 'doctors', icon: Stethoscope, color: 'blue' },
  { label: 'Patients', key: 'patients', icon: User, color: 'green' },
  { label: 'Today Patients', key: 'patients', icon: User, color: 'teal' }, // You can refine this later
  { label: 'Critical Patients', key: 'critical', icon: AlertCircle, color: 'red' },
  { label: 'Appointments', key: 'appointments', icon: Calendar, color: 'purple' },
  { label: 'Billing', key: 'billing', icon: DollarSign, color: 'yellow' },
  { label: 'Pharmacy', key: 'pharmacy', icon: Pill, color: 'pink' },
  { label: 'Labs', key: 'labs', icon: Activity, color: 'indigo' },
  { label: 'Feedbacks', key: 'feedbacks', icon: MessageSquare, color: 'orange' },
];



    return (
        <Layout>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-2">
          <h1 className="text-2xl md:text-3xl font-bold text-green-800 flex items-center">
            <ClipboardList className="mr-3 w-6 h-6 md:w-8 md:h-8" />
            Admin Dashboard
          </h1>
          <div className="text-sm md:text-lg text-gray-500 font-medium">
            System Overview
          </div>
        </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                {[
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
                ].map((tab) => (
                    <button
                        key={tab.id}
                        className={`flex-shrink-0 flex items-center px-4 py-2 ${activeTab === tab.id ? 'border-b-2 border-green-600 text-green-700 font-medium' : 'text-gray-600 hover:text-green-600'}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon className="w-5 h-5 mr-2" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-8">

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {statsConfig.map(({ label, key, icon, color }) => (
                            <StatCard
                                key={key}
                                icon={icon}
                                title={label}
                                value={loading ? '...' : stats[key] ?? 0}
                                color={color}
                            />
                        ))}
                    </div>

                    {/* Critical Patients Section */}
            {/* Critical Patients Section */}
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
                  {
                    header: 'Status',
                    accessor: 'status',
                    cell: (value) => <StatusBadge status={value} />
                  }
                ]}
                // CHANGE THIS LINE RIGHT HERE:
                data={criticalList}
                emptyMessage="No critical patients currently"
              />
            </div>

                    {/* Recent Appointments Section */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <Calendar className="mr-2 text-blue-600" />
                            Recent Appointments
                        </h2>
                        <DataTable
                            columns={[
                                { header: 'Appointment ID', accessor: 'id' },
                                { header: 'Patient', accessor: 'patient' },
                                { header: 'Doctor', accessor: 'doctor' },
                                {
                                    header: 'Date',
                                    accessor: 'date',
                                    cell: (value) => new Date(value).toLocaleString()
                                },
                                {
                                    header: 'Status',
                                    accessor: 'status',
                                    cell: (value) => <StatusBadge status={value} />
                                }
                            ]}
                            data={sampleRecentAppointments}
                            emptyMessage="No recent appointments"
                        />
                    </div>
                </div>
            )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Users Management</h2>
            <DataTable
              columns={[{ header: 'ID', accessor: 'user_id' }, { header: 'Name', accessor: 'full_name' }, { header: 'Role', accessor: 'role' }]}
              data={users}
              loading={loading}
            />
          </div>
        )}

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Doctors Management</h2>
            <DataTable
              columns={[{ header: 'Name', accessor: 'full_name' }, { header: 'Specialty', accessor: 'specialization' }]}
              data={doctors}
              loading={loading}
            />
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Patients Management</h2>
            <DataTable
              columns={[
                { header: 'ID', accessor: 'patient_id' },
                { header: 'Name', accessor: 'full_name' },
                { header: 'Contact', accessor: 'contact_info' }
              ]}
              data={patients}
              loading={loading}
            />
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Appointments Management</h2>
            <DataTable
              columns={[
                { header: 'ID', accessor: 'appointment_id' },
                { header: 'Patient', accessor: 'patient_name' },
                { header: 'Status', accessor: 'status', cell: (v) => <StatusBadge status={v} /> }
              ]}
              data={appointments}
              loading={loading}
            />
          </div>
        )}

        {/* Pharmacy Tab */}
        {activeTab === 'pharmacy' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Pharmacy Management</h2>
            <DataTable
              columns={[
                { header: 'Medicine ID', accessor: 'medicine_id' },
                { header: 'Name', accessor: 'name' },
                { header: 'Stock', accessor: 'stock_quantity' },
                { header: 'Price', accessor: 'price' }
              ]}
              data={pharmacy}
              loading={loading}
            />
          </div>
        )}

        {/* Labs Tab */}
        {activeTab === 'labs' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Laboratory Management</h2>
            <DataTable
              columns={[
                { header: 'Test ID', accessor: 'test_id' },
                { header: 'Test Name', accessor: 'test_name' },
                { header: 'Patient', accessor: 'patient_name' },
                { header: 'Status', accessor: 'status', cell: (v) => <StatusBadge status={v} /> }
              ]}
              data={labs}
              loading={loading}
            />
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Billing Management</h2>
            <DataTable
              columns={[
                { header: 'Invoice #', accessor: 'billing_id' },
                { header: 'Patient', accessor: 'patient_name' },
                { header: 'Amount', accessor: 'total_amount' },
                { header: 'Status', accessor: 'status', cell: (v) => <StatusBadge status={v} /> }
              ]}
              data={billing}
              loading={loading}
            />
          </div>
        )}

        {/* Ambulances Tab */}
        {activeTab === 'ambulances' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Ambulance Services</h2>
            <DataTable
              columns={[
                { header: 'Vehicle #', accessor: 'vehicle_number' },
                { header: 'Driver', accessor: 'driver_name' },
                { header: 'Status', accessor: 'status' },
                { header: 'Location', accessor: 'current_location' }
              ]}
              data={ambulances}
              loading={loading}
            />
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Patient Feedback</h2>
            <DataTable
              columns={[
                { header: 'Patient', accessor: 'patient_name' },
                { header: 'Rating', accessor: 'rating' },
                { header: 'Comments', accessor: 'comments' },
                { header: 'Date', accessor: 'created_at', cell: (v) => new Date(v).toLocaleDateString() }
              ]}
              data={feedback}
              loading={loading}
            />
          </div>
        )}
        </Layout>
    );
}