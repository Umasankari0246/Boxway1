import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { usePayrollStore } from '../../../store/payrollStore';
import Icon from "../../../components/ui/Icon.jsx"

const api = axios.create({
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api'
    : 'https://boxxway.onrender.com/api',
});

const RECENT_EMPLOYEES_KEY = 'payrollRecentEmployees';

const Step1 = () => {
  const navigate = useNavigate();
  const { multiRun, setMultiEmployees } = usePayrollStore();
  const [selected, setSelected] = React.useState(new Set(multiRun.selectedEmployees.map(e => e.id)));
  const [employees, setEmployees] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const fallbackEmployees = [
    { id: 'EMP001', name: 'Uma', role: 'CAD Technician', department: 'Engineering', salary: 40000, status: 'Active' },
    { id: 'EMP002', name: 'Ravi', role: 'Project Manager', department: 'Operations', salary: 55000, status: 'Active' },
    { id: 'EMP003', name: 'Nisha', role: 'Finance Analyst', department: 'Finance', salary: 48000, status: 'Active' },
    { id: 'EMP004', name: 'Arun', role: 'Architect', department: 'Design', salary: 62000, status: 'Active' },
  ];

  const getRecentEmployees = () => {
    try {
      const raw = window.localStorage.getItem(RECENT_EMPLOYEES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error('Error reading recent employees:', err);
      return [];
    }
  };

  const mergeEmployees = (apiEmployees = [], recentEmployees = []) => {
    const merged = [...fallbackEmployees];
    const existingIds = new Set(merged.map(emp => emp.id));

    [...recentEmployees, ...apiEmployees].forEach(emp => {
      const normalizedId = emp.id || emp.employeeId || emp._id;
      if (!normalizedId || existingIds.has(normalizedId)) return;
      merged.push({ ...emp, id: normalizedId, employeeId: emp.employeeId || normalizedId });
      existingIds.add(normalizedId);
    });

    return merged;
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees/');
      const recentEmployees = getRecentEmployees();
      const employeeList = mergeEmployees(response.data.data || [], recentEmployees);
      setEmployees(employeeList);

      if (employeeList.length > 0) {
        const defaultSelection = new Set(employeeList.slice(0, 3).map(e => e.id));
        setSelected(defaultSelection);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    const handleStorage = (event) => {
      if (event.key === RECENT_EMPLOYEES_KEY) {
        fetchEmployees();
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', fetchEmployees);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', fetchEmployees);
    };
  }, []);

  const toggle = (id) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleAll = () => selected.size > 0 ? setSelected(new Set()) : setSelected(new Set(employees.map(e => e.id)));

  const STEPS = ['Select Employees', 'Setup Payroll', 'Review & Confirm'];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#f8f6f6]">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/payroll')} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded">
            <Icon name="arrow_back" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Multi-Employee Payroll Run</h2>
            <p className="text-sm text-slate-500">Process payroll for multiple employees</p>
          </div>
        </div>
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
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900">Select Employees ({selected.size} selected)</h3>
            <button onClick={toggleAll} className="text-sm font-semibold text-primary hover:underline">
              {selected.size === employees.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-8 text-slate-400">Loading employees...</div>
            ) : employees.map(e => (
              <div key={e.id} onClick={() => toggle(e.id)}
                className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${selected.has(e.id) ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300'}`}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${selected.has(e.id) ? 'bg-primary border-primary' : 'border-slate-300'}`}>
                  {selected.has(e.id) && <Icon name="check" className="text-white text-xs" />}
                </div>
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{e.name.charAt(0)}</div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-slate-900">{e.name}</p>
                  <p className="text-xs text-slate-400">{e.role} · {e.department}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">${(e.salary / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}<span className="text-slate-400 font-normal text-xs">/mo</span></p>
                  <span className={`text-[10px] font-bold ${e.status === 'Active' ? 'text-green-600' : 'text-yellow-600'}`}>{e.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selected.size > 0 && (
          <div className="mt-4 p-4 bg-primary/10 rounded-lg flex justify-between text-sm">
            <span className="font-semibold text-primary">{selected.size} employees selected</span>
            <span className="font-bold text-slate-900">Est. Total: ${employees.filter(e => selected.has(e.id)).reduce((s, e) => s + Math.round((e.salary || 0) / 12), 0).toLocaleString()}</span>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button onClick={() => navigate('/payroll')} className="px-6 py-2.5 border border-slate-200 bg-white text-slate-700 text-sm font-semibold rounded hover:bg-slate-50">Cancel</button>
          <button disabled={selected.size === 0}
            onClick={() => { setMultiEmployees(employees.filter(e => selected.has(e.id))); navigate('/payroll/run/multi/step2'); }}
            className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-40">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Step1;