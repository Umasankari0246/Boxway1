import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Icon from "../../components/ui/Icon.jsx"

const api = axios.create({
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api'
    : 'https://boxxway.onrender.com/api'
});

const STATUS_CFG = {
  'In Progress': { cls: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
  'Planning':    { cls: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  'Completed':   { cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  'On Hold':     { cls: 'bg-zinc-100 text-zinc-500',   dot: 'bg-zinc-400' },
};
const TYPE_COLORS = {
  'Commercial':   'bg-indigo-50 text-indigo-700',
  'Residential':  'bg-teal-50 text-teal-700',
  'Hospitality':  'bg-rose-50 text-rose-700',
  'Municipal':    'bg-sky-50 text-sky-700',
  'High-End Residential': 'bg-violet-50 text-violet-700',
  'Cultural / Institutional': 'bg-orange-50 text-orange-700',
  'Renovation / Restoration': 'bg-yellow-50 text-yellow-700',
};
const STATUSES = ['All', 'In Progress', 'Planning', 'On Hold', 'Completed'];

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects/');
        setProjects(response.data.data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const types = ['All', ...Array.from(new Set(projects.map(p => p.type)))];

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const filtered = projects
    .filter(p =>
      (statusFilter === 'All' || p.status === statusFilter) &&
      (typeFilter === 'All' || p.type === typeFilter) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
       p.client.toLowerCase().includes(search.toLowerCase()) ||
       p.lead.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      let va = a[sortBy], vb = b[sortBy];
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  const totalBudget = projects.reduce((s, p) => s + (p.budget || 0), 0);
  const totalSpent  = projects.reduce((s, p) => s + (p.spent || 0), 0);

  const handleDelete = async () => {
    try {
      await api.delete(`/projects/${deletingId}`);
      setProjects(projects.filter(p => p.id !== deletingId));
      setDeletingId(null);
    } catch (err) {
      console.error("Error deleting project:", err);
      alert("Failed to delete project");
    }
  };

  const SortIcon = ({ col }) => (
    <Icon name={sortBy === col ? (sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'} className={`text-[14px] ml-0.5 ${sortBy === col ? 'text-primary' : 'text-zinc-300'}`} />
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#fcf9f8]">
      {/* KPIs */}
      <div className="px-8 pt-6 pb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects',  val: projects.length,                                                                          icon: 'architecture',       color: 'text-zinc-900' },
          { label: 'In Progress',     val: projects.filter(p => p.status === 'In Progress').length,                                 icon: 'pending_actions',    color: 'text-blue-600' },
          { label: 'Total Budget',    val: '$' + (totalBudget / 1000000).toFixed(1) + 'M',                                               icon: 'monetization_on',    color: 'text-primary'  },
          { label: 'Avg. Progress',   val: projects.length ? Math.round(projects.reduce((s, p) => s + (p.progress || 0), 0) / projects.length) + '%' : '0%',   icon: 'trending_up',        color: 'text-emerald-600' },
        ].map(k => (
          <div key={k.label} className="bg-white border border-zinc-100 shadow-sm p-5 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">{k.label}</p>
              <p className={`text-3xl font-black ${k.color}`}>{k.val}</p>
            </div>
            <Icon name={k.icon} className={`text-[28px] ${k.color} opacity-20`} />
          </div>
        ))}
      </div>

      {/* Search / Filter / Action bar */}
      <div className="px-8 pb-4">
        <div className="bg-white border border-zinc-100 shadow-sm py-3 px-4 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-40">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[18px]" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-zinc-50 text-xs font-medium placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Search project, client, or lead..." />
          </div>
          {/* Status filters */}
          <div className="flex gap-1.5 flex-wrap">
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest transition-colors ${statusFilter === s ? 'bg-primary text-white' : 'border border-zinc-200 text-zinc-500 hover:bg-zinc-50'}`}>{s}</button>
            ))}
          </div>
          {/* Type dropdown */}
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border border-zinc-200 text-[10px] font-black uppercase py-2 px-3 focus:ring-0 focus:border-primary bg-white">
            {types.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
          </select>
          {/* Sort */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border border-zinc-200 text-[10px] font-black uppercase py-2 px-3 focus:ring-0 focus:border-primary bg-white">
            <option value="name">Sort: Name</option>
            <option value="budget">Sort: Budget</option>
            <option value="progress">Sort: Progress</option>
            <option value="endDate">Sort: End Date</option>
          </select>
          {/* New Project CTA */}
          <button onClick={() => navigate('/projects/new')} className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors shadow-sm shadow-primary/20">
            <Icon name="add" className="text-[16px]" />New Project
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="px-8 pb-16">
        <div className="bg-white border border-zinc-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="border-b border-zinc-100 bg-zinc-50/60">
              <tr>
                {[
                  { label: 'Project', col: 'name' },
                  { label: 'Type', col: 'type' },
                  { label: 'Client', col: 'client' },
                  { label: 'Lead', col: 'lead' },
                  { label: 'Budget', col: 'budget' },
                  { label: 'Progress', col: 'progress' },
                  { label: 'Phase', col: 'phase' },
                  { label: 'Status', col: 'status' },
                  { label: 'End Date', col: 'endDate' },
                  { label: 'Actions', col: null },
                ].map(({ label, col }) => (
                  <th key={label} className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest text-zinc-400 whitespace-nowrap">
                    {col ? (
                      <button onClick={() => toggleSort(col)} className="flex items-center hover:text-zinc-700 transition-colors">
                        {label}<SortIcon col={col} />
                      </button>
                    ) : label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="py-16 text-center">
                  <Icon name="architecture" className="text-zinc-200 text-4xl block mb-2" />
                  <p className="text-zinc-400 text-sm">No projects match your filters.</p>
                </td></tr>
              )}
              {filtered.map(p => {
                const sc = STATUS_CFG[p.status] || STATUS_CFG['On Hold'];
                const tc = TYPE_COLORS[p.type] || 'bg-zinc-50 text-zinc-600';
                const budgetPct = Math.round((p.spent / p.budget) * 100);
                return (
                  <tr key={p.id} className="hover:bg-zinc-50/70 transition-colors cursor-pointer group" onClick={() => navigate(`/projects/${p.id}`)}>
                    <td className="px-5 py-3.5 max-w-[180px]">
                      <p className="text-xs font-black text-zinc-800 group-hover:text-primary transition-colors truncate">{p.name}</p>
                      <p className="text-[9px] text-zinc-400 font-mono">{p.id}</p>
                    </td>
                    <td className="px-5 py-3.5"><span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 ${tc}`}>{p.type}</span></td>
                    <td className="px-5 py-3.5 text-xs text-zinc-600 whitespace-nowrap">{p.client}</td>
                    <td className="px-5 py-3.5 text-xs text-zinc-500 whitespace-nowrap">{p.lead}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-black text-zinc-900">${(p.budget / 1000).toFixed(0)}K</p>
                      <p className="text-[9px] text-zinc-400">${(p.spent / 1000).toFixed(0)}K spent</p>
                    </td>
                    <td className="px-5 py-3.5 min-w-[100px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-zinc-100">
                          <div className={`h-1.5 transition-all ${budgetPct > 90 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${p.progress}%` }} />
                        </div>
                        <span className="text-[9px] font-black text-zinc-500 w-8">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[9px] font-mono font-black text-zinc-500">{p.phase}/{p.totalPhases}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${sc.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-zinc-400 whitespace-nowrap">{p.endDate}</td>
                    <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => navigate(`/projects/${p.id}`)} className="p-1.5 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors" title="View"><Icon name="visibility" className="text-[15px]" /></button>
                        <button onClick={() => navigate(`/projects/${p.id}/edit`)} className="p-1.5 hover:bg-zinc-100 text-zinc-400 hover:text-primary transition-colors" title="Edit"><Icon name="edit" className="text-[15px]" /></button>
                        <button onClick={() => setDeletingId(p.id)} className="p-1.5 hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors" title="Delete"><Icon name="delete" className="text-[15px]" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-zinc-50 text-[9px] font-black uppercase tracking-widest text-zinc-400 flex justify-between">
            <span>Showing {filtered.length} of {projects.length} projects</span>
            <span>Total budget: ${(totalBudget / 1000000).toFixed(1)}M · Spent: ${(totalSpent / 1000000).toFixed(1)}M</span>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setDeletingId(null)}>
          <div className="bg-white p-8 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <Icon name="warning" className="text-red-500 text-3xl mb-3 block" />
            <h3 className="text-lg font-black uppercase tracking-tight mb-2">Delete Project?</h3>
            <p className="text-sm text-zinc-500 mb-6">This will permanently delete the project and all associated data.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 border border-zinc-200 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;