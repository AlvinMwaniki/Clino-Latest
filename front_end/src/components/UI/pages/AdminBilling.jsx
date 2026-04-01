import { useEffect, useState } from 'react';
import Layout from '../../Layout/Layout';
import StatusBadge from '../StatusBadge';
import { api } from '../../../utils/api';

export default function AdminBilling() {
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [patients, setPatients] = useState([]);
  const [mpesaModal, setMpesaModal] = useState(null);
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [mpesaStatus, setMpesaStatus] = useState('');

  const [formData, setFormData] = useState({
    patient_id: '', appointment_id: '',
    consultation_fee: 0, lab_fees: 0, pharmacy_fees: 0, other_fees: 0,
    insurance_scheme: 'Cash', insurance_number: '',
    nhif_covered: 0, sha_covered: 0, notes: ''
  });

  useEffect(() => {
    fetchBills();
    fetchStats();
    api.get('/patients').then(setPatients).catch(() => { });
  }, []);

  const fetchBills = () => api.get('/billing').then(setBills).catch(() => setBills([])).finally(() => setLoading(false));
  const fetchStats = () => api.get('/billing/stats').then(setStats).catch(() => { });
  const set = (f) => (e) => setFormData(p => ({ ...p, [f]: e.target.value }));

  const totalAmount = ['consultation_fee', 'lab_fees', 'pharmacy_fees', 'other_fees']
    .reduce((s, k) => s + parseFloat(formData[k] || 0), 0);
  const patientOwes = Math.max(0, totalAmount - parseFloat(formData.nhif_covered || 0) - parseFloat(formData.sha_covered || 0));

  const handleCreateBill = async (e) => {
    e.preventDefault();
    try {
      await api.post('/billing', formData);
      setShowForm(false);
      fetchBills();
      fetchStats();
    } catch (err) { alert(err.message); }
  };

  const handleMpesaPay = async () => {
    if (!mpesaPhone) { setMpesaStatus('Enter a phone number'); return; }
    setMpesaStatus('Sending STK push...');
    try {
      const res = await api.post('/mpesa/stk-push', {
        billing_id: mpesaModal.billing_id,
        phone_number: mpesaPhone,
        amount: mpesaModal.patient_owes
      });
      setMpesaStatus('✅ ' + res.message);
    } catch (err) {
      setMpesaStatus('❌ ' + err.message);
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Billing Management</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          {showForm ? 'Cancel' : '+ Create Invoice'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Revenue', value: `KES ${Number(stats.total_revenue || 0).toLocaleString()}` },
          { label: 'Collected', value: `KES ${Number(stats.collected || 0).toLocaleString()}`, color: 'text-green-600' },
          { label: 'Outstanding', value: `KES ${Number(stats.outstanding || 0).toLocaleString()}`, color: 'text-red-600' },
          { label: 'NHIF Claims', value: stats.nhif_claims || 0 },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border p-4 shadow-sm">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-xl font-bold ${s.color || 'text-gray-800'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Create Bill Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-md border mb-8">
          <h2 className="text-lg font-semibold mb-4 text-blue-700">New Invoice</h2>
          <form onSubmit={handleCreateBill} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase">Patient & Fees (KES)</p>
              <select required className="w-full p-2 border rounded" onChange={set('patient_id')}>
                <option value="">Select Patient</option>
                {patients.map(p => <option key={p.patient_id} value={p.patient_id}>{p.full_name}</option>)}
              </select>
              <input type="number" placeholder="Consultation Fee" className="w-full p-2 border rounded" onChange={set('consultation_fee')} />
              <input type="number" placeholder="Lab Fees" className="w-full p-2 border rounded" onChange={set('lab_fees')} />
              <input type="number" placeholder="Pharmacy Fees" className="w-full p-2 border rounded" onChange={set('pharmacy_fees')} />
              <input type="number" placeholder="Other Fees" className="w-full p-2 border rounded" onChange={set('other_fees')} />
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase">Insurance (NHIF / SHA)</p>
              <select className="w-full p-2 border rounded" onChange={set('insurance_scheme')}>
                <option value="Cash">Cash</option>
                <option value="NHIF">NHIF</option>
                <option value="SHA">SHA (Social Health Authority)</option>
                <option value="Private">Private Insurance</option>
              </select>
              <input type="text" placeholder="Insurance / Member Number" className="w-full p-2 border rounded" onChange={set('insurance_number')} />
              <input type="number" placeholder="NHIF Covered Amount" className="w-full p-2 border rounded" onChange={set('nhif_covered')} />
              <input type="number" placeholder="SHA Covered Amount" className="w-full p-2 border rounded" onChange={set('sha_covered')} />
              <textarea placeholder="Notes" className="w-full p-2 border rounded" onChange={set('notes')} />
              <div className="bg-blue-50 p-3 rounded text-sm space-y-1">
                <div className="flex justify-between"><span>Total:</span><strong>KES {totalAmount.toLocaleString()}</strong></div>
                <div className="flex justify-between text-green-700">
                  <span>Insurance covers:</span>
                  <strong>KES {(parseFloat(formData.nhif_covered || 0) + parseFloat(formData.sha_covered || 0)).toLocaleString()}</strong>
                </div>
                <div className="flex justify-between text-red-700 font-bold">
                  <span>Patient owes:</span><strong>KES {patientOwes.toLocaleString()}</strong>
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="w-full bg-blue-700 text-white py-3 rounded-lg font-bold hover:bg-blue-800">
                Generate Invoice
              </button>
            </div>
          </form>
        </div>
      )}

      {/* M-Pesa Modal */}
      {mpesaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold mb-2">Pay via M-Pesa</h3>
            <p className="text-gray-600 mb-4">Amount due: <strong className="text-green-700">KES {Number(mpesaModal.patient_owes).toLocaleString()}</strong></p>
            <input type="tel" placeholder="Customer phone e.g. 0712345678"
              className="w-full p-2 border rounded mb-3"
              value={mpesaPhone} onChange={e => setMpesaPhone(e.target.value)} />
            {mpesaStatus && <p className="text-sm mb-3 text-blue-700">{mpesaStatus}</p>}
            <div className="flex gap-3">
              <button onClick={handleMpesaPay} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700">
                Send STK Push
              </button>
              <button onClick={() => { setMpesaModal(null); setMpesaPhone(''); setMpesaStatus(''); }}
                className="flex-1 border py-2 rounded-lg hover:bg-gray-50">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Bills Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['#', 'Patient', 'Total (KES)', 'Insurance', 'Patient Owes', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400 animate-pulse">Loading bills...</td></tr>
            ) : bills.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">No bills found</td></tr>
            ) : bills.map(b => (
              <tr key={b.billing_id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-sm">#{b.billing_id}</td>
                <td className="px-4 py-3 text-sm font-medium">{b.patient_name}</td>
                <td className="px-4 py-3 text-sm">{Number(b.total_amount).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm">{b.insurance_scheme}</td>
                <td className="px-4 py-3 text-sm font-bold text-red-700">{Number(b.patient_owes).toLocaleString()}</td>
                <td className="px-4 py-3"><StatusBadge status={b.payment_status || 'pending'} /></td>
                <td className="px-4 py-3">
                  {b.payment_status === 'Pending' && (
                    <button onClick={() => setMpesaModal({ billing_id: b.billing_id, patient_owes: b.patient_owes })}
                      className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                      M-Pesa
                    </button>
                  )}
                  {b.mpesa_receipt && <span className="text-xs text-gray-500 ml-2">{b.mpesa_receipt}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}