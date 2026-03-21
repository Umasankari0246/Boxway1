import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_CLIENTS } from '../../data/mockData';

const ClientsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const statuses = ['All', 'Active', 'Inactive'];
  const filtered = MOCK_CLIENTS.filter(c =>
    (filter === 'All' || c.status === filter) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) ||
     c.contactPerson.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#f8f6f6]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Clients</h2>
          <p className="text-sm text-slate-500 mt-0.5">{MOCK_CLIENTS.length} registered clients</p>
        </div>
        <button onClick={() => navigate('/clients/new')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
          <span className="material-symbols-outlined text-lg">add</span>
          New Client
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Clients', val: MOCK_CLIENTS.length, icon: 'person_pin', color: 'text-slate-900' },
          { label: 'Active', val: MOCK_CLIENTS.filter(c => c.status === 'Active').length, icon: 'check_circle', color: 'text-green-600' },
          { label: 'Total Projects', val: MOCK_CLIENTS.reduce((s, c) => s + c.totalProjects, 0), icon: 'architecture', color: 'text-blue-600' },
          { label: 'Total Value', val: '$' + (MOCK_CLIENTS.reduce((s, c) => s + c.totalValue, 0) / 1000000).toFixed(1) + 'M', icon: 'attach_money', color: 'text-primary' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className={`material-symbols-outlined ${k.color}`}>{k.icon}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{k.label}</span>
            </div>
            <p className={`text-3xl font-black ${k.color}`}>{k.val}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded bg-white text-sm focus:outline-none focus:border-primary"
            placeholder="Search clients..." />
        </div>
        <div className="flex gap-2">
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${filter === s ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Client', 'Contact Person', 'Type', 'Projects', 'Total Value', 'Status', 'Actions'].map(col => (
                <th key={col} className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/clients/${c.id}`)}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{c.name.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.city}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{c.contactPerson}</td>
                <td className="px-6 py-4"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded uppercase">{c.type}</span></td>
                <td className="px-6 py-4 text-sm font-medium text-slate-700">{c.totalProjects}</td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">${c.totalValue.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded uppercase ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{c.status}</span>
                </td>
                <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                  <button className="text-slate-400 hover:text-primary transition-colors p-1">
                    <span className="material-symbols-outlined text-lg">more_vert</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientsPage;
