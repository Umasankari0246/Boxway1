import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Icon from "../../components/ui/Icon.jsx"

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
});

const LABEL = 'text-[9px] uppercase tracking-[0.15em] font-black text-zinc-400';
const VAL = 'text-sm font-semibold text-zinc-900 mt-0.5';

const ReviewProposalPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const form = state?.form || {};

  const handleSubmit = async () => {
    try {
      const newProposal = {
        title: form.projectTitle || 'Untitled Proposal',
        client: form.fullName || 'Unknown Client',
        clientContact: form.email || '',
        lead: 'Marcus Johnson',
        value: 0,
        status: 'Submitted',
        phase: 'Initial',
        version: 1,
        submittedDate: new Date().toISOString().split('T')[0],
      };
      await api.post('/proposals/', newProposal);
      navigate('/proposals');
    } catch (err) {
      console.error('Error submitting proposal:', err);
      alert('Failed to submit proposal. Please try again.');
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
      navigate('/proposals');
    } catch (err) {
      console.error('Error saving draft:', err);
      alert('Failed to save draft. Please try again.');
    }
  };

  const sections = [
    { label: 'Full Name', val: form.fullName || 'Eleanor Sterling-Hayes' },
    { label: 'Email', val: form.email || 'eleanor.hayes@monolith-estate.co.uk' },
    { label: 'Phone', val: form.phone || '+44 7700 900 452' },
    { label: 'Company', val: form.company || 'Sterling Estate Development' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#fcf9f8]">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-[#fcf9f8]/95 backdrop-blur border-b border-zinc-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-zinc-900 transition-colors">
            <Icon name="arrow_back" className="text-[20px]" />
          </button>
          <div>
            <h2 className="text-xl font-black tracking-tight text-zinc-900 uppercase">Review & Confirm</h2>
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Step 4 of 4 — Final Validation</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate(-1)} className="px-5 py-2.5 border border-zinc-200 text-zinc-700 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-colors">
            Back to Edit
          </button>
          <button onClick={handleSubmit} className="px-6 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors flex items-center gap-2 shadow-lg shadow-primary/20">
            Submit Enquiry
            <Icon name="send" className="text-[16px]" />
          </button>
        </div>
      </div>

      <div className="px-8 pb-16 pt-8 max-w-7xl">
        {/* Status Banner */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-[10px] tracking-[0.15em] uppercase text-primary font-black mb-1">Step 4 of 4: Final Validation</p>
            <h3 className="text-4xl font-black tracking-tighter text-zinc-900">Initial Enquiry</h3>
            <p className="text-zinc-500 mt-2 text-sm">
              Please review the captured data for the{' '}
              <span className="text-zinc-900 font-semibold underline decoration-primary/30 decoration-2 underline-offset-4">
                {form.projectTitle || 'The Monolith Pavilion'}
              </span>{' '}
              project before final submission.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 border border-emerald-100">
            <Icon name="check_circle" style={{ fontVariationSettings: "'FILL' 1" }} className="text-emerald-600 text-[18px]" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700">All Sections Complete</span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left: Primary Data */}
          <div className="col-span-12 lg:col-span-8 space-y-6">

            {/* Client Info */}
            <div className="bg-white p-8 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <Icon name="person" className="text-primary text-[20px]" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Client Info</h4>
                </div>
                <button onClick={() => navigate(-1)} className="text-[10px] text-primary font-black uppercase tracking-widest hover:underline">Edit</button>
              </div>
              <div className="grid grid-cols-2 gap-8">
                {sections.map(s => (
                  <div key={s.label}>
                    <p className={LABEL}>{s.label}</p>
                    <p className={VAL}>{s.val || '—'}</p>
                  </div>
                ))}
                <div>
                  <p className={LABEL}>Communication Preference</p>
                  <p className={VAL}>{form.commMode || 'Video Call'}</p>
                </div>
                <div>
                  <p className={LABEL}>Lead Source</p>
                  <p className={VAL}>{form.leadSource || 'Referral'}</p>
                </div>
              </div>
            </div>

            {/* Requirements & Vision */}
            <div className="bg-zinc-50 p-8 border border-zinc-100 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <Icon name="auto_awesome" className="text-primary text-[20px]" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Requirements & Vision</h4>
                </div>
                <button onClick={() => navigate(-1)} className="text-[10px] text-primary font-black uppercase tracking-widest hover:underline">Edit</button>
              </div>
              <div className="mb-4">
                <p className={LABEL + ' mb-1'}>Project Vision</p>
                <p className="text-base leading-relaxed italic text-zinc-600 font-light">
                  {form.vision || '"To create a seamless transition between the existing facade and a raw concrete extension that celebrates structural honesty and natural light."'}
                </p>
              </div>
              {form.pillars?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {form.pillars.map(p => (
                    <span key={p} className="px-3 py-1 bg-zinc-200 text-zinc-700 text-[9px] font-black uppercase tracking-widest">{p}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Project Overview 2-col */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 border border-zinc-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Icon name="architecture" className="text-primary text-[18px]" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Project Details</h4>
                </div>
                <div className="space-y-3">
                  <div><p className={LABEL}>Title</p><p className={VAL}>{form.projectTitle || 'The Monolith Pavilion'}</p></div>
                  <div><p className={LABEL}>Type</p><p className={VAL}>{form.projectType || 'High-End Residential'}</p></div>
                  <div><p className={LABEL}>Site Address</p><p className={VAL}>{form.siteAddress || '12 Swain\'s Lane, London'}</p></div>
                  <div><p className={LABEL}>Plot Size</p><p className={VAL}>{form.plotSize ? `${form.plotSize} sqm` : '—'}</p></div>
                </div>
              </div>
              <div className="bg-white p-6 border border-zinc-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Icon name="checklist" className="text-primary text-[18px]" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Scope of Services</h4>
                </div>
                <div className="space-y-2">
                  {(form.scopeServices?.length > 0 ? form.scopeServices : ['RIBA Stages 0-4 (Design)', 'Contract Administration', 'BIM Coordination']).map(s => (
                    <div key={s} className="flex items-center gap-2 text-xs">
                      <Icon name="check" className="text-primary text-[14px]" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Validation Log */}
            <div className="border border-zinc-200 p-6 opacity-70">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center mb-4">Validation Log</p>
              <div className="space-y-2.5">
                {[
                  'Client Identity Verified',
                  'No Conflict of Interest Found',
                  'Site Data Auto-Matched from Records',
                  'Budget Range Within Studio Threshold',
                ].map(c => (
                  <div key={c} className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-zinc-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Sidebar Summary */}
          <div className="col-span-12 lg:col-span-4 space-y-5">
            {/* Dark Scope Card */}
            <div className="bg-zinc-900 text-white p-7">
              <div className="flex items-center gap-3 mb-6">
                <Icon name="analytics" className="text-primary text-[20px]" />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Project Scope</h4>
              </div>
              <div>
                <p className="text-[9px] text-white/40 uppercase tracking-widest mb-1">Primary Typology</p>
                <p className="font-bold text-white">{form.projectType || 'High-End Residential'}</p>
              </div>
              <hr className="my-5 border-white/10" />
              <div>
                <p className="text-[9px] text-white/40 uppercase tracking-widest mb-2">Service Phases Included</p>
                {(form.scopeServices || ['RIBA Stages 0-4 (Design)', 'Contract Administration']).map(s => (
                  <div key={s} className="flex items-center justify-between text-xs mt-2">
                    <span className="text-white/70">{s}</span>
                    <Icon name="check" style={{ fontVariationSettings: "'wght' 700" }} className="text-primary text-[14px]" />
                  </div>
                ))}
              </div>
            </div>

            {/* Budget Card */}
            <div className="bg-white border-l-4 border-primary p-7 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <Icon name="payments" className="text-primary text-[20px]" />
                <h4 className="text-[10px] font-black uppercase tracking-widest">Financials & Timing</h4>
              </div>
              <div className="space-y-5">
                <div>
                  <p className={LABEL + ' mb-1'}>Investment Range</p>
                  <p className="text-2xl font-black text-zinc-900">{form.budgetRange || '$1.5M – $3.0M'}</p>
                </div>
                <div>
                  <p className={LABEL + ' mb-1'}>Timeline Flexibility</p>
                  <p className="text-lg font-bold text-zinc-700">
                    {(form.timelineFlexibility || 50) < 34 ? 'Strict' : (form.timelineFlexibility || 50) < 67 ? 'Moderate' : 'Flexible'}
                  </p>
                  <p className="text-[10px] text-zinc-400">Estimated 14–18 months</p>
                </div>
                <div>
                  <p className={LABEL + ' mb-1'}>Priority Level</p>
                  <span className={`inline-block px-3 py-1 text-[9px] font-black uppercase tracking-widest ${form.priority === 'Hot' ? 'bg-primary text-white' : form.priority === 'Warm' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-500'}`}>
                    {form.priority || 'Hot'} Lead
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-zinc-100 p-5 shadow-sm text-center">
              <button onClick={handleSubmit} className="w-full py-3.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-2">
                <Icon name="send" className="text-[16px]" />
                Submit Enquiry
              </button>
              <button onClick={handleSaveDraft} className="w-full mt-2 py-3 border border-zinc-200 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-colors">
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewProposalPage;