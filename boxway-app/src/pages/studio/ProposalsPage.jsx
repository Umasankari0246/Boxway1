import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Icon from "../../components/ui/Icon.jsx"

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
});

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
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [deletingId, setDeletingId] = useState(null);
  const [statusDropdownId, setStatusDropdownId] = useState(null);
  const [phaseDropdownId, setPhaseDropdownId] = useState(null);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await api.get('/proposals/');
        setProposals(response.data.data);
      } catch (err) {
        console.error("Error fetching proposals:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, []);

  const won = proposals.filter(p => p.status === 'Won').length;
  const closed = proposals.filter(p => ['Won', 'Lost'].includes(p.status)).length;
  const winRate = closed > 0 ? Math.round((won / closed) * 100) : 0;
  const pipelineValue = proposals.filter(p => ['Submitted', 'Under Review', 'Draft'].includes(p.status)).reduce((s, p) => s + p.value, 0);
  const pending = proposals.filter(p => ['Submitted', 'Under Review'].includes(p.status)).length;

  const filtered = proposals.filter(p =>
    (filter === 'All' || p.status === filter) &&
    (p.title.toLowerCase().includes(search.toLowerCase()) || p.client.toLowerCase().includes(search.toLowerCase()) || p.lead.toLowerCase().includes(search.toLowerCase()))
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.submittedDate || b.createdAt) - new Date(a.submittedDate || a.createdAt);
    if (sortBy === 'value') return b.value - a.value;
    if (sortBy === 'status') return a.status.localeCompare(b.status);
    return 0;
  });

  const handleDelete = async () => {
    try {
      await api.delete(`/proposals/${deletingId}`);
      const updated = proposals.filter(p => p.id !== deletingId);
      setProposals(updated);
      setDeletingId(null);
    } catch (err) {
      console.error("Error deleting proposal:", err);
      alert("Failed to delete proposal");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/proposals/${id}`, { status: newStatus });
      const updated = proposals.map(p => p.id === id ? { ...p, status: newStatus } : p);
      setProposals(updated);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  const handlePhaseChange = async (id, newPhase) => {
    try {
      await api.patch(`/proposals/${id}`, { phase: newPhase });
      const updated = proposals.map(p => p.id === id ? { ...p, phase: newPhase } : p);
      setProposals(updated);
    } catch (err) {
      console.error("Error updating phase:", err);
      alert("Failed to update phase");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#fcf9f8]">
      {/* Sticky sub-header */}
      <div className="sticky top-0 z-20 bg-[#fcf9f8]/90 backdrop-blur border-b border-zinc-100 px-8 py-5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-900 uppercase">Proposals</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-0.5">{proposals.length} enquiries · Architecture firm pipeline</p>
        </div>
        <button
          onClick={() => navigate('/proposals/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-[11px] font-black uppercase tracking-widest hover:bg-black transition-colors shadow-lg shadow-primary/20"
        >
          <Icon name="add" className="text-[18px]" />
          New Enquiry / Proposal
        </button>
      </div>

      <div className="p-8 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Proposals', val: proposals.length, icon: 'description', color: 'text-zinc-900' },
            { label: 'Win Rate', val: `${winRate}%`, icon: 'emoji_events', color: 'text-emerald-600', sub: `${won} of ${closed} closed` },
            { label: 'Pipeline Value', val: `$${(pipelineValue / 1000).toFixed(0)}K`, icon: 'monetization_on', color: 'text-primary', sub: 'active proposals' },
            { label: 'Awaiting Decision', val: pending, icon: 'pending_actions', color: 'text-amber-600', sub: 'submitted or under review' },
          ].map(k => (
            <div key={k.label} className="bg-white border border-zinc-100 shadow-sm p-5 flex items-center justify-between min-w-[200px]">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{k.label}</p>
                <p className={`text-3xl font-black ${k.color}`}>{k.val}</p>
                {k.sub && <p className="text-[10px] text-zinc-400 mt-0.5">{k.sub}</p>}
              </div>
              <Icon name={k.icon} className={`text-[28px] ${k.color} opacity-30`} />
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="bg-white border border-zinc-100 shadow-sm p-3 flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[20px]" />
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
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <Icon name="description" className="text-zinc-200 text-4xl block mb-2" />
                    <p className="text-zinc-400 text-sm">No proposals match your search.</p>
                  </td>
                </tr>
              )}
              {sorted.map(p => {
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
                      <div className="relative" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setStatusDropdownId(statusDropdownId === p.id ? null : p.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${cfg.cls} min-w-[100px]`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {p.status}
                        </button>
                        {statusDropdownId === p.id && (
                          <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded shadow-lg z-50 min-w-[100px]">
                            {['Draft', 'Submitted', 'Under Review', 'Won', 'Lost'].map(status => (
                              <button
                                key={status}
                                onClick={() => { handleStatusChange(p.id, status); setStatusDropdownId(null); }}
                                className="w-full px-3 py-2 text-left text-[10px] font-black uppercase hover:bg-zinc-50"
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="relative" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setPhaseDropdownId(phaseDropdownId === p.id ? null : p.id)}
                          className="text-xs text-zinc-600 min-w-[80px]"
                        >
                          {p.phase || 'Initial'}
                        </button>
                        {phaseDropdownId === p.id && (
                          <div className="absolute top-full left-0 mt-1 bg-white border border-zinc-200 rounded shadow-lg z-50 min-w-[80px]">
                            {['Initial', 'Review', 'Approved'].map(phase => (
                              <button
                                key={phase}
                                onClick={() => { handlePhaseChange(p.id, phase); setPhaseDropdownId(null); }}
                                className="w-full px-3 py-2 text-left text-[10px] font-black uppercase hover:bg-zinc-50"
                              >
                                {phase}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-zinc-400">{p.submittedDate || '—'}</td>
                    <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => navigate(`/proposals/${p.id}`)} className="p-1.5 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors" title="View"><Icon name="visibility" className="text-[16px]" /></button>
                        <button onClick={() => navigate(`/proposals/new`)} className="p-1.5 hover:bg-zinc-100 text-zinc-400 hover:text-primary transition-colors" title="Edit"><Icon name="edit" className="text-[16px]" /></button>
                        <button
                          onClick={() => setDeletingId(p.id)}
                          className="p-1.5 hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors" title="Delete"
                        >
                          <Icon name="delete" className="text-[16px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-zinc-100 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
            <span>Showing {sorted.length} of {proposals.length} proposals</span>
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setDeletingId(null)}>
          <div className="bg-white p-8 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <Icon name="warning" className="text-red-500 text-3xl mb-3 block" />
            <h3 className="text-lg font-black uppercase tracking-tight mb-2">Delete Proposal?</h3>
            <p className="text-sm text-zinc-500 mb-6">This action cannot be undone. The proposal and all its data will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 border border-zinc-200 text-[11px] font-black uppercase tracking-widest hover:bg-zinc-50">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalsPage;