import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Icon from "../../components/ui/Icon.jsx";
import jsPDF from 'jspdf';

const api = axios.create({
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api'
    : 'https://boxxway.onrender.com/api'
});

const TABS = ['Dashboard', 'Payroll Runs', 'Payslips', 'Settings'];

const PayrollDashboardTab = ({ navigate }) => {
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedRun, setSelectedRun] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    const fetchPayrollRuns = async () => {
      try {
        const response = await api.get('/payroll-runs/');
        setPayrollRuns(response.data.data);
      } catch (err) {
        console.error("Error fetching payroll runs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayrollRuns();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/payroll-runs/${id}`, { 
        status: 'Completed', 
        processedDate: new Date().toISOString().split('T')[0], 
        approvedBy: 'Admin' 
      });
      setPayrollRuns(runs => runs.map(run => 
        run.id === id ? { ...run, status: 'Completed', processedDate: new Date().toISOString().split('T')[0], approvedBy: 'Admin' } : run
      ));
    } catch (err) {
      console.error("Error approving payroll run:", err);
      alert("Failed to approve payroll run");
    }
  };

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleView = (run) => {
    setSelectedRun(run);
    setShowViewModal(true);
    setActiveDropdown(null);
  };

  const handleDownload = (run) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Payroll Run Details', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Payroll ID: ${run.id}`, 20, 35);
    doc.text(`Period: ${run.period}`, 20, 45);
    doc.text(`Employees: ${run.employees}`, 20, 55);
    doc.text(`Ad Hoc Payments: ${run.adHoc}`, 20, 65);
    doc.text(`Gross Amount: $${run.grossAmount.toLocaleString()}`, 20, 75);
    doc.text(`Net Amount: $${run.netAmount.toLocaleString()}`, 20, 85);
    doc.text(`Status: ${run.status}`, 20, 95);
    doc.text(`Processed Date: ${run.processedDate || '—'}`, 20, 105);
    doc.text(`Approved By: ${run.approvedBy || '—'}`, 20, 115);
    
    doc.save(`${run.id}-payroll-details.pdf`);
    setActiveDropdown(null);
  };

  return (
  <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-6">
    {/* KPIs */}
    <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Total Employees Paid', val: '8', trend: '+2.4%', trendUp: true },
        { label: 'Ad Hoc Payments', val: '3', sub: 'This month' },
        { label: 'Pending Approvals', val: payrollRuns.filter(r => r.status === 'Pending Approval').length, sub: 'Needs action', color: 'text-primary' },
        { label: 'Total Payroll Amount', val: '$68,750', sub: 'Oct 2023' },
      ].map(k => (
        <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">{k.label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-3xl font-bold ${k.color || 'text-slate-900'}`}>{k.val}</h3>
            {k.trend && <span className={`text-xs font-bold flex items-center ${k.trendUp ? 'text-green-500' : 'text-red-500'}`}>
              <Icon name={k.trendUp ? 'arrow_upward' : 'arrow_downward'} className="text-xs" />{k.trend}
            </span>}
            {k.sub && <span className="text-slate-400 text-xs font-medium">{k.sub}</span>}
          </div>
        </div>
      ))}
    </div>

    {/* Recent Payroll Runs Table */}
    <div className="col-span-12 lg:col-span-8">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h4 className="font-bold text-slate-900">Recent Payroll Runs</h4>
          <button onClick={() => {}} className="text-sm font-semibold text-primary hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>{['Period', 'Employees', 'Ad Hoc', 'Amount', 'Status', 'Actions'].map(col => (
                <th key={col} className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{col}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payrollRuns.map(run => (
                <tr key={run.id} className={run.status === 'Pending Approval' ? 'bg-primary/5' : 'hover:bg-slate-50'}>
                  <td className="px-6 py-4 font-semibold text-sm text-slate-700">{run.period}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{run.employees}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{run.adHoc}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">${run.grossAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${run.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{run.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    {run.status === 'Pending Approval' ? (
                      <button 
                        onClick={() => handleApprove(run.id)}
                        className="px-3 py-1 bg-primary text-white text-xs font-bold rounded hover:bg-primary/90"
                      >
                        Approve
                      </button>
                    ) : (
                      <>
                        <button 
                          onClick={() => toggleDropdown(run.id)}
                          className="text-slate-400 hover:text-primary p-1"
                        >
                          <Icon name="more_vert" className="text-xl" />
                        </button>
                        {activeDropdown === run.id && (
                          <div className="absolute right-0 top-0 mt-8 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                            <button 
                              onClick={() => handleView(run)}
                              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Icon name="visibility" className="text-lg" /> View
                            </button>
                            <button 
                              onClick={() => handleDownload(run)}
                              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <Icon name="download" className="text-lg" /> Download
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* Right Column */}
    <div className="col-span-12 lg:col-span-4 space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h4 className="font-bold text-slate-900">Alerts & Insights</h4>
          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">2 New</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex gap-4">
            <Icon name="error" className="text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-900">Missing salary data</p>
              <p className="text-xs text-slate-500 mt-1">1 employee hasn't updated their direct deposit info.</p>
              <button className="mt-2 text-xs font-bold text-red-500 hover:underline">View Employees</button>
            </div>
          </div>
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg flex gap-4">
            <Icon name="pending_actions" className="text-yellow-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-900">Pending approvals</p>
              <p className="text-xs text-slate-500 mt-1">November payroll draft awaiting sign-off.</p>
              <button className="mt-2 text-xs font-bold text-yellow-600 hover:underline">Go to Approvals</button>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-zinc-900 rounded-xl p-6 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10">
          <h4 className="font-bold text-lg mb-2">Run Payroll</h4>
          <p className="text-zinc-400 text-sm mb-6">Process the current cycle for all departments.</p>
          <div className="space-y-3">
            <button onClick={() => navigate('/payroll/run/single/step1')} className="w-full py-3 border border-white/20 text-white text-sm font-bold rounded-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <Icon name="person" className="text-xl" /> Single Employee
            </button>
            <button onClick={() => navigate('/payroll/run/multi/step1')} className="w-full py-3 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
              <Icon name="group" className="text-xl" /> All / Multi Employees
            </button>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 opacity-10">
          <Icon name="payments" className="text-[150px]" />
        </div>
      </div>
    </div>

    {/* View Modal */}
    {showViewModal && selectedRun && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowViewModal(false)}>
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
            <h3 className="text-xl font-bold text-slate-900">Payroll Run Details</h3>
            <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-slate-600">
              <Icon name="close" className="text-2xl" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Payroll ID</p>
                <p className="text-sm font-semibold text-slate-900">{selectedRun.id}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Period</p>
                <p className="text-sm font-semibold text-slate-900">{selectedRun.period}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Employees</p>
                <p className="text-sm font-semibold text-slate-900">{selectedRun.employees}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Ad Hoc Payments</p>
                <p className="text-sm font-semibold text-slate-900">{selectedRun.adHoc}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Gross Amount</p>
                <p className="text-sm font-semibold text-slate-900">${selectedRun.grossAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Net Amount</p>
                <p className="text-sm font-semibold text-slate-900">${selectedRun.netAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</p>
                <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${selectedRun.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{selectedRun.status}</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Processed Date</p>
                <p className="text-sm font-semibold text-slate-900">{selectedRun.processedDate || '—'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Approved By</p>
                <p className="text-sm font-semibold text-slate-900">{selectedRun.approvedBy || '—'}</p>
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white">
            <button 
              onClick={() => handleDownload(selectedRun)}
              className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-bold rounded hover:bg-slate-50 flex items-center gap-2"
            >
              <Icon name="download" className="text-lg" /> Download
            </button>
            <button 
              onClick={() => setShowViewModal(false)}
              className="px-4 py-2 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

const PayrollRunsTab = ({ navigate }) => {
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayrollRuns = async () => {
      try {
        const response = await api.get('/payroll-runs/');
        setPayrollRuns(response.data.data);
      } catch (err) {
        console.error("Error fetching payroll runs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayrollRuns();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">All Payroll Runs</h3>
        <div className="flex gap-3">
          <button onClick={() => navigate('/payroll/run/single/step1')} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 text-sm font-bold rounded hover:bg-slate-50">
            <Icon name="person" className="text-lg" /> Single Run
          </button>
          <button onClick={() => navigate('/payroll/run/multi/step1')} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Icon name="group" className="text-lg" /> Multi Run
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>{['Period', 'Employees', 'Ad Hoc', 'Gross', 'Net', 'Status', 'Processed', 'Approved By'].map(col => (
              <th key={col} className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{col}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payrollRuns.map(run => (
              <tr key={run.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-semibold text-sm text-slate-700">{run.period}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{run.employees}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{run.adHoc}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">${run.grossAmount.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-slate-600">${run.netAmount.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${run.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{run.status}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{run.processedDate || '—'}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{run.approvedBy || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PayslipsTab = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const response = await api.get('/payslips/');
        setPayslips(response.data.data);
      } catch (err) {
        console.error("Error fetching payslips:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayslips();
  }, []);

  const filtered = payslips.filter(p =>
    p.employeeName.toLowerCase().includes(search.toLowerCase())
  );

  const handleView = (payslip) => {
    setSelectedPayslip(payslip);
    setShowViewModal(true);
  };

  const handleDownload = (payslip) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Payslip Details', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Payslip ID: ${payslip.id}`, 20, 35);
    doc.text(`Employee ID: ${payslip.employeeId}`, 20, 45);
    doc.text(`Employee Name: ${payslip.employeeName}`, 20, 55);
    doc.text(`Period: ${payslip.period}`, 20, 65);
    doc.text(`Gross Salary: $${payslip.grossSalary.toLocaleString()}`, 20, 75);
    doc.text(`Deductions: $${payslip.deductions.toLocaleString()}`, 20, 85);
    doc.text(`Net Salary: $${payslip.net.toLocaleString()}`, 20, 95);
    doc.text(`Status: ${payslip.status}`, 20, 105);
    doc.text(`Issued Date: ${payslip.issuedDate}`, 20, 115);
    
    doc.save(`${payslip.id}-payslip.pdf`);
  };

  const handleEmail = (payslip) => {
    const subject = encodeURIComponent(`Payslip for ${payslip.period} - ${payslip.employeeName}`);
    const body = encodeURIComponent(`Please find attached the payslip for ${payslip.period}.\n\nEmployee: ${payslip.employeeName}\nNet Salary: $${payslip.net.toLocaleString()}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
          <input value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded bg-white text-sm focus:outline-none focus:border-primary" placeholder="Search payslips..." />
        </div>
        <select className="px-3 py-2 border border-slate-200 bg-white rounded text-sm focus:outline-none focus:border-primary">
          <option>All Periods</option>
          <option>October 2023</option>
          <option>September 2023</option>
        </select>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>{['Employee', 'Period', 'Gross', 'Deductions', 'Net', 'Status', 'Actions'].map(col => (
              <th key={col} className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{col}</th>
            ))}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-slate-900">{p.employeeName}</p>
                  <p className="text-xs text-slate-400">{p.employeeId}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{p.period}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">${p.grossSalary.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-red-600">-${p.deductions.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900">${p.net.toLocaleString()}</td>
                <td className="px-6 py-4"><span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">{p.status}</span></td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleView(p)}
                      title="View" 
                      className="p-1 text-slate-400 hover:text-primary transition-colors"
                    >
                      <Icon name="visibility" className="text-lg" />
                    </button>
                    <button 
                      onClick={() => handleDownload(p)}
                      title="Download" 
                      className="p-1 text-slate-400 hover:text-primary transition-colors"
                    >
                      <Icon name="download" className="text-lg" />
                    </button>
                    <button 
                      onClick={() => handleEmail(p)}
                      title="Email" 
                      className="p-1 text-slate-400 hover:text-primary transition-colors"
                    >
                      <Icon name="mail" className="text-lg" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {showViewModal && selectedPayslip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowViewModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-slate-900">Payslip Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-slate-400 hover:text-slate-600">
                <Icon name="close" className="text-2xl" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Payslip ID</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedPayslip.id}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Employee ID</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedPayslip.employeeId}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Employee Name</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedPayslip.employeeName}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Period</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedPayslip.period}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Issued Date</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedPayslip.issuedDate}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Gross Salary</p>
                  <p className="text-sm font-semibold text-slate-900">${selectedPayslip.grossSalary.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Deductions</p>
                  <p className="text-sm font-semibold text-red-600">-${selectedPayslip.deductions.toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Net Salary</p>
                  <p className="text-2xl font-bold text-slate-900">${selectedPayslip.net.toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</p>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">{selectedPayslip.status}</span>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button 
                onClick={() => handleDownload(selectedPayslip)}
                className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-bold rounded hover:bg-slate-50 flex items-center gap-2"
              >
                <Icon name="download" className="text-lg" /> Download
              </button>
              <button 
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsTab = () => {
  const [activeSection, setActiveSection] = useState('templates');
  const [templates, setTemplates] = useState([
    { id: 1, name: 'Standard Tech', department: 'Engineering', basicSalary: 4000, allowance: 600, deduction: 150 },
    { id: 2, name: 'Operations Lead', department: 'Operations', basicSalary: 3200, allowance: 450, deduction: 120 },
  ]);
  const [templateForm, setTemplateForm] = useState({ name: '', department: '', basicSalary: '', allowance: '', deduction: '' });
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateMessage, setTemplateMessage] = useState('');

  const [payments, setPayments] = useState([
    { id: 1, employee: 'Alicia Chen', paymentType: 'Bonus', amount: 1200, date: '2026-07-01' },
    { id: 2, employee: 'Daniel Brooks', paymentType: 'Commission', amount: 850, date: '2026-06-24' },
  ]);
  const [paymentForm, setPaymentForm] = useState({ employee: '', paymentType: 'Bonus', amount: '', date: new Date().toISOString().split('T')[0] });
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState('');

  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, name: 'Direct Deposit', enabled: true, default: true },
    { id: 2, name: 'Bank Transfer', enabled: true, default: false },
    { id: 3, name: 'Check', enabled: false, default: false },
    { id: 4, name: 'Wire Transfer', enabled: true, default: false },
  ]);
  const [paymentMethodMessage, setPaymentMethodMessage] = useState('');

  const [roles, setRoles] = useState([
    { id: 1, name: 'Payroll Admin', permissions: { view: true, create: true, edit: true, approve: true, delete: true } },
    { id: 2, name: 'HR Manager', permissions: { view: true, create: true, edit: true, approve: true, delete: false } },
    { id: 3, name: 'Finance Manager', permissions: { view: true, create: false, edit: true, approve: true, delete: false } },
    { id: 4, name: 'Employee', permissions: { view: true, create: false, edit: false, approve: false, delete: false } },
  ]);
  const [roleMessage, setRoleMessage] = useState('');

  const [workflows, setWorkflows] = useState([
    { id: 1, role: 'HR Manager' },
    { id: 2, role: 'Finance Manager' },
    { id: 3, role: 'Payroll Admin' },
  ]);
  const [workflowMessage, setWorkflowMessage] = useState('');

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    inApp: true,
    events: {
      payrollCreated: true,
      payrollApproved: true,
      payrollRejected: true,
      paymentCompleted: true,
      approvalPending: true,
    },
  });
  const [notificationMessage, setNotificationMessage] = useState('');

  const sections = [
    { id: 'templates', title: 'Salary Templates', icon: 'payments', desc: 'Create reusable salary templates by department.' },
    { id: 'payments', title: 'Ad-Hoc Payments', icon: 'add_circle', desc: 'Add one-time bonuses and commissions quickly.' },
    { id: 'methods', title: 'Payment Methods', icon: 'account_balance', desc: 'Enable payment channels and choose a default option.' },
    { id: 'roles', title: 'Roles & Access', icon: 'manage_accounts', desc: 'Set user permissions for payroll tasks.' },
    { id: 'workflows', title: 'Approval Workflows', icon: 'task_alt', desc: 'Arrange approval levels for payroll review.' },
    { id: 'notifications', title: 'Notifications', icon: 'notifications', desc: 'Send alerts for payroll events and approvals.' },
  ];

  const resetTemplateForm = () => {
    setTemplateForm({ name: '', department: '', basicSalary: '', allowance: '', deduction: '' });
    setEditingTemplateId(null);
    setShowTemplateForm(false);
  };

  const resetPaymentForm = () => {
    setPaymentForm({ employee: '', paymentType: 'Bonus', amount: '', date: new Date().toISOString().split('T')[0] });
    setShowPaymentForm(false);
  };

  const handleTemplateSave = (e) => {
    e.preventDefault();
    if (!templateForm.name || !templateForm.department) return;

    const payload = {
      id: editingTemplateId || Date.now(),
      name: templateForm.name,
      department: templateForm.department,
      basicSalary: Number(templateForm.basicSalary) || 0,
      allowance: Number(templateForm.allowance) || 0,
      deduction: Number(templateForm.deduction) || 0,
    };

    if (editingTemplateId) {
      setTemplates((prev) => prev.map((item) => item.id === editingTemplateId ? payload : item));
      setTemplateMessage('Template updated successfully.');
    } else {
      setTemplates((prev) => [payload, ...prev]);
      setTemplateMessage('Template saved successfully.');
    }

    resetTemplateForm();
  };

  const handleTemplateEdit = (template) => {
    setTemplateForm({
      name: template.name,
      department: template.department,
      basicSalary: template.basicSalary,
      allowance: template.allowance,
      deduction: template.deduction,
    });
    setEditingTemplateId(template.id);
    setShowTemplateForm(true);
    setTemplateMessage('');
  };

  const handleTemplateDelete = (id) => {
    setTemplates((prev) => prev.filter((item) => item.id !== id));
    setTemplateMessage('Template removed successfully.');
  };

  const handlePaymentSave = (e) => {
    e.preventDefault();
    if (!paymentForm.employee || !paymentForm.amount) return;

    const payload = {
      id: Date.now(),
      employee: paymentForm.employee,
      paymentType: paymentForm.paymentType,
      amount: Number(paymentForm.amount) || 0,
      date: paymentForm.date,
    };

    setPayments((prev) => [payload, ...prev]);
    setPaymentMessage('Ad-hoc payment saved successfully.');
    resetPaymentForm();
  };

  const handlePaymentDelete = (id) => {
    setPayments((prev) => prev.filter((item) => item.id !== id));
    setPaymentMessage('Payment removed successfully.');
  };

  const handleMethodToggle = (id) => {
    setPaymentMethods((prev) => prev.map((item) => item.id === id ? { ...item, enabled: !item.enabled } : item));
    setPaymentMethodMessage('Payment method updated.');
  };

  const handleDefaultMethod = (id) => {
    setPaymentMethods((prev) => prev.map((item) => ({ ...item, default: item.id === id })));
    setPaymentMethodMessage('Default method updated.');
  };

  const handleRolePermission = (roleId, permission) => {
    setRoles((prev) => prev.map((role) => role.id === roleId ? { ...role, permissions: { ...role.permissions, [permission]: !role.permissions[permission] } } : role));
    setRoleMessage('Permissions updated.');
  };

  const addWorkflowLevel = () => {
    setWorkflows((prev) => [...prev, { id: Date.now(), role: 'Payroll Admin' }]);
    setWorkflowMessage('Approval level added.');
  };

  const removeWorkflowLevel = (id) => {
    setWorkflows((prev) => prev.filter((item) => item.id !== id));
    setWorkflowMessage('Approval level removed.');
  };

  const moveWorkflowLevel = (id, direction) => {
    const index = workflows.findIndex((item) => item.id === id);
    if (index < 0) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= workflows.length) return;
    const updated = [...workflows];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setWorkflows(updated);
    setWorkflowMessage('Approval order updated.');
  };

  const updateWorkflowRole = (id, role) => {
    setWorkflows((prev) => prev.map((item) => item.id === id ? { ...item, role } : item));
  };

  const toggleNotification = (eventKey) => {
    setNotificationSettings((prev) => ({
      ...prev,
      events: { ...prev.events, [eventKey]: !prev.events[eventKey] },
    }));
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'templates':
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Salary Templates</h3>
                <p className="text-sm text-slate-500">Quickly create salary structures for each department.</p>
              </div>
              <button onClick={() => { setShowTemplateForm(true); setTemplateMessage(''); }} className="px-3 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90">Add Template</button>
            </div>
            {templateMessage && <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">{templateMessage}</div>}
            {showTemplateForm && (
              <form onSubmit={handleTemplateSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <input value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Template Name" />
                <input value={templateForm.department} onChange={(e) => setTemplateForm({ ...templateForm, department: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Department" />
                <input type="number" value={templateForm.basicSalary} onChange={(e) => setTemplateForm({ ...templateForm, basicSalary: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Basic Salary" />
                <input type="number" value={templateForm.allowance} onChange={(e) => setTemplateForm({ ...templateForm, allowance: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Allowance" />
                <input type="number" value={templateForm.deduction} onChange={(e) => setTemplateForm({ ...templateForm, deduction: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Deduction" />
                <div className="md:col-span-2 flex justify-end gap-2">
                  <button type="button" onClick={resetTemplateForm} className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600">Cancel</button>
                  <button type="submit" className="px-3 py-2 bg-primary text-white text-sm font-semibold rounded-lg">Save</button>
                </div>
              </form>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 font-semibold text-slate-500">Template</th>
                    <th className="px-3 py-2 font-semibold text-slate-500">Department</th>
                    <th className="px-3 py-2 font-semibold text-slate-500">Basic</th>
                    <th className="px-3 py-2 font-semibold text-slate-500">Allowance</th>
                    <th className="px-3 py-2 font-semibold text-slate-500">Deduction</th>
                    <th className="px-3 py-2 font-semibold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {templates.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2 font-semibold text-slate-800">{item.name}</td>
                      <td className="px-3 py-2 text-slate-600">{item.department}</td>
                      <td className="px-3 py-2 text-slate-600">${item.basicSalary.toLocaleString()}</td>
                      <td className="px-3 py-2 text-slate-600">${item.allowance.toLocaleString()}</td>
                      <td className="px-3 py-2 text-slate-600">${item.deduction.toLocaleString()}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button onClick={() => handleTemplateEdit(item)} className="text-sm font-semibold text-primary">Edit</button>
                          <button onClick={() => handleTemplateDelete(item.id)} className="text-sm font-semibold text-red-500">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'payments':
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Ad-Hoc Payments</h3>
                <p className="text-sm text-slate-500">Create quick one-time payouts for employees.</p>
              </div>
              <button onClick={() => { setShowPaymentForm(true); setPaymentMessage(''); }} className="px-3 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90">Add Payment</button>
            </div>
            {paymentMessage && <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">{paymentMessage}</div>}
            {showPaymentForm && (
              <form onSubmit={handlePaymentSave} className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <input value={paymentForm.employee} onChange={(e) => setPaymentForm({ ...paymentForm, employee: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Employee" />
                <select value={paymentForm.paymentType} onChange={(e) => setPaymentForm({ ...paymentForm, paymentType: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option value="Bonus">Bonus</option>
                  <option value="Commission">Commission</option>
                </select>
                <input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Amount" />
                <input type="date" value={paymentForm.date} onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                <div className="md:col-span-2 flex justify-end gap-2">
                  <button type="button" onClick={resetPaymentForm} className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600">Cancel</button>
                  <button type="submit" className="px-3 py-2 bg-primary text-white text-sm font-semibold rounded-lg">Save</button>
                </div>
              </form>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 font-semibold text-slate-500">Employee</th>
                    <th className="px-3 py-2 font-semibold text-slate-500">Type</th>
                    <th className="px-3 py-2 font-semibold text-slate-500">Amount</th>
                    <th className="px-3 py-2 font-semibold text-slate-500">Date</th>
                    <th className="px-3 py-2 font-semibold text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2 font-semibold text-slate-800">{item.employee}</td>
                      <td className="px-3 py-2 text-slate-600">{item.paymentType}</td>
                      <td className="px-3 py-2 text-slate-600">${item.amount.toLocaleString()}</td>
                      <td className="px-3 py-2 text-slate-600">{item.date}</td>
                      <td className="px-3 py-2">
                        <button onClick={() => handlePaymentDelete(item.id)} className="text-sm font-semibold text-red-500">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'methods':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Payment Methods</h3>
              <p className="text-sm text-slate-500">Enable or disable each method and pick your default one.</p>
            </div>
            {paymentMethodMessage && <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">{paymentMethodMessage}</div>}
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex flex-col md:flex-row md:items-center md:justify-between rounded-xl border border-slate-200 p-4 gap-3">
                  <div>
                    <p className="font-semibold text-slate-800">{method.name}</p>
                    <p className="text-sm text-slate-500">{method.enabled ? 'Enabled for payroll disbursement' : 'Disabled for now'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={method.enabled} onChange={() => handleMethodToggle(method.id)} />
                      Enable/Disable
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="radio" name="defaultMethod" checked={method.default} onChange={() => handleDefaultMethod(method.id)} />
                      Default
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'roles':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Roles & Access</h3>
              <p className="text-sm text-slate-500">Control who can view, create, edit, approve, and delete payroll records.</p>
            </div>
            {roleMessage && <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">{roleMessage}</div>}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 font-semibold text-slate-500">Role</th>
                    <th className="px-3 py-2 font-semibold text-slate-500">View</th>
                    <th className="px-3 py-2 font-semibold text-slate-500">Create</th>
                    <th className="px-3 py-2 font-semibold text-slate-500">Edit</th>
                    <th className="px-3 py-2 font-semibold text-slate-500">Approve</th>
                    <th className="px-3 py-2 font-semibold text-slate-500">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {roles.map((role) => (
                    <tr key={role.id}>
                      <td className="px-3 py-2 font-semibold text-slate-800">{role.name}</td>
                      {['view', 'create', 'edit', 'approve', 'delete'].map((permission) => (
                        <td key={permission} className="px-3 py-2">
                          <input type="checkbox" checked={role.permissions[permission]} onChange={() => handleRolePermission(role.id, permission)} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'workflows':
        return (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Approval Workflows</h3>
                <p className="text-sm text-slate-500">Add, remove, and reorder approval stages with one click.</p>
              </div>
              <button onClick={addWorkflowLevel} className="px-3 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90">Add Level</button>
            </div>
            {workflowMessage && <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">{workflowMessage}</div>}
            <div className="space-y-3">
              {workflows.map((item, index) => (
                <div key={item.id} className="flex flex-col md:flex-row md:items-center md:justify-between rounded-xl border border-slate-200 p-4 gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Level {index + 1}</p>
                    <p className="text-xs text-slate-500">{item.role}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select value={item.role} onChange={(e) => updateWorkflowRole(item.id, e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                      <option value="HR Manager">HR Manager</option>
                      <option value="Finance Manager">Finance Manager</option>
                      <option value="Payroll Admin">Payroll Admin</option>
                    </select>
                    <button onClick={() => moveWorkflowLevel(item.id, 'up')} className="px-2 py-2 border border-slate-200 rounded-lg text-sm">↑</button>
                    <button onClick={() => moveWorkflowLevel(item.id, 'down')} className="px-2 py-2 border border-slate-200 rounded-lg text-sm">↓</button>
                    <button onClick={() => removeWorkflowLevel(item.id)} className="px-3 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-lg">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Notifications</h3>
              <p className="text-sm text-slate-500">Turn on alerts for payroll activity and approvals.</p>
            </div>
            {notificationMessage && <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">{notificationMessage}</div>}
            <div className="rounded-xl border border-slate-200 p-4 space-y-3">
              <label className="flex items-center justify-between text-sm text-slate-700">
                <span>Email Notifications</span>
                <input type="checkbox" checked={notificationSettings.email} onChange={() => setNotificationSettings({ ...notificationSettings, email: !notificationSettings.email })} />
              </label>
              <label className="flex items-center justify-between text-sm text-slate-700">
                <span>In-App Notifications</span>
                <input type="checkbox" checked={notificationSettings.inApp} onChange={() => setNotificationSettings({ ...notificationSettings, inApp: !notificationSettings.inApp })} />
              </label>
            </div>
            <div className="rounded-xl border border-slate-200 p-4 space-y-3">
              <p className="text-sm font-semibold text-slate-800">Notification Events</p>
              {Object.entries(notificationSettings.events).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between text-sm text-slate-700">
                  <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}</span>
                  <input type="checkbox" checked={value} onChange={() => toggleNotification(key)} />
                </label>
              ))}
            </div>
            <div className="flex justify-end">
              <button onClick={() => setNotificationMessage('Notification settings saved.')} className="px-3 py-2 bg-primary text-white text-sm font-semibold rounded-lg">Save</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sections.map((section) => (
          <button key={section.id} type="button" onClick={() => setActiveSection(section.id)} className={`rounded-xl border p-5 text-left transition-all ${activeSection === section.id ? 'border-primary bg-primary/10 shadow-sm' : 'border-slate-200 bg-white hover:shadow-sm'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Icon name={section.icon} className="text-xl" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{section.title}</h4>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">{section.desc}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {renderSection()}
      </div>
    </div>
  );
};

const PayrollPage = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const navigate = useNavigate();

  const renderTab = () => {
    switch (activeTab) {
      case 'Dashboard': return <PayrollDashboardTab navigate={navigate} />;
      case 'Payroll Runs': return <PayrollRunsTab navigate={navigate} />;
      case 'Payslips': return <PayslipsTab />;
      case 'Settings': return <SettingsTab />;
      default: return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200 px-8 shrink-0">
        <div className="flex gap-8">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`py-4 border-b-2 text-sm font-semibold transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-8 bg-[#f8f6f6]">
        {renderTab()}
      </div>
    </div>
  );
};

export default PayrollPage;