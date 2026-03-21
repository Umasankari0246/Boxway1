import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayrollStore } from '../../../store/payrollStore';

const STEPS = ['Select Employees', 'Setup Payroll', 'Review & Confirm'];

const Step2 = () => {
  const navigate = useNavigate();
  const { multiRun, setMultiPayrollConfig } = usePayrollStore();
  const emps = multiRun.selectedEmployees;
  const [form, setForm] = useState({ bonusPercent: 0, deductionRate: 17, taxRate: 20, payPeriod: 'Monthly', notes: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  if (!emps || emps.length === 0) { navigate('/payroll/run/multi/step1'); return null; }

  const totalGross = emps.reduce((s, e) => {
    const base = Math.round(e.salary / 12);
    return s + base + Math.round(base * (form.bonusPercent / 100));
  }, 0);
  const totalDeductions = Math.round(totalGross * (form.deductionRate / 100));
  const totalTax = Math.round(totalGross * (form.taxRate / 100));
  const totalNet = totalGross - totalDeductions - totalTax;

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#f8f6f6]">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/payroll/run/multi/step1')} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Setup Payroll</h2>
            <p className="text-sm text-slate-500">Configure settings for {emps.length} employees</p>
          </div>
        </div>

        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i < 1 ? 'bg-green-500 border-green-500 text-white' : i === 1 ? 'bg-primary border-primary text-white' : 'border-slate-300 text-slate-400 bg-white'}`}>
                  {i < 1 ? <span className="material-symbols-outlined text-xs">check</span> : i + 1}
                </div>
                <span className={`text-[10px] font-bold mt-1 uppercase tracking-wide ${i === 1 ? 'text-primary' : 'text-slate-400'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < 1 ? 'bg-primary' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-5">Payroll Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Bonus % (applied to all)</label>
                <input type="number" value={form.bonusPercent} onChange={e => set('bonusPercent', e.target.value)} min="0" max="100" className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Deduction Rate (%)</label>
                <input type="number" value={form.deductionRate} onChange={e => set('deductionRate', e.target.value)} min="0" max="50" className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Tax Rate (%)</label>
                <input type="number" value={form.taxRate} onChange={e => set('taxRate', e.target.value)} min="0" max="50" className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Pay Period</label>
                <select value={form.payPeriod} onChange={e => set('payPeriod', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
                  <option>Monthly</option><option>Bi-weekly</option><option>Weekly</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Notes</label>
                <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none" />
              </div>
            </div>
          </div>
          <div className="col-span-2">
            <div className="bg-zinc-900 rounded-xl p-6 text-white sticky top-0">
              <h4 className="font-bold mb-4">Payroll Summary</h4>
              <div className="space-y-2 text-sm mb-5">
                <div className="flex justify-between"><span className="text-zinc-400">Employees</span><span>{emps.length}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Total Gross</span><span>${totalGross.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Deductions</span><span className="text-red-400">-${totalDeductions.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Tax</span><span className="text-red-400">-${totalTax.toLocaleString()}</span></div>
                <div className="border-t border-white/10 pt-2 flex justify-between">
                  <span className="font-bold">TOTAL NET</span><span className="text-xl font-black text-primary">${totalNet.toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                {emps.slice(0, 4).map(e => (
                  <div key={e.id} className="flex items-center gap-2 text-xs text-zinc-400">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[10px]">{e.name.charAt(0)}</div>
                    <span className="truncate">{e.name}</span>
                  </div>
                ))}
                {emps.length > 4 && <p className="text-xs text-zinc-500">+{emps.length - 4} more employees</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={() => navigate('/payroll/run/multi/step1')} className="px-6 py-2.5 border border-slate-200 bg-white text-slate-700 text-sm font-semibold rounded hover:bg-slate-50">Back</button>
          <button onClick={() => { setMultiPayrollConfig({ ...form, totalGross, totalDeductions, totalTax, totalNet }); navigate('/payroll/run/multi/step3'); }} className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 shadow-lg shadow-primary/20">Review & Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default Step2;
