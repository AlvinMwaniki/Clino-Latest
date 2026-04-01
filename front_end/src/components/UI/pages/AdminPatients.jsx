// ════════════════════════════════════════════════
// FILE: src/components/UI/pages/AdminPatients.jsx
// ════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import Layout from '../../Layout/Layout';
import Table from '../Table';
import { api } from '../../../utils/api';

const columns = [
  { header: 'ID', accessor: 'patient_id' },
  { header: 'Full Name', accessor: 'full_name' },
  { header: 'Date of Birth', accessor: 'date_of_birth' },
  { header: 'Gender', accessor: 'gender' },
  { header: 'Status', accessor: 'status' },
  { header: 'Room', accessor: 'room' },
  { header: 'Diagnosis', accessor: 'diagnosis' },
  { header: 'Admission Date', accessor: 'admissionDate' },
];

const INITIAL_FORM = {
  username: '', password_hash: '', confirm_password: '',
  full_name: '', email: '', phone: '',
  date_of_birth: '', gender: 'Male', contact_info: '',
  status: 'Stable', diagnosis: '', room: '', role: 'patient'
};

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [error, setError] = useState('');

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await api.get('/patients');
      setPatients(data);
    } catch { setPatients([]); }
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
      await api.post('/patients/register', formData);
      setShowForm(false);
      setFormData(INITIAL_FORM);
      fetchPatients();
    } catch (err) { setError(err.message); }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Patients Management</h1>
        <button onClick={() => { setShowForm(!showForm); setError(''); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          {showForm ? 'Cancel' : '+ Register Patient'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-blue-700">Patient Registration</h2>
          {error && <p className="text-red-600 text-sm mb-4 bg-red-50 p-2 rounded">{error}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3 border-r pr-4">
              <p className="text-xs font-bold text-gray-500 uppercase">Account Info</p>
              <input type="text" placeholder="Full Name" required className="w-full p-2 border rounded" onChange={set('full_name')} />
              <input type="text" placeholder="Username" required className="w-full p-2 border rounded" onChange={set('username')} />
              <input type="email" placeholder="Email" required className="w-full p-2 border rounded" onChange={set('email')} />
              <input type="text" placeholder="Phone" className="w-full p-2 border rounded" onChange={set('phone')} />
              <input type="password" placeholder="Password" required className="w-full p-2 border rounded" onChange={set('password_hash')} />
              <input type="password" placeholder="Confirm Password" required className="w-full p-2 border rounded" onChange={set('confirm_password')} />
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase">Medical Info</p>
              <input type="date" required className="w-full p-2 border rounded" onChange={set('date_of_birth')} />
              <select className="w-full p-2 border rounded" onChange={set('gender')}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <select className="w-full p-2 border rounded" onChange={set('status')}>
                <option value="Stable">Stable</option>
                <option value="Critical">Critical</option>
                <option value="Under Observation">Under Observation</option>
                <option value="Discharged">Discharged</option>
              </select>
              <input type="text" placeholder="Diagnosis" className="w-full p-2 border rounded" onChange={set('diagnosis')} />
              <input type="text" placeholder="Room / Ward" className="w-full p-2 border rounded" onChange={set('room')} />
              <input type="text" placeholder="Contact / Next of Kin" className="w-full p-2 border rounded" onChange={set('contact_info')} />
            </div>
            <div className="md:col-span-2 pt-2">
              <button type="submit" className="w-full bg-blue-700 text-white py-3 rounded-lg font-bold hover:bg-blue-800">
                Register Patient
              </button>
            </div>
          </form>
        </div>
      )}
      <Table columns={columns} data={patients} />
      {loading && <div className="text-center text-gray-500 mt-4 animate-pulse">Loading...</div>}
    </Layout>
  );
}