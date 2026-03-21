import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MOCK_PAYSLIPS } from '../../data/mockData';

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
});

const EmployeeProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('overview');
  const [emp, setEmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/employees/${id}`);
        setEmp(response.data.data);
      } catch (err) {
        console.error("Error fetching employee:", err);
        setError("Could not load employee data.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center bg-[#f8f6f6]"><p className="text-slate-500">Loading...</p></div>;
  }

  if (error || !emp) {
     return (
       <div className="flex-1 flex flex-col items-center justify-center bg-[#f8f6f6]">
         <p className="text-slate-500 mb-4">{error || "Employee not found."}</p>
         <button onClick={() => navigate('/employees')} className="px-4 py-2 bg-primary text-white rounded">Back to Employees</button>
       </div>
     );
  }

  const payslips = MOCK_PAYSLIPS.filter(p => p.employeeId === emp.id);

  const statusColor = emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';

  const userAvatar = emp.gender === 'Female' ? 'https://avatar.iran.liara.run/public/girl' : 'https://avatar.iran.liara.run/public/boy';

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8f6f6]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="flex items-start gap-6">
          <button onClick={() => navigate('/employees')} className="mt-1 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
            <img src={emp.photoUrl || userAvatar} alt={emp.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900">{emp.name}</h2>
              <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded uppercase ${statusColor}`}>{emp.status}</span>
            </div>
            <p className="text-slate-500 text-sm mt-0.5">{emp.role} · {emp.department}</p>
            <div className="flex items-center gap-6 mt-3 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">cake</span>{emp.dob || '01 Jan 1990'}</span>
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">water_drop</span>{emp.bloodGroup || 'O+'}</span>
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm">location_on</span>{emp.city || emp.location || 'London'}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">Employee ID</p>
            <p className="text-lg font-black text-slate-900 mt-0.5">{emp.id}</p>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-6 mt-5 border-t border-slate-100 pt-4">
          {['overview', 'leaves & timesheet', 'projects', 'payslips', 'documents'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`text-sm font-semibold capitalize pb-2 border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Personal Information</h3>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div><dt className="text-slate-500 text-xs uppercase font-bold">Full Name</dt><dd className="font-medium mt-0.5">{emp.name}</dd></div>
                  <div><dt className="text-slate-500 text-xs uppercase font-bold">Email</dt><dd className="font-medium mt-0.5">{emp.email}</dd></div>
                  <div><dt className="text-slate-500 text-xs uppercase font-bold">Phone</dt><dd className="font-medium mt-0.5">{emp.phone}</dd></div>
                  <div><dt className="text-slate-500 text-xs uppercase font-bold">Gender</dt><dd className="font-medium mt-0.5">{emp.gender || 'Male'}</dd></div>
                  <div><dt className="text-slate-500 text-xs uppercase font-bold">Join Date</dt><dd className="font-medium mt-0.5">{emp.joinDate || '2023-01-15'}</dd></div>
                  <div className="col-span-2 mt-2">
                       <dt className="text-slate-500 text-xs uppercase font-bold">Family / Emergency Info</dt>
                       <dd className="font-medium mt-1 text-slate-700">Family: {emp.familyMembers || '—'}</dd>
                       <dd className="font-medium text-slate-700">Emergency Contact: {emp.emergencyContactName || '—'} ({emp.emergencyContactRelation || '—'}) - {emp.emergencyPhone || '—'}</dd>
                  </div>
                </dl>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Academic Information & Skills</h3>
                <div className="mb-4">
                     <p className="text-sm font-medium text-slate-700"><span className="text-slate-500 w-24 inline-block">Education:</span> {emp.highestQualification || 'M.Arch'}, {emp.university || 'MIT'}, {emp.graduationYear || '2015'}</p>
                </div>
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Architecture Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {(emp.architectureSkills && emp.architectureSkills.length > 0 ? emp.architectureSkills : ['Conceptual Design', '3D Modeling', 'Urban Planning']).map(s => (
                      <span key={s} className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
                 <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tools</h4>
                  <div className="flex flex-wrap gap-2">
                    {(emp.toolsSelection && emp.toolsSelection.length > 0 ? emp.toolsSelection : ['AutoCAD', 'Revit', 'SketchUp']).map(s => (
                      <span key={s} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 text-xs font-bold rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4">Role Details</h3>
                <dl className="space-y-3 text-sm">
                  <div><dt className="text-slate-500 text-xs uppercase font-bold">Role</dt><dd className="font-medium mt-0.5">{emp.role}</dd></div>
                  <div><dt className="text-slate-500 text-xs uppercase font-bold">Department</dt><dd className="font-medium mt-0.5">{emp.department}</dd></div>
                </dl>
              </div>
              <div className="bg-zinc-900 rounded-xl p-6 text-white">
                <h3 className="font-bold mb-2">Annual Salary</h3>
                <p className="text-3xl font-black text-primary">${(emp.salary || 75000).toLocaleString()}</p>
                <p className="text-slate-400 text-xs mt-1">per year</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaves & timesheet' && (
             <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-300">calendar_month</span>
                <p className="text-slate-500 text-sm mt-3">No upcoming leaves scheduled. Timesheet is up to date.</p>
            </div>
        )}

         {activeTab === 'projects' && (
             <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Project Assignment History</h3>
                <div className="relative border-l-2 border-slate-200 ml-3 mt-6 space-y-8">
                    <div className="relative pl-6">
                        <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-white"></span>
                        <p className="text-xs font-bold text-primary mb-1">Current</p>
                        <h4 className="text-sm font-bold text-slate-800">Nile River Resort Phase 2</h4>
                        <p className="text-xs text-slate-500 mt-1">Lead Architect • Assigned on Oct 2023</p>
                    </div>
                    <div className="relative pl-6">
                        <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-slate-300 ring-4 ring-white"></span>
                        <p className="text-xs font-bold text-slate-500 mb-1">Completed</p>
                        <h4 className="text-sm font-bold text-slate-800">Sunrise Apartments</h4>
                        <p className="text-xs text-slate-500 mt-1">Senior Architect • Jan 2022 - Sep 2023</p>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'payslips' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Payslip History</h3>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  {['Period', 'Gross Salary', 'Deductions', 'Net Salary', 'Status', 'Actions'].map(col => (
                    <th key={col} className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payslips.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">No payslips found for this employee.</td></tr>
                )}
                {payslips.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{p.period}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">${p.grossSalary?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-red-600">-${p.deductions?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">${p.net?.toLocaleString()}</td>
                    <td className="px-6 py-4"><span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">{p.status}</span></td>
                    <td className="px-6 py-4">
                      <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-lg">download</span></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300">folder_open</span>
            <p className="text-slate-500 text-sm mt-3">No documents uploaded for this employee yet.</p>
            <button className="mt-4 px-4 py-2 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 transition-colors">
              Upload Document
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeProfilePage;
