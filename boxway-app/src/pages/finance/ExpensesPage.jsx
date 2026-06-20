import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_EXPENSES } from '../../data/mockData';
import Icon from "../../components/ui/Icon.jsx"

const statusColors = { Approved: 'bg-green-100 text-green-700', Pending: 'bg-yellow-100 text-yellow-700', Rejected: 'bg-red-100 text-red-700' };

const ExpensesPage = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState(() => {
    const stored = localStorage.getItem('expenses');
    return stored ? JSON.parse(stored) : MOCK_EXPENSES;
  });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [statusDropdownId, setStatusDropdownId] = useState(null);
  const [form, setForm] = useState({ title: '', category: '', amount: '', date: '', project: '', notes: '' });

  const categories = ['All', 'Software', 'Travel', 'Office', 'Entertainment'];
  const filtered = expenses.filter(e =>
    (filter === 'All' || e.category === filter) &&
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalApproved = expenses.filter(e => e.status === 'Approved').reduce((s, e) => s + e.amount, 0);
  const totalPending = expenses.filter(e => e.status === 'Pending').reduce((s, e) => s + e.amount, 0);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleDelete = () => {
    const updated = expenses.filter(e => e.id !== deletingId);
    setExpenses(updated);
    localStorage.setItem('expenses', JSON.stringify(updated));
    setDeletingId(null);
  };

  const handleStatusChange = (id, newStatus) => {
    const updated = expenses.map(e => e.id === id ? { ...e, status: newStatus } : e);
    setExpenses([...updated]);
    localStorage.setItem('expenses', JSON.stringify(updated));
  };

  const handleAddExpense = () => {
    if (form.title && form.amount) {
      const newExpense = {
        id: Date.now().toString(),
        title: form.title,
        category: form.category || 'Other',
        amount: Number(form.amount),
        date: form.date || new Date().toISOString().split('T')[0],
        project: form.project || '',
        notes: form.notes || '',
        submittedBy: 'Current User',
        status: 'Pending'
      };
      const updated = [newExpense, ...expenses];
      setExpenses(updated);
      localStorage.setItem('expenses', JSON.stringify(updated));
      setForm({ title: '', category: '', amount: '', date: '', project: '', notes: '' });
      setShowCreate(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#f8f6f6]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Expenses</h2>
          <p className="text-sm text-slate-500">{MOCK_EXPENSES.length} expense records</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded shadow-lg shadow-primary/20 hover:bg-primary/90">
          <Icon name="add" className="text-lg" /> Log Expense
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Expenses', val: '$' + expenses.reduce((s, e) => s + e.amount, 0).toLocaleString() },
          { label: 'Approved', val: '$' + totalApproved.toLocaleString(), color: 'text-green-600' },
          { label: 'Pending', val: '$' + totalPending.toLocaleString(), color: 'text-yellow-600' },
          { label: 'This Month', val: expenses.length + ' items' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{k.label}</p>
            <p className={`text-2xl font-black ${k.color || 'text-slate-900'}`}>{k.val}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded bg-white text-sm focus:outline-none focus:border-primary" placeholder="Search expenses..." />
        </div>
        <div className="flex gap-2">
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${filter === c ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{c}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>{['Title', 'Category', 'Submitted By', 'Project', 'Amount', 'Date', 'Status', 'Actions'].map(col => (
              <th key={col} className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{col}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(e => (
              <tr key={e.id}>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-slate-900">{e.title}</p>
                  {e.notes && <p className="text-xs text-slate-400 truncate max-w-[200px]">{e.notes}</p>}
                </td>
                <td className="px-6 py-4"><span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded uppercase">{e.category}</span></td>
                <td className="px-6 py-4 text-sm text-slate-600">{e.submittedBy}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{e.project || '—'}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900">${e.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{e.date}</td>
                <td className="px-6 py-4">
                  <div className="relative">
                    <button
                      onClick={() => setStatusDropdownId(statusDropdownId === e.id ? null : e.id)}
                      className={`px-4 py-1 text-[10px] font-bold uppercase border border-slate-300 rounded cursor-pointer min-w-[120px] bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary relative z-10 ${statusColors[e.status]}`}
                    >
                      {e.status}
                    </button>
                    {statusDropdownId === e.id && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded shadow-lg z-50 min-w-[120px]">
                        {['Approved', 'Pending', 'Rejected'].map(status => (
                          <button
                            key={status}
                            onClick={() => { handleStatusChange(e.id, status); setStatusDropdownId(null); }}
                            className="w-full px-4 py-2 text-left text-[10px] font-bold uppercase hover:bg-slate-50"
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    <button onClick={() => { setSelectedExpense(e); setShowView(true); }} className="p-1 text-slate-400 hover:text-primary transition-colors"><Icon name="visibility" className="text-lg" /></button>
                    <button onClick={() => setDeletingId(e.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors"><Icon name="delete" className="text-lg" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900">Log Expense</h3>
              <button onClick={() => setShowCreate(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"><Icon name="close" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Expense Title *</label>
                <input value={form.title} onChange={e => set('title', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary" /></div>
              <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Category</label>
                <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
                  <option value="">Select</option>
                  {['Software', 'Travel', 'Office', 'Entertainment', 'Other'].map(c => <option key={c}>{c}</option>)}</select></div>
              <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Amount ($)</label>
                <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="0.00" /></div>
              <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Date</label>
                <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary" /></div>
              <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Project (optional)</label>
                <input value={form.project} onChange={e => set('project', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary" /></div>
              <div className="col-span-2"><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Notes</label>
                <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none" /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded hover:bg-slate-50">Cancel</button>
              <button onClick={handleAddExpense} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 shadow-lg shadow-primary/20">Submit Expense</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showView && selectedExpense && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowView(false)}>
          <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900">Expense Details</h3>
              <button onClick={() => setShowView(false)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"><Icon name="close" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Title</p>
                <p className="text-sm font-semibold text-slate-900">{selectedExpense.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</p>
                  <p className="text-sm text-slate-700">{selectedExpense.category}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Amount</p>
                  <p className="text-sm font-bold text-slate-900">${selectedExpense.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date</p>
                  <p className="text-sm text-slate-700">{selectedExpense.date}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</p>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded uppercase ${statusColors[selectedExpense.status]}`}>{selectedExpense.status}</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Submitted By</p>
                <p className="text-sm text-slate-700">{selectedExpense.submittedBy}</p>
              </div>
              {selectedExpense.project && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Project</p>
                  <p className="text-sm text-slate-700">{selectedExpense.project}</p>
                </div>
              )}
              {selectedExpense.notes && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Notes</p>
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
            <Icon name="warning" className="text-red-500 text-3xl mb-3 block" />
            <h3 className="text-lg font-black uppercase tracking-tight mb-2">Delete Expense?</h3>
            <p className="text-sm text-slate-500 mb-6">This will permanently remove the expense record.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;