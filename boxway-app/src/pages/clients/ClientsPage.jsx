import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MoreVertical, User, CheckCircle, Building2, DollarSign } from 'lucide-react';
import axios from 'axios';
import Icon from "../../components/ui/Icon.jsx"

const api = axios.create({
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api'
    : 'https://boxxway.onrender.com/api'
});

const iconMap = {
  person_pin: User,
  check_circle: CheckCircle,
  architecture: Building2,
  attach_money: DollarSign,
};

const ClientsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get('/clients/');
        setClients(response.data.data);
      } catch (err) {
        console.error("Error fetching clients:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    try {
      await api.delete(`/clients/${id}`);
      setClients(clients.filter(c => c.id !== id));
      setOpenMenuId(null);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error deleting client:", err);
      alert("Failed to delete client");
    }
  };

  const toggleMenu = (id) => setOpenMenuId((current) => (current === id ? null : id));

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/clients/${id}`, { status: newStatus });
      setClients(clients.map(c => c.id === id ? { ...c, status: newStatus } : c));
      setOpenMenuId(null);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await api.get('/clients/');
      setClients(res.data.data || []);
    } catch (err) {
      console.error('Error refreshing clients:', err);
      alert('Failed to refresh clients');
    } finally {
      setLoading(false);
    }
  };

  const statuses = ['All', 'Active', 'Inactive'];
  const filtered = clients.filter(c =>
    (filter === 'All' || c.status === filter) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) ||
     c.contactPerson.toLowerCase().includes(search.toLowerCase()))
  ).reverse(); // Sort by recently added first

  // Pagination
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginatedClients = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#f8f6f6]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-slate-500 mt-0.5">{clients.length} registered clients</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} disabled={loading} className="px-3 py-2 bg-white border border-slate-200 text-sm font-bold rounded hover:bg-slate-50">
            <Icon name="refresh" className="text-[16px]" />
          </button>
          <button onClick={() => navigate('/clients/new')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" />
            New Client
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Clients', val: clients.length, icon: 'person_pin', color: 'text-slate-900' },
          { label: 'Active', val: clients.filter(c => c.status === 'Active').length, icon: 'check_circle', color: 'text-green-600' },
          { label: 'Total Projects', val: clients.reduce((s, c) => s + (c.totalProjects || 0), 0), icon: 'architecture', color: 'text-blue-600' },
          { label: 'Total Value', val: '$' + (clients.reduce((s, c) => s + (c.totalValue || 0), 0) / 1000000).toFixed(1) + 'M', icon: 'attach_money', color: 'text-primary' },
        ].map(k => {
          const Icon = iconMap[k.icon] || User;
          return (
            <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Icon className={`${k.color} h-5 w-5`} />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{k.label}</span>
              </div>
              <p className={`text-3xl font-black ${k.color}`}>{k.val}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Client', 'Contact Person', 'Type', 'Projects', 'Total Value', 'Status', 'Actions'].map(col => (
                <th key={col} className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedClients.map(c => (
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
                  <select
                    value={c.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleStatusChange(c.id, e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className={`px-3 py-1 text-[10px] font-bold rounded uppercase border-0 cursor-pointer min-w-[100px] ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                  <div className="relative inline-flex">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMenu(c.id);
                      }}
                      className="text-slate-400 hover:text-primary transition-colors p-1"
                      aria-label="Client actions"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    {openMenuId === c.id && (
                      <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-slate-200 bg-white shadow-xl shadow-black/5 z-50">
                        <button
                          onClick={() => { setOpenMenuId(null); navigate(`/clients/${c.id}`); }}
                          className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => { setOpenMenuId(null); navigate(`/clients/${c.id}/edit`); }}
                          className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-slate-50"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setOpenMenuId(null)}
                          className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} clients
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-xs font-bold rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 text-xs font-bold rounded border ${
                  currentPage === page
                    ? 'border-primary bg-primary text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-xs font-bold rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;