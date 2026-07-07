import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import { Search, Download, Plus, ChevronRight, MapPin, RefreshCw, Users, Edit3, Trash2, UserCheck, UserX, Clock } from 'lucide-react';
import { useTranslation } from '../store/settingsStore';
import { useFormatters } from '../store/settingsStore';

const api = axios.create({
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api'
    : 'https://boxxway.onrender.com/api'
});

const EmployeesPage = () => {
  const { formatCurrency, formatDate } = useFormatters();

  const { t } = useTranslation();

  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

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

  const handleRefresh = () => {
    setLoading(true);
    setCurrentPage(1);
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
  };

  const handleDelete = async (empId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      const response = await api.delete(`/employees/${empId}`);
      // Remove from local state - filter by both id and employeeId to be safe
      setEmployees(employees.filter(emp => emp.id !== empId && emp.employeeId !== empId));
      // Reset to first page if current page becomes empty
      setCurrentPage(1);
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

  const handleDownloadPDF = async (employee) => {
    try {
      const doc = new jsPDF();
      const empId = employee._id || employee.id;

      // Fetch full employee details
      const response = await api.get(`/employees/${empId}`);
      const emp = response.data.data;

      let y = 20;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const lineHeight = 10;

      const addPageIfNeeded = () => {
        if (y > pageHeight - 30) {
          doc.addPage();
          y = margin;
        }
      };

      const addField = (label, value) => {
        addPageIfNeeded();
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(12);
        doc.text(`${label}:`, margin, y);
        doc.setTextColor(0, 0, 0);
        const valueText = value || 'N/A';
        // Handle long text by wrapping
        const maxWidth = 120;
        const lines = doc.splitTextToSize(valueText, maxWidth);
        doc.text(lines, margin + 50, y);
        y += lineHeight * lines.length;
      };

      const addSection = (title) => {
        addPageIfNeeded();
        y += 5;
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(title, margin, y);
        y += 10;
      };

      // Add title
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 0);
      doc.text('Employee Details', margin, y);
      y += 15;

      // Add employee name
      doc.setFontSize(16);
      doc.text(emp.name || 'N/A', margin, y);
      y += 15;

      // Add line separator
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, 190, y);
      y += 10;

      // Personal Information
      addSection('Personal Information');
      addField('Employee ID', emp.employeeId);
      addField('Email', emp.email);
      addField('Phone', emp.phone);
      addField('Role', emp.role);
      addField('Department', emp.department);
      addField('Employee Type', emp.employeeType);
      addField('Status', emp.status);
      addField('City', emp.city);
      addField('Date of Birth', emp.dob);
      addField('Gender', emp.gender);
      addField('Blood Group', emp.bloodGroup);

      // Education
      addSection('Education');
      addField('Highest Qualification', emp.highestQualification);
      addField('University', emp.university);
      addField('Graduation Year', emp.graduationYear);

      // Skills
      addSection('Skills');
      addField('Architecture Skills', emp.architectureSkills?.join(', '));
      addField('Tools', emp.toolsSelection?.join(', '));

      // Emergency Contact
      addSection('Emergency Contact');
      addField('Contact Name', emp.emergencyContactName);
      addField('Relation', emp.emergencyContactRelation);
      addField('Phone', emp.emergencyPhone);

      // Salary Details
      addSection('Salary Details');
      addField('Salary', emp.salary ? `$${formatCurrency(emp.salary)}` : 'N/A');
      addField('Basic Pay', emp.basicPay ? `$${formatCurrency(emp.basicPay)}` : 'N/A');
      addField('HRA', emp.hra ? `$${formatCurrency(emp.hra)}` : 'N/A');
      addField('Allowances', emp.allowances ? `$${formatCurrency(emp.allowances)}` : 'N/A');
      addField('Tax ID', emp.taxId);

      // Add footer to each page
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, pageHeight - 15);
        doc.text(`Page ${i} of ${totalPages}`, 190 - 30, pageHeight - 15);
      }

      // Save the PDF
      doc.save(`${emp.name.replace(/\s+/g, '_')}_details.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Please try again.');
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
  }).reverse();

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage);

  const handleExport = () => {
    console.log('Exporting employees. Total employees:', employees.length);
    console.log('Filtered employees:', filteredEmployees.length);
    console.log('Filtered data:', filteredEmployees);
    
    // Escape CSV values properly
    const escapeCSV = (value) => {
      if (!value) return '';
      const stringValue = String(value);
      // If value contains comma, quote it and escape any quotes
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };
    
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Role', 'Department', 'Status', 'Location'].join(','),
      ...filteredEmployees.map(emp => [
        escapeCSV(emp.name),
        escapeCSV(emp.email),
        escapeCSV(emp.phone || ''),
        escapeCSV(emp.role),
        escapeCSV(emp.department),
        escapeCSV(emp.status),
        escapeCSV(emp.city || emp.location || 'N/A')
      ].join(','))
    ].join('\n');

    console.log('CSV content length:', csvContent.length);
    console.log('CSV preview:', csvContent.substring(0, 500));

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
            <p className="text-sm text-slate-500 mt-1">{t('Manage your team members and their roles')}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleRefresh} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded hover:bg-slate-50 transition-colors flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />{t('Refresh')}</button>
            <button onClick={handleExport} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded hover:bg-slate-50 transition-colors flex items-center gap-2">
              <Download className="h-4 w-4" />{t('Export')}</button>
            <button onClick={() => navigate('/employees/new')} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2">
              <Plus className="h-4 w-4" />{t('New Employee')}</button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder={t('Search employees by name, role, or department...')} 
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
            <option>{t('All Departments')}</option>
            <option>{t('Design')}</option>
            <option>{t('Engineering')}</option>
            <option>{t('Management')}</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-w-[150px] px-4 py-2 bg-white border border-slate-200 rounded text-sm text-slate-600 focus:outline-none focus:border-primary"
          >
            <option>{t('All Status')}</option>
            <option>{t('Active')}</option>
            <option>{t('On Leave')}</option>
            <option>{t('Inactive')}</option>
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
            <div className="w-10">{t('Image')}</div>
            <div>{t('Employee')}</div>
            <div>{t('Role')}</div>
            <div>{t('Status')}</div>
            <div>{t('Location')}</div>
            <div className="text-right">{t('Actions')}</div>
          </div>

          {/* List Body */}
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="px-8 py-12 text-center text-slate-500 text-sm flex flex-col items-center">
                 <RefreshCw className="animate-spin h-8 w-8 mb-2" />{t('Loading employees...')}</div>
            ) : employees.length === 0 ? (
              <div className="px-8 py-12 text-center text-slate-500 text-sm">
                 <Users className="h-10 w-10 mb-2 text-slate-300" />
                 <p>{t('No employees found.')}</p>
              </div>
            ) : (
              paginatedEmployees.map((emp, index) => (
                <div
                  key={`${emp.id}-${index}`}
                  className="grid grid-cols-[auto_2fr_1.5fr_1.5fr_1fr_120px] gap-4 px-8 py-4 items-center hover:bg-slate-50 transition-colors group"
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
                    <h3
                      onClick={() => navigate(`/employees/${emp._id || emp.id}`)}
                      className="font-bold text-base text-slate-900 group-hover:text-primary transition-colors cursor-pointer"
                    >
                      {emp.name}
                    </h3>
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
                      <option value="Active">{t('Active')}</option>
                      <option value="Inactive">{t('Inactive')}</option>
                      <option value="On Leave">{t('On Leave')}</option>
                    </select>
                  </div>
                  <div className="text-sm text-slate-600 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {emp.city || emp.location || 'N/A'}
                  </div>
                  <div className="flex justify-end gap-1 items-center">
                    <button onClick={(e) => { e.stopPropagation(); handleDownloadPDF(emp); }} className="text-slate-400 hover:text-blue-500 p-1.5 rounded hover:bg-blue-50 transition-colors" title={t('Download PDF')}>
                      <Download className="h-4 w-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(emp._id || emp.id); }} className="text-slate-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors" title={t('Delete')}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/employees/${emp._id || emp.id}`); }} className="text-slate-400 hover:text-primary p-1.5 rounded hover:bg-primary/10 transition-colors" title={t('View Details')}>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {filteredEmployees.length > 0 && (
            <div className="px-8 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredEmployees.length)} of {filteredEmployees.length} employees
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-medium rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >{t('Previous')}</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 text-xs font-medium rounded border ${
                      currentPage === page
                        ? 'bg-primary text-white border-primary'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-medium rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >{t('Next')}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeesPage;
