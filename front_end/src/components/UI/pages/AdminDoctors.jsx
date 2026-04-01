// ═══════════════════════════════════════════════
// FILE: src/components/UI/pages/AdminDoctors.jsx
// ═══════════════════════════════════════════════
import { useEffect, useState } from 'react';
import Layout from '../../Layout/Layout';
import Table from '../Table';
import { api } from '../../../utils/api';

const columns = [
  { header: 'Doctor ID', accessor: 'doctor_id' },
  { header: 'Full Name', accessor: 'full_name' },
  { header: 'Specialization', accessor: 'specialization' },
  { header: 'Availability', accessor: 'availability_schedule' },
  { header: 'Feedback Score', accessor: 'feedback_score' },
];

const INITIAL_FORM = {
  username: '', password_hash: '', confirm_password: '',
  full_name: '', role: 'doctor', email: '', phone: '',
  specialization: '', availability_schedule: '', feedback_score: 0
};

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [error, setError] = useState('');

  useEffect(() => { fetchDoctors(); }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const data = await api.get('/doctors');
      setDoctors(data);
    } catch { setDoctors([]); }
    finally { setLoading(false); }
  };

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password_hash !== formData.confirm_password) {
      setError('Passwords do not match'); return;
    }
    try {
      await api.post('/doctors/register', formData);
      setShowForm(false);
      setFormData(INITIAL_FORM);
      fetchDoctors();
    } catch (err) { setError(err.message); }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Doctors Management</h1>
        <button onClick={() => { setShowForm(!showForm); setError(''); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          {showForm ? 'Cancel' : '+ Add New Doctor'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-blue-700">Register New Doctor</h2>
          {error && <p className="text-red-600 text-sm mb-4 bg-red-50 p-2 rounded">{error}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3 border-r pr-4">
              <p className="text-xs font-bold text-gray-500 uppercase">Account Information</p>
              <input type="text" placeholder="Full Name" required className="w-full p-2 border rounded" onChange={set('full_name')} />
              <input type="text" placeholder="Username" required className="w-full p-2 border rounded" onChange={set('username')} />
              <input type="email" placeholder="Email" required className="w-full p-2 border rounded" onChange={set('email')} />
              <input type="text" placeholder="Phone" className="w-full p-2 border rounded" onChange={set('phone')} />
              <input type="password" placeholder="Password" required className="w-full p-2 border rounded" onChange={set('password_hash')} />
              <input type="password" placeholder="Confirm Password" required className="w-full p-2 border rounded" onChange={set('confirm_password')} />
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase">Doctor Details</p>
              <input type="text" placeholder="Specialization" required className="w-full p-2 border rounded" onChange={set('specialization')} />
              <textarea placeholder="Availability e.g. Mon-Fri 8am-5pm" className="w-full p-2 border rounded h-24" onChange={set('availability_schedule')} />
            </div>
            <div className="md:col-span-2 pt-2">
              <button type="submit" className="w-full bg-blue-700 text-white py-3 rounded-lg font-bold hover:bg-blue-800">
                Save Doctor
              </button>
            </div>
          </form>
        </div>
      )}
      <Table columns={columns} data={doctors} />
      {loading && <div className="text-center text-gray-500 mt-4 animate-pulse">Loading...</div>}
    </Layout>
  );
}