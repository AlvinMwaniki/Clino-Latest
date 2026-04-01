import { useEffect, useState } from 'react';
import Layout from "../../Layout/Layout.jsx";
import Table from "../Table.jsx";

const columns = [
  { header: 'ID', accessor: 'appointment_id' },
  { header: 'Patient', accessor: 'patient_name' }, // Changed from patient_id
  { header: 'Doctor', accessor: 'doctor_name' },   // Changed from doctor_id
  {
    header: 'Date & Time',
    accessor: 'appointment_date',
    render: (value) => new Date(value).toLocaleString() // Make it readable
  },
  { header: 'Status', accessor: 'status' },
];

export default function AdminAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAppointments() {
            setLoading(true);
            try {
                // Fetch all doctors' appointments (assuming admin can see all)
              const res = await fetch('/api/appointments');
                const data = await res.json();
                setAppointments(data);
            } catch {
                setAppointments([]);
            }
            setLoading(false);
        }
        fetchAppointments();
    }, []);

    return (
        <Layout>
            <h1 className="text-2xl font-bold mb-6">Appointments Management</h1>
            <Table columns={columns} data={appointments} />
            {loading && <div className="text-center text-gray-500 mt-4">Loading...</div>}
        </Layout>
    );
} 