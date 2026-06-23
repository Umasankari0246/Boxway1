import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
});

const STEPS = ['Basic Info', 'Project Requirements'];

const NewClientPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    companyName: '', contactPerson: '', email: '', phone: '', type: '', city: '',
    projectType: '', estimatedBudget: '', numberOfProjects: '', timeline: '', description: '',
  });
  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    if (!form.companyName) {
      setError('Company Name is required.');
      return false;
    }
    if (!form.contactPerson) {
      setError('Contact Person is required.');
      return false;
    }
    const phoneDigits = form.phone.replace(/\D/g, '');
    if (!phoneDigits || phoneDigits.length !== 10) {
      setError('Phone number is required and must contain exactly 10 digits.');
      return false;
    }
    if (!form.email || !form.email.includes('@')) {
      setError('Email is required and must include @.');
      return false;
    }
    return true;
  };

  const addClient = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setError('');
    try {
      const newClient = {
        name: form.companyName,
        contactPerson: form.contactPerson,
        email: form.email,
        phone: form.phone,
        type: form.type || 'Corporate',
        status: 'Active',
        totalProjects: parseInt(form.numberOfProjects) || 0,
        totalValue: parseFloat(form.estimatedBudget) || 0,
        city: form.city,
      };
      console.log("Sending client data:", newClient);
      const response = await api.post('/clients/', newClient);
      console.log("Server response:", response.data);
      setIsSubmitting(false);
      navigate('/clients');
    } catch (err) {
      console.error("Error adding client:", err);
      console.error("Error response:", err.response?.data);
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || "Failed to add client. Please try again.";
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#f8f6f6]">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/clients')} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Register New Client</h2>
            <p className="text-sm text-slate-500 mt-0.5">Add a new client to your roster</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${step > i + 1 ? 'bg-green-500 border-green-500 text-white' : step === i + 1 ? 'bg-primary border-primary text-white' : 'border-slate-300 text-slate-400 bg-white'}`}>
                  {step > i + 1 ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={`text-[10px] font-bold mt-1 uppercase tracking-wide ${step === i + 1 ? 'text-primary' : 'text-slate-400'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${step > i + 1 ? 'bg-primary' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <h3 className="text-lg font-bold text-slate-900 mb-6">{STEPS[step - 1]}</h3>
          {step === 1 && (
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2"><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Company Name *</label>
                <input value={form.companyName} onChange={e => set('companyName', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" /></div>
              <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Contact Person *</label>
                <input value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" /></div>
              <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email *</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" /></div>
              <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="1234567890"
                /></div>
              <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Client Type</label>
                <select value={form.type} onChange={e => set('type', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
                  <option value="">Select Type</option>
                  {['Corporate', 'Developer', 'SMB', 'Hospitality', 'Municipality', 'Individual'].map(t => <option key={t}>{t}</option>)}</select></div>
              <div className="col-span-2"><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">City / Location</label>
                <input value={form.city} onChange={e => set('city', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" /></div>
            </div>
          )}
          {step === 2 && (
            <div className="grid grid-cols-2 gap-5">
              <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Project Type</label>
                <select value={form.projectType} onChange={e => set('projectType', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
                  <option value="">Select Type</option>
                  {['Commercial', 'Residential', 'Hospitality', 'Municipal', 'Industrial', 'Mixed-Use'].map(t => <option key={t}>{t}</option>)}</select></div>
              <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Number of Projects</label>
                <input type="number" value={form.numberOfProjects} onChange={e => set('numberOfProjects', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="e.g., 3" min="0" /></div>
              <div><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Estimated Budget ($)</label>
                <input type="number" value={form.estimatedBudget} onChange={e => set('estimatedBudget', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="e.g., 500000" /></div>
              <div className="col-span-2"><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Expected Timeline</label>
                <input value={form.timeline} onChange={e => set('timeline', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="e.g., 12-18 months" /></div>
              <div className="col-span-2"><label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Project Description</label>
                <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none" placeholder="Describe the project requirements..." /></div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-between mt-6">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/clients')}
            className="px-6 py-2.5 border border-slate-200 bg-white text-slate-700 text-sm font-semibold rounded hover:bg-slate-50">
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            onClick={() => step < 2 ? setStep(s => s + 1) : addClient()}
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-60"
          >
            {step === 2 ? (isSubmitting ? 'Saving...' : 'Register Client') : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewClientPage;
