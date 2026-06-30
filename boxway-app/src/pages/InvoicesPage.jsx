import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, RefreshCw, DollarSign, Clock, AlertCircle, CheckCircle, ChevronRight, Trash2, Edit3, Download, X } from 'lucide-react';
import axios from 'axios';

const api = axios.create({
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api'
    : 'https://boxxway.onrender.com/api'
});

const InvoicesPage = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [deletingId, setDeletingId] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ client: '', project: '', amount: '', date: '', status: '', notes: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await api.get('/invoices/');
        setInvoices(response.data.data);
      } catch (err) {
        console.error("Error fetching invoices:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const filtered = invoices.filter(inv => {
    const matchesSearch = search === '' ||
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.client.toLowerCase().includes(search.toLowerCase()) ||
      inv.project.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All Statuses' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // Sort by createdAt first, fallback to date if createdAt is not available
    const dateA = a.createdAt || a.date;
    const dateB = b.createdAt || b.date;
    return new Date(dateB) - new Date(dateA);
  });

  const handleDelete = async () => {
    try {
      const idToDelete = deletingId;
      const updated = invoices.filter(inv => inv.id !== idToDelete);
      setInvoices(updated);
      const nextTotalPages = Math.max(1, Math.ceil(updated.length / itemsPerPage));
      setCurrentPage(page => Math.min(page, nextTotalPages));
      await api.delete(`/invoices/${encodeURIComponent(idToDelete)}`);
      setDeletingId(null);
    } catch (err) {
      console.error("Error deleting invoice:", err);
      alert("Failed to delete invoice");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/invoices/${encodeURIComponent(id)}`, { status: newStatus });
      setInvoices(prevInvoices => 
        prevInvoices.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv)
      );
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  const openEditModal = (invoice) => {
    setSelectedInvoice(invoice);
    setEditForm({
      client: invoice.client,
      project: invoice.project,
      amount: invoice.amount,
      date: invoice.date,
      status: invoice.status,
      notes: invoice.notes || ''
    });
    setShowEdit(true);
  };

  const handleEditInvoice = async () => {
    if (selectedInvoice) {
      try {
        const updatedInvoice = {
          client: editForm.client,
          project: editForm.project,
          amount: Number(editForm.amount),
          date: editForm.date,
          status: editForm.status,
          notes: editForm.notes
        };
        const response = await api.patch(`/invoices/${encodeURIComponent(selectedInvoice.id)}`, updatedInvoice);
        setInvoices(prevInvoices => 
          prevInvoices.map(inv => inv.id === selectedInvoice.id ? response.data.data : inv)
        );
        setShowEdit(false);
        setSelectedInvoice(null);
      } catch (err) {
        console.error("Error updating invoice:", err);
        alert("Failed to update invoice");
      }
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await api.get('/invoices/');
      setInvoices(response.data.data);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      alert("Failed to refresh invoices");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-100 text-emerald-700';
      case 'Pending': return 'bg-amber-100 text-amber-700';
      case 'Overdue': return 'bg-red-100 text-red-600';
      default: return 'bg-zinc-100 text-zinc-700';
    }
  };

  // Calculate KPIs
  const totalBilled = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const pending = invoices.filter(inv => inv.status === 'Pending').reduce((sum, inv) => sum + inv.amount, 0);
  const overdue = invoices.filter(inv => inv.status === 'Overdue').reduce((sum, inv) => sum + inv.amount, 0);
  const paidThisMonth = invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0);


  return (
    <div className="flex flex-col h-full bg-[#f8f6f6]">
      {/* Header Container */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-slate-500 mt-1">Track and manage client billing and incoming revenue</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleRefresh} disabled={loading} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <Link to="/invoices/new" className="px-4 py-2 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2">
              <Plus className="h-4 w-4" /> New Invoice
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search invoices by ID, client or project..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-colors"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-w-[150px] px-4 py-2 bg-white border border-slate-200 rounded text-sm text-slate-600 focus:outline-none focus:border-primary"
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="px-8 py-6 bg-[#f8f6f6]">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 border border-zinc-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-400 font-black uppercase mb-1">Total Billed</p>
              <h3 className="text-2xl font-black">${totalBilled.toLocaleString()}</h3>
            </div>
            <div className="text-primary"><DollarSign className="text-[28px]" /></div>
          </div>
          <div className="bg-white p-4 border border-zinc-100 shadow-sm flex items-center justify-between border-l-2 border-l-primary">
            <div>
              <p className="text-[10px] text-zinc-400 font-black uppercase mb-1">Pending</p>
              <h3 className="text-2xl font-black">${pending.toLocaleString()}</h3>
            </div>
            <div className="text-black"><Clock className="text-[28px]" /></div>
          </div>
          <div className="bg-white p-4 border border-zinc-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-400 font-black uppercase mb-1">Overdue</p>
              <h3 className="text-2xl font-black text-primary">${overdue.toLocaleString()}</h3>
            </div>
            <div className="text-primary"><AlertCircle className="text-[28px]" /></div>
          </div>
          <div className="bg-white p-4 border border-zinc-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-400 font-black uppercase mb-1">Paid this Month</p>
              <h3 className="text-2xl font-black">${paidThisMonth.toLocaleString()}</h3>
            </div>
            <div className="text-black"><CheckCircle className="text-[28px]" /></div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* List Header */}
          <div className="grid grid-cols-[1.5fr_2fr_1fr_1fr_1fr_120px] gap-4 px-8 py-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider items-center">
            <div>Invoice ID</div>
            <div>Client</div>
            <div>Issue Date</div>
            <div>Amount</div>
            <div>Status</div>
            <div className="text-right">Actions</div>
          </div>

          {/* List Body */}
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="px-8 py-12 text-center text-slate-500 text-sm flex flex-col items-center">
                 <RefreshCw className="animate-spin h-8 w-8 mb-2" />
                 Loading invoices...
              </div>
            ) : invoices.length === 0 ? (
              <div className="px-8 py-12 text-center text-slate-500 text-sm">
                 <DollarSign className="h-10 w-10 mb-2 text-slate-300" />
                 <p>No invoices found.</p>
              </div>
            ) : (
              paginated.map((inv, index) => (
                <div
                  key={`${inv.id}-${index}`}
                  className="grid grid-cols-[1.5fr_2fr_1fr_1fr_1fr_120px] gap-4 px-8 py-4 items-center hover:bg-slate-50 transition-colors group"
                >
                  <div className="text-xs font-black">{inv.id}</div>
                  <div>
                    <p className="text-xs font-black">{inv.client}</p>
                    <p className="text-[10px] text-zinc-500 uppercase">{inv.project}</p>
                  </div>
                  <div className="text-[11px] font-medium uppercase text-zinc-600">{inv.date}</div>
                  <div className="text-[11px] font-black text-right">${inv.amount.toLocaleString()}</div>
                  <div>
                    <select
                      value={inv.status}
                      onChange={(e) => handleStatusChange(inv.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      className={`px-4 py-0.5 text-[9px] font-black uppercase border-0 cursor-pointer min-w-[100px] ${getStatusColor(inv.status)}`}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-1 items-center">
                    <button onClick={() => setSelectedInvoice(inv)} className="text-slate-400 hover:text-black p-1.5 rounded hover:bg-slate-50 transition-colors" title="View">
                      <Download className="h-4 w-4" />
                    </button>
                    <button onClick={() => openEditModal(inv)} className="text-slate-400 hover:text-primary p-1.5 rounded hover:bg-primary/10 transition-colors" title="Edit">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeletingId(inv.id)} className="text-slate-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => navigate(`/invoices/${inv.id}`)} className="text-slate-400 hover:text-primary p-1.5 rounded hover:bg-primary/10 transition-colors" title="View Details">
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
                Showing {(safeCurrentPage - 1) * itemsPerPage + 1} to {Math.min(safeCurrentPage * itemsPerPage, filtered.length)} of {filtered.length} invoices
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
                  disabled={safeCurrentPage === 1}
                  className="px-3 py-1.5 text-xs font-medium rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 text-xs font-medium rounded border ${
                      safeCurrentPage === page
                        ? 'bg-primary text-white border-primary'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-medium rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Invoice Modal */}
      {showEdit && selectedInvoice && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowEdit(false)}>
          <div className="bg-white p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black uppercase tracking-tight">Edit Invoice</h3>
              <button onClick={() => setShowEdit(false)} className="p-1.5 hover:bg-zinc-100 transition-colors">
                <X className="text-[20px]" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Client</label>
                <input
                  className="w-full text-sm border-zinc-200 rounded focus:ring-primary focus:border-primary"
                  type="text"
                  value={editForm.client}
                  onChange={(e) => setEditForm({ ...editForm, client: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Project</label>
                <input
                  className="w-full text-sm border-zinc-200 rounded focus:ring-primary focus:border-primary"
                  type="text"
                  value={editForm.project}
                  onChange={(e) => setEditForm({ ...editForm, project: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Amount</label>
                  <input
                    className="w-full text-sm border-zinc-200 rounded focus:ring-primary focus:border-primary"
                    type="number"
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Date</label>
                  <input
                    className="w-full text-sm border-zinc-200 rounded focus:ring-primary focus:border-primary"
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Status</label>
                <select
                  className="w-full text-sm border-zinc-200 rounded focus:ring-primary focus:border-primary"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Notes</label>
                <textarea
                  className="w-full text-sm border-zinc-200 rounded focus:ring-primary focus:border-primary"
                  rows="3"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowEdit(false)} className="flex-1 py-2.5 border border-zinc-200 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50">Cancel</button>
              <button onClick={handleEditInvoice} className="flex-1 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-primary/90">Update Invoice</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setDeletingId(null)}>
          <div className="bg-white p-8 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <Icon name="warning" className="text-red-500 text-3xl mb-3 block" />
            <h3 className="text-lg font-black uppercase tracking-tight mb-2">Delete Invoice?</h3>
            <p className="text-sm text-zinc-500 mb-6">This will permanently remove the invoice and all its associated data.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 border border-zinc-200 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setSelectedInvoice(null)}>
          <div className="bg-white w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="text-lg font-black uppercase tracking-tight">Invoice Details</h3>
              <button onClick={() => setSelectedInvoice(null)} className="p-1.5 hover:bg-zinc-100 transition-colors">
                <Icon name="close" className="text-[20px]" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Invoice ID</p>
                  <p className="text-sm font-semibold">{selectedInvoice.id}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Issue Date</p>
                  <p className="text-sm font-semibold">{selectedInvoice.date}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Client</p>
                  <p className="text-sm font-semibold">{selectedInvoice.client}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Project</p>
                  <p className="text-sm font-semibold">{selectedInvoice.project}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Amount</p>
                  <p className="text-sm font-black text-lg">${selectedInvoice.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Status</p>
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase ${getStatusColor(selectedInvoice.status)}`}>{selectedInvoice.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default InvoicesPage;