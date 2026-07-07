import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ArrowRight, Building2, Users, Calendar, DollarSign, CheckSquare, Info, Check, Plus } from 'lucide-react';
import { useTranslation } from '../../store/settingsStore';
import { useFormatters } from '../../store/settingsStore';

const api = axios.create({
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api'
    : 'https://boxxway.onrender.com/api',
});

const STEPS = [
  { id: '01', label: 'Details',    icon: Building2 },
  { id: '02', label: 'Client',     icon: Users   },
  { id: '03', label: 'Resources',  icon: Users        },
  { id: '04', label: 'Phases',     icon: Calendar     },
  { id: '05', label: 'Budget',     icon: DollarSign     },
  { id: '06', label: 'Review',     icon: CheckSquare   },
];

const PROJECT_PHASES = {
  'High-End Residential':      ['Initial Meeting','Site Analysis','Schematic Design','Design Development','Client Approval','Construction Docs','Construction','Interior Design','Material Purchase','Vendor Finalization','Handover'],
  'Commercial / Retail':       ['Initial Meeting','Site Survey','Concept Design','Planning Submission','Design Development','Construction Docs','Tendering','Construction','Fit-Out','Handover'],
  'Hospitality / Boutique Hotel': ['Initial Meeting','Feasibility Study','Concept Design','Design Development','Construction Docs','Procurement','Construction','Interior Design','Fit-Out','Handover'],
  'Renovation / Restoration':  ['Initial Meeting','Condition Survey','Design Brief','Conservation Analysis','Planning Consent','Design Development','Construction Docs','Construction','Handover'],
  'Cultural / Institutional':  ['Initial Meeting','Site Analysis','Brief Development','Concept Design','Planning Submission','Design Development','Tender','Construction','Commissioning','Handover'],
  'Default':                   ['Initial Meeting','Resource Assignment','Design','Construction','Interior Design','Material Purchase','Vendor Finalization','Handover'],
};

const LABEL = 'block text-sm font-bold text-slate-700 mb-1.5';
const INPUT = 'w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors';

const NewProjectPage = () => {
  const { formatCurrency, formatDate } = useFormatters();

  const { t } = useTranslation();

  const navigate = useNavigate();
  const loc = useLocation();
  const { id } = useParams();
  const fromProposal = loc.state?.proposal || null;

  const [step, setStep] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);

  const [form, setForm] = useState({
    name: fromProposal?.title || '',
    type: fromProposal?.projectType || 'High-End Residential',
    description: '',
    startDate: '',
    endDate: '',
    client: fromProposal?.client || '',
    clientContact: fromProposal?.fullName || '',
    clientEmail: fromProposal?.email || '',
    clientProjectCode: 'BW24-',
    leadArchitect: '',
    teamMembers: [],
    budget: '',
    phases: (PROJECT_PHASES['High-End Residential']).map((p, i) => ({ name: p, active: true, order: i })),
  });

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get('/employees/');
        setEmployees(res.data.data);
        if (res.data.data.length > 0) {
          setForm(prev => ({
            ...prev,
            leadArchitect: prev.leadArchitect || (res.data.data[0].id || res.data.data[0].employeeId),
            teamMembers: prev.teamMembers.length > 0 ? prev.teamMembers : [(res.data.data[0].id || res.data.data[0].employeeId)]
          }));
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get('/clients/');
        setClients(res.data.data);
      } catch (err) {
        console.error('Error fetching clients:', err);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      setLoading(true);
      const fetchProject = async () => {
        try {
          const response = await api.get(`/projects/${id}`);
          const project = response.data.data;
          setForm({
            name: project.name || '',
            type: project.type || 'High-End Residential',
            description: project.description || '',
            startDate: project.startDate || '',
            endDate: project.endDate || '',
            client: project.client || '',
            clientContact: project.clientContact || '',
            clientEmail: project.clientEmail || '',
            clientProjectCode: project.clientProjectCode || 'BW24-',
            leadArchitect: project.lead || '',
            teamMembers: project.teamMembers || [],
            budget: project.budget || '',
            phases: (PROJECT_PHASES[project.type] || PROJECT_PHASES['Default']).map((p, i) => ({ name: p, active: true, order: i })),
          });
        } catch (err) {
          console.error('Error fetching project:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchProject();
    }
  }, [id]);

  const updateType = (type) => {
    const phases = (PROJECT_PHASES[type] || PROJECT_PHASES['Default']).map((p, i) => ({ name: p, active: true, order: i }));
    setForm(prev => ({ ...prev, type, phases }));
  };

  const toggleMember = (empId) => set('teamMembers', form.teamMembers.includes(empId) ? form.teamMembers.filter(x => x !== empId) : [...form.teamMembers, empId]);

  const togglePhase = (idx) => {
    const phases = [...form.phases];
    phases[idx] = { ...phases[idx], active: !phases[idx].active };
    set('phases', phases);
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      try {
        const totalPhases = (PROJECT_PHASES[form.type] || PROJECT_PHASES['Default']).length;
        const initialProgress = Math.round((1 / totalPhases) * 100);
        const projectPayload = {
          name: form.name,
          client: form.client,
          lead: form.leadArchitect,
          type: form.type,
          status: 'Planning',
          budget: parseFloat(form.budget) || 0,
          spent: 0,
          progress: initialProgress,
          startDate: form.startDate,
          endDate: form.endDate,
          city: '',
          description: form.description,
          phase: 1,
          totalPhases,
          teamMembers: form.teamMembers,
        };
        if (isEditMode) {
          await api.patch(`/projects/${id}`, projectPayload);
        } else {
          await api.post('/projects/', projectPayload);
        }
        navigate('/projects');
      } catch (err) {
        console.error('Error saving project:', err);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f6f6]">
      {/* Header Container */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/projects')} className="p-2 rounded-full hover:bg-slate-50 text-slate-500 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{isEditMode ? 'Edit Project' : 'New Project'}</h2>
              <p className="text-sm text-slate-500 mt-1">
                {fromProposal ? `From Proposal: ${fromProposal.id}` : 'Create project from scratch'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded hover:bg-slate-50 transition-colors">{t('Save Draft')}</button>
            <button onClick={handleNext} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2">
              {step < STEPS.length - 1 ? 'Continue' : 'Create Project'}
              {step < STEPS.length - 1 && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Stepper */}
        <div className="mt-6 flex items-center overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {STEPS.map((s, i) => (
              <button key={s.id} onClick={() => setStep(i)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${i === step ? 'bg-primary/10 text-primary font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === step ? 'bg-primary text-white' : i < step ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {i < step ? <Check className="h-3 w-3" /> : i + 1}
                </div>
                <span className="text-sm">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-8">
          
          {/* Step 0: Project Details */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{t('Project Details')}</h3>
                  <p className="text-sm text-slate-500">{t('Enter the basic information for this project.')}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={LABEL}>Project Name / Title</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} placeholder={t('e.g. Meridian Tower Renovation')} className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>{t('Project Type')}</label>
                  <select value={form.type} onChange={e => updateType(e.target.value)} className={INPUT}>
                    {Object.keys(PROJECT_PHASES).filter(k => k !== 'Default').map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Project Code (Auto)</label>
                  <input value={form.clientProjectCode} onChange={e => set('clientProjectCode', e.target.value)} placeholder={t('BW24-01BFN-DGL')} className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>{t('Start Date')}</label>
                  <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>{t('Expected End Date')}</label>
                  <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} className={INPUT} />
                </div>
                <div className="md:col-span-2">
                  <label className={LABEL}>{t('Project Description')}</label>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} placeholder={t('Brief scope of the project...')} className={INPUT + ' resize-none'} />
                </div>
                {fromProposal && (
                  <div className="md:col-span-2 flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Info className="text-blue-600 h-5 w-5" />
                    <p className="text-sm text-blue-800">{t('Linked to Proposal')}<strong>{fromProposal.id || 'PRP001'}</strong> — details pre-filled from approved enquiry.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 1: Client */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{t('Client Information')}</h3>
                  <p className="text-sm text-slate-500">{t('Link a client to this project and set contact details.')}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={LABEL}>Client / Company</label>
                  <select value={form.client} onChange={e => set('client', e.target.value)} className={INPUT}>
                    <option value="">{t('Select client...')}</option>
                    {clients.map(c => <option key={c.id || c.clientId} value={c.id || c.clientId}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>{t('Client Contact Name')}</label>
                  <input value={form.clientContact} onChange={e => set('clientContact', e.target.value)} placeholder={t('Robert Chen')} className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>{t('Client Email')}</label>
                  <input value={form.clientEmail} onChange={e => set('clientEmail', e.target.value)} placeholder={t('robert@meridian.com')} className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>{t('Client Phone')}</label>
                  <input placeholder={t('+1 555-2001')} className={INPUT} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Resources */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{t('Resource Assignment')}</h3>
                  <p className="text-sm text-slate-500">{t('Assign a lead architect and project team members.')}</p>
                </div>
              </div>
              <div>
                <label className={LABEL}>{t('Lead Architect')}</label>
                <select value={form.leadArchitect} onChange={e => set('leadArchitect', e.target.value)} className={INPUT + ' mb-6'}>
                  {employees.map(e => <option key={e.id || e.employeeId} value={e.id || e.employeeId}>{e.name} — {e.role}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>{t('Team Members')}</label>
                <p className="text-sm text-slate-500 mb-4">{t('Select all that apply. Resources can also be changed mid-project.')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employees.map(e => {
                    const empId = e.id || e.employeeId;
                    const isSelected = form.teamMembers.includes(empId);
                    return (
                      <label key={empId} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors shrink-0 ${isSelected ? 'bg-primary' : 'bg-slate-200'}`}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center shrink-0">
                          {e.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{e.name}</p>
                          <p className="text-xs text-slate-500">{e.role}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Phases */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{t('Project Phases')}</h3>
                  <p className="text-sm text-slate-500">{t('Auto-generated from project type. Toggle phases as needed.')}</p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg flex items-center gap-3 mb-4">
                <Info className="text-blue-600 h-5 w-5" />
                <p className="text-sm text-blue-800">{t('Phases for type:')}<strong className="font-bold">{form.type}</strong>. Resources can be reassigned at any phase.</p>
              </div>
              <div className="space-y-3">
                {form.phases.map((ph, i) => (
                  <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${ph.active ? 'border-slate-200 bg-white shadow-sm' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                    <div
                      onClick={() => togglePhase(i)}
                      className={`w-5 h-5 rounded flex items-center justify-center transition-colors shrink-0 cursor-pointer ${ph.active ? 'bg-primary' : 'bg-slate-200'}`}
                    >
                      {ph.active && <Check className="text-white h-3 w-3" />}
                    </div>
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-sm font-bold text-slate-400 w-6">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-sm font-bold text-slate-900">{ph.name}</span>
                    </div>
                    <span className={`text-xs font-bold rounded-lg px-3 py-1 ${i === 0 ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}`}>
                      {i === 0 ? 'Start' : 'Upcoming'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Budget */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{t('Budget & Financials')}</h3>
                  <p className="text-sm text-slate-500">{t('Configure the budget, currency, and payment schedule.')}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={LABEL}>Total Project Budget ($)</label>
                  <input type="number" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder={t('e.g. 450000')} className={INPUT + ' text-lg'} />
                </div>
                <div>
                  <label className={LABEL}>{t('Currency')}</label>
                  <select className={INPUT}><option>USD ($)</option><option>GBP (£)</option><option>EUR (€)</option></select>
                </div>
                <div>
                  <label className={LABEL}>{t('Fee Type')}</label>
                  <select className={INPUT}>
                    <option>{t('Lump Sum Fixed Fee')}</option>
                    <option>{t('Percentage of Construction Cost')}</option>
                    <option>{t('Hourly Rate')}</option>
                    <option>{t('RIBA Stage-Based Payments')}</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL}>{t('Payment Schedule')}</label>
                  <select className={INPUT}>
                    <option>{t('Milestone-Based')}</option>
                    <option>{t('Monthly Retainer')}</option>
                    <option>50/50 (Deposit + Completion)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={LABEL}>{t('Budget Notes')}</label>
                  <textarea rows={3} placeholder={t('Any budget constraints, contingency notes...')} className={INPUT + ' resize-none'} />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <CheckSquare className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{t('Review & Create')}</h3>
                  <p className="text-sm text-slate-500">{t('Double check all project information before creating.')}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-4">
                  {[
                    { label: 'Project Name', val: form.name || '—' },
                    { label: 'Type', val: form.type },
                    { label: 'Client', val: form.client || '—' },
                    { label: 'Contact', val: form.clientContact || '—' },
                    { label: 'Budget', val: form.budget ? `$${formatCurrency(Number(form.budget).toLocaleString())}` : '—' },
                    { label: 'Start Date', val: form.startDate || '—' },
                    { label: 'End Date', val: form.endDate || '—' },
                    { label: 'Project Code', val: form.clientProjectCode || '—' },
                  ].map(f => (
                    <div key={f.label} className="flex justify-between items-center py-3 border-b border-slate-100">
                      <span className="text-sm text-slate-500">{f.label}</span>
                      <span className="text-sm font-bold text-slate-900">{f.val}</span>
                    </div>
                  ))}
                  
                  <div className="pt-4">
                    <p className="text-sm font-bold text-slate-900 mb-3">Phases ({form.phases.filter(p => p.active).length} active)</p>
                    <div className="flex flex-wrap gap-2">
                      {form.phases.filter(p => p.active).map((ph, i) => (
                        <span key={i} className="text-xs font-bold rounded-lg px-3 py-1 bg-slate-100 text-slate-600">{ph.name}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <p className="text-sm font-bold text-slate-900 mb-3">Team ({form.teamMembers.length} members)</p>
                    <div className="flex flex-wrap gap-2">
                      {employees.filter(e => form.teamMembers.includes(e.id || e.employeeId)).map(e => (
                        <span key={e.id || e.employeeId} className="text-xs font-bold rounded-lg px-3 py-1 bg-primary/10 text-primary">{e.name}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 text-center">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6">{t('Summary')}</h4>
                    <div className="mb-6">
                      <p className="text-3xl font-black text-slate-900">{form.name || 'Untitled'}</p>
                    </div>
                    <div className="mb-8">
                      <p className="text-sm text-slate-500 mb-1">{t('Total Budget')}</p>
                      <p className="text-3xl font-black text-primary">{form.budget ? `$${formatCurrency(Number(form.budget).toLocaleString())}` : '—'}</p>
                    </div>
                    <button onClick={handleNext} className="w-full py-3 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                      <Check className="h-5 w-5" />{t('Create Project')}</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="flex justify-between mt-10 pt-6 border-t border-slate-100">
            <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/projects')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-bold transition-colors">
              <ArrowLeft className="h-5 w-5" />
              {step > 0 ? 'Previous' : 'Cancel'}
            </button>
            <button onClick={handleNext} className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
              {step < STEPS.length - 1 ? 'Continue' : 'Create Project'}
              {step < STEPS.length - 1 && <ArrowRight className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NewProjectPage;
