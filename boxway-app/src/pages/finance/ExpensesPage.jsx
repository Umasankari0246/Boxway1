import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, RefreshCw, DollarSign, CheckCircle, Clock, Trash2, Edit3, Eye, X, AlertTriangle, Download } from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useFormatters } from '../../hooks/useFormatters.js';
import { useTranslation } from '../../store/settingsStore';

const api = axios.create({
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:8001/api'
    : 'https://boxxway.onrender.com/api'
});

const statusColors = { Approved: 'bg-green-100 text-green-700', Pending: 'bg-yellow-100 text-yellow-700', Rejected: 'bg-red-100 text-red-700' };

const ExpensesPage = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState({ title: '', category: '', amount: '', date: '', project: '', notes: '' });
  const [projects, setProjects] = useState([]);
  const [showEdit, setShowEdit] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { formatCurrency, formatDate } = useFormatters();
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expensesRes, projectsRes] = await Promise.all([
          api.get('/expenses/'),
          api.get('/projects/')
        ]);
        setExpenses(expensesRes.data.data);
        setProjects(projectsRes.data.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const [expensesRes, projectsRes] = await Promise.all([
        api.get('/expenses/'),
        api.get('/projects/')
      ]);
      setExpenses(expensesRes.data.data);
      setProjects(projectsRes.data.data || []);
    } catch (err) {
      console.error("Error refreshing data:", err);
      alert("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', 'Software', 'Travel', 'Office', 'Entertainment'];
  const filtered = expenses.filter(e =>
    (filter === 'All' || e.category === filter) &&
    e.title.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => {
    const dateA = a.createdAt || a.date;
    const dateB = b.createdAt || b.date;
    return new Date(dateB) - new Date(dateA);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginatedExpenses = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalApproved = expenses.filter(e => e.status === 'Approved').reduce((s, e) => s + e.amount, 0);
  const totalPending = expenses.filter(e => e.status === 'Pending').reduce((s, e) => s + e.amount, 0);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleDelete = async () => {
    try {
      await api.delete(`/expenses/${deletingId}`);
      const updated = expenses.filter(e => e.id !== deletingId);
      setExpenses(updated);
      setDeletingId(null);
    } catch (err) {
      console.error("Error deleting expense:", err);
      alert("Failed to delete expense");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/expenses/${id}`, { status: newStatus });
      const updated = expenses.map(e => e.id === id ? { ...e, status: newStatus } : e);
      setExpenses([...updated]);
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  const handleAddExpense = async () => {
    if (form.title && form.amount) {
      try {
        const newExpense = {
          title: form.title,
          category: form.category || '-',
          amount: Number(form.amount),
          date: form.date || '-',
          project: form.project || '-',
          notes: form.notes || '-',
          submittedBy: '-',
          status: 'Pending'
        };
        const response = await api.post('/expenses/', newExpense);
        setExpenses([response.data.data, ...expenses]);
        setForm({ title: '', category: '', amount: '', date: '', project: '', notes: '' });
        setShowCreate(false);
      } catch (err) {
        console.error("Error adding expense:", err);
        alert("Failed to add expense");
      }
    }
  };

  const handleEditExpense = async () => {
    if (form.title && form.amount && selectedExpense) {
      try {
        const updatedExpense = {
          title: form.title,
          category: form.category || '-',
          amount: Number(form.amount),
          date: form.date || '-',
          project: form.project || '-',
          notes: form.notes || '-',
          submittedBy: selectedExpense.submittedBy || '-',
          status: selectedExpense.status
        };
        const response = await api.patch(`/expenses/${selectedExpense.id}`, updatedExpense);
        setExpenses(expenses.map(e => e.id === selectedExpense.id ? response.data.data : e));
        setForm({ title: '', category: '', amount: '', date: '', project: '', notes: '' });
        setShowEdit(false);
        setSelectedExpense(null);
      } catch (err) {
        console.error("Error updating expense:", err);
        alert("Failed to update expense");
      }
    }
  };

  const openEditModal = (expense) => {
    setSelectedExpense(expense);
    setForm({
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      project: expense.project || '',
      notes: expense.notes || ''
    });
    setShowEdit(true);
  };

  const handleDownload = (expense) => {
    try {
      const doc = new jsPDF();
      const margin = 20;
      let y = margin;

      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('EXPENSE RECEIPT', margin, y);
      y += 15;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Title: ${expense.title}`, margin, y);
      y += 8;
      doc.text(`Category: ${expense.category}`, margin, y);
      y += 8;
      doc.text(`Date: ${formatDate(expense.date)}`, margin, y);
      y += 8;
      doc.text(`Status: ${expense.status}`, margin, y);
      y += 15;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Amount:', margin, y);
      y += 8;
      doc.setFontSize(16);
      doc.text(formatCurrency(expense.amount), margin, y);
      y += 15;

      if (expense.project) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Project: ${expense.project}`, margin, y);
        y += 15;
      }

      if (expense.notes) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Notes:', margin, y);
        y += 8;
        const splitNotes = doc.splitTextToSize(expense.notes, 170);
        doc.text(splitNotes, margin, y);
      }

      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Boxway Expense Management', margin, 280);

      doc.save(`expense-${expense.id || expense.title}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to download expense");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f6f6]">
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">{t('Expenses')}</h1>
            <p className="text-sm text-slate-500 mt-1">{t('Track and manage business expenses and reimbursements')}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleRefresh} disabled={loading} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50">
              <RefreshCw className="h-4 w-4" />{t('Refresh')}</button>
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2">
              <Plus className="h-4 w-4" />{t('Log Expense')}</button>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder={t('Search expenses by title...')} 
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
            <option value="All">{t('All Categories')}</option>
            <option value="Software">{t('Software')}</option>
            <option value="Travel">{t('Travel')}</option>
            <option value="Office">{t('Office')}</option>
            <option value="Entertainment">{t('Entertainment')}</option>
          </select>
        </div>
      </div>

      <div className="px-8 py-6 bg-[#f8f6f6]">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 border border-zinc-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-400 font-black uppercase mb-1">{t('Total Expenses')}</p>
              <h3 className="text-2xl font-black">{formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}</h3>
            </div>
            <div className="text-primary"><DollarSign className="text-[28px]" /></div>
          </div>
          <div className="bg-white p-4 border border-zinc-100 shadow-sm flex items-center justify-between border-l-2 border-l-green-500">
            <div>
              <p className="text-[10px] text-zinc-400 font-black uppercase mb-1">{t('Approved')}</p>
              <h3 className="text-2xl font-black">{formatCurrency(totalApproved)}</h3>
            </div>
            <div className="text-green-600"><CheckCircle className="text-[28px]" /></div>
          </div>
          <div className="bg-white p-4 border border-zinc-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-400 font-black uppercase mb-1">{t('Pending')}</p>
              <h3 className="text-2xl font-black text-yellow-600">{formatCurrency(totalPending)}</h3>
            </div>
            <div className="text-yellow-600"><Clock className="text-[28px]" /></div>
          </div>
          <div className="bg-white p-4 border border-zinc-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-400 font-black uppercase mb-1">{t('This Month')}</p>
              <h3 className="text-2xl font-black">{expenses.length} items</h3>
            </div>
            <div className="text-black"><DollarSign className="text-[28px]" /></div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_120px] gap-4 px-8 py-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider items-center">
            <div>{t('Title')}</div>
            <div>{t('Category')}</div>
            <div>{t('Project')}</div>
            <div>{t('Amount')}</div>
            <div>{t('Status')}</div>
            <div className="text-right">{t('Actions')}</div>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="px-8 py-12 text-center text-slate-500 text-sm flex flex-col items-center">
                 <RefreshCw className="animate-spin h-8 w-8 mb-2" />{t('Loading expenses...')}</div>
            ) : expenses.length === 0 ? (
              <div className="px-8 py-12 text-center text-slate-500 text-sm">
                 <DollarSign className="h-10 w-10 mb-2 text-slate-300" />
                 <p>{t('No expenses found.')}</p>
              </div>
            ) : (
              paginatedExpenses.map((e, index) => (
                <div
                  key={`${e.id}-${index}`}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_120px] gap-4 px-8 py-4 items-center hover:bg-slate-50 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{e.title}</p>
                    {e.notes && <p className="text-xs text-slate-400 truncate max-w-[200px]">{e.notes}</p>}
                  </div>
                  <div><span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded uppercase">{e.category}</span></div>
                  <div className="text-sm text-slate-500">{e.project || '—'}</div>
                  <div className="text-sm font-bold text-slate-900">{formatCurrency(e.amount)}</div>
                  <div>
                    <select
                      value={e.status}
                      onChange={(event) => handleStatusChange(e.id, event.target.value)}
                      onClick={(event) => event.stopPropagation()}
                      onMouseDown={(event) => event.stopPropagation()}
                      className={`px-4 py-1 text-[10px] font-bold uppercase border-0 cursor-pointer min-w-[100px] ${statusColors[e.status]}`}
                    >
                      <option value="Approved">{t('Approved')}</option>
                      <option value="Pending">{t('Pending')}</option>
                      <option value="Rejected">{t('Rejected')}</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-1 items-center">
                    <button onClick={() => handleDownload(e)} className="text-slate-400 hover:text-black p-1.5 rounded hover:bg-slate-50 transition-colors" title={t('Download')}>
                      <Download className="h-4 w-4" />
                    </button>
                    <button onClick={() => { setSelectedExpense(e); setShowView(true); }} className="text-slate-400 hover:text-black p-1.5 rounded hover:bg-slate-50 transition-colors" title={t('View')}>
                      <Eye className="h-4 w-4" />
                    </button>
                    <button onClick={() => openEditModal(e)} className="text-slate-400 hover:text-primary p-1.5 rounded hover:bg-primary/10 transition-colors" title={t('Edit')}>
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => setDeletingId(e.id)} className="text-slate-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors" title={t('Delete')}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {filtered.length > 0 && (
            <div className="px-8 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} expenses
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

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900">{t('Log Expense')}</h3>
              <button onClick={() => setShowCreate(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"><X className="text-lg" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Expense Title *</label>
                <input value={form.title} onChange={e => set('title', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary" /></div>
              <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t('Category')}</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
                  <option value="">{t('Select')}</option>
                  {['Software', 'Travel', 'Office', 'Entertainment', 'Other'].map(c => <option key={c}>{c}</option>)}</select></div>
              <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t('Amount')}</label>
                <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder={t('0.00')} /></div>
              <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t('Date')}</label>
                <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary" /></div>
              <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Project (optional)</label>
                <select value={form.project} onChange={e => set('project', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
                  <option value="">{t('Select project')}</option>
                  {projects.map(project => (
                    <option key={project.id || project.projectId} value={project.name}>{project.name}</option>
                  ))}
                </select></div>
              <div className="col-span-2"><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t('Notes')}</label>
                <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none" /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded hover:bg-slate-50">{t('Cancel')}</button>
              <button onClick={handleAddExpense} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 shadow-lg shadow-primary/20">{t('Submit Expense')}</button>
            </div>
          </div>
        </div>
      )}

      {showEdit && selectedExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowEdit(false)}>
          <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900">{t('Edit Expense')}</h3>
              <button onClick={() => setShowEdit(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"><X className="text-lg" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Expense Title *</label>
                <input value={form.title} onChange={e => set('title', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary" /></div>
              <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t('Category')}</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
                  <option value="">{t('Select')}</option>
                  {['Software', 'Travel', 'Office', 'Entertainment', 'Other'].map(c => <option key={c}>{c}</option>)}</select></div>
              <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t('Amount')}</label>
                <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder={t('0.00')} /></div>
              <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t('Date')}</label>
                <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary" /></div>
              <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Project (optional)</label>
                <select value={form.project} onChange={e => set('project', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
                  <option value="">{t('Select project')}</option>
                  {projects.map(project => (
                    <option key={project.id || project.projectId} value={project.name}>{project.name}</option>
                  ))}
                </select></div>
              <div className="col-span-2"><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t('Notes')}</label>
                <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none" /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowEdit(false)} className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded hover:bg-slate-50">{t('Cancel')}</button>
              <button onClick={handleEditExpense} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 shadow-lg shadow-primary/20">{t('Update Expense')}</button>
            </div>
          </div>
        </div>
      )}

      {showView && selectedExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowView(false)}>
          <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900">{t('Expense Details')}</h3>
              <button onClick={() => setShowView(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"><X className="text-lg" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('Title')}</p>
                <p className="text-sm font-semibold text-slate-900">{selectedExpense.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('Category')}</p>
                  <p className="text-sm text-slate-700">{selectedExpense.category}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">{t('Amount')}</p>
                  <p className="text-sm font-bold text-slate-900">{formatCurrency(selectedExpense.amount)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">{t('Date')}</p>
                  <p className="text-sm font-bold text-slate-900">{formatDate(selectedExpense.date)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('Status')}</p>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded uppercase ${statusColors[selectedExpense.status]}`}>{selectedExpense.status}</span>
                </div>
              </div>
              {selectedExpense.project && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('Project')}</p>
                  <p className="text-sm text-slate-700">{selectedExpense.project}</p>
                </div>
              )}
              {selectedExpense.notes && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{t('Notes')}</p>
                  <p className="text-sm text-slate-700">{selectedExpense.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDeletingId(null)}>
          <div className="bg-white rounded-xl p-8 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <AlertTriangle className="text-red-500 text-3xl mb-3 block" />
            <h3 className="text-lg font-black uppercase tracking-tight mb-2">{t('Delete Expense?')}</h3>
            <p className="text-sm text-slate-500 mb-6">{t('This will permanently remove the expense record.')}</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50">{t('Cancel')}</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700">{t('Delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;