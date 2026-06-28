import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { usePayrollStore } from '../../../store/payrollStore';
import Icon from "../../../components/ui/Icon.jsx"

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
});

const STEPS = ['Select Employees', 'Setup Payroll', 'Review & Confirm'];

const Step3 = () => {
  const navigate = useNavigate();
  const { multiRun, confirmMultiRun, resetMultiRun } = usePayrollStore();
  const { selectedEmployees: emps, payrollConfig: cfg } = multiRun;

  if (!emps || emps.length === 0) { navigate('/payroll/run/multi/step1'); return null; }

  const handleSubmit = async () => {
    try {
      const payrollRunPayload = {
        period: cfg.payPeriod || 'Current Cycle',
        employees: emps.length,
        adHoc: 0,
        grossAmount: Number(cfg.totalGross || 0),
        netAmount: Number(cfg.totalNet || 0),
        status: 'Pending Approval'
      };

      const payrollResponse = await api.post('/payroll-runs/', payrollRunPayload);
      const payrollRunId = payrollResponse.data.data.id;

      for (const employee of emps) {
        const base = Math.round(employee.salary / 12);
        const bonus = Math.round(base * ((cfg.bonusPercent || 0) / 100));
        const gross = base + bonus;
        const deductions = Math.round(gross * ((cfg.deductionRate || 17) / 100));
        const tax = Math.round(gross * ((cfg.taxRate || 20) / 100));
        const net = gross - deductions - tax;

        await api.post('/payslips/', {
          employeeId: employee.id,
          employeeName: employee.name,
          period: cfg.payPeriod || 'Current Cycle',
          grossSalary: gross,
          deductions: deductions + tax,
          net,
          status: 'Issued',
          issuedDate: new Date().toISOString().split('T')[0],
          notes: `Payroll run ${payrollRunId}`
        });
      }

      confirmMultiRun();
      setTimeout(() => { resetMultiRun(); navigate('/payroll'); }, 500);
    } catch (err) {
      console.error('Error processing payroll:', err);
      alert('Failed to process payroll. Please try again.');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#f8f6f6]">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/payroll/run/multi/step2')} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded">
            <Icon name="arrow_back" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Review & Confirm Multi-Payroll</h2>
            <p className="text-sm text-slate-500">{emps.length} employees — final review before processing</p>
          </div>
        </div>

        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i < 2 ? 'bg-green-500 border-green-500 text-white' : 'bg-primary border-primary text-white'}`}>
                  {i < 2 ? <Icon name="check" className="text-xs" /> : 3}
                </div>
                <span className={`text-[10px] font-bold mt-1 uppercase tracking-wide ${i === 2 ? 'text-primary' : 'text-slate-400'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className="flex-1 h-0.5 mx-2 bg-primary" />}
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
          <Icon name="warning" className="text-yellow-600 shrink-0" />
          <p className="text-sm text-yellow-800">Please review all details. Once submitted, payroll will be queued for processing and approval.</p>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-4 p-6">
          <h3 className="font-bold text-slate-900 mb-4">Payroll Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Employees', val: emps.length },
              { label: 'Total Gross', val: '$' + (cfg.totalGross || 0).toLocaleString() },
              { label: 'Total Net', val: '$' + (cfg.totalNet || 0).toLocaleString(), color: 'text-primary' },
            ].map(k => (
              <div key={k.label} className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">{k.label}</p>
                <p className={`text-2xl font-black ${k.color || 'text-slate-900'}`}>{k.val}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3 text-xs text-slate-500">
            <span>Deductions: <strong className="text-slate-700">${(cfg.totalDeductions || 0).toLocaleString()}</strong></span>
            <span>Tax ({cfg.taxRate}%): <strong className="text-slate-700">${(cfg.totalTax || 0).toLocaleString()}</strong></span>
            <span>Pay Period: <strong className="text-slate-700">{cfg.payPeriod}</strong></span>
          </div>
        </div>

        {/* Employee Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Employee Breakdown</h3>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50"><tr>
              {['Employee', 'Base', 'Bonus', 'Deductions', 'Tax', 'Net'].map(col => (
                <th key={col} className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{col}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {emps.map(e => {
                const base = Math.round(e.salary / 12);
                const bonus = Math.round(base * ((cfg.bonusPercent || 0) / 100));
                const gross = base + bonus;
                const ded = Math.round(gross * ((cfg.deductionRate || 17) / 100));
                const tax = Math.round(gross * ((cfg.taxRate || 20) / 100));
                const net = gross - ded - tax;
                return (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-sm font-semibold text-slate-900">{e.name}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">${base.toLocaleString()}</td>
                    <td className="px-5 py-3 text-sm text-green-600">+${bonus.toLocaleString()}</td>
                    <td className="px-5 py-3 text-sm text-red-500">-${ded.toLocaleString()}</td>
                    <td className="px-5 py-3 text-sm text-red-500">-${tax.toLocaleString()}</td>
                    <td className="px-5 py-3 text-sm font-bold text-slate-900">${net.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between">
          <button onClick={() => navigate('/payroll/run/multi/step2')} className="px-6 py-2.5 border border-slate-200 bg-white text-slate-700 text-sm font-semibold rounded hover:bg-slate-50">Back to Edit</button>
          <button onClick={handleSubmit} className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 shadow-lg shadow-primary/20 flex items-center gap-2">
            <Icon name="check_circle" className="text-lg" /> Process {emps.length} Payrolls
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step3;