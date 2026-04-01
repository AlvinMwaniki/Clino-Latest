// ══════════════════════════════════════════════════
// FILE: src/components/UI/pages/AdminAuditLogs.jsx
// ══════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import Layout from '../../Layout/Layout';
import { api } from '../../../utils/api';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ action: '', table_name: '' });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchLogs(); }, [filter]);

  const fetchLogs = async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 200, ...filter }).toString();
    try {
      const data = await api.get(`/audit?${params}`);
      setLogs(data || []);
    } catch { setLogs([]); }
    finally { setLoading(false); }
  };

  const actionColor = {
    LOGIN: 'bg-blue-100 text-blue-800',
    POST: 'bg-green-100 text-green-800',
    PUT: 'bg-yellow-100 text-yellow-800',
    DELETE: 'bg-red-100 text-red-800',
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>

      <div className="flex gap-4 mb-4">
        <select className="p-2 border rounded text-sm" value={filter.action}
          onChange={e => setFilter(p => ({ ...p, action: e.target.value }))}>
          <option value="">All Actions</option>
          <option value="LOGIN">Login</option>
          <option value="POST">Created</option>
          <option value="PUT">Updated</option>
          <option value="DELETE">Deleted</option>
        </select>
        <select className="p-2 border rounded text-sm" value={filter.table_name}
          onChange={e => setFilter(p => ({ ...p, table_name: e.target.value }))}>
          <option value="">All Tables</option>
          {['patients', 'doctors', 'appointments', 'billing', 'lab', 'pharmacy'].map(t => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Time', 'User', 'Role', 'Action', 'Table', 'Details'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 animate-pulse text-gray-400">Loading logs...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">No audit logs found</td></tr>
            ) : logs.map(log => (
              <tr key={log.log_id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-xs text-gray-500 whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })}
                </td>
                <td className="px-4 py-2 font-medium">{log.performed_by || 'System'}</td>
                <td className="px-4 py-2 text-gray-500 capitalize">{log.role || '—'}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${actionColor[log.action] || 'bg-gray-100 text-gray-700'}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-600 capitalize">{log.table_name}</td>
                <td className="px-4 py-2 text-xs text-gray-400 max-w-xs truncate" title={log.details}>
                  {log.details ? (() => { try { return JSON.parse(log.details)?.path || log.details; } catch { return log.details; } })() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}