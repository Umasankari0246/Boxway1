import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_CLIENTS, MOCK_PROJECTS, MOCK_INVOICES } from '../../data/mockData';

const ClientProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = React.useState('overview');
  const client = MOCK_CLIENTS.find(c => c.id === id) || MOCK_CLIENTS[0];
  const projects = MOCK_PROJECTS.filter(p => p.clientId === client.id);
  const invoices = MOCK_INVOICES.filter(i => i.clientId === client.id);

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8f6f6]">
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="flex items-start gap-5">
          <button onClick={() => navigate('/clients')} className="mt-1 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
            {client.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900">{client.name}</h2>
              <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded uppercase ${client.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{client.status}</span>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded uppercase bg-blue-50 text-blue-700">{client.type}</span>
            </div>
            <div className="flex gap-6 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">person</span>{client.contactPerson}</span>
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">mail</span>{client.email}</span>
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">location_on</span>{client.city}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase font-bold">Total Value</p>
            <p className="text-2xl font-black text-primary">${client.totalValue.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex gap-6 mt-5 border-t border-slate-100 pt-4">
          {['overview', 'projects', 'invoices'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`text-sm font-semibold capitalize pb-2 border-b-2 transition-colors ${tab === t ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {tab === 'overview' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Client Details</h3>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div><dt className="text-slate-500 text-xs uppercase font-bold">Company</dt><dd className="font-medium mt-0.5">{client.name}</dd></div>
                <div><dt className="text-slate-500 text-xs uppercase font-bold">Contact Person</dt><dd className="font-medium mt-0.5">{client.contactPerson}</dd></div>
                <div><dt className="text-slate-500 text-xs uppercase font-bold">Email</dt><dd className="font-medium mt-0.5">{client.email}</dd></div>
                <div><dt className="text-slate-500 text-xs uppercase font-bold">Phone</dt><dd className="font-medium mt-0.5">{client.phone}</dd></div>
                <div><dt className="text-slate-500 text-xs uppercase font-bold">Client Since</dt><dd className="font-medium mt-0.5">{client.joinDate}</dd></div>
                <div><dt className="text-slate-500 text-xs uppercase font-bold">Client ID</dt><dd className="font-medium mt-0.5">{client.id}</dd></div>
              </dl>
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="text-xs text-slate-500 uppercase font-bold">Active Projects</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{client.totalProjects}</p>
              </div>
              <div className="bg-zinc-900 rounded-xl p-5 text-white">
                <p className="text-xs text-zinc-400 uppercase font-bold">Lifetime Value</p>
                <p className="text-2xl font-black text-primary mt-1">${client.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'projects' && (
          <div className="space-y-4">
            {projects.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/projects/${p.id}`)}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{p.name}</p>
                    <p className="text-sm text-slate-500 mt-0.5">Phase {p.phase} of {p.totalPhases} · Led by {p.lead}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded uppercase ${
                    p.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                    p.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    p.status === 'On Hold' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'
                  }`}>{p.status}</span>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Progress</span><span>{p.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full"><div className="h-1.5 bg-primary rounded-full" style={{ width: `${p.progress}%` }} /></div>
                </div>
              </div>
            ))}
            {projects.length === 0 && <p className="text-slate-400 text-sm">No projects for this client.</p>}
          </div>
        )}

        {tab === 'invoices' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50"><tr>
                {['Invoice', 'Amount', 'Due Date', 'Status'].map(col => (
                  <th key={col} className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{col}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{inv.id}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">${inv.total.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{inv.dueDate}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        inv.status === 'Paid' ? 'bg-green-100 text-green-700' :
                        inv.status === 'Overdue' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'}`}>{inv.status}</span>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">No invoices found.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProfilePage;
