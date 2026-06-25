import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { usePayrollStore } from '../../../store/payrollStore';
import Icon from "../../../components/ui/Icon.jsx"

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
});

const STEPS = ['Select Employee', 'Setup Salary', 'Review & Confirm'];

const Step3 = () => {
  const navigate = useNavigate();
  const { singleRun, confirmSingleRun, resetSingleRun } = usePayrollStore();
  const { selectedEmployee: emp, salarySetup: s } = singleRun;
  if (!emp || !s.net) { navigate('/payroll/run/single/step1'); return null; }

  const handleSubmit = async () => {
    try {
      // Create payroll run
      const payrollRunPayload = {
        period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        employees: 1,
        adHoc: 0,
        grossAmount: s.gross,
        netAmount: s.net,
        status: 'Pending Approval',
        processedDate: null,
        approvedBy: null,
      };
      const payrollResponse = await api.post('/payroll-runs/', payrollRunPayload);
      const payrollRunId = payrollResponse.data.data.id;

      // Create payslip
      const payslipPayload = {
        employeeId: emp.id,
        employeeName: emp.name,
        payrollRunId: payrollRunId,
        period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        grossSalary: s.gross,
        deductions: s.deductions,
        net: s.net,
        status: 'Pending',
        issuedDate: null,
        notes: s.notes || null,
      };
      await api.post('/payslips/', payslipPayload);

      confirmSingleRun();
      setTimeout(() => { resetSingleRun(); navigate('/payroll'); }, 500);
    } catch (err) {
      console.error('Error processing payroll:', err);
      alert('Failed to process payroll. Please try again.');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#f8f6f6]">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/payroll/run/single/step2')} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded">
            <Icon name="arrow_back" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Review & Confirm</h2>
            <p className="text-sm text-slate-500">Double-check before processing</p>
          </div>
        </div>

        <div className="flex items-center mb-8">
          {STEPS.map((step, i) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i < 2 ? 'bg-green-500 border-green-500 text-white' : 'bg-primary border-primary text-white'}`}>
                  {i < 2 ? <Icon name="check" className="text-xs" /> : 3}
                </div>
                <span className={`text-[10px] font-bold mt-1 uppercase tracking-wide ${i === 2 ? 'text-primary' : 'text-slate-400'}`}>{step}</span>
              </div>
              {i < STEPS.length - 1 && <div className="flex-1 h-0.5 mx-2 bg-primary" />}
            </React.Fragment>
          ))}
        </div>

        {/* Notice Banner */}
        <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
          <Icon name="warning" className="text-yellow-600 shrink-0" />
          <p className="text-sm text-yellow-800">Please review all details carefully. Once submitted, this payroll run will be queued for processing and may require approval.</p>
        </div>

        {/* Employee Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-4 p-6">
          <h3 className="font-bold text-slate-900 mb-4">Employee Details</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">{emp.name.charAt(0)}</div>
            <div>
              <p className="font-bold text-slate-900">{emp.name}</p>
              <p className="text-sm text-slate-500">{emp.role} · {emp.department} · {emp.id}</p>
            </div>
          </div>
        </div>

        {/* Pay Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-4 p-6">
          <h3 className="font-bold text-slate-900 mb-4">Pay Breakdown</h3>
          <div className="space-y-3">
            {[
              { label: 'Base Salary', val: `$${Number(s.baseSalary).toLocaleString()}` },
              { label: 'Bonus', val: `+$${Number(s.bonus).toLocaleString()}`, cls: 'text-green-600' },
              { label: `Tax (${s.taxRate}%)`, val: `-$${s.taxAmount?.toLocaleString()}`, cls: 'text-red-600' },
              { label: 'Deductions', val: `-$${Number(s.deductions).toLocaleString()}`, cls: 'text-red-600' },
            ].map(row => (
              <div key={row.label} className="flex justify-between text-sm">
                <span className="text-slate-500">{row.label}</span>
                <span className={`font-medium ${row.cls || 'text-slate-900'}`}>{row.val}</span>
              </div>
            ))}
            <div className="border-t border-slate-200 pt-3 flex justify-between">
              <span className="font-bold text-slate-900">NET PAY</span>
              <span className="text-2xl font-black text-primary">${s.net?.toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Pay Period: <strong className="text-slate-700">{s.payPeriod}</strong></span>
              <span>Method: Direct Deposit</span>
            </div>
          </div>
        </div>

        {s.notes && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 p-4">
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Notes</p>
            <p className="text-sm text-slate-700">{s.notes}</p>
          </div>
        )}

        <div className="flex justify-between">
          <button onClick={() => navigate('/payroll/run/single/step2')} className="px-6 py-2.5 border border-slate-200 bg-white text-slate-700 text-sm font-semibold rounded hover:bg-slate-50">Back to Edit</button>
          <button onClick={handleSubmit} className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 shadow-lg shadow-primary/20 flex items-center gap-2">
            <Icon name="check_circle" className="text-lg" /> Confirm & Process
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step3;