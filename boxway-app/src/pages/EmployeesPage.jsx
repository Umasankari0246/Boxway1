import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Download, Plus, ChevronRight, MapPin, RefreshCw, Users } from 'lucide-react';

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
});

const EmployeesPage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex flex-col h-full bg-[#f8f6f6]">
      {/* Header Container */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Employees</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your team members and their roles</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded hover:bg-slate-50 transition-colors flex items-center gap-2">
              <Download className="h-4 w-4" /> Export
            </button>
            <button onClick={() => navigate('/employees/new')} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2">
              <Plus className="h-4 w-4" /> New Employee
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search employees by name, role, or department..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-colors"
            />
          </div>
          <select className="min-w-[180px] px-4 py-2 bg-white border border-slate-200 rounded text-sm text-slate-600 focus:outline-none focus:border-primary">
            <option>All Departments</option>
            <option>Design</option>
            <option>Engineering</option>
            <option>Management</option>
          </select>
          <select className="min-w-[150px] px-4 py-2 bg-white border border-slate-200 rounded text-sm text-slate-600 focus:outline-none focus:border-primary">
            <option>All Status</option>
            <option>Active</option>
            <option>On Leave</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* List Header */}
          <div className="grid grid-cols-[auto_2fr_1.5fr_1.5fr_1fr_auto] gap-4 px-8 py-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="w-10">Image</div>
            <div>Employee</div>
            <div>Role</div>
            <div>Status</div>
            <div>Location</div>
            <div className="w-8"></div>
          </div>

          {/* List Body */}
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="px-8 py-12 text-center text-slate-500 text-sm flex flex-col items-center">
                 <RefreshCw className="animate-spin h-8 w-8 mb-2" />
                 Loading employees...
              </div>
            ) : employees.length === 0 ? (
              <div className="px-8 py-12 text-center text-slate-500 text-sm">
                 <Users className="h-10 w-10 mb-2 text-slate-300" />
                 <p>No employees found.</p>
              </div>
            ) : (
              employees.map(emp => (
                <div 
                  key={emp.id}
                  onClick={() => navigate(`/employees/${emp.id}`)}
                  className="grid grid-cols-[auto_2fr_1.5fr_1.5fr_1fr_auto] gap-4 px-8 py-4 items-center hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-slate-200">
                    {emp.photoUrl ? (
                      <img src={emp.photoUrl} alt={emp.name} className="w-full h-full object-cover" />
                    ) : (
                      emp.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{emp.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{emp.email}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-slate-900">{emp.role}</p>
                    <p className="text-xs text-slate-500">{emp.department}</p>
                  </div>
                  <div>
                    <span className={`inline-flex px-2 py-1 text-[10px] font-bold rounded uppercase ${
                      emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {emp.status}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {emp.city || emp.location || 'N/A'}
                  </div>
                  <div className="w-8 flex justify-end">
                    <button className="text-slate-400 hover:text-primary p-1 rounded hover:bg-primary/10 transition-colors">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeesPage;
