import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Icon from "../components/ui/Icon.jsx"

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
    <div className="flex-1 p-6 overflow-y-auto no-scrollbar space-y-6">
      {/* Top Actions */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Financial Ledger</h1>
          <p className="text-[10px] text-zinc-500 uppercase font-bold mt-0.5">Track and manage client billing and incoming revenue</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="bg-white border border-zinc-200 text-zinc-700 px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-colors disabled:opacity-50"
          >
            <Icon name="refresh" className="text-[16px]" />
          </button>
          <Link 
            to="/invoices/new"
            className="bg-primary text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors"
          >
            New Invoice
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-zinc-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-400 font-black uppercase mb-1">Total Billed</p>
            <h3 className="text-2xl font-black">${totalBilled.toLocaleString()}</h3>
          </div>
          <div className="text-primary"><Icon name="payments" className="text-[28px]" /></div>
        </div>
        <div className="bg-white p-4 border border-zinc-100 shadow-sm flex items-center justify-between border-l-2 border-l-primary">
          <div>
            <p className="text-[10px] text-zinc-400 font-black uppercase mb-1">Pending</p>
            <h3 className="text-2xl font-black">${pending.toLocaleString()}</h3>
          </div>
          <div className="text-black"><Icon name="schedule" className="text-[28px]" /></div>
        </div>
        <div className="bg-white p-4 border border-zinc-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-400 font-black uppercase mb-1">Overdue</p>
            <h3 className="text-2xl font-black text-primary">${overdue.toLocaleString()}</h3>
          </div>
          <div className="text-primary"><Icon name="warning" className="text-[28px]" /></div>
        </div>
        <div className="bg-white p-4 border border-zinc-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-400 font-black uppercase mb-1">Paid this Month</p>
            <h3 className="text-2xl font-black">${paidThisMonth.toLocaleString()}</h3>
          </div>
          <div className="text-black"><Icon name="check_circle" className="text-[28px]" /></div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-zinc-100 shadow-sm p-3 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[20px]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border-none text-[12px] font-medium placeholder:text-zinc-400 focus:ring-1 focus:ring-primary"
            placeholder="Search by ID, client or project..."
            type="text"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white border border-zinc-200 text-[11px] font-bold uppercase py-2 px-10 focus:ring-0 focus:border-primary min-w-[180px]"
          >
            <option>All Statuses</option>
            <option>Paid</option>
            <option>Pending</option>
            <option>Overdue</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-zinc-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Invoice ID</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Client</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Issue Date</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Amount</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {paginated.map(inv => (
              <tr key={inv.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4 text-xs font-black">{inv.id}</td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-xs font-black">{inv.client}</p>
                    <p className="text-[10px] text-zinc-500 uppercase">{inv.project}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-[11px] font-medium uppercase text-zinc-600">{inv.date}</td>
                <td className="px-6 py-4 text-[11px] font-black text-right">${inv.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-center">
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
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setSelectedInvoice(inv)} className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-black transition-colors"><Icon name="visibility" className="text-[18px]" /></button>
                    <button onClick={() => openEditModal(inv)} className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-primary transition-colors"><Icon name="edit" className="text-[18px]" /></button>
                    <button onClick={() => setDeletingId(inv.id)} className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-red-600 transition-colors"><Icon name="delete" className="text-[18px]" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-3 border-t border-zinc-100 flex items-center justify-between">
          <div className="text-[10px] font-black uppercase text-zinc-400">Showing {paginated.length} of {filtered.length} results</div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
              disabled={safeCurrentPage === 1}
              className="h-8 px-2 text-[10px] font-black uppercase border border-zinc-100 hover:bg-zinc-50 disabled:opacity-50"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`h-8 w-8 ${safeCurrentPage === i + 1 ? 'bg-black text-white' : 'border border-zinc-100'} text-[10px] font-black hover:bg-zinc-50`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
              disabled={safeCurrentPage === totalPages}
              className="h-8 px-2 text-[10px] font-black uppercase border border-zinc-100 hover:bg-zinc-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Edit Invoice Modal */}
      {showEdit && selectedInvoice && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowEdit(false)}>
          <div className="bg-white p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black uppercase tracking-tight">Edit Invoice</h3>
              <button onClick={() => setShowEdit(false)} className="p-1.5 hover:bg-zinc-100 transition-colors">
                <Icon name="close" className="text-[20px]" />
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