import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Icon from "../../components/ui/Icon.jsx"

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
});

const STEPS = [
  { id: '01', label: 'Details',    icon: 'architecture' },
  { id: '02', label: 'Client',     icon: 'person_pin'   },
  { id: '03', label: 'Resources',  icon: 'group'        },
  { id: '04', label: 'Phases',     icon: 'timeline'     },
  { id: '05', label: 'Budget',     icon: 'payments'     },
  { id: '06', label: 'Review',     icon: 'fact_check'   },
];

const EMPLOYEES = [
  { id: 'EMP001', name: 'Marcus Johnson',  role: 'Senior Architect' },
  { id: 'EMP002', name: 'Priya Nair',      role: 'Project Manager'  },
  { id: 'EMP003', name: 'Tom Walsh',       role: 'Junior Architect' },
  { id: 'EMP004', name: 'Elena Rodriguez', role: 'Interior Designer'},
  { id: 'EMP005', name: 'James Kim',       role: 'Structural Eng.'  },
  { id: 'EMP006', name: 'Lisa Park',       role: 'CAD Technician'   },
  { id: 'EMP008', name: 'Nina Patel',      role: 'Architect'        },
];

const PROJECT_PHASES = {
  'High-End Residential':      ['Initial Meeting','Site Analysis','Schematic Design','Design Development','Client Approval','Construction Docs','Construction','Interior Design','Material Purchase','Vendor Finalization','Handover'],
  'Commercial / Retail':       ['Initial Meeting','Site Survey','Concept Design','Planning Submission','Design Development','Construction Docs','Tendering','Construction','Fit-Out','Handover'],
  'Hospitality / Boutique Hotel': ['Initial Meeting','Feasibility Study','Concept Design','Design Development','Construction Docs','Procurement','Construction','Interior Design','Fit-Out','Handover'],
  'Renovation / Restoration':  ['Initial Meeting','Condition Survey','Design Brief','Conservation Analysis','Planning Consent','Design Development','Construction Docs','Construction','Handover'],
  'Cultural / Institutional':  ['Initial Meeting','Site Analysis','Brief Development','Concept Design','Planning Submission','Design Development','Tender','Construction','Commissioning','Handover'],
  'Default':                   ['Initial Meeting','Resource Assignment','Design','Construction','Interior Design','Material Purchase','Vendor Finalization','Handover'],
};

const LABEL = 'text-[9px] uppercase tracking-[0.15em] font-black text-zinc-400 block mb-1.5';
const INPUT = 'w-full border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:outline-none focus:border-primary';

const NewProjectPage = () => {
  const navigate = useNavigate();
  const loc = useLocation();
  const fromProposal = loc.state?.proposal || null;

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: fromProposal?.title || '',
    type: fromProposal?.projectType || 'High-End Residential',
    description: '',
    startDate: '',
    endDate: '',
    // Client
    client: fromProposal?.client || '',
    clientContact: fromProposal?.fullName || '',
    clientEmail: fromProposal?.email || '',
    clientProjectCode: 'BW24-',
    // Resources
    leadArchitect: 'EMP001',
    teamMembers: ['EMP001'],
    // Budget
    budget: '',
    // Phases — auto-generated from type
    phases: (PROJECT_PHASES['High-End Residential']).map((p, i) => ({ name: p, active: true, order: i })),
  });

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const updateType = (type) => {
    const phases = (PROJECT_PHASES[type] || PROJECT_PHASES['Default']).map((p, i) => ({ name: p, active: true, order: i }));
    setForm(prev => ({ ...prev, type, phases }));
  };

  const toggleMember = (id) => set('teamMembers', form.teamMembers.includes(id) ? form.teamMembers.filter(x => x !== id) : [...form.teamMembers, id]);

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
        const projectPayload = {
          name: form.name,
          client: form.client,
          lead: form.leadArchitect,
          type: form.type,
          status: 'Planning',
          budget: parseFloat(form.budget) || 0,
          spent: 0,
          progress: 0,
          startDate: form.startDate,
          endDate: form.endDate,
          city: '',
        };
        await api.post('/projects/', projectPayload);
        navigate('/projects');
      } catch (err) {
        console.error('Error creating project:', err);
        alert('Failed to create project. Please try again.');
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#fcf9f8]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#fcf9f8]/95 backdrop-blur border-b border-zinc-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/projects')} className="text-zinc-400 hover:text-zinc-700 transition-colors">
            <Icon name="arrow_back" className="text-[20px]" />
          </button>
          <div>
            <h2 className="text-xl font-black tracking-tight text-zinc-900 uppercase">New Project</h2>
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mt-0.5">
              {fromProposal ? `From Proposal: ${fromProposal.id}` : 'Create project from scratch'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-zinc-100 text-zinc-700 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors">Save Draft</button>
          <button onClick={handleNext} className="px-6 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors flex items-center gap-1.5">
            {step < STEPS.length - 1 ? 'Continue' : 'Create Project'}
            <Icon name="arrow_forward" className="text-[16px]" />
          </button>
        </div>
      </div>

      {/* Stepper */}
      <div className="px-8 py-4 border-b border-zinc-100 overflow-x-auto">
        <div className="flex items-stretch gap-0 min-w-max">
          {STEPS.map((s, i) => (
            <button key={s.id} onClick={() => setStep(i)} className={`flex items-center gap-2 px-5 py-2 border-b-2 transition-all ${i === step ? 'border-primary text-primary' : i < step ? 'border-zinc-300 text-zinc-400' : 'border-transparent text-zinc-300'}`}>
              <span className={`w-5 h-5 text-[9px] font-black flex items-center justify-center ${i <= step ? 'bg-primary text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                {i < step ? '✓' : s.id}
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 pb-16 pt-6 max-w-5xl">
        {/* Step 0: Project Details */}
        {step === 0 && (
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-4">
              <Icon name="architecture" className="p-2 bg-zinc-50 text-primary text-[20px]" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.15em]">01. Project Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={LABEL}>Project Name / Title</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Meridian Tower Renovation" className={INPUT + ' text-lg font-black'} />
              </div>
              <div>
                <label className={LABEL}>Project Type</label>
                <select value={form.type} onChange={e => updateType(e.target.value)} className={INPUT}>
                  {Object.keys(PROJECT_PHASES).filter(k => k !== 'Default').map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Project Code (Auto)</label>
                <input value={form.clientProjectCode} onChange={e => set('clientProjectCode', e.target.value)} placeholder="BW24-01BFN-DGL" className={INPUT + ' font-mono'} />
              </div>
              <div>
                <label className={LABEL}>Start Date</label>
                <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Expected End Date</label>
                <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} className={INPUT} />
              </div>
              <div className="md:col-span-2">
                <label className={LABEL}>Project Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Brief scope of the project..." className={INPUT + ' resize-none'} />
              </div>
              {fromProposal && (
                <div className="md:col-span-2 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200">
                  <Icon name="link" style={{ fontVariationSettings: "'FILL' 1" }} className="text-emerald-600 text-[20px]" />
                  <p className="text-xs text-emerald-800 font-semibold">
                    Linked to Proposal <strong>{fromProposal.id || 'PRP001'}</strong> — details pre-filled from approved enquiry.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 1: Client */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Icon name="person_pin" className="p-2 bg-zinc-50 text-primary text-[20px]" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.15em]">02. Client Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={LABEL}>Client / Company</label>
                <select value={form.client} onChange={e => set('client', e.target.value)} className={INPUT}>
                  <option value="">Select client...</option>
                  {['Meridian Properties','Horizon Developments','Park & Associates','Sunrise Hospitality','Greenway Urban Co.'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Client Contact Name</label>
                <input value={form.clientContact} onChange={e => set('clientContact', e.target.value)} placeholder="Robert Chen" className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Client Email</label>
                <input value={form.clientEmail} onChange={e => set('clientEmail', e.target.value)} placeholder="robert@meridian.com" className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>Client Phone</label>
                <input placeholder="+1 555-2001" className={INPUT} />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Resources */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Icon name="group" className="p-2 bg-zinc-50 text-primary text-[20px]" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.15em]">03. Resource Assignment</h3>
            </div>
            <div>
              <label className={LABEL}>Lead Architect</label>
              <select value={form.leadArchitect} onChange={e => set('leadArchitect', e.target.value)} className={INPUT + ' mb-6'}>
                {EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.name} — {e.role}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL + ' mb-3'}>Team Members (select all that apply)</label>
              <p className="text-[10px] text-zinc-400 mb-3">Resources can also be added/changed mid-project</p>
              <div className="space-y-2">
                {EMPLOYEES.map(e => (
                  <label key={e.id} className="flex items-center gap-3 p-3 bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer">
                    <div
                      onClick={() => toggleMember(e.id)}
                      className={`w-4 h-4 border-2 flex items-center justify-center transition-colors shrink-0 ${form.teamMembers.includes(e.id) ? 'border-primary bg-primary' : 'border-zinc-300'}`}
                    >
                      {form.teamMembers.includes(e.id) && <Icon name="check" style={{ fontVariationSettings: "'wght' 700" }} className="text-white text-[12px]" />}
                    </div>
                    <div className="w-8 h-8 bg-primary/10 text-primary text-[11px] font-black flex items-center justify-center shrink-0">{e.name.charAt(0)}</div>
                    <div>
                      <p className="text-xs font-black text-zinc-800">{e.name}</p>
                      <p className="text-[9px] text-zinc-400">{e.role}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Phases */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <Icon name="timeline" className="p-2 bg-zinc-50 text-primary text-[20px]" />
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.15em]">04. Project Phases</h3>
                <p className="text-[9px] text-zinc-400 mt-0.5">Auto-generated from project type. Toggle phases as needed.</p>
              </div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 flex items-center gap-2 mb-2">
              <Icon name="info" className="text-amber-600 text-[18px]" />
              <p className="text-[10px] text-amber-800 font-semibold">Phases for type: <strong>{form.type}</strong>. Resources can be reassigned at any phase.</p>
            </div>
            <div className="space-y-2">
              {form.phases.map((ph, i) => (
                <div key={i} className={`flex items-center gap-4 p-4 border transition-all ${ph.active ? 'bg-white border-zinc-100' : 'bg-zinc-50 border-zinc-100 opacity-50'}`}>
                  <div
                    onClick={() => togglePhase(i)}
                    className={`w-4 h-4 border-2 flex items-center justify-center transition-colors shrink-0 cursor-pointer ${ph.active ? 'border-primary bg-primary' : 'border-zinc-300'}`}
                  >
                    {ph.active && <Icon name="check" style={{ fontVariationSettings: "'wght' 700" }} className="text-white text-[12px]" />}
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-[10px] font-black font-mono text-primary w-6">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-xs font-black text-zinc-800">{ph.name}</span>
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 ${i === 0 ? 'bg-primary text-white' : 'bg-zinc-100 text-zinc-400'}`}>
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
            <div className="flex items-center gap-3 mb-4">
              <Icon name="payments" className="p-2 bg-zinc-50 text-primary text-[20px]" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.15em]">05. Budget & Financials</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={LABEL}>Total Project Budget ($)</label>
                <input type="number" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="e.g. 450000" className={INPUT + ' text-xl font-black'} />
              </div>
              <div>
                <label className={LABEL}>Currency</label>
                <select className={INPUT}><option>USD ($)</option><option>GBP (£)</option><option>EUR (€)</option></select>
              </div>
              <div>
                <label className={LABEL}>Fee Type</label>
                <select className={INPUT}>
                  <option>Lump Sum Fixed Fee</option>
                  <option>Percentage of Construction Cost</option>
                  <option>Hourly Rate</option>
                  <option>RIBA Stage-Based Payments</option>
                </select>
              </div>
              <div>
                <label className={LABEL}>Payment Schedule</label>
                <select className={INPUT}>
                  <option>Milestone-Based</option>
                  <option>Monthly Retainer</option>
                  <option>50/50 (Deposit + Completion)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={LABEL}>Budget Notes</label>
                <textarea rows={2} placeholder="Any budget constraints, contingency notes..." className={INPUT + ' resize-none'} />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Icon name="fact_check" className="p-2 bg-zinc-50 text-primary text-[20px]" />
              <h3 className="text-[11px] font-black uppercase tracking-[0.15em]">06. Review & Create</h3>
            </div>
            <div className="grid grid-cols-12 gap-5">
              <div className="col-span-12 lg:col-span-8 space-y-4">
                {[
                  { label: 'Project Name', val: form.name || '—' },
                  { label: 'Type', val: form.type },
                  { label: 'Client', val: form.client || '—' },
                  { label: 'Contact', val: form.clientContact || '—' },
                  { label: 'Budget', val: form.budget ? `$${Number(form.budget).toLocaleString()}` : '—' },
                  { label: 'Start Date', val: form.startDate || '—' },
                  { label: 'End Date', val: form.endDate || '—' },
                  { label: 'Project Code', val: form.clientProjectCode || '—' },
                ].map(f => (
                  <div key={f.label} className="flex items-center justify-between px-4 py-3 bg-zinc-50 border-l-4 border-zinc-100">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{f.label}</p>
                    <p className="text-xs font-bold text-zinc-900">{f.val}</p>
                  </div>
                ))}
                <div className="px-4 py-3 bg-zinc-50 border-l-4 border-zinc-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">Phases ({form.phases.filter(p => p.active).length} active)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {form.phases.filter(p => p.active).map((ph, i) => (
                      <span key={i} className="text-[9px] font-black uppercase px-2 py-0.5 bg-primary/10 text-primary">{ph.name}</span>
                    ))}
                  </div>
                </div>
                <div className="px-4 py-3 bg-zinc-50 border-l-4 border-zinc-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">Team ({form.teamMembers.length} members)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {EMPLOYEES.filter(e => form.teamMembers.includes(e.id)).map(e => (
                      <span key={e.id} className="text-[9px] font-black uppercase px-2 py-0.5 bg-zinc-200 text-zinc-700">{e.name}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-span-12 lg:col-span-4">
                <div className="bg-zinc-900 text-white p-6 space-y-5">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Project Summary</p>
                  <div><p className="text-[9px] text-white/40 uppercase tracking-widest">Name</p><p className="font-bold">{form.name || '—'}</p></div>
                  <div><p className="text-[9px] text-white/40 uppercase tracking-widest">Budget</p><p className="text-2xl font-black text-primary">{form.budget ? `$${Number(form.budget).toLocaleString()}` : '—'}</p></div>
                  <div><p className="text-[9px] text-white/40 uppercase tracking-widest">Phases</p><p className="font-bold">{form.phases.filter(p => p.active).length} phases defined</p></div>
                  <button onClick={handleNext} className="w-full py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-primary transition-colors flex items-center justify-center gap-2">
                    <Icon name="add" className="text-[16px]" />Create Project
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="flex justify-between mt-10 pt-6 border-t border-zinc-100">
          <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/projects')} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 text-[10px] font-black uppercase tracking-widest transition-colors">
            <Icon name="arrow_back" className="text-[18px]" />
            {step > 0 ? 'Previous' : 'Cancel'}
          </button>
          <button onClick={handleNext} className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors">
            {step < STEPS.length - 1 ? 'Continue' : 'Create Project'}
            <Icon name="arrow_forward" className="text-[16px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewProjectPage;