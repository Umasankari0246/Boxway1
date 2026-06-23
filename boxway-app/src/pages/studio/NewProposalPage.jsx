import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Icon from "../../components/ui/Icon.jsx"

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
});

const STEPS = [
  { id: '01', label: 'Client', icon: 'person' },
  { id: '02', label: 'Project', icon: 'architecture' },
  { id: '03', label: 'Budget', icon: 'payments' },
  { id: '04', label: 'Vision', icon: 'auto_awesome' },
  { id: '05', label: 'Site', icon: 'location_on' },
  { id: '06', label: 'Scope', icon: 'checklist' },
  { id: '07', label: 'Lead', icon: 'analytics' },
];

const INPUT = 'w-full bg-transparent border-0 border-b border-zinc-200 focus:ring-0 focus:border-primary px-0 py-2 text-sm font-medium text-zinc-900 placeholder:text-zinc-300 transition-colors';
const LABEL = 'block text-[9px] uppercase tracking-[0.15em] font-black text-zinc-500 mb-1.5';

const DEFAULT_FORM = {
  fullName: '', email: '', phone: '', company: '', commMode: 'Video Call (Zoom/Teams)', isPrimary: true, stakeholders: '',
  projectTitle: '', projectType: 'High-End Residential', siteAddress: '', plotSize: '', buildupArea: '',
  budgetRange: '$1.5M – $3.0M', timelineFlexibility: 50, includesInterior: true, includesLandscape: false, includesBIM: true,
  vision: '', pillars: ['Minimalist Void'],
  siteNotes: '',
  scopeServices: ['RIBA Stages 0-4 (Design)', 'Contract Administration'],
  leadSource: '', priority: 'Hot',
};

const PILLARS = ['Sustainable Materials', 'Minimalist Void', 'Brutalist Elements', 'Smart Integration', 'Biophilic Design', 'Net Zero'];

const NewProposalPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const filePromises = files.map(file => new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result
        });
        reader.readAsDataURL(file);
      }));
      Promise.all(filePromises).then(base64Files => {
        setUploadedFiles([...uploadedFiles, ...base64Files]);
        alert(`${files.length} file(s) uploaded successfully`);
      });
    }
  };

  const handleSaveDraft = async () => {
    try {
      const newProposal = {
        title: form.projectTitle || 'Untitled Proposal',
        client: form.fullName || 'Unknown Client',
        clientContact: form.email || '',
        lead: 'Marcus Johnson',
        value: 0,
        status: 'Draft',
        phase: 'Initial',
        version: 1,
        submittedDate: null,
      };
      await api.post('/proposals/', newProposal);
      alert('Proposal saved as draft');
      navigate('/proposals');
    } catch (err) {
      console.error('Error saving proposal:', err);
      alert('Failed to save proposal. Please try again.');
    }
  };

  const togglePillar = (p) => setForm(f => ({
    ...f,
    pillars: f.pillars.includes(p) ? f.pillars.filter(x => x !== p) : [...f.pillars, p],
  }));

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else navigate('/proposals/review', { state: { form } });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#fcf9f8]">
      {/* Sticky sub-header */}
      <div className="sticky top-0 z-20 bg-[#fcf9f8]/95 backdrop-blur border-b border-zinc-100 px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/proposals')} className="text-zinc-400 hover:text-zinc-700 transition-colors">
              <Icon name="arrow_back" className="text-[20px]" />
            </button>
            <h2 className="text-xl font-black tracking-tight text-zinc-900 uppercase">New Enquiry / Initial Meeting</h2>
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mt-0.5 ml-8">Status: Drafting Phase · v1.0</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSaveDraft} className="px-5 py-2.5 bg-zinc-100 text-zinc-700 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors">
            Save Draft
          </button>
          <button onClick={handleNext} className="px-6 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors flex items-center gap-2">
            {step < STEPS.length - 1 ? 'Next Step' : 'Review & Submit'}
            <Icon name="arrow_forward" className="text-[16px]" />
          </button>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="px-8 py-5 border-b border-zinc-100 overflow-x-auto no-scrollbar">
        <div className="flex items-stretch gap-0 min-w-max">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(i)}
              className={`flex items-center gap-2.5 px-6 py-2 border-b-2 transition-all ${
                i === step
                  ? 'border-primary text-primary'
                  : i < step
                  ? 'border-zinc-300 text-zinc-400'
                  : 'border-transparent text-zinc-300'
              }`}
            >
              <span className={`w-5 h-5 flex items-center justify-center text-[9px] font-black ${i <= step ? 'bg-primary text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                {i < step ? <Icon name="check" className="text-[12px]" /> : s.id}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 pb-16 pt-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-10">

            {/* STEP 0: Client Info */}
            {step === 0 && (
              <section className="space-y-8">
                <div className="flex items-center gap-3 mb-2">
                  <Icon name="person" className="p-2 bg-zinc-50 text-primary text-[20px]" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-900">01. Client Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { field: 'fullName', label: 'Full Name', placeholder: 'e.g. Julianne Sterling', type: 'text' },
                    { field: 'email', label: 'Email Address', placeholder: 'j.sterling@estate.com', type: 'email' },
                    { field: 'phone', label: 'Phone Number', placeholder: '+1 555-000-1234', type: 'tel' },
                    { field: 'company', label: 'Company / Entity', placeholder: 'Sterling Development Group', type: 'text' },
                  ].map(f => (
                    <div key={f.field} className="group">
                      <label className={LABEL}>{f.label}</label>
                      <input type={f.type} value={form[f.field]} onChange={e => set(f.field, e.target.value)} placeholder={f.placeholder} className={INPUT} />
                    </div>
                  ))}
                </div>
                <div className="bg-zinc-50 p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={LABEL}>Preferred Communication</label>
                    <select value={form.commMode} onChange={e => set('commMode', e.target.value)} className={INPUT + ' appearance-none cursor-pointer'}>
                      <option>Video Call (Zoom/Teams)</option>
                      <option>In-Person Studio Meeting</option>
                      <option>Email Correspondence Only</option>
                      <option>On-Site Meeting</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => set('isPrimary', !form.isPrimary)}
                      className={`relative w-11 h-6 transition-colors ${form.isPrimary ? 'bg-primary' : 'bg-zinc-200'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white transition-all ${form.isPrimary ? 'right-1' : 'left-1'}`} />
                    </button>
                    <label className={LABEL + ' mb-0'}>Primary Decision Maker</label>
                  </div>
                </div>
                <div>
                  <label className={LABEL}>Stakeholders & Key Partners</label>
                  <textarea value={form.stakeholders} onChange={e => set('stakeholders', e.target.value)} rows={2} placeholder="List other involved parties, spouses, or board members..." className={INPUT + ' resize-none'} />
                </div>
              </section>
            )}

            {/* STEP 1: Project Overview */}
            {step === 1 && (
              <section className="space-y-8">
                <div className="flex items-center gap-3 mb-2">
                  <Icon name="architecture" className="p-2 bg-zinc-50 text-primary text-[20px]" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-900">02. Project Overview</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className={LABEL}>Project Title / Alias</label>
                    <input type="text" value={form.projectTitle} onChange={e => set('projectTitle', e.target.value)} placeholder="e.g. The Monolith Pavilion" className={INPUT + ' text-xl font-black'} />
                  </div>
                  <div>
                    <label className={LABEL}>Project Type</label>
                    <select value={form.projectType} onChange={e => set('projectType', e.target.value)} className={INPUT}>
                      <option>High-End Residential</option>
                      <option>Commercial / Retail</option>
                      <option>Hospitality / Boutique Hotel</option>
                      <option>Cultural / Institutional</option>
                      <option>Renovation / Restoration</option>
                      <option>Mixed-Use Development</option>
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>Site Address / Coordinates</label>
                    <input type="text" value={form.siteAddress} onChange={e => set('siteAddress', e.target.value)} placeholder="Street name, City, Country" className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>Approx. Plot Size (sqm)</label>
                    <input type="number" value={form.plotSize} onChange={e => set('plotSize', e.target.value)} placeholder="0.00" className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>Target Built-up Area (sqm)</label>
                    <input type="number" value={form.buildupArea} onChange={e => set('buildupArea', e.target.value)} placeholder="0.00" className={INPUT} />
                  </div>
                </div>
              </section>
            )}

            {/* STEP 2: Budget (left col content shown in sidebar on desktop) */}
            {step === 2 && (
              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <Icon name="payments" className="p-2 bg-zinc-50 text-primary text-[20px]" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-900">03. Budget & Timeline</h3>
                </div>
                <div>
                  <label className={LABEL}>Investment Range</label>
                  <select value={form.budgetRange} onChange={e => set('budgetRange', e.target.value)} className={INPUT}>
                    <option>Under $500K</option>
                    <option>$500K – $1.5M</option>
                    <option>$1.5M – $3.0M</option>
                    <option>$3.0M – $5.0M</option>
                    <option>$5.0M – $10M+</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className={LABEL + ' mb-0'}>Timeline Flexibility</label>
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                      {form.timelineFlexibility < 34 ? 'Strict' : form.timelineFlexibility < 67 ? 'Moderate' : 'Flexible'}
                    </span>
                  </div>
                  <input type="range" min={0} max={100} value={form.timelineFlexibility} onChange={e => set('timelineFlexibility', e.target.value)} className="w-full accent-primary cursor-pointer" />
                </div>
                <div className="space-y-3">
                  <label className={LABEL}>Project Includes</label>
                  {[
                    { key: 'includesInterior', label: 'Interior Curation' },
                    { key: 'includesLandscape', label: 'Landscape Design' },
                    { key: 'includesBIM', label: 'BIM Management' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        onClick={() => set(key, !form[key])}
                        className={`w-4 h-4 border-2 flex items-center justify-center transition-colors ${form[key] ? 'border-primary bg-primary' : 'border-zinc-300'}`}
                      >
                        {form[key] && <Icon name="check" style={{ fontVariationSettings: "'wght' 700" }} className="text-white text-[12px]" />}
                      </div>
                      <span className="text-sm font-semibold">{label}</span>
                    </label>
                  ))}
                </div>
              </section>
            )}

            {/* STEP 3: Vision */}
            {step === 3 && (
              <section className="space-y-8">
                <div className="flex items-center gap-3 mb-2">
                  <Icon name="auto_awesome" className="p-2 bg-zinc-50 text-primary text-[20px]" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-900">04. Requirements & Vision</h3>
                </div>
                <div>
                  <label className={LABEL}>Core Purpose & Priorities</label>
                  <textarea
                    value={form.vision}
                    onChange={e => set('vision', e.target.value)}
                    rows={4}
                    placeholder="Describe the soul of the project. What feeling should the space evoke?"
                    className="w-full bg-zinc-50 border-0 border-l-2 border-primary focus:ring-0 p-4 text-sm text-zinc-800 placeholder:text-zinc-300 italic resize-none"
                  />
                </div>
                <div className="space-y-3">
                  <label className={LABEL}>Must-Have Design Pillars</label>
                  <div className="flex flex-wrap gap-2">
                    {PILLARS.map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePillar(p)}
                        className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest border transition-colors ${form.pillars.includes(p) ? 'bg-primary text-white border-primary' : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:border-zinc-400'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* STEP 4: Site */}
            {step === 4 && (
              <section className="space-y-8">
                <div className="flex items-center gap-3 mb-2">
                  <Icon name="location_on" className="p-2 bg-zinc-50 text-primary text-[20px]" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-900">05. Site & Documentation</h3>
                </div>
                <div>
                  <label className={LABEL}>Site Notes & Context</label>
                  <textarea value={form.siteNotes} onChange={e => set('siteNotes', e.target.value)} rows={3} placeholder="Conservation area constraints, neighboring buildings, planning history..." className={INPUT + ' resize-none'} />
                </div>
                <div className="border-2 border-dashed border-zinc-200 p-8 flex flex-col items-center text-center gap-3 hover:border-primary cursor-pointer transition-colors group">
                  <input type="file" multiple accept=".pdf,.doc,.docx,.dwg,.jpg,.jpeg,.png" onChange={handleFileUpload} className="hidden" id="file-upload" />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Icon name="cloud_upload" className="text-zinc-300 group-hover:text-primary text-[36px] transition-colors" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-zinc-700">Upload Site Files</p>
                      <p className="text-[10px] text-zinc-400 mt-1">CAD, PDF, or Site Imagery — max 50MB</p>
                    </div>
                  </label>
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 text-left w-full">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Uploaded Files:</p>
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="text-[10px] text-zinc-600 truncate">{file.name}</div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* STEP 5: Scope */}
            {step === 5 && (
              <section className="space-y-8">
                <div className="flex items-center gap-3 mb-2">
                  <Icon name="checklist" className="p-2 bg-zinc-50 text-primary text-[20px]" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-900">06. Scope of Services</h3>
                </div>
                <div className="space-y-3">
                  {[
                    'RIBA Stages 0-4 (Design)',
                    'Contract Administration',
                    'Interior FF&E',
                    'Landscape Design',
                    'Structural Engineering Liaison',
                    'BIM Coordination',
                    'Planning Application Support',
                  ].map(s => (
                    <label key={s} className="flex items-center gap-3 cursor-pointer p-3 bg-zinc-50 hover:bg-zinc-100 transition-colors">
                      <div
                        onClick={() => set('scopeServices', form.scopeServices.includes(s) ? form.scopeServices.filter(x => x !== s) : [...form.scopeServices, s])}
                        className={`w-4 h-4 border-2 flex items-center justify-center shrink-0 transition-colors ${form.scopeServices.includes(s) ? 'border-primary bg-primary' : 'border-zinc-300'}`}
                      >
                        {form.scopeServices.includes(s) && <Icon name="check" style={{ fontVariationSettings: "'wght' 700" }} className="text-white text-[12px]" />}
                      </div>
                      <span className="text-xs font-semibold">{s}</span>
                    </label>
                  ))}
                </div>
              </section>
            )}

            {/* STEP 6: Lead */}
            {step === 6 && (
              <section className="space-y-8">
                <div className="flex items-center gap-3 mb-2">
                  <Icon name="analytics" className="p-2 bg-zinc-50 text-primary text-[20px]" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-zinc-900">07. Internal Qualification</h3>
                </div>
                <div>
                  <label className={LABEL}>Priority Level</label>
                  <div className="grid grid-cols-3 gap-1 mt-2">
                    {['Hot', 'Warm', 'Cold'].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => set('priority', p)}
                        className={`py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${form.priority === p ? 'bg-primary text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={LABEL}>Lead Source</label>
                  <input type="text" value={form.leadSource} onChange={e => set('leadSource', e.target.value)} placeholder="e.g. Architectural Digest / Referral / Google" className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Assign Lead Architect</label>
                  <select className={INPUT}>
                    <option>Marcus Johnson — Senior Architect</option>
                    <option>Priya Nair — Project Manager</option>
                    <option>Nina Patel — Architect</option>
                    <option>Elena Rodriguez — Interior Designer</option>
                  </select>
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar — dark budget card + always visible summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-zinc-900 text-white p-7 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rotate-45 translate-x-10 -translate-y-10" />
              <div className="flex items-center gap-3 mb-6">
                <Icon name="payments" className="text-primary text-[20px]" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.15em]">Budget & Scope Summary</h3>
              </div>
              <div className="space-y-4 text-sm relative z-10">
                <div>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest mb-1">Investment Range</p>
                  <p className="font-bold text-white">{form.budgetRange || '—'}</p>
                </div>
                <div>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest mb-1">Timeline Flexibility</p>
                  <p className="font-bold text-primary">{form.timelineFlexibility < 34 ? 'Strict' : form.timelineFlexibility < 67 ? 'Moderate' : 'Flexible'}</p>
                </div>
                <div>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest mb-1">Project Type</p>
                  <p className="font-medium text-sm">{form.projectType || '—'}</p>
                </div>
                <div>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest mb-1">Client</p>
                  <p className="font-medium">{form.fullName || '—'}</p>
                  <p className="text-white/50 text-xs mt-0.5">{form.company}</p>
                </div>
                <div>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest mb-1">Services Included</p>
                  {form.scopeServices.length > 0 ? form.scopeServices.map(s => (
                    <div key={s} className="flex items-center gap-2 text-xs mt-1">
                      <Icon name="check" style={{ fontVariationSettings: "'wght' 700" }} className="text-primary text-[12px]" />
                      <span>{s}</span>
                    </div>
                  )) : <p className="text-white/30 text-xs">None selected</p>}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between mt-10 pt-6 border-t border-zinc-100">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/proposals')}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 text-[10px] font-black uppercase tracking-widest transition-colors"
          >
            <Icon name="arrow_back" className="text-[18px]" />
            {step > 0 ? 'Previous Step' : 'Back to Proposals'}
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors"
          >
            {step < STEPS.length - 1 ? 'Continue' : 'Review & Submit'}
            <Icon name="arrow_forward" className="text-[16px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewProposalPage;