// ══════════════════════════════════════════════
// FILE: src/components/UI/pages/AdminWards.jsx
// ══════════════════════════════════════════════
import { useEffect, useState } from 'react';
import Layout from '../../Layout/Layout';
import { api } from '../../../utils/api';

export default function AdminWards() {
  const [wards, setWards] = useState([]);
  const [beds, setBeds] = useState([]);
  const [summary, setSummary] = useState({});
  const [selectedWard, setSelected] = useState(null);
  const [patients, setPatients] = useState([]);
  const [assignForm, setAssignForm] = useState({ bed_id: '', patient_id: '', notes: '' });

  useEffect(() => {
    api.get('/wards').then(setWards).catch(() => { });
    api.get('/wards/occupancy').then(setSummary).catch(() => { });
    api.get('/patients').then(setPatients).catch(() => { });
  }, []);

  const loadBeds = async (ward) => {
    setSelected(ward);
    const data = await api.get(`/wards/${ward.ward_id}/beds`).catch(() => []);
    setBeds(data);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await api.post('/wards/assign', assignForm);
      loadBeds(selectedWard);
      setAssignForm({ bed_id: '', patient_id: '', notes: '' });
    } catch (err) { alert(err.message); }
  };

  const handleDischarge = async (assignment_id) => {
    if (!window.confirm('Discharge this patient?')) return;
    await api.put(`/wards/discharge/${assignment_id}`, {}).catch(err => alert(err.message));
    loadBeds(selectedWard);
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Ward & Bed Management</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Beds', value: summary.total_beds || 0 },
          { label: 'Occupied', value: summary.occupied || 0, color: 'text-red-600' },
          { label: 'Available', value: summary.available || 0, color: 'text-green-600' },
          { label: 'Maintenance', value: summary.maintenance || 0, color: 'text-yellow-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border p-4 shadow-sm">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color || 'text-gray-800'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-3">Wards</h2>
          {wards.map(w => (
            <button key={w.ward_id} onClick={() => loadBeds(w)}
              className={`w-full text-left p-3 rounded-lg mb-2 border transition ${selectedWard?.ward_id === w.ward_id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}`}>
              <p className="font-medium text-sm">{w.ward_name}</p>
              <p className="text-xs text-gray-500">{w.occupied || 0}/{w.total_beds} beds occupied</p>
            </button>
          ))}
        </div>

        <div className="md:col-span-2 bg-white rounded-xl shadow p-4">
          {selectedWard ? (
            <>
              <h2 className="font-semibold mb-3">{selectedWard.ward_name} — Beds</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {beds.map(b => (
                  <div key={b.bed_id}
                    className={`p-3 rounded-lg border text-sm ${b.status === 'Occupied' ? 'bg-red-50 border-red-200' : b.status === 'Maintenance' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
                    <p className="font-bold">Bed {b.bed_number}</p>
                    <p className="text-xs">{b.status}</p>
                    {b.patient_name && <p className="text-xs font-medium mt-1">{b.patient_name}</p>}
                    {b.assignment_id && (
                      <button onClick={() => handleDischarge(b.assignment_id)}
                        className="mt-2 text-xs bg-red-600 text-white px-2 py-0.5 rounded hover:bg-red-700">
                        Discharge
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <form onSubmit={handleAssign} className="border-t pt-4 space-y-3">
                <h3 className="font-semibold text-sm">Assign a Bed</h3>
                <select required className="w-full p-2 border rounded text-sm"
                  value={assignForm.bed_id} onChange={e => setAssignForm(p => ({ ...p, bed_id: e.target.value }))}>
                  <option value="">Select Available Bed</option>
                  {beds.filter(b => b.status === 'Available').map(b => (
                    <option key={b.bed_id} value={b.bed_id}>Bed {b.bed_number}</option>
                  ))}
                </select>
                <select required className="w-full p-2 border rounded text-sm"
                  value={assignForm.patient_id} onChange={e => setAssignForm(p => ({ ...p, patient_id: e.target.value }))}>
                  <option value="">Select Patient</option>
                  {patients.map(p => <option key={p.patient_id} value={p.patient_id}>{p.full_name}</option>)}
                </select>
                <textarea placeholder="Notes (optional)" className="w-full p-2 border rounded text-sm"
                  value={assignForm.notes} onChange={e => setAssignForm(p => ({ ...p, notes: e.target.value }))} />
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700">
                  Assign Bed
                </button>
              </form>
            </>
          ) : (
            <p className="text-gray-400 text-center py-16">Select a ward to view beds</p>
          )}
        </div>
      </div>
    </Layout>
  );
}