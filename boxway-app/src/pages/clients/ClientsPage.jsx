import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, User, CheckCircle, Building2, DollarSign, RefreshCw, MapPin, ChevronRight, Trash2, Edit3 } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from '../../store/settingsStore';
import { useFormatters } from '../../store/settingsStore';

const api = axios.create({
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api'
    : 'https://boxxway.onrender.com/api'
});

const ClientsPage = () => {
  const { formatCurrency, formatDate } = useFormatters();

  const { t } = useTranslation();

  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
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
      setCurrentPage(1);
    } catch (err) {
      console.error("Error deleting client:", err);
      alert("Failed to delete client");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/clients/${id}`, { status: newStatus });
      setClients(clients.map(c => c.id === id ? { ...c, status: newStatus } : c));
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
    <div className="flex flex-col h-full bg-[#f8f6f6]">
      {/* Header Container */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-slate-500 mt-1">{t('Manage your client relationships and project portfolios')}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleRefresh} disabled={loading} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50">
              <RefreshCw className="h-4 w-4" />{t('Refresh')}</button>
            <button onClick={() => navigate('/clients/new')} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2">
              <Plus className="h-4 w-4" />{t('New Client')}</button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder={t('Search clients by name or contact person...')} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-colors"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="min-w-[150px] px-4 py-2 bg-white border border-slate-200 rounded text-sm text-slate-600 focus:outline-none focus:border-primary"
          >
            <option value="All">{t('All Status')}</option>
            <option value="Active">{t('Active')}</option>
            <option value="Inactive">{t('Inactive')}</option>
          </select>
        </div>
      </div>
      <div className="px-8 py-6 bg-[#f8f6f6]">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Clients', val: clients.length, icon: User, color: 'text-slate-900' },
            { label: 'Active', val: clients.filter(c => c.status === 'Active').length, icon: CheckCircle, color: 'text-green-600' },
            { label: 'Total Projects', val: clients.reduce((s, c) => s + (c.totalProjects || 0), 0), icon: Building2, color: 'text-blue-600' },
            { label: 'Total Value', val: '$' + (clients.reduce((s, c) => s + (c.totalValue || 0), 0) / 1000000).toFixed(1) + 'M', icon: DollarSign, color: 'text-primary' },
          ].map(k => {
            const Icon = k.icon;
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
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* List Header */}
          <div className="grid grid-cols-[auto_2fr_1.5fr_1fr_1fr_1fr_120px] gap-4 px-8 py-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider items-center">
            <div className="w-10">{t('Image')}</div>
            <div>{t('Client')}</div>
            <div>{t('Contact Person')}</div>
            <div>{t('Projects')}</div>
            <div>{t('Total Value')}</div>
            <div>{t('Status')}</div>
            <div className="text-right">{t('Actions')}</div>
          </div>

          {/* List Body */}
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="px-8 py-12 text-center text-slate-500 text-sm flex flex-col items-center">
                 <RefreshCw className="animate-spin h-8 w-8 mb-2" />{t('Loading clients...')}</div>
            ) : clients.length === 0 ? (
              <div className="px-8 py-12 text-center text-slate-500 text-sm">
                 <User className="h-10 w-10 mb-2 text-slate-300" />
                 <p>{t('No clients found.')}</p>
              </div>
            ) : (
              paginatedClients.map((c, index) => (
                <div
                  key={`${c.id}-${index}`}
                  className="grid grid-cols-[auto_2fr_1.5fr_1fr_1fr_1fr_120px] gap-4 px-8 py-4 items-center hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-slate-200">
                    <span className="text-sm">{c.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h3
                      onClick={() => navigate(`/clients/${c.id}`)}
                      className="font-bold text-base text-slate-900 group-hover:text-primary transition-colors cursor-pointer"
                    >
                      {c.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{c.city || 'N/A'}
                    </p>
                  </div>
                  <div className="text-sm text-slate-600">{c.contactPerson}</div>
                  <div className="text-sm font-semibold text-slate-900">{c.totalProjects}</div>
                  <div className="text-sm font-semibold text-slate-900">{formatCurrency(c.totalValue.toLocaleString())}</div>
                  <div>
                    <select
                      value={c.status}
                      onChange={(e) => { e.stopPropagation(); handleStatusChange(c.id, e.target.value); }}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-[10px] font-bold rounded uppercase px-3 py-1 outline-none cursor-pointer border border-transparent hover:border-slate-200 min-w-[100px] ${
                        c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <option value="Active">{t('Active')}</option>
                      <option value="Inactive">{t('Inactive')}</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-1 items-center">
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(c.id); }} className="text-slate-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors" title={t('Delete')}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/clients/${c.id}/edit`); }} className="text-slate-400 hover:text-blue-500 p-1.5 rounded hover:bg-blue-50 transition-colors" title={t('Edit')}>
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/clients/${c.id}`); }} className="text-slate-400 hover:text-primary p-1.5 rounded hover:bg-primary/10 transition-colors" title={t('View Details')}>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="px-8 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} clients
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-medium rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >{t('Previous')}</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 text-xs font-medium rounded border ${
                      currentPage === page
                        ? 'bg-primary text-white border-primary'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-medium rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >{t('Next')}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;