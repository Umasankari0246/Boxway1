import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Download, Plus, ChevronRight, MapPin, RefreshCw, Users, Edit3, Trash2, UserCheck, UserX, Clock } from 'lucide-react';

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
});

const EmployeesPage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Status');

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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      const response = await api.delete(`/employees/${id}`);
      // Remove from local state
      setEmployees(employees.filter(emp => emp.id !== id));
      alert("Employee deleted successfully!");
    } catch (err) {
      console.error("Error deleting employee:", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
      }
      alert("Failed to delete employee. Please check console for details.");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await api.patch(`/employees/${id}`, { status: newStatus });
      if (response.data && response.data.data) {
        setEmployees(employees.map(emp => emp.id === id ? { ...emp, status: newStatus } : emp));
      } else {
        setEmployees(employees.map(emp => emp.id === id ? { ...emp, status: newStatus } : emp));
      }
    } catch (err) {
      console.error("Error updating status:", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);
      }
      alert("Failed to update status. Please check console for details.");
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = searchTerm === '' || 
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'All Departments' || emp.department === departmentFilter;
    const matchesStatus = statusFilter === 'All Status' || emp.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleExport = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Role', 'Department', 'Status', 'Location'].join(','),
      ...filteredEmployees.map(emp => [
        emp.name,
        emp.email,
        emp.phone || '',
        emp.role,
        emp.department,
        emp.status,
        emp.city || emp.location || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'employees.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            <button onClick={handleExport} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded hover:bg-slate-50 transition-colors flex items-center gap-2">
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-colors"
            />
          </div>
          <select 
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="min-w-[180px] px-4 py-2 bg-white border border-slate-200 rounded text-sm text-slate-600 focus:outline-none focus:border-primary"
          >
            <option>All Departments</option>
            <option>Design</option>
            <option>Engineering</option>
            <option>Management</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-w-[150px] px-4 py-2 bg-white border border-slate-200 rounded text-sm text-slate-600 focus:outline-none focus:border-primary"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>On Leave</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="px-8 py-6 bg-[#f8f6f6]">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Employees', val: employees.length, icon: Users, color: 'text-slate-900' },
            { label: 'Active', val: employees.filter(e => e.status === 'Active').length, icon: UserCheck, color: 'text-green-600' },
            { label: 'Inactive', val: employees.filter(e => e.status === 'Inactive').length, icon: UserX, color: 'text-yellow-600' },
            { label: 'On Leave', val: employees.filter(e => e.status === 'On Leave').length, icon: Clock, color: 'text-blue-600' },
          ].map(k => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`${k.color} h-5 w-5`} />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{k.label}</span>
                </div>
                <p className={`text-3xl font-black ${k.color}`}>{k.val}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* List Header */}
          <div className="grid grid-cols-[auto_2fr_1.5fr_1.5fr_1fr_120px] gap-4 px-8 py-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider items-center">
            <div className="w-10">Image</div>
            <div>Employee</div>
            <div>Role</div>
            <div>Status</div>
            <div>Location</div>
            <div className="text-right">Actions</div>
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
              filteredEmployees.map(emp => (
                <div 
                  key={emp.id}
                  onClick={() => navigate(`/employees/${emp.id}`)}
                  className="grid grid-cols-[auto_2fr_1.5fr_1.5fr_1fr_120px] gap-4 px-8 py-4 items-center hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-slate-200">
                    {emp.photoUrl ? (
                      <img src={emp.photoUrl} alt={emp.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm">
                        {emp.name ? emp.name.charAt(0).toUpperCase() : '?'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-primary transition-colors">{emp.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{emp.email}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-slate-900">{emp.role}</p>
                    <p className="text-xs text-slate-500">{emp.department}</p>
                  </div>
                  <div>
                    <select 
                      value={emp.status} 
                      onChange={(e) => { e.stopPropagation(); handleStatusChange(emp.id, e.target.value); }} 
                      onClick={(e) => e.stopPropagation()}
                      className={`text-[10px] font-bold rounded uppercase px-3 py-1 outline-none cursor-pointer border border-transparent hover:border-slate-200 min-w-[100px] ${
                        emp.status === 'Active' ? 'bg-green-100 text-green-700' : 
                        emp.status === 'On Leave' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                  <div className="text-sm text-slate-600 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {emp.city || emp.location || 'N/A'}
                  </div>
                  <div className="flex justify-end gap-1 items-center">
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/employees/${emp.id}`); }} className="text-slate-400 hover:text-primary p-1.5 rounded hover:bg-primary/10 transition-colors" title="Edit">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(emp.id); }} className="text-slate-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button className="text-slate-400 hover:text-primary p-1.5 rounded hover:bg-primary/10 transition-colors" title="View Details">
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
