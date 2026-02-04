import { useEffect, useState } from 'react';
import Layout from '../components/Layout/Layout';
import Table from '../components/UI/Table';

const columns = [
    { header: 'Patient ID', accessor: 'patient_id' },
    { header: 'Full Name', accessor: 'full_name' },
    { header: 'Date of Birth', accessor: 'date_of_birth' },
    { header: 'Gender', accessor: 'gender' },
    { header: 'Contact Info', accessor: 'contact_info' },
    { header: 'Registration Date', accessor: 'registration_date' },
];

export default function AdminPatients() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  // Form State mapped to SSMS columns
  const [formData, setFormData] = useState({
    username: '',
    password_hash: '',
    confirm_password: '',
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: 'Male', // Default
    contact_info: '', // This acts as the address/emergency contact
    role: 'patient'
  });

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/patients');
      const data = await res.json();
      setPatients(data);
    } catch {
      setPatients([]);
    }
    setLoading(false);
  };
  useEffect(() => { fetchPatients(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password_hash !== formData.confirm_password) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch('/api/patients/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert("Patient registered successfully!");
        setShowForm(false);
        fetchPatients();
      } else {
        const err = await res.json();
        alert(`Error: ${err.message}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
    }
  };
    useEffect(() => {
        async function fetchPatients() {
            setLoading(true);
            try {
              const res = await fetch('/api/patients');
                const data = await res.json();
                setPatients(data);
            } catch {
                setPatients([]);
            }
            setLoading(false);
        }
        fetchPatients();
    }, []);

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Patients Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {showForm ? 'Cancel' : '+ Add New Patient'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-blue-700">Patient Registration (User & Patient Tables)</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4 border-r pr-4">
              <p className="text-xs font-bold text-gray-500 uppercase">Account Information</p>
              <input type="text" placeholder="Full Name" required className="w-full p-2 border rounded" onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
              <input type="text" placeholder="Username" required className="w-full p-2 border rounded" onChange={e => setFormData({ ...formData, username: e.target.value })} />
              <input type="email" placeholder="Email" required className="w-full p-2 border rounded" onChange={e => setFormData({ ...formData, email: e.target.value })} />
              <input type="password" placeholder="Password" required className="w-full p-2 border rounded" onChange={e => setFormData({ ...formData, password_hash: e.target.value })} />
              <input type="password" placeholder="Confirm Password" required className="w-full p-2 border rounded" onChange={e => setFormData({ ...formData, confirm_password: e.target.value })} />
            </div>
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-500 uppercase">Medical Records Information</p>
              <input type="date" placeholder="DOB" required className="w-full p-2 border rounded" onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })} />
              <select className="w-full p-2 border rounded" onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              <input type="text" placeholder="Phone (Contact Info)" className="w-full p-2 border rounded" onChange={e => setFormData({ ...formData, contact_info: e.target.value })} />
            </div>
            <div className="md:col-span-2 pt-4">
              <button type="submit" className="w-full bg-blue-700 text-white py-3 rounded-lg font-bold hover:bg-blue-800">
                Register Patient
              </button>
            </div>
          </form>
        </div>
      )}

      <Table columns={columns} data={patients} />
      {loading && <div className="text-center text-gray-500 mt-4">Loading...</div>}
    </Layout>
  );
}