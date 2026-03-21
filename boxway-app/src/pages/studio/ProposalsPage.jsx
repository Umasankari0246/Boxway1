import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_PROPOSALS } from '../../data/mockData';

const statusConfig = {
  Draft: { cls: 'bg-zinc-100 text-zinc-600', dot: 'bg-zinc-400' },
  Submitted: { cls: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  'Under Review': { cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  Won: { cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  Lost: { cls: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

const STATUSES = ['All', 'Draft', 'Submitted', 'Under Review', 'Won', 'Lost'];

const ProposalsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [deletingId, setDeletingId] = useState(null);

  const won = MOCK_PROPOSALS.filter(p => p.status === 'Won').length;
  const closed = MOCK_PROPOSALS.filter(p => ['Won', 'Lost'].includes(p.status)).length;
  const winRate = closed > 0 ? Math.round((won / closed) * 100) : 0;
  const pipelineValue = MOCK_PROPOSALS.filter(p => ['Submitted', 'Under Review', 'Draft'].includes(p.status)).reduce((s, p) => s + p.value, 0);
  const pending = MOCK_PROPOSALS.filter(p => ['Submitted', 'Under Review'].includes(p.status)).length;

  const filtered = MOCK_PROPOSALS.filter(p =>
    (filter === 'All' || p.status === filter) &&
    (p.title.toLowerCase().includes(search.toLowerCase()) || p.client.toLowerCase().includes(search.toLowerCase()) || p.lead.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#fcf9f8]">
      {/* Sticky sub-header */}
      <div className="sticky top-0 z-20 bg-[#fcf9f8]/90 backdrop-blur border-b border-zinc-100 px-8 py-5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 uppercase">Proposals</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-0.5">{MOCK_PROPOSALS.length} enquiries · Architecture firm pipeline</p>
        </div>
        <button
          onClick={() => navigate('/proposals/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-[11px] font-black uppercase tracking-widest hover:bg-black transition-colors shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Enquiry / Proposal
        </button>
      </div>

      <div className="p-8 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Proposals', val: MOCK_PROPOSALS.length, icon: 'description', color: 'text-zinc-900' },
            { label: 'Win Rate', val: `${winRate}%`, icon: 'emoji_events', color: 'text-emerald-600', sub: `${won} of ${closed} closed` },
            { label: 'Pipeline Value', val: `$${(pipelineValue / 1000).toFixed(0)}K`, icon: 'monetization_on', color: 'text-primary', sub: 'active proposals' },
            { label: 'Awaiting Decision', val: pending, icon: 'pending_actions', color: 'text-amber-600', sub: 'submitted or under review' },
          ].map(k => (
            <div key={k.label} className="bg-white border border-zinc-100 shadow-sm p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{k.label}</p>
                <p className={`text-3xl font-black ${k.color}`}>{k.val}</p>
                {k.sub && <p className="text-[10px] text-zinc-400 mt-0.5">{k.sub}</p>}
              </div>
              <span className={`material-symbols-outlined text-[28px] ${k.color} opacity-30`}>{k.icon}</span>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="bg-white border border-zinc-100 shadow-sm p-3 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[20px]">search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border-none text-[12px] font-medium placeholder:text-zinc-400 focus:ring-1 focus:ring-primary"
              placeholder="Search by title, client, or lead architect..."
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-colors ${filter === s ? 'bg-primary text-white' : 'border border-zinc-200 text-zinc-500 hover:bg-zinc-50'}`}
              >
                {s}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-white border border-zinc-200 text-[11px] font-bold uppercase py-2 px-3 focus:ring-0 focus:border-primary flex-shrink-0"
          >
            <option value="date">Sort: Date</option>
            <option value="value">Sort: Value</option>
            <option value="status">Sort: Status</option>
          </select>
        </div>

        {/* Proposals Table */}
        <div className="bg-white border border-zinc-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="border-b border-zinc-100 bg-zinc-50/50">
              <tr>
                {['Proposal', 'Client', 'Lead Architect', 'Value', 'Status', 'Phase', 'Submitted', 'Actions'].map(col => (
                  <th key={col} className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest text-zinc-400">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <span className="material-symbols-outlined text-zinc-200 text-4xl block mb-2">description</span>
                    <p className="text-zinc-400 text-sm">No proposals match your search.</p>
                  </td>
                </tr>
              )}
              {filtered.map(p => {
                const cfg = statusConfig[p.status] || statusConfig.Draft;
                return (
                  <tr
                    key={p.id}
                    className="hover:bg-zinc-50/70 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/proposals/${p.id}`)}
                  >
                    <td className="px-5 py-4">
                      <p className="text-xs font-black text-zinc-900 group-hover:text-primary transition-colors">{p.title}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">v{p.version} · {p.id}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-semibold text-zinc-800">{p.client}</p>
                      <p className="text-[10px] text-zinc-400">{p.clientContact}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-zinc-600">{p.lead}</td>
                    <td className="px-5 py-4 text-xs font-black text-zinc-900">${p.value.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${cfg.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-0.5">
                        {['Initial', 'Review', 'Approved'].map((ph, i) => {
                          const phaseIndex = p.status === 'Won' ? 3 : p.status === 'Under Review' ? 2 : p.status === 'Submitted' ? 1 : 0;
                          return (
                            <div key={ph} className={`h-1.5 w-6 ${i < phaseIndex ? 'bg-primary' : i === phaseIndex && phaseIndex > 0 ? 'bg-primary/40' : 'bg-zinc-200'}`} />
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-zinc-400">{p.submittedDate || '—'}</td>
                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => navigate(`/proposals/${p.id}`)} className="p-1.5 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors" title="View"><span className="material-symbols-outlined text-[16px]">visibility</span></button>
                        <button onClick={() => navigate(`/proposals/new`)} className="p-1.5 hover:bg-zinc-100 text-zinc-400 hover:text-primary transition-colors" title="Edit"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                        <button
                          onClick={() => setDeletingId(p.id)}
                          className="p-1.5 hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors" title="Delete"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
            <span>Showing {filtered.length} of {MOCK_PROPOSALS.length} proposals</span>
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setDeletingId(null)}>
          <div className="bg-white p-8 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <span className="material-symbols-outlined text-red-500 text-3xl mb-3 block">warning</span>
            <h3 className="text-lg font-black uppercase tracking-tight mb-2">Delete Proposal?</h3>
            <p className="text-sm text-zinc-500 mb-6">This action cannot be undone. The proposal and all its data will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 border border-zinc-200 text-[11px] font-black uppercase tracking-widest hover:bg-zinc-50">Cancel</button>
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 bg-red-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalsPage;
