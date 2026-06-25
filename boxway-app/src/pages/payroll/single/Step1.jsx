import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { usePayrollStore } from '../../../store/payrollStore';
import Icon from "../../../components/ui/Icon.jsx"

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
});

const Step1 = () => {
  const navigate = useNavigate();
  const { singleRun, setSingleEmployee } = usePayrollStore();
  const [selected, setSelected] = React.useState(singleRun.selectedEmployee?.id || null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const STEPS = ['Select Employee', 'Setup Salary', 'Review & Confirm'];

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get('/employees/');
        setEmployees(response.data.data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const emp = employees.find(e => e.id === selected);

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#f8f6f6]">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/payroll')} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded">
            <Icon name="arrow_back" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Single Payroll Run</h2>
            <p className="text-sm text-slate-500 mt-0.5">Process payroll for a specific employee</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i === 0 ? 'bg-primary border-primary text-white' : 'border-slate-300 text-slate-400 bg-white'}`}>{i + 1}</div>
                <span className={`text-[10px] font-bold mt-1 uppercase tracking-wide ${i === 0 ? 'text-primary' : 'text-slate-400'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className="flex-1 h-0.5 mx-2 bg-slate-200" />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Select Employee</h3>
          {loading ? (
            <p className="text-sm text-slate-500">Loading employees...</p>
          ) : (
            <div className="space-y-3">
              {employees.map(e => (
                <div key={e.id} onClick={() => setSelected(e.id)}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${selected === e.id ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${selected === e.id ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>{e.name.charAt(0)}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-slate-900">{e.name}</p>
                    <p className="text-xs text-slate-400">{e.role} · {e.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">${(e.salary / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <p className="text-xs text-slate-400">/ mo</p>
                  </div>
                  {selected === e.id && <Icon name="check_circle" className="text-primary" />}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={() => navigate('/payroll')} className="px-6 py-2.5 border border-slate-200 bg-white text-slate-700 text-sm font-semibold rounded hover:bg-slate-50">Cancel</button>
          <button
            disabled={!selected}
            onClick={() => { setSingleEmployee(employees.find(e => e.id === selected)); navigate('/payroll/run/single/step2'); }}
            className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step1;