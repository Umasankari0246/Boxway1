import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Search, Filter, ArrowUpRight, BarChart3, CheckCircle, Clock, Users, X, Download, ChevronRight, RefreshCw, FolderOpen, PauseCircle } from 'lucide-react';
import { useFormatters } from '../../hooks/useFormatters.js';
import { useTranslation } from '../../store/settingsStore';

const api = axios.create({
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:8001/api'
    : 'https://boxxway.onrender.com/api'
});

const STATUS_CFG = {
  'In Progress': 'bg-blue-100 text-blue-700',
  'Planning':    'bg-amber-100 text-amber-700',
  'Completed':   'bg-emerald-100 text-emerald-700',
  'On Hold':     'bg-zinc-100 text-zinc-500',
};

const TYPE_COLORS = {
  'Commercial':   'bg-indigo-50 text-indigo-700',
  'Residential':  'bg-teal-50 text-teal-700',
  'Hospitality':  'bg-rose-50 text-rose-700',
  'Municipal':    'bg-sky-50 text-sky-700',
  'High-End Residential': 'bg-violet-50 text-violet-700',
  'Cultural / Institutional': 'bg-orange-50 text-orange-700',
  'Renovation / Restoration': 'bg-yellow-50 text-yellow-700',
};
const STATUSES = ['All Status', 'In Progress', 'Planning', 'On Hold', 'Completed'];

const ProjectsPage = () => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const { formatCurrency } = useFormatters();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects/');
        setProjects(response.data.data);
      } catch (err) {
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    setCurrentPage(1);
    try {
      const response = await api.get('/projects/');
      setProjects(response.data.data);
    } catch (err) {
      console.error("Error refreshing projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const types = ['All Types', ...Array.from(new Set(projects.map(p => p.type)))];

  const filteredProjects = projects
    .map(p => {
      let progress = p.progress;
      if (progress === undefined || progress === null || progress === 0 && p.phase > 1) {
        const totalPhases = p.totalPhases || 8;
        const phase = p.phase || 1;
        progress = Math.round((phase / totalPhases) * 100);
      }
      return { ...p, progress };
    })
    .filter(p =>
      (statusFilter === 'All Status' || p.status === statusFilter) &&
      (typeFilter === 'All Types' || p.type === typeFilter) &&
      (searchTerm === '' ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.lead.toLowerCase().includes(searchTerm.toLowerCase()))
    ).reverse();

  const totalPages = Math.ceil(filteredProjects.length / rowsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalBudget = projects.reduce((s, p) => s + (p.budget || 0), 0);
  const activeCount = projects.filter(p => p.status === 'In Progress').length;

  const handleExport = () => {
    const escapeCSV = (value) => {
      if (!value) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };
    const csvContent = [
      ['Project', 'Type', 'Client', 'Lead', 'Budget', 'Progress', 'Status', 'End Date'].join(','),
      ...filteredProjects.map(p => [
        escapeCSV(p.name),
        escapeCSV(p.type),
        escapeCSV(p.client),
        escapeCSV(p.lead),
        escapeCSV(p.budget),
        escapeCSV(p.progress),
        escapeCSV(p.status),
        escapeCSV(p.endDate)
      ].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'projects.csv');
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
            <p className="text-sm text-slate-500 mt-1">{t('Manage your projects and their progress')}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleRefresh} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded hover:bg-slate-50 transition-colors flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />{t('Refresh')}</button>
            <button onClick={handleExport} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded hover:bg-slate-50 transition-colors flex items-center gap-2">
              <Download className="h-4 w-4" />{t('Export')}</button>
            <button onClick={() => navigate('/projects/new')} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2">
              <Plus className="h-4 w-4" />{t('New Project')}</button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder={t('Search projects by name, client, or lead...')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-colors"
            />
          </div>
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="min-w-[180px] px-4 py-2 bg-white border border-slate-200 rounded text-sm text-slate-600 focus:outline-none focus:border-primary"
          >
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-w-[150px] px-4 py-2 bg-white border border-slate-200 rounded text-sm text-slate-600 focus:outline-none focus:border-primary"
          >
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="px-8 py-6 bg-[#f8f6f6]">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Projects', val: projects.length, icon: FolderOpen, color: 'text-slate-900' },
            { label: 'Active Projects', val: activeCount, icon: BarChart3, color: 'text-emerald-600' },
            { label: 'Total Budget', val: formatCurrency(totalBudget), icon: CheckCircle, color: 'text-primary' },
            { label: 'Pending Approvals', val: '4', icon: Clock, color: 'text-amber-500' },
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
          <div className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_1.5fr_1fr_60px] gap-4 px-8 py-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider items-center">
            <div>{t('Project')}</div>
            <div>{t('Type')}</div>
            <div>{t('Client')}</div>
            <div className="hidden lg:block">{t('Budget')}</div>
            <div>{t('Progress')}</div>
            <div>{t('Status')}</div>
            <div className="text-right">{t('Action')}</div>
          </div>

          {/* List Body */}
          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="px-8 py-12 text-center text-slate-500 text-sm flex flex-col items-center">
                 <RefreshCw className="animate-spin h-8 w-8 mb-2" />{t('Loading projects...')}</div>
            ) : projects.length === 0 ? (
              <div className="px-8 py-12 text-center text-slate-500 text-sm">
                 <FolderOpen className="h-10 w-10 mb-2 text-slate-300 mx-auto" />
                 <p>{t('No projects found.')}</p>
              </div>
            ) : (
              paginatedProjects.map((p, index) => (
                <div
                  key={`${p.id}-${index}`}
                  className="grid grid-cols-[2fr_1.5fr_1.5fr_1fr_1.5fr_1fr_60px] gap-4 px-8 py-4 items-center hover:bg-slate-50 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/projects/${p.id}`)}
                >
                  <div>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-primary transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{p.id}</p>
                  </div>
                  <div className="text-sm">
                    <span className={`px-3 py-1 text-xs font-bold rounded-lg ${TYPE_COLORS[p.type] || 'bg-slate-100 text-slate-600'}`}>{p.type}</span>
                  </div>
                  <div className="text-sm">
                    <p className="text-slate-900">{p.client}</p>
                    <p className="text-xs text-slate-500">{p.lead}</p>
                  </div>
                  <div className="hidden lg:block text-right">
                    <p className="font-bold text-slate-900">{formatCurrency((p.budget / 1000).toFixed(0))}K</p>
                    <p className="text-xs text-slate-500">{formatCurrency((p.spent / 1000).toFixed(0))}K spent</p>
                  </div>
                  <div className="text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-2 transition-all ${p.progress > 90 ? 'bg-emerald-500' : p.progress > 60 ? 'bg-primary' : 'bg-amber-500'}`} style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-500 w-8">{p.progress}%</span>
                    </div>
                  </div>
                  <div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-lg ${STATUS_CFG[p.status] || STATUS_CFG['On Hold']}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="flex justify-end items-center">
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/projects/${p.id}`); }} className="text-slate-400 hover:text-primary p-1.5 rounded hover:bg-primary/10 transition-colors" title={t('View Details')}>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {filteredProjects.length > 0 && (
            <div className="px-8 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredProjects.length)} of {filteredProjects.length} projects
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

export default ProjectsPage;
