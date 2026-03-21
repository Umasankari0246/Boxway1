import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayrollStore } from '../../../store/payrollStore';

const STEPS = ['Select Employee', 'Setup Salary', 'Review & Confirm'];

const Step2 = () => {
  const navigate = useNavigate();
  const { singleRun, setSingleSalarySetup, setSingleStep } = usePayrollStore();
  const emp = singleRun.selectedEmployee;
  const monthly = emp ? Math.round(emp.salary / 12) : 0;

  const [form, setForm] = useState({
    baseSalary: singleRun.salarySetup.baseSalary || monthly,
    bonus: singleRun.salarySetup.bonus || 0,
    deductions: singleRun.salarySetup.deductions || Math.round(monthly * 0.17),
    taxRate: singleRun.salarySetup.taxRate || 20,
    payPeriod: singleRun.salarySetup.payPeriod || 'Monthly',
    notes: singleRun.salarySetup.notes || '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const gross = Number(form.baseSalary) + Number(form.bonus);
  const taxAmount = Math.round(gross * (form.taxRate / 100));
  const net = gross - Number(form.deductions) - taxAmount;

  if (!emp) { navigate('/payroll/run/single/step1'); return null; }

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#f8f6f6]">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/payroll/run/single/step1')} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Single Payroll Run</h2>
            <p className="text-sm text-slate-500">for {emp.name}</p>
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
            <h3 className="text-lg font-bold text-slate-900 mb-5">Setup Salary</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Base Salary ($)</label>
                <input type="number" value={form.baseSalary} onChange={e => set('baseSalary', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Bonus / Commission ($)</label>
                <input type="number" value={form.bonus} onChange={e => set('bonus', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Deductions ($)</label>
                <input type="number" value={form.deductions} onChange={e => set('deductions', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Tax Rate (%)</label>
                <input type="number" value={form.taxRate} onChange={e => set('taxRate', e.target.value)} min="0" max="50" className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Pay Period</label>
                <select value={form.payPeriod} onChange={e => set('payPeriod', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
                  <option>Monthly</option><option>Bi-weekly</option><option>Weekly</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Notes</label>
                <textarea rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none" placeholder="Optional notes..." />
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <div className="bg-zinc-900 rounded-xl p-6 text-white sticky top-0">
              <h4 className="font-bold mb-5">Pay Summary</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-zinc-400">Base Salary</span><span className="font-medium">${Number(form.baseSalary).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Bonus</span><span className="font-medium text-green-400">+${Number(form.bonus).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Deductions</span><span className="font-medium text-red-400">-${Number(form.deductions).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Tax ({form.taxRate}%)</span><span className="font-medium text-red-400">-${taxAmount.toLocaleString()}</span></div>
                <div className="border-t border-white/10 pt-3 flex justify-between">
                  <span className="font-bold">NET PAY</span>
                  <span className="text-xl font-black text-primary">${net.toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-white/10">
                <p className="text-zinc-400 text-xs">Employee</p>
                <p className="font-semibold mt-0.5">{emp.name}</p>
                <p className="text-zinc-400 text-xs mt-2">{emp.role} · {emp.department}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={() => navigate('/payroll/run/single/step1')} className="px-6 py-2.5 border border-slate-200 bg-white text-slate-700 text-sm font-semibold rounded hover:bg-slate-50">Back</button>
          <button onClick={() => { setSingleSalarySetup({ ...form, gross, taxAmount, net }); navigate('/payroll/run/single/step3'); }} className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 shadow-lg shadow-primary/20">Review & Confirm</button>
        </div>
      </div>
    </div>
  );
};

export default Step2;
