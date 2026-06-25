import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Icon from "../../components/ui/Icon.jsx"

const api = axios.create({
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api'
    : 'https://boxxway.onrender.com/api',
});

/* ── Phase definitions by project type ────────────────────────────────────── */
const PHASE_MAP = {
  'Commercial': ['Initial Meeting','Site Survey','Concept Design','Planning Submission','Design Development','Construction Docs','Tendering','Construction','Fit-Out','Handover'],
  'Residential': ['Initial Meeting','Site Analysis','Schematic Design','Design Development','Client Approval','Construction Docs','Construction','Interior Design','Material Purchase','Vendor Finalization','Handover'],
  'Hospitality': ['Initial Meeting','Feasibility','Concept Design','Design Development','Construction Docs','Procurement','Construction','Interior Design','Fit-Out','Handover'],
  'Municipal': ['Initial Meeting','Site Analysis','Brief Development','Concept Design','Planning Submission','Design Development','Tender','Construction','Commissioning','Handover'],
  'High-End Residential': ['Initial Meeting','Site Analysis','Schematic Design','Design Development','Client Approval','Construction Docs','Construction','Interior Design','Material Purchase','Vendor Finalization','Handover'],
  'Commercial / Retail': ['Initial Meeting','Site Survey','Concept Design','Planning Submission','Design Development','Construction Docs','Tendering','Construction','Fit-Out','Handover'],
  'Hospitality / Boutique Hotel': ['Initial Meeting','Feasibility Study','Concept Design','Design Development','Construction Docs','Procurement','Construction','Interior Design','Fit-Out','Handover'],
  'Renovation / Restoration': ['Initial Meeting','Condition Survey','Design Brief','Conservation Analysis','Planning Consent','Design Development','Construction Docs','Construction','Handover'],
  'Cultural / Institutional': ['Initial Meeting','Site Analysis','Brief Development','Concept Design','Planning Submission','Design Development','Tender','Construction','Commissioning','Handover'],
  DEFAULT: ['Initial Meeting','Resource Assignment','Design','Construction','Interior Design','Material Purchase','Vendor Finalization','Handover'],
};

const STATUS_CFG = {
  'In Progress': { cls: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500'    },
  'Planning':    { cls: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500'   },
  'Completed':   { cls: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  'On Hold':     { cls: 'bg-zinc-100 text-zinc-500',     dot: 'bg-zinc-400'    },
};

const MOCK_DOCS = [
  { name: 'Site_Survey_PRJ001.dwg',    type: 'DWG', size: '18.4 MB', folder: 'Site',       date: 'Mar 12, 2024' },
  { name: 'Scheme_CAD_v3.2.dwg',       type: 'DWG', size: '64.1 MB', folder: 'Scheme/CAD', date: 'Mar 15, 2024' },
  { name: 'Ext_Render_Final_v1.png',   type: 'PNG', size: '22.8 MB', folder: 'Renders',    date: 'Mar 18, 2024' },
  { name: 'Email_In_Structural.pdf',   type: 'PDF', size: '3.2 MB',  folder: 'Email In',   date: 'Mar 14, 2024' },
];

const INITIAL_COMMENTS = [
  { id: 1, author: 'Alex Carter',    avatar: 'AC', color: 'bg-primary',    role: 'Admin',          time: '5 days ago', phase: 'Initial Meeting',   text: 'Project kicked off. All client documentation received and filed. Initial meeting notes uploaded.', likes: 3 },
  { id: 2, author: 'Marcus Johnson', avatar: 'MJ', color: 'bg-zinc-700',   role: 'Lead Architect',  time: '4 days ago', phase: 'Design',             text: 'Schematic design v1.0 completed and shared with client via email. Awaiting client feedback before advancing to Design Development.', likes: 5 },
  { id: 3, author: 'Priya Nair',     avatar: 'PN', color: 'bg-blue-600',   role: 'Project Manager', time: '2 days ago', phase: 'Design',             text: 'Client review meeting held. Minor revisions requested on east elevation. Tom has been assigned the CAD revisions. Target: 3 working days.', likes: 2 },
  { id: 4, author: 'Tom Walsh',      avatar: 'TW', color: 'bg-zinc-600',   role: 'Junior Architect', time: '1 day ago', phase: 'Design',             text: 'East elevation CAD revised per client comments. New DWG uploaded under Scheme/CAD — v3.2. Marcus to review before resending to client.', likes: 4 },
];

const TABS = [
  { key: 'overview',   label: 'Overview',  icon: 'dashboard_customize' },
  { key: 'phases',     label: 'Phases',    icon: 'timeline'             },
  { key: 'team',       label: 'Team',      icon: 'group'                },
  { key: 'documents',  label: 'Documents', icon: 'folder'               },
  { key: 'approvals',  label: 'Approvals', icon: 'fact_check'           },
  { key: 'activity',   label: 'Activity',  icon: 'chat'                 },
];

const ProjectViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [activePhaseIdx, setActivePhaseIdx] = useState(0);
  const [tab, setTab] = useState('overview');
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const [likedIds, setLikedIds] = useState([]);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [projectStatus, setProjectStatus] = useState('Planning');
  const [team, setTeam] = useState([]);
  
  // Initialize team from project.teamMembers
  const getEmployeeById = (empId) => employees.find(e => e.id === empId || e.employeeId === empId);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, employeesRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get('/employees/'),
        ]);
        let projectData = projectRes.data.data;
        
        // Calculate progress if not present
        let progress = projectData.progress;
        if (progress === undefined || progress === null || progress === 0 && projectData.phase > 1) {
          const totalPhases = projectData.totalPhases || 8;
          const phase = projectData.phase || 1;
          progress = Math.round((phase / totalPhases) * 100);
          // Update project in backend with calculated progress
          await api.patch(`/projects/${id}`, { progress });
          projectData = { ...projectData, progress };
        }
        
        setProject(projectData);
        setEmployees(employeesRes.data.data);
        setActivePhaseIdx(projectData.phase - 1);
        setProjectStatus(projectData.status);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);
  
  // Update team when project or employees change
  useEffect(() => {
    if (project && employees.length > 0) {
      const initialTeam = project.teamMembers?.map(empId => {
        const emp = getEmployeeById(empId);
        return {
          id: empId,
          name: emp?.name || 'Unknown',
          role: emp?.role || 'Member',
          color: ['bg-primary', 'bg-blue-600', 'bg-zinc-600', 'bg-violet-600', 'bg-teal-600', 'bg-rose-600'][Math.floor(Math.random() * 6)],
        };
      }) || [];
      setTeam(initialTeam);
    }
  }, [project, employees]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-zinc-500">Project not found</p>
      </div>
    );
  }

  const phases = PHASE_MAP[project.type] || PHASE_MAP.DEFAULT;

  const sc = STATUS_CFG[projectStatus] || STATUS_CFG['In Progress'];
  const budgetPct = Math.round((project.spent / project.budget) * 100);

  const postComment = () => {
    if (!newComment.trim()) return;
    setComments(prev => [...prev, {
      id: Date.now(),
      author: 'Alex Carter', avatar: 'AC', color: 'bg-primary', role: 'Admin',
      time: 'Just now', phase: phases[activePhaseIdx] || 'General',
      text: newComment, likes: 0,
    }]);
    setNewComment('');
  };

  const advancePhase = async () => {
    if (activePhaseIdx < phases.length - 1) {
      const nextIdx = activePhaseIdx + 1;
      setActivePhaseIdx(nextIdx);
      
      // Calculate progress percentage
      const progress = Math.round(((nextIdx + 1) / phases.length) * 100);
      
      // Update project in backend
      try {
        const updates = { phase: nextIdx + 1, progress };
        if (nextIdx === phases.length - 1) {
          updates.status = 'Completed';
          setProjectStatus('Completed');
        } else if (projectStatus === 'Planning') {
          updates.status = 'In Progress';
          setProjectStatus('In Progress');
        }
        await api.patch(`/projects/${id}`, updates);
        setProject(prev => ({ ...prev, ...updates }));
      } catch (err) {
        console.error("Error updating project:", err);
      }

      setComments(prev => [...prev, {
        id: Date.now(), author: 'System', avatar: '⚡', color: 'bg-zinc-500', role: 'Boxway Studio',
        time: 'Just now', phase: phases[nextIdx], isSystem: true,
        text: `Phase advanced to "${phases[nextIdx]}". Previous phase "${phases[activePhaseIdx]}" marked as complete.`, likes: 0,
      }]);
    }
    setShowAdvanceModal(false);
  };

  const saveStatus = async (newStatus) => {
    try {
      await api.patch(`/projects/${id}`, { status: newStatus });
      setProject(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#fcf9f8]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#fcf9f8]/95 backdrop-blur border-b border-zinc-100 px-8 py-4">
        <div className="flex items-start gap-4">
          <button onClick={() => navigate('/projects')} className="text-zinc-400 hover:text-zinc-700 transition-colors mt-1">
            <Icon name="arrow_back" className="text-[20px]" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <span className="text-[9px] font-mono font-black text-zinc-400">{project.projectId || project.id}</span>
              {/* Editable status */}
              {editingStatus ? (
                <select 
                  autoFocus 
                  value={projectStatus} 
                  onChange={(e) => { 
                    setProjectStatus(e.target.value); 
                    saveStatus(e.target.value);
                    setEditingStatus(false); 
                  }} 
                  onBlur={() => setEditingStatus(false)}
                  className="text-[9px] font-black uppercase border border-primary px-2 py-0.5 focus:outline-none"
                >
                  {Object.keys(STATUS_CFG).map(s => <option key={s}>{s}</option>)}
                </select>
              ) : (
                <button onClick={() => setEditingStatus(true)} className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest cursor-pointer hover:opacity-80 ${sc.cls}`} title="Click to change status">
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                  {projectStatus}
                  <Icon name="edit" className="text-[12px] ml-1" />
                </button>
              )}
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-zinc-100 text-zinc-500">{project.type}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-zinc-900 truncate">{project.name}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">{project.client} · Led by {project.lead} · {team.length} team members</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setShowResourceModal(true)} className="flex items-center gap-1.5 px-4 py-2 border border-zinc-200 text-zinc-700 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-colors">
              <Icon name="group_add" className="text-[16px]" />Resources
            </button>
            <button onClick={() => navigate(`/projects/${id}/edit`)} className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors">
              <Icon name="edit" className="text-[16px]" />Edit
            </button>
            {activePhaseIdx < phases.length - 1 && (
              <button onClick={() => setShowAdvanceModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors shadow-sm shadow-primary/20">
                <Icon name="arrow_forward" className="text-[16px]" />
                Advance Phase
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mt-4 border-t border-zinc-100 pt-1 overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-zinc-400 hover:text-zinc-700'}`}>
              <Icon name={t.icon} className="text-[15px]" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8 max-w-7xl">
        {/* ─── OVERVIEW ─── */}
        {tab === 'overview' && (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8 space-y-5">
              {/* Description */}
              <div className="bg-white border border-zinc-100 shadow-sm p-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Project Description</h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{project.description || "No description provided."}</p>
              </div>
              {/* Budget */}
              <div className="bg-white border border-zinc-100 shadow-sm p-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Budget Utilisation</h3>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-zinc-500">Spent: <strong className="text-zinc-900">${project.spent?.toLocaleString() || 0}</strong></span>
                  <span className="text-zinc-500">Budget: <strong className="text-zinc-900">${project.budget?.toLocaleString() || 0}</strong></span>
                </div>
                <div className="h-2 bg-zinc-100">
                  <div className={`h-2 transition-all ${budgetPct > 90 ? 'bg-red-500' : budgetPct > 70 ? 'bg-amber-500' : 'bg-primary'}`} style={{ width: `${budgetPct}%` }} />
                </div>
                <div className="flex justify-between mt-2">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{budgetPct}% used</p>
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Remaining: ${(project.budget - project.spent)?.toLocaleString() || 0}</p>
                </div>
              </div>
              {/* Phase quick view */}
              <div className="bg-white border border-zinc-100 shadow-sm p-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Phase Progress</h3>
                <div className="flex gap-0.5 mb-2">
                  {phases.map((ph, i) => (
                    <div key={i} title={ph} className={`flex-1 h-2 transition-all ${i < activePhaseIdx ? 'bg-primary' : i === activePhaseIdx ? 'bg-primary/40' : 'bg-zinc-100'}`} />
                  ))}
                </div>
                <div className="flex justify-between">
                  <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Current: {phases[activePhaseIdx]}</p>
                  <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">Phase {activePhaseIdx + 1} of {phases.length}</p>
                </div>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-4 space-y-4">
              {/* Status card */}
              <div className="bg-zinc-900 text-white p-6">
                <p className="text-[9px] text-white/40 uppercase tracking-widest mb-3">Overall Progress</p>
                <p className="text-5xl font-black text-primary">{project.progress}%</p>
                <p className="text-white/50 text-xs mt-2">Phase {activePhaseIdx + 1} of {phases.length}</p>
                <p className="text-white/70 text-sm font-bold mt-3">{phases[activePhaseIdx]}</p>
              </div>
              {/* Key dates */}
              <div className="bg-white border border-zinc-100 shadow-sm p-5 space-y-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Key Dates</h3>
                {[
                  { label: 'Start Date', val: project.startDate || '-' }, 
                  { label: 'End Date', val: project.endDate || '-' }, 
                  { label: 'Team Size', val: `${team.length} members` },
                ].map(f => (
                  <div key={f.label} className="flex justify-between items-center">
                    <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-black">{f.label}</p>
                    <p className="text-xs font-bold text-zinc-900">{f.val}</p>
                  </div>
                ))}
              </div>
              {/* Quick links */}
              <div className="bg-white border border-zinc-100 shadow-sm p-5 space-y-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Quick Actions</h3>
                <button onClick={() => { setTab('activity'); }} className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-50 hover:bg-zinc-100 transition-colors text-[10px] font-black text-left">
                  <Icon name="chat" className="text-[16px]" text-zinc-400 />Add Comment
                </button>
                <button onClick={() => navigate('/documents')} className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-50 hover:bg-zinc-100 transition-colors text-[10px] font-black text-left">
                  <Icon name="upload" className="text-[16px]" text-zinc-400 />Upload Document
                </button>
                <button onClick={() => navigate('/invoices/new')} className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-50 hover:bg-zinc-100 transition-colors text-[10px] font-black text-left">
                  <Icon name="receipt_long" className="text-[16px]" text-zinc-400 />Create Invoice
                </button>
                <button onClick={() => navigate('/proposals')} className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-50 hover:bg-zinc-100 transition-colors text-[10px] font-black text-left">
                  <Icon name="description" className="text-[16px]" text-zinc-400 />View Parent Proposal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── PHASES ─── */}
        {tab === 'phases' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-black text-zinc-900">Workflow Phases</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Click "Advance Phase" in the header to move to the next stage. Each phase includes uploads and client review loops.</p>
              </div>
            </div>
            {phases.map((phase, i) => {
              const isDone = i < activePhaseIdx;
              const isCurrent = i === activePhaseIdx;
              const isUpcoming = i > activePhaseIdx;
              return (
                <div key={phase} className={`border transition-all ${isCurrent ? 'border-primary/40 bg-primary/5 shadow-sm' : isDone ? 'border-zinc-100 bg-zinc-50/50' : 'border-zinc-100 bg-white opacity-60'}`}>
                  <div className="p-5 flex items-center gap-5">
                    {/* Status icon */}
                    <div className={`w-10 h-10 flex items-center justify-center shrink-0 ${isDone ? 'bg-emerald-500' : isCurrent ? 'bg-primary' : 'bg-zinc-100'}`}>
                      {isDone ? <Icon name="check" className="text-white text-[18px]" />
                        : isCurrent ? <Icon name="pending" className="text-white text-[18px]" animate-pulse />
                        : <span className="text-zinc-400 text-xs font-black">{String(i + 1).padStart(2, '0')}</span>}
                    </div>
                    {/* Phase info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className={`text-sm font-black ${isCurrent ? 'text-primary' : isDone ? 'text-zinc-900' : 'text-zinc-500'}`}>
                          Phase {i + 1}: {phase}
                        </p>
                        {isCurrent && <span className="text-[8px] font-black uppercase tracking-widest bg-primary text-white px-2 py-0.5">In Progress</span>}
                        {isDone && <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-0.5">✓ Complete</span>}
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {isDone ? 'Completed — documents uploaded & client approved.' :
                         isCurrent ? 'Active — create and upload designs, conduct client reviews over email, advance when approved.' :
                         'Upcoming — resources can be assigned or changed before this phase begins.'}
                      </p>
                    </div>
                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      {isCurrent && (
                        <>
                          <button onClick={() => navigate('/documents')} className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-[9px] font-black uppercase tracking-widest transition-colors flex items-center gap-1">
                            <Icon name="upload" className="text-[13px]" />Upload
                          </button>
                          <button onClick={() => setShowAdvanceModal(true)} className="px-3 py-1.5 bg-primary text-white text-[9px] font-black uppercase tracking-widest hover:bg-black transition-colors flex items-center gap-1">
                            <Icon name="check" className="text-[13px]" />Approve & Advance
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Review loop indicator for current phase */}
                  {isCurrent && (
                    <div className="border-t border-primary/20 px-5 py-3 bg-white/40 flex items-center gap-4 flex-wrap">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Review loop:</span>
                      {['Create/Upload Design', 'Send to Client', 'Client Review', 'Revise if needed', 'Client Approval', 'Advance Phase'].map((step, si) => (
                        <React.Fragment key={step}>
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 ${si < 2 ? 'bg-primary text-white' : si === 2 ? 'bg-primary/20 text-primary' : 'bg-zinc-100 text-zinc-400'}`}>{step}</span>
                          {si < 5 && <Icon name="chevron_right" className="text-zinc-300 text-[12px]" />}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ─── TEAM ─── */}
        {tab === 'team' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-zinc-900">Assigned Team</h3>
              <button onClick={() => setShowResourceModal(true)} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors">
                <Icon name="group_add" className="text-[16px]" />Assign Resources
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {team.map(m => (
                <div key={m.id} className="bg-white border border-zinc-100 shadow-sm p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 ${m.color} text-white font-black text-lg flex items-center justify-center`}>{m.name.charAt(0)}</div>
                  <div className="flex-1">
                    <p className="font-black text-sm text-zinc-900">{m.name}</p>
                    <p className="text-xs text-zinc-400">{m.role}</p>
                  </div>
                  <button onClick={() => setTeam(t => t.filter(x => x.id !== m.id))} className="p-1.5 text-zinc-300 hover:text-red-500 transition-colors">
                    <Icon name="remove_circle" className="text-[16px]" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-zinc-400 text-center pt-2">Resources can be added or changed at any phase of the project.</p>
          </div>
        )}

        {/* ─── DOCUMENTS ─── */}
        {tab === 'documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-zinc-900">Project Documents</h3>
              <button onClick={() => navigate('/documents')} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors">
                <Icon name="upload" className="text-[16px]" />Upload Document
              </button>
            </div>
            <div className="bg-white border border-zinc-100 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="border-b border-zinc-100 bg-zinc-50/60">
                  <tr>
                    {['File', 'Type', 'Folder', 'Size', 'Date', 'Actions'].map(c => (
                      <th key={c} className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-zinc-400">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {MOCK_DOCS.map(doc => (
                    <tr key={doc.name} className="hover:bg-zinc-50 group">
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-black text-zinc-800">{doc.name}</p>
                      </td>
                      <td className="px-5 py-3.5"><span className="text-[9px] font-mono font-black text-zinc-500">{doc.type}</span></td>
                      <td className="px-5 py-3.5"><span className="text-[9px] font-black uppercase text-zinc-500 bg-zinc-100 px-2 py-0.5">{doc.folder}</span></td>
                      <td className="px-5 py-3.5 text-xs text-zinc-400">{doc.size}</td>
                      <td className="px-5 py-3.5 text-xs text-zinc-400">{doc.date}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1 hover:bg-zinc-100 text-zinc-400 hover:text-primary transition-colors"><Icon name="download" className="text-[15px]" /></button>
                          <button className="p-1 hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors"><Icon name="delete" className="text-[15px]" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── APPROVALS ─── */}
        {tab === 'approvals' && (
          <div className="space-y-4">
            <h3 className="font-black text-zinc-900 mb-4">Approval History</h3>
            {phases.slice(0, activePhaseIdx + 1).map((ph, i) => {
              const isDone = i < activePhaseIdx;
              return (
                <div key={ph} className={`border ${isDone ? 'border-emerald-100 bg-emerald-50/30' : 'border-primary/30 bg-primary/5'}`}>
                  <div className="p-5 flex items-center gap-4">
                    <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${isDone ? 'bg-emerald-500' : 'bg-primary'}`}>
                      <Icon name={isDone ? 'check' : 'pending'} className="text-white text-[16px]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-black text-zinc-900">Phase {i + 1}: {ph}</p>
                      <p className="text-[9px] text-zinc-400 mt-0.5">
                        {isDone ? `Approved — client confirmed design and signed off on this phase.` : `In progress — awaiting client review and approval.`}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      {isDone ? (
                        <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 px-2 py-0.5">Approved ✓</span>
                      ) : (
                        <span className="text-[8px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 px-2 py-0.5">Pending</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── ACTIVITY LOG ─── */}
        {tab === 'activity' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-zinc-900">Activity & Comments</h3>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{comments.length} entries</span>
            </div>

            {/* Compose */}
            <div className="flex gap-3 mb-8">
              <div className="w-8 h-8 bg-primary text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">AC</div>
              <div className="flex-1">
                <select className="w-full border border-zinc-200 bg-zinc-50 text-[10px] font-black uppercase px-3 py-2 focus:outline-none focus:border-primary mb-2">
                  {phases.map(ph => <option key={ph}>{ph}</option>)}
                </select>
                <textarea value={newComment} onChange={e => setNewComment(e.target.value)} rows={3} placeholder="Add a note, update, or action item for this project..." className="w-full border border-zinc-200 bg-zinc-50 text-sm px-4 py-3 focus:outline-none focus:border-primary resize-none" />
                <div className="flex justify-end mt-2">
                  <button onClick={postComment} disabled={!newComment.trim()} className="px-5 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-40">Post Comment</button>
                </div>
              </div>
            </div>

            {/* Comment list */}
            <div className="space-y-6">
              {comments.map(c => (
                <div key={c.id} className={`flex gap-3 ${c.isSystem ? 'opacity-60' : ''}`}>
                  <div className={`w-8 h-8 ${c.color} text-white text-[10px] font-black flex items-center justify-center shrink-0`}>
                    {c.avatar.length <= 2 ? c.avatar : '⚡'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="text-xs font-black text-zinc-900">{c.author}</span>
                      <span className="text-[9px] text-zinc-400">{c.role}</span>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 ${c.isSystem ? 'bg-zinc-100 text-zinc-500' : 'bg-primary/10 text-primary'}`}>{c.phase}</span>
                      <span className="text-[9px] text-zinc-300 ml-auto">{c.time}</span>
                    </div>
                    <p className={`text-sm leading-relaxed ${c.isSystem ? 'text-zinc-400 italic' : 'text-zinc-700'}`}>{c.text}</p>
                    {!c.isSystem && (
                      <button
                        onClick={() => setLikedIds(prev => prev.includes(c.id) ? prev.filter(x => x.id !== c.id) : [...prev, c.id])}
                        className={`flex items-center gap-1 mt-2 text-[9px] font-bold uppercase tracking-wider transition-colors ${likedIds.includes(c.id) ? 'text-primary' : 'text-zinc-300 hover:text-zinc-600'}`}
                      >
                        <Icon name="thumb_up" style={{ fontVariationSettings: `'FILL' ${likedIds.includes(c.id) ? 1 : 0}` }} className="text-[14px]" />
                        {c.likes + (likedIds.includes(c.id) ? 1 : 0)}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Advance Phase Modal ─── */}
      {showAdvanceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowAdvanceModal(false)}>
          <div className="bg-white w-full max-w-md shadow-2xl p-8" onClick={e => e.stopPropagation()}>
            <Icon name="arrow_forward" className="text-primary text-3xl mb-3 block" />
            <h3 className="text-lg font-black uppercase tracking-tight mb-2">Advance to Next Phase?</h3>
            <p className="text-sm text-zinc-500 mb-2">Mark <strong className="text-zinc-900">"{phases[activePhaseIdx]}"</strong> as complete and advance to:</p>
            <div className="p-4 bg-primary/5 border border-primary/20 mb-6">
              <p className="text-sm font-black text-primary">{phases[activePhaseIdx + 1]}</p>
            </div>
            <p className="text-[10px] text-zinc-400 mb-5">Ensure all documents have been uploaded and client approval has been received via email before advancing.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowAdvanceModal(false)} className="flex-1 py-3 border border-zinc-200 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50">Cancel</button>
              <button onClick={advancePhase} className="flex-1 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors">Confirm & Advance</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Resource Assignment Modal ─── */}
      {showResourceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowResourceModal(false)}>
          <div className="bg-white w-full max-w-md shadow-2xl p-8 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black uppercase tracking-tight mb-5">Assign / Reassign Resources</h3>
            <p className="text-xs text-zinc-400 mb-4">Resources can be changed at any phase of the project.</p>
            <div className="space-y-2">
              {employees.map(e => {
                const assigned = team.some(t => t.id === e.id || t.id === e.employeeId);
                const colors = ['bg-primary', 'bg-blue-600', 'bg-zinc-600', 'bg-violet-600', 'bg-teal-600', 'bg-rose-600'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                return (
                  <label key={e.id || e.employeeId} className="flex items-center gap-3 p-3 bg-zinc-50 hover:bg-zinc-100 cursor-pointer transition-colors">
                    <div
                      onClick={() => {
                        const empId = e.id || e.employeeId;
                        if (assigned) {
                          setTeam(prev => prev.filter(x => x.id !== empId));
                        } else {
                          setTeam(prev => [...prev, {
                            id: empId,
                            name: e.name,
                            role: e.role,
                            color,
                          }]);
                        }
                      }}
                      className={`w-4 h-4 border-2 flex items-center justify-center transition-colors ${assigned ? 'border-primary bg-primary' : 'border-zinc-300'}`}
                    >
                      {assigned && <Icon name="check" style={{ fontVariationSettings: "'wght' 700" }} className="text-white text-[12px]" />}
                    </div>
                    <div className={`w-8 h-8 ${color} text-white text-[10px] font-black flex items-center justify-center shrink-0`}>{e.name.charAt(0)}</div>
                    <div>
                      <p className="text-xs font-black">{e.name}</p>
                      <p className="text-[9px] text-zinc-400">{e.role}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowResourceModal(false)} className="flex-1 py-2.5 border border-zinc-200 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50">Cancel</button>
              <button 
                onClick={async () => {
                  try {
                    await api.patch(`/projects/${id}`, { teamMembers: team.map(t => t.id) });
                    setShowResourceModal(false);
                  } catch (err) {
                    console.error("Error updating team:", err);
                  }
                }} 
                className="flex-1 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors"
              >
                Save Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectViewPage;
