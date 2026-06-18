import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_EXPENSES } from '../../data/mockData';
import Icon from "../../components/ui/Icon.jsx"

const statusColors = { Approved: 'bg-green-100 text-green-700', Pending: 'bg-yellow-100 text-yellow-700', Rejected: 'bg-red-100 text-red-700' };

const ExpensesPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', category: '', amount: '', date: '', project: '', notes: '' });

  const categories = ['All', 'Software', 'Travel', 'Office', 'Entertainment'];
  const filtered = MOCK_EXPENSES.filter(e =>
    (filter === 'All' || e.category === filter) &&
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalApproved = MOCK_EXPENSES.filter(e => e.status === 'Approved').reduce((s, e) => s + e.amount, 0);
  const totalPending = MOCK_EXPENSES.filter(e => e.status === 'Pending').reduce((s, e) => s + e.amount, 0);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

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
          { label: 'Total Expenses', val: '$' + MOCK_EXPENSES.reduce((s, e) => s + e.amount, 0).toLocaleString() },
          { label: 'Approved', val: '$' + totalApproved.toLocaleString(), color: 'text-green-600' },
          { label: 'Pending', val: '$' + totalPending.toLocaleString(), color: 'text-yellow-600' },
          { label: 'This Month', val: MOCK_EXPENSES.length + ' items' },
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

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>{['Title', 'Category', 'Submitted By', 'Project', 'Amount', 'Date', 'Status', 'Actions'].map(col => (
              <th key={col} className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{col}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(e => (
              <tr key={e.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-slate-900">{e.title}</p>
                  {e.notes && <p className="text-xs text-slate-400 truncate max-w-[200px]">{e.notes}</p>}
                </td>
                <td className="px-6 py-4"><span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded uppercase">{e.category}</span></td>
                <td className="px-6 py-4 text-sm text-slate-600">{e.submittedBy}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{e.project || '—'}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900">${e.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{e.date}</td>
                <td className="px-6 py-4"><span className={`px-2.5 py-0.5 text-[10px] font-bold rounded uppercase ${statusColors[e.status]}`}>{e.status}</span></td>
                <td className="px-6 py-4">
                  <div className="flex gap-1">
                    <button className="p-1 text-slate-400 hover:text-primary transition-colors"><Icon name="visibility" className="text-lg" /></button>
                    <button className="p-1 text-slate-400 hover:text-red-500 transition-colors"><Icon name="delete" className="text-lg" /></button>
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
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 shadow-lg shadow-primary/20">Submit Expense</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;