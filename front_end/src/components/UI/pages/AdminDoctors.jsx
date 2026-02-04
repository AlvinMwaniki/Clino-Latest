import { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import Table from '../components/UI/Table';

const columns = [
    { header: 'Doctor ID', accessor: 'doctor_id' },
    { header: 'Full Name', accessor: 'full_name' },
    { header: 'Specialization', accessor: 'specialization' },
    { header: 'Availability', accessor: 'availability_schedule' },
    { header: 'Feedback Score', accessor: 'feedback_score' },
];

export default function AdminDoctors() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    // Users Table Fields
    username: '',
    password_hash: '', // We'll send the raw password, backend will hash it
    confirm_password: '',
    full_name: '',
    role: 'doctor',    // This is mandatory for your Users table
    email: '',
    phone: '',

    // Doctors Table Fields
    specialization: '',
    availability_schedule: '',
    feedback_score: 0   // Default starting score
  });

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/doctors');
      const data = await res.json();
      setDoctors(data);
    } catch {
      setDoctors([]);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password_hash !== formData.confirm_password) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch('/api/doctors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData) // Sends all fields (role, specialization, etc.)
      });

      if (res.ok) {
        alert("Success: User and Doctor records created!");
        setShowForm(false);
        fetchDoctors();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

    useEffect(() => {
        async function fetchDoctors() {
            setLoading(true);
            try {
              const res = await fetch('/api/doctors');
                const data = await res.json();
                setDoctors(data);
            } catch {
                setDoctors([]);
            }
            setLoading(false);
        }
        fetchDoctors();
    }, []);

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Doctors Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-2200"
        >
          {showForm ? 'Cancel' : '+ Add New Doctor'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-green-100 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-green-700">Add New Doctor (User & Doctor Tables)</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* --- USERS TABLE FIELDS --- */}
            <div className="space-y-4 border-r pr-4">
              <p className="text-xs font-bold text-blue-600 uppercase">Users Table Data</p>
              <input type="text" placeholder="Full Name" required className="w-full p-2 border rounded" onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
              <input type="text" placeholder="Username" required className="w-full p-2 border rounded" onChange={e => setFormData({ ...formData, username: e.target.value })} />
              <input type="email" placeholder="Email" required className="w-full p-2 border rounded" onChange={e => setFormData({ ...formData, email: e.target.value })} />
              <input type="text" placeholder="Phone" className="w-full p-2 border rounded" onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              {/* Role is hidden because it's always 'doctor' for this form */}
              <input type="password" placeholder="Password" required className="w-full p-2 border rounded" onChange={e => setFormData({ ...formData, password_hash: e.target.value })} />
              <input type="password" placeholder="Repeat Password" required className="w-full p-2 border rounded" onChange={e => setFormData({ ...formData, confirm_password: e.target.value })} />
            </div>

            {/* --- DOCTORS TABLE FIELDS --- */}
            <div className="space-y-4">
              <p className="text-xs font-bold text-blue-600 uppercase">Doctors Table Data</p>
              <input type="text" placeholder="Specialization" required className="w-full p-2 border rounded" onChange={e => setFormData({ ...formData, specialization: e.target.value })} />
              <textarea placeholder="Availability Schedule" className="w-full p-2 border rounded" onChange={e => setFormData({ ...formData, availability_schedule: e.target.value })} />
              <input type="number" placeholder="Initial Feedback Score" className="w-full p-2 border rounded" value={formData.feedback_score} onChange={e => setFormData({ ...formData, feedback_score: e.target.value })} />
            </div>

            <div className="md:col-span-2 pt-4">
              <button type="submit" className="w-full bg-blue-700 text-white py-3 rounded-lg font-bold">
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      <Table columns={columns} data={doctors} />
      {loading && <div className="text-center text-gray-500 mt-4">Loading...</div>}
    </Layout>
  );
} 