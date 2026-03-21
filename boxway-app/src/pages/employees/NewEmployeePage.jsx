import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MOCK_EMPLOYEES } from '../../data/mockData';

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
});

const STEPS = ['Basic Info', 'Academic & Tools', 'Documents', 'Payroll (Opt)', 'Review & Submit'];

const NewEmployeePage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', dob: '', gender: '', bloodGroup: '', city: '',
    role: '', department: '', employeeType: '', startDate: '', managerId: '',
    emergencyContactName: '', emergencyContactRelation: '', emergencyPhone: '',
    familyMembers: '', highestQualification: '', university: '', graduationYear: '',
    architectureSkills: [], toolsSelection: [],
    photoUrl: null, collegeDocs: null,
    salary: '', basicPay: '', hra: '', allowances: '', taxId: '',
    projects: []
  });

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const departments = ['Design', 'Engineering', 'Management', 'Finance', 'Technical', 'HR'];
  const roles = ['Senior Architect', 'Architect', 'Junior Architect', 'Project Manager', 'Interior Designer', 'Structural Engineer', 'CAD Technician', 'Finance Manager'];
  const toolsList = ['AutoCAD', 'Revit', 'SketchUp', 'Rhino', 'Enscape', 'Lumion', 'V-Ray', '3ds Max'];
  const skillsList = ['Conceptual Design', '3D Modeling', 'Drafting', 'Urban Planning', 'Interior Design', 'Landscape Architecture'];

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError('');
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        dob: form.dob,
        gender: form.gender,
        bloodGroup: form.bloodGroup,
        city: form.city,
        role: form.role,
        department: form.department,
        employeeType: form.employeeType,
        startDate: form.startDate,
        managerId: form.managerId,
        emergencyContactName: form.emergencyContactName,
        emergencyContactRelation: form.emergencyContactRelation,
        emergencyPhone: form.emergencyPhone,
        familyMembers: form.familyMembers,
        highestQualification: form.highestQualification,
        university: form.university,
        graduationYear: form.graduationYear,
        architectureSkills: form.architectureSkills,
        toolsSelection: form.toolsSelection,
        salary: Number(form.salary) || 0,
        basicPay: Number(form.basicPay) || 0,
        hra: Number(form.hra) || 0,
        allowances: Number(form.allowances) || 0,
        taxId: form.taxId,
        status: "Active"
      };

      await api.post('/employees/', payload);
      navigate('/employees');
    } catch (err) {
      console.error('Error creating employee:', err);
      setError(err.response?.data?.detail || 'Failed to create employee. Please check required fields.');
      setIsSubmitting(false);
    }
  };

  const handleToolChange = (tool) => {
    if (form.toolsSelection.includes(tool)) {
      set('toolsSelection', form.toolsSelection.filter(t => t !== tool));
    } else {
      set('toolsSelection', [...form.toolsSelection, tool]);
    }
  };

  const handleSkillChange = (skill) => {
    if (form.architectureSkills.includes(skill)) {
      set('architectureSkills', form.architectureSkills.filter(s => s !== skill));
    } else {
      set('architectureSkills', [...form.architectureSkills, skill]);
    }
  };

  const prefillSalary = (role) => {
    let base = 50000;
    if (role.includes('Senior') || role.includes('Manager')) base = 90000;
    else if (role.includes('Junior') || role.includes('Technician')) base = 40000;
    else if (role) base = 65000;
    set('salary', base);
    set('basicPay', Math.round(base * 0.4));
    set('hra', Math.round(base * 0.2));
    set('allowances', Math.round(base * 0.4));
  };

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    set('role', newRole);
    prefillSalary(newRole);
  };

  const renderStep = () => {
    if (step === 1) return (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">Personal Information</h3>
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Full Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="e.g., Marcus Johnson" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email Address *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="email@boxway.com" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Phone Number</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="+1 555-0000" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Date of Birth</label>
              <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Gender</label>
              <select value={form.gender} onChange={e => set('gender', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                <option value="">Select Gender</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Blood Group</label>
              <select value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                <option value="">Select Blood Group</option>
                <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
              </select>
            </div>
             <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">City</label>
              <input value={form.city} onChange={e => set('city', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="e.g., London" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Employee ID</label>
              <input value={`EMP${String(MOCK_EMPLOYEES.length + 1).padStart(3, '0')}`} disabled className="w-full border border-slate-100 bg-slate-50 rounded px-3 py-2.5 text-sm text-slate-400 cursor-not-allowed" />
            </div>
          </div>
        </div>
        <div>
           <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2 mt-6">Family & Emergency Information</h3>
           <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
               <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Family Members (Brief)</label>
               <textarea value={form.familyMembers} onChange={e => set('familyMembers', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" rows="2" placeholder="e.g., Spouse (Jane Doe), Child (John Doe)"></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Emergency Contact Name</label>
              <input value={form.emergencyContactName} onChange={e => set('emergencyContactName', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Contact name" />
            </div>
             <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Relation</label>
              <input value={form.emergencyContactRelation} onChange={e => set('emergencyContactRelation', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="e.g., Spouse, Parent" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Emergency Phone</label>
              <input value={form.emergencyPhone} onChange={e => set('emergencyPhone', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="+1 555-0000" />
            </div>
           </div>
        </div>
      </div>
    );

    if (step === 2) return (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">Academic Information</h3>
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Highest Qualification</label>
              <input value={form.highestQualification} onChange={e => set('highestQualification', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="e.g., M.Arch" />
            </div>
             <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">University/Institution</label>
              <input value={form.university} onChange={e => set('university', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="e.g., MIT" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Graduation Year</label>
              <input type="number" value={form.graduationYear} onChange={e => set('graduationYear', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="2020" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2 mt-6">Architecture Skills & Tools</h3>
          <div className="mb-4">
             <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Skills</label>
             <div className="flex flex-wrap gap-2">
               {skillsList.map(skill => (
                 <label key={skill} className={`px-3 py-1.5 rounded-full text-xs cursor-pointer border ${form.architectureSkills.includes(skill) ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                   <input type="checkbox" className="hidden" checked={form.architectureSkills.includes(skill)} onChange={() => handleSkillChange(skill)} />
                   {skill}
                 </label>
               ))}
             </div>
          </div>
          <div>
             <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Software Tools</label>
             <div className="flex flex-wrap gap-2">
               {toolsList.map(tool => (
                 <label key={tool} className={`px-3 py-1.5 rounded-full text-xs cursor-pointer border ${form.toolsSelection.includes(tool) ? 'bg-primary text-white border-primary' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}>
                   <input type="checkbox" className="hidden" checked={form.toolsSelection.includes(tool)} onChange={() => handleToolChange(tool)} />
                   {tool}
                 </label>
               ))}
             </div>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2 mt-6">Role & Department</h3>
           <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Job Role *</label>
              <select value={form.role} onChange={handleRoleChange} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                <option value="">Select Role</option>
                {roles.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Department *</label>
              <select value={form.department} onChange={e => set('department', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                <option value="">Select Department</option>
                {departments.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Employment Type</label>
              <select value={form.employeeType} onChange={e => set('employeeType', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                <option value="">Select Type</option>
                <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Intern</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
          </div>
        </div>
      </div>
    );

    if (step === 3) return (
      <div className="grid grid-cols-2 gap-5">
        <div className="col-span-2">
            <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">Employee Photo</h3>
            <div className="flex items-center gap-4 mb-6">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border-2 border-dashed border-slate-300 overflow-hidden text-slate-400">
                    <span className="material-symbols-outlined text-4xl">person</span>
                </div>
                <div>
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded text-sm font-medium text-slate-700 hover:bg-slate-50">Upload Photo</button>
                    <p className="text-xs text-slate-500 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                </div>
            </div>
        </div>
        <div className="col-span-2">
          <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">College & Onboarding Documents</h3>
          <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-slate-400 text-4xl">upload_file</span>
            <p className="text-sm text-slate-500 mt-2">Drop documents here or <span className="text-primary font-semibold">browse</span></p>
            <p className="text-xs text-slate-400 mt-1">ID Card, Degree Certificates, Offer Letter (Max 10MB each)</p>
          </div>
        </div>
      </div>
    );

    if (step === 4) return (
      <div className="space-y-6">
         <div>
          <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">Payroll Setup (Optional)</h3>
          <p className="text-xs text-slate-500 mb-4">Values are pre-populated based on standard structures for the selected role but can be customized.</p>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Annual Total Salary ($)</label>
              <input type="number" value={form.salary} onChange={e => set('salary', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-slate-50 font-bold" />
            </div>
             <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Basic Pay ($)</label>
              <input type="number" value={form.basicPay} onChange={e => set('basicPay', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
             <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">HRA ($)</label>
              <input type="number" value={form.hra} onChange={e => set('hra', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
             <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Other Allowances ($)</label>
              <input type="number" value={form.allowances} onChange={e => set('allowances', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
             <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Tax ID / SSN</label>
              <input value={form.taxId} onChange={e => set('taxId', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="XXX-XX-XXXX" />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2 mt-6">Project Assignment (Optional)</h3>
           <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Assign to initial project</label>
              <select className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                <option value="">Select Project</option>
                <option value="p1">Nile River Resort</option>
                <option value="p2">Sunrise Apartments</option>
              </select>
            </div>
        </div>
      </div>
    );
    
    if (step === 5) return (
      <div className="space-y-6">
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
           <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-slate-200 text-slate-400">
                    <span className="material-symbols-outlined text-3xl">person</span>
                </div>
                <div>
                   <h2 className="text-xl font-bold text-slate-800">{form.name || 'New Employee'}</h2>
                   <p className="text-sm text-slate-500">{form.role || 'Role not set'} • {form.department || 'Department not set'}</p>
                </div>
           </div>
           
           <div className="grid grid-cols-2 gap-y-4 gap-x-8">
               <div>
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Personal & Contact</h4>
                   <div className="space-y-1 text-sm">
                       <p><span className="text-slate-500 inline-block w-24">Email:</span> {form.email || '—'}</p>
                       <p><span className="text-slate-500 inline-block w-24">Phone:</span> {form.phone || '—'}</p>
                       <p><span className="text-slate-500 inline-block w-24">Gender:</span> {form.gender || '—'}</p>
                       <p><span className="text-slate-500 inline-block w-24">Blood Grp:</span> {form.bloodGroup || '—'}</p>
                   </div>
               </div>
               <div>
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Academic & Skills</h4>
                   <div className="space-y-1 text-sm">
                       <p><span className="text-slate-500 inline-block w-24">Education:</span> {form.highestQualification ? `${form.highestQualification} from ${form.university}` : '—'}</p>
                       <p><span className="text-slate-500 inline-block w-24">Skills:</span> {form.architectureSkills.length > 0 ? form.architectureSkills.join(', ') : '—'}</p>
                       <p><span className="text-slate-500 inline-block w-24">Tools:</span> {form.toolsSelection.length > 0 ? form.toolsSelection.join(', ') : '—'}</p>
                   </div>
               </div>
               <div className="col-span-2 mt-4 pt-4 border-t border-slate-200">
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payroll Overview</h4>
                   <div className="grid grid-cols-4 gap-4">
                       <div className="bg-white p-3 rounded border border-slate-200 text-center">
                            <p className="text-xs text-slate-500 mb-1">Total Salary</p>
                            <p className="font-bold text-slate-800">${form.salary ? Number(form.salary).toLocaleString() : '0'}</p>
                       </div>
                       <div className="bg-white p-3 rounded border border-slate-200 text-center">
                            <p className="text-xs text-slate-500 mb-1">Basic Pay</p>
                            <p className="font-bold text-slate-800">${form.basicPay ? Number(form.basicPay).toLocaleString() : '0'}</p>
                       </div>
                   </div>
               </div>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/employees')} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Add New Employee</h2>
            <p className="text-sm text-slate-500 mt-0.5">Fill in the details to register a new team member</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex justify-between items-center mb-6 relative z-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                step > i + 1 ? 'bg-primary text-white' : step === i + 1 ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-slate-100 text-slate-400'
              }`}>
                {step > i + 1 ? <span className="material-symbols-outlined text-lg">check</span> : i + 1}
              </div>
              <span className={`text-xs mt-2 font-medium ${step === i + 1 ? 'text-primary' : 'text-slate-500'}`}>{s}</span>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
               {error}
            </div>
          )}
          <h3 className="text-lg font-bold text-slate-900 mb-6">{STEPS[step - 1]}</h3>
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button type="button" onClick={() => setStep(s => s - 1)} disabled={isSubmitting} className="px-6 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50">
              Back
            </button>
          )}
          {step < 5 ? (
            <button type="button" onClick={() => setStep(s => s + 1)} className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
              Continue
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
              {isSubmitting ? (
                <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
              ) : (
                <span className="material-symbols-outlined text-sm">check_circle</span>
              )}
              {isSubmitting ? 'Creating...' : 'Create Employee'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewEmployeePage;
