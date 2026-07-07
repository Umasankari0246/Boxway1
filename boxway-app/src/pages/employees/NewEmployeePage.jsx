import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Icon from "../../components/ui/Icon.jsx"
import { useTranslation } from '../../store/settingsStore';
import { useFormatters } from '../../store/settingsStore';

const api = axios.create({
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api'
    : 'https://boxxway.onrender.com/api'
});

const STEPS = ['Basic Info', 'Academic & Tools', 'Documents', 'Payroll (Opt)', 'Review & Submit'];
const RECENT_EMPLOYEES_KEY = 'payrollRecentEmployees';

const NewEmployeePage = () => {
  const { formatCurrency, formatDate } = useFormatters();

  const { t } = useTranslation();

  const navigate = useNavigate();
  const { id } = useParams();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState('');
  const [projects, setProjects] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    const fetchEmployeeCount = async () => {
      try {
        const response = await api.get('/employees/');
        const employees = response.data.data || [];
        
        // Extract numeric part from existing employee IDs and find the maximum
        const employeeNumbers = employees
          .map(emp => {
            if (emp.employeeId) {
              const match = emp.employeeId.match(/EMP(\d+)/);
              return match ? parseInt(match[1], 10) : 0;
            }
            return 0;
          })
          .filter(num => num > 0);
        
        const maxNumber = employeeNumbers.length > 0 ? Math.max(...employeeNumbers) : 0;
        const nextNumber = maxNumber + 1;
        setEmployeeId(`EMP${String(nextNumber).padStart(3, '0')}`);
      } catch (error) {
        setEmployeeId(`EMP001`);
      }
    };
    if (!id) fetchEmployeeCount();
  }, [id]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects/');
        setProjects(response.data.data || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      setLoading(true);
      const fetchEmployee = async () => {
        try {
          const response = await api.get(`/employees/${id}`);
          const employee = response.data.data;
          setEmployeeId(employee.employeeId || '');
          setForm({
            name: employee.name || '',
            email: employee.email || '',
            phone: employee.phone || '',
            dob: employee.dob || '',
            gender: employee.gender || '',
            bloodGroup: employee.bloodGroup || '',
            city: employee.city || '',
            role: employee.role || '',
            department: employee.department || '',
            employeeType: employee.employeeType || '',
            startDate: employee.startDate || '',
            managerId: employee.managerId || '',
            emergencyContactName: employee.emergencyContactName || '',
            emergencyContactRelation: employee.emergencyContactRelation || '',
            emergencyPhone: employee.emergencyPhone || '',
            familyMembers: employee.familyMembers || '',
            highestQualification: employee.highestQualification || '',
            university: employee.university || '',
            graduationYear: employee.graduationYear || '',
            architectureSkills: employee.architectureSkills || [],
            toolsSelection: employee.toolsSelection || [],
            photoUrl: employee.photoUrl || null,
            collegeDocs: employee.collegeDocs || null,
            salary: employee.salary || '',
            basicPay: employee.basicPay || '',
            hra: employee.hra || '',
            allowances: employee.allowances || '',
            taxId: employee.taxId || '',
            projects: employee.projects || []
          });
        } catch (err) {
          console.error('Error fetching employee:', err);
          alert('Failed to load employee data');
        } finally {
          setLoading(false);
        }
      };
      fetchEmployee();
    }
  }, [id]);

  const validateForm = () => {
    const digitsOnly = form.phone.replace(/\D/g, '');
    if (!digitsOnly || digitsOnly.length !== 10) {
      setError('Phone number is required and must contain exactly 10 digits.');
      return false;
    }
    if (!form.email || !form.email.includes('@')) {
      setError('A valid email address is required and must contain the @ symbol.');
      return false;
    }
    if (!form.highestQualification || form.highestQualification.trim() === '') {
      setError('Highest qualification is required.');
      return false;
    }
    if (!form.university || form.university.trim() === '') {
      setError('University/Institution is required.');
      return false;
    }
    if (!form.graduationYear || form.graduationYear.trim() === '') {
      setError('Graduation year is required.');
      return false;
    }
    return true;
  };

  const departments = ['Design', 'Engineering', 'Management', 'Finance', 'Technical', 'HR'];
  const roles = ['Senior Architect', 'Architect', 'Junior Architect', 'Project Manager', 'Interior Designer', 'Structural Engineer', 'CAD Technician', 'Finance Manager'];
  const toolsList = ['AutoCAD', 'Revit', 'SketchUp', 'Rhino', 'Enscape', 'Lumion', 'V-Ray', '3ds Max'];
  const skillsList = ['Conceptual Design', '3D Modeling', 'Drafting', 'Urban Planning', 'Interior Design', 'Landscape Architecture'];

  const persistRecentEmployee = (employee) => {
    try {
      const raw = window.localStorage.getItem(RECENT_EMPLOYEES_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      const employeeIdValue = employee?.employeeId || employee?.id || employee?._id || employee?.employeeId || employeeId;
      const normalizedEmployee = {
        ...employee,
        id: employeeIdValue,
        employeeId: employeeIdValue,
        name: employee?.name || form.name,
        role: employee?.role || form.role,
        department: employee?.department || form.department,
        salary: Number(employee?.salary ?? form.salary ?? 0),
        status: employee?.status || 'Active',
      };
      const next = [normalizedEmployee, ...existing.filter(item => item.id !== normalizedEmployee.id)].slice(0, 20);
      window.localStorage.setItem(RECENT_EMPLOYEES_KEY, JSON.stringify(next));
    } catch (err) {
      console.error('Failed to persist recent employee:', err);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      setIsSubmitting(true);
      setError('');
      const payload = {
        employeeId: employeeId,
        name: form.name,
        email: form.email,
        phone: form.phone,
        dob: form.dob || null,
        gender: form.gender || null,
        bloodGroup: form.bloodGroup || null,
        city: form.city || null,
        role: form.role,
        department: form.department,
        employeeType: form.employeeType || null,
        startDate: form.startDate || null,
        managerId: form.managerId || null,
        emergencyContactName: form.emergencyContactName || null,
        emergencyContactRelation: form.emergencyContactRelation || null,
        emergencyPhone: form.emergencyPhone || null,
        familyMembers: form.familyMembers || null,
        highestQualification: form.highestQualification,
        university: form.university,
        graduationYear: form.graduationYear,
        architectureSkills: form.architectureSkills || [],
        toolsSelection: form.toolsSelection || [],
        salary: Number(form.salary) || 0,
        basicPay: Number(form.basicPay) || 0,
        hra: Number(form.hra) || 0,
        allowances: Number(form.allowances) || 0,
        taxId: form.taxId || null,
        status: "Active",
        photoUrl: form.photoUrl || null,
        collegeDocs: form.collegeDocs || null,
        projects: form.projects || []
      };

      let savedEmployeeId = employeeId;

      if (isEditMode) {
        await api.patch(`/employees/${id}`, payload);
        alert('Employee updated successfully!');
      } else {
        const response = await api.post('/employees/', payload);
        alert('Employee created successfully!');
        const createdEmployee = response?.data?.data || { ...payload, id: payload.employeeId };
        persistRecentEmployee(createdEmployee);
        if (createdEmployee.employeeId) {
          savedEmployeeId = createdEmployee.employeeId;
          setEmployeeId(savedEmployeeId);
        }
        console.log('Created employee with ID:', savedEmployeeId);
      }

      // Update project team members if a project was assigned
      if (form.projects && form.projects.length > 0) {
        try {
          const projectId = form.projects[0];
          console.log('Attempting to add employee to project:', projectId, 'Employee ID:', savedEmployeeId);

          const projectRes = await api.get(`/projects/${projectId}`);
          const project = projectRes.data.data;
          const currentTeamMembers = project.teamMembers || [];
          console.log('Current team members:', currentTeamMembers);

          // Add employee to project team if not already there
          if (!currentTeamMembers.includes(savedEmployeeId)) {
            const updatedTeamMembers = [...currentTeamMembers, savedEmployeeId];
            await api.patch(`/projects/${projectId}`, {
              teamMembers: updatedTeamMembers
            });
            console.log(`Successfully added employee ${savedEmployeeId} to project ${projectId}`);
          } else {
            console.log('Employee already in project team');
          }
        } catch (err) {
          console.error('Error updating project team:', err);
          alert('Employee saved but failed to update project team. Please add manually.');
        }
      }

      navigate('/employees');
    } catch (err) {
      console.error('Error saving employee:', err);
      setError(err.response?.data?.detail || 'Failed to save employee. Please check required fields.');
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
          <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">{t('Personal Information')}</h3>
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Full Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder={t('e.g., Marcus Johnson')} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email Address *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder={t('email@boxway.com')}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Phone Number *</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={e => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                  set('phone', digits);
                }}
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder={t('e.g., 5551234567')}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t('Date of Birth')}</label>
              <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t('Gender')}</label>
              <select value={form.gender} onChange={e => set('gender', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                <option value="">{t('Select Gender')}</option>
                <option>{t('Male')}</option><option>{t('Female')}</option><option>{t('Other')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t('Blood Group')}</label>
              <select value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                <option value="">{t('Select Blood Group')}</option>
                <option>A+</option><option>{t('A-')}</option><option>B+</option><option>{t('B-')}</option><option>O+</option><option>{t('O-')}</option><option>AB+</option><option>{t('AB-')}</option>
              </select>
            </div>
             <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t('City')}</label>
              <input value={form.city} onChange={e => set('city', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder={t('e.g., London')} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t('Employee ID')}</label>
              <input value={employeeId} disabled className="w-full border border-slate-100 bg-slate-50 rounded px-3 py-2.5 text-sm text-slate-400 cursor-not-allowed" />
            </div>
          </div>
        </div>
        <div>
           <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2 mt-6">{t('Family & Emergency Information')}</h3>
           <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
               <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Family Members (Brief)</label>
               <textarea value={form.familyMembers} onChange={e => set('familyMembers', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" rows="2" placeholder={t('e.g., Spouse (Jane Doe), Child (John Doe)')}></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t('Emergency Contact Name')}</label>
              <input value={form.emergencyContactName} onChange={e => set('emergencyContactName', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder={t('Contact name')} />
            </div>
             <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t('Relation')}</label>
              <input value={form.emergencyContactRelation} onChange={e => set('emergencyContactRelation', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder={t('e.g., Spouse, Parent')} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t('Emergency Phone')}</label>
              <input 
                value={form.emergencyPhone} 
                onChange={e => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  set('emergencyPhone', value);
                }} 
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" 
                placeholder={t('10-digit phone number')} 
                maxLength={10}
              />
            </div>
           </div>
        </div>
      </div>
    );

    if (step === 2) return (
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">{t('Academic Information')}</h3>
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Highest Qualification *</label>
              <input value={form.highestQualification} onChange={e => set('highestQualification', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder={t('e.g., M.Arch')} required />
            </div>
             <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">University/Institution *</label>
              <input value={form.university} onChange={e => set('university', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"  placeholder={t('e.g., MIT')} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Graduation Year *</label>
              <input type="number" value={form.graduationYear} onChange={e => set('graduationYear', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder={t('2020')} required />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2 mt-6">{t('Architecture Skills & Tools')}</h3>
          <div className="mb-4">
             <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">{t('Skills')}</label>
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
             <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">{t('Software Tools')}</label>
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
          <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2 mt-6">{t('Role & Department')}</h3>
           <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Job Role *</label>
              <select value={form.role} onChange={handleRoleChange} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                <option value="">{t('Select Role')}</option>
                {roles.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Department *</label>
              <select value={form.department} onChange={e => set('department', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                <option value="">{t('Select Department')}</option>
                {departments.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t('Employment Type')}</label>
              <select value={form.employeeType} onChange={e => set('employeeType', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary">
                <option value="">{t('Select Type')}</option>
                <option>{t('Full-time')}</option><option>{t('Part-time')}</option><option>{t('Contract')}</option><option>{t('Intern')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t('Start Date')}</label>
              <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
          </div>
        </div>
      </div>
    );

    if (step === 3) return (
      <div className="grid grid-cols-2 gap-5">
        <div className="col-span-2">
            <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">{t('Employee Photo')}</h3>
            <div className="flex items-center gap-4 mb-6">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center border-2 border-dashed border-slate-300 overflow-hidden text-slate-400">
                    {form.photoUrl ? (
                      <img src={form.photoUrl} alt="Employee preview" className="w-full h-full object-cover" />
                    ) : (
                      <Icon name="person" className="text-4xl" />
                    )}
                </div>
                <div>
                    <input 
                      type="file" 
                      id="photo-upload" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            set('photoUrl', reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                    <button type="button" onClick={() => document.getElementById('photo-upload').click()} className="px-4 py-2 bg-white border border-slate-200 rounded text-sm font-medium text-slate-700 hover:bg-slate-50">{t('Upload Photo')}</button>
                    <p className="text-xs text-slate-500 mt-2">{t('JPG, GIF or PNG. Max size of 800K')}</p>
                </div>
            </div>
        </div>
        <div className="col-span-2">
          <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">{t('College & Onboarding Documents')}</h3>
          <input 
            type="file" 
            id="doc-upload" 
            className="hidden" 
            multiple 
            accept=".pdf,.doc,.docx" 
            onChange={(e) => {
              const files = Array.from(e.target.files);
              // Convert files to base64 for storage
              const filePromises = files.map(file => {
                return new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    resolve({
                      name: file.name,
                      type: file.type,
                      size: file.size,
                      data: reader.result
                    });
                  };
                  reader.readAsDataURL(file);
                });
              });
              
              Promise.all(filePromises).then(base64Files => {
                set('collegeDocs', base64Files);
              });
            }} 
          />
          <div onClick={() => document.getElementById('doc-upload').click()} className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
            <Icon name="upload_file" className="text-slate-400 text-4xl" />
            <p className="text-sm text-slate-500 mt-2">
              {form.collegeDocs && form.collegeDocs.length > 0 
                ? <span className="text-primary font-semibold">{form.collegeDocs.length} document(s) selected</span>
                : <>{t('Drop documents here or')}<span className="text-primary font-semibold">browse</span></>
              }
            </p>
            <p className="text-xs text-slate-400 mt-1">ID Card, Degree Certificates, Offer Letter (Max 10MB each)</p>
          </div>
        </div>
      </div>
    );

    if (step === 4) return (
      <div className="space-y-6">
         <div>
          <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">Payroll Setup (Optional)</h3>
          <p className="text-xs text-slate-500 mb-4">{t('Values are pre-populated based on standard structures for the selected role but can be customized.')}</p>
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
              <input value={form.taxId} onChange={e => set('taxId', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder={t('XXX-XX-XXXX')} />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2 mt-6">Project Assignment (Optional)</h3>
           <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{t('Assign to initial project')}</label>
              <select
                value={form.projects && form.projects.length > 0 ? form.projects[0] : ''}
                onChange={(e) => set('projects', e.target.value ? [e.target.value] : [])}
                className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">{t('Select Project')}</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
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
                    <Icon name="person" className="text-3xl" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-slate-800">{form.name || 'New Employee'}</h2>
                   <p className="text-sm text-slate-500">{form.role || 'Role not set'} • {form.department || 'Department not set'}</p>
                </div>
           </div>
           
           <div className="grid grid-cols-2 gap-y-4 gap-x-8">
               <div>
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('Personal & Contact')}</h4>
                   <div className="space-y-1 text-sm">
                       <p><span className="text-slate-500 inline-block w-24">{t('Email:')}</span> {form.email || '—'}</p>
                       <p><span className="text-slate-500 inline-block w-24">{t('Phone:')}</span> {form.phone || '—'}</p>
                       <p><span className="text-slate-500 inline-block w-24">{t('Gender:')}</span> {form.gender || '—'}</p>
                       <p><span className="text-slate-500 inline-block w-24">{t('Blood Grp:')}</span> {form.bloodGroup || '—'}</p>
                   </div>
               </div>
               <div>
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('Academic & Skills')}</h4>
                   <div className="space-y-1 text-sm">
                       <p><span className="text-slate-500 inline-block w-24">{t('Education:')}</span> {form.highestQualification ? `${form.highestQualification} from ${form.university}` : '—'}</p>
                       <p><span className="text-slate-500 inline-block w-24">{t('Skills:')}</span> {form.architectureSkills.length > 0 ? form.architectureSkills.join(', ') : '—'}</p>
                       <p><span className="text-slate-500 inline-block w-24">{t('Tools:')}</span> {form.toolsSelection.length > 0 ? form.toolsSelection.join(', ') : '—'}</p>
                   </div>
               </div>
               <div className="col-span-2 mt-4 pt-4 border-t border-slate-200">
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('Payroll Overview')}</h4>
                   <div className="grid grid-cols-4 gap-4">
                       <div className="bg-white p-3 rounded border border-slate-200 text-center">
                            <p className="text-xs text-slate-500 mb-1">{t('Total Salary')}</p>
                            <p className="font-bold text-slate-800">{formatCurrency(form.salary ? Number(form.salary).toLocaleString() : '0')}</p>
                       </div>
                       <div className="bg-white p-3 rounded border border-slate-200 text-center">
                            <p className="text-xs text-slate-500 mb-1">{t('Basic Pay')}</p>
                            <p className="font-bold text-slate-800">{formatCurrency(form.basicPay ? Number(form.basicPay).toLocaleString() : '0')}</p>
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
            <Icon name="arrow_back" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900">{isEditMode ? 'Edit Employee' : 'Add New Employee'}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{isEditMode ? 'Update employee information' : 'Fill in the details to register a new team member'}</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex justify-between items-center mb-6 relative z-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                step > i + 1 ? 'bg-primary text-white' : step === i + 1 ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-slate-100 text-slate-400'
              }`}>
                {step > i + 1 ? <Icon name="check" className="text-lg" /> : i + 1}
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
            <button type="button" onClick={() => setStep(s => s - 1)} disabled={isSubmitting} className="px-6 py-2.5 border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50">{t('Back')}</button>
          )}
          {step < 5 ? (
            <button type="button" onClick={() => setStep(s => s + 1)} className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm">{t('Continue')}</button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
              {isSubmitting ? (
                <Icon name="refresh" className="text-sm animate-spin" />
              ) : (
                <Icon name="check_circle" className="text-sm" />
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