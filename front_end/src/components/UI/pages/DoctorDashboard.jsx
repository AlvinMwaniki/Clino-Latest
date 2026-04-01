import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Calendar, Stethoscope, User, ClipboardList, Activity, Pill, Ambulance, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Layout from "../../Layout/Layout.jsx";
import DataTable from "../DataTable.jsx";
import useAuthStore from "../../../store/useAuthStore";

// --- SUB-COMPONENTS (Defined outside to prevent re-renders) ---

function StatusBadge({ status }) {
  const statusClasses = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    confirmed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 py-1 text-xs rounded-full capitalize ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
}

function StatCard(props) {
  // 1. Get the icon from props
  const IconComponent = props.icon;

  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-full ${colorClasses[props.color]} flex items-center justify-center`}>
          {/* 2. Use the new variable name here */}
          {IconComponent && <IconComponent className="w-6 h-6" />}
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">{props.title}</p>
          <p className="text-2xl font-bold">
            {props.loading ? '...' : props.value}
          </p>
        </div>
      </div>
    </div>
  );
}
// --- MAIN DASHBOARD ---

export default function DoctorDashboard() {
  const user = useAuthStore((state) => state.user);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [labs, setLabs] = useState([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingLabs: 0,
    criticalPatients: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const location = useLocation();
  // --- HANDLER FUNCTIONS ---

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });

      if (res.ok) {
        setAppointments(appointments.map(appt =>
          appt.appointment_id === appointmentId
            ? { ...appt, status: 'completed' }
            : appt
        ));
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
    }
  };

  const updateLabResult = (testId) => console.log('Update lab result:', testId);
  const viewAppointmentDetails = (appointmentId) => console.log('View appointment:', appointmentId);
  const viewPatientDetails = (patientId) => console.log('View patient:', patientId);
  const viewLabDetails = (testId) => console.log('View lab test:', testId);

  // --- COLUMN DEFINITIONS (Now inside to access handlers) ---

  const appointmentColumns = [
    {
      header: 'Appointment ID',
      accessor: 'appointment_id',
      cell: (value) => <span className="font-mono text-sm">#{value}</span>
    },
    {
      header: 'Patient',
      accessor: 'patient_name',
      cell: (value) => (
        <div className="flex items-center">
          <User className="w-4 h-4 mr-2 text-green-600" />
          <span>{value}</span>
        </div>
      )
    },
    {
      header: 'Date & Time',
      accessor: 'appointment_date',
      cell: (value) => new Date(value).toLocaleString()
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (value) => <StatusBadge status={value} />
    },
    {
      header: 'Actions',
      accessor: 'appointment_id',
      cell: (value, row) => (
        <div className="flex space-x-2">
          {row.status === 'pending' && (
            <button
              onClick={() => handleCompleteAppointment(value)}
              className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
            >
              Complete
            </button>
          )}
          <button
            onClick={() => viewAppointmentDetails(value)}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
          >
            Details
          </button>
        </div>
      )
    }
  ];

  const patientColumns = [
    {
      header: 'Patient ID',
      accessor: 'patient_id',
      cell: (value) => <span className="font-mono text-sm">#{value}</span>
    },
    {
      header: 'Full Name',
      accessor: 'full_name',
      cell: (value) => <span className="font-medium">{value}</span>
    },
    {
      header: 'Gender',
      accessor: 'gender',
      cell: (value) => <span className="capitalize">{value}</span>
    },
    {
      header: 'Contact',
      accessor: 'contact_info',
      cell: (value) => (
        <div className="flex flex-col">
          <span>{value.phone}</span>
          <span className="text-xs text-gray-500">{value.email}</span>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: 'patient_id',
      cell: (value) => (
        <button
          onClick={() => viewPatientDetails(value)}
          className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded"
        >
          View
        </button>
      )
    }
  ];

  const labColumns = [
    { header: 'Test', accessor: 'test_name', cell: (value) => <span className="font-medium">{value}</span> },
    { header: 'Patient', accessor: 'patient_name' },
    { header: 'Date', accessor: 'test_date', cell: (value) => new Date(value).toLocaleDateString() },
    { header: 'Status', accessor: 'status', cell: (value) => <StatusBadge status={value} /> },
    {
      header: 'Result',
      accessor: 'result',
      cell: (value, row) => row.status === 'completed' ? <span className="text-sm">{value || 'No result'}</span> : <span className="text-gray-400 text-sm">Pending</span>
    },
    {
      header: 'Actions',
      accessor: 'test_id',
      cell: (value, row) => (
        <div className="flex space-x-2">
          {row.status === 'pending' && (
            <button onClick={() => updateLabResult(value)} className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded">Update</button>
          )}
          <button onClick={() => viewLabDetails(value)} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded">Details</button>
        </div>
      )
    }
  ];

  // --- DATA FETCHING ---
  useEffect(() => {
    const path = location.pathname.split('/').pop();
    const validTabs = ['appointments', 'patients', 'labs', 'pharmacy', 'ambulances'];

    if (validTabs.includes(path)) {
      setActiveTab(path);
    } else {
      setActiveTab('dashboard');
    }
  }, [location]);

  // --- Updated DATA FETCHING block in DoctorDashboard.jsx ---
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // 1. Fetch appointments specifically for this doctor (user_id 3)
        const appRes = await fetch(`/api/appointments/doctor/${user.user_id}`);
        const appData = await appRes.json();
        setAppointments(appData);

        // 2. Fetch patients
        const patRes = await fetch('/api/appoint_patients');
        const patData = await patRes.json();
        setPatients(patData);

        // 3. Fetch Labs
        const labRes = await fetch('/api/lab');
        const labData = await labRes.json();

        // Filter labs that belong to Sarah's patients using the fresh appData
        const relevantLabs = labData.filter(l => appData.some(a => a.patient_id === l.patient_id));
        setLabs(relevantLabs);

        // 4. Calculate Stats using appData DIRECTLY
        // Use local date string to avoid timezone mismatches
        const todayString = new Date().toLocaleDateString();
        const todayApps = appData.filter(a =>
          new Date(a.appointment_date).toLocaleDateString() === todayString
        ).length;

        const critPatientsRes = await fetch('/api/patients/stats/critical');
        const critPatients = await critPatientsRes.json();

        setStats({
          todayAppointments: todayApps,
          totalPatients: patData.length,
          pendingLabs: relevantLabs.filter(l => l.status === 'pending').length,
          criticalPatients: critPatients.count || 0
        });

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.user_id) fetchData();
  }, [user]);

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-2">
        {/* Title: Stacks on top on mobile, sits left on desktop */}
        <h1 className="text-2xl md:text-3xl font-bold text-green-800 flex items-center">
          <Stethoscope className="mr-3 w-6 h-6 md:w-8 md:h-8" />
          Doctor Dashboard
        </h1>

        {/* Welcome Message: Below title on mobile, sits right on desktop */}
        <div className="text-sm md:text-lg text-gray-600">
          Welcome, <span className="font-semibold text-green-700">Dr. {user?.full_name}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {[
          { id: 'dashboard', icon: ClipboardList, label: 'Overview' },
          { id: 'appointments', icon: Calendar, label: 'Appointments' },
          { id: 'patients', icon: User, label: 'Patients' },
          { id: 'labs', icon: Activity, label: 'Lab Tests' },
          { id: 'pharmacy', icon: Pill, label: 'Pharmacy' }
        ].map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center px-4 py-2 ${activeTab === tab.id ? 'border-b-2 border-green-600 text-green-700 font-medium' : 'text-gray-600 hover:text-green-600'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon className="w-5 h-5 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Rendering */}
      {activeTab === 'dashboard' && (
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Today's Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={Calendar} title="Today's Appointments" value={stats.todayAppointments} color="green" loading={loading} />
            <StatCard icon={User} title="Total Patients" value={stats.totalPatients} color="blue" loading={loading} />
            <StatCard icon={Activity} title="Pending Labs" value={stats.pendingLabs} color="orange" loading={loading} />
            <StatCard icon={AlertCircle} title="Critical Patients" value={stats.criticalPatients} color="red" loading={loading} />
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <DataTable columns={appointmentColumns} data={appointments} loading={loading} emptyMessage="No appointments found" />
        </div>
      )}

      {activeTab === 'patients' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <DataTable columns={patientColumns} data={patients} loading={loading} emptyMessage="No patients found" />
        </div>
      )}

      {activeTab === 'labs' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <DataTable columns={labColumns} data={labs} loading={loading} emptyMessage="No lab tests found" />
        </div>
      )}

      {activeTab === 'pharmacy' && (
        <div className="bg-white rounded-xl shadow-md p-6 text-center py-12">
          <Pill className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600">Pharmacy Management</h3>
          <p className="text-gray-500 mt-2">Coming Soon</p>
        </div>
      )}
    </Layout>
  );
}