import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MOCK_PAYSLIPS } from '../../data/mockData';
import Icon from "../../components/ui/Icon.jsx"

const api = axios.create({
  baseURL: 'http://localhost:8000/api'
});

const EmployeeProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('overview');
  const [emp, setEmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [documents, setDocuments] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/employees/${id}`);
        setEmp(response.data.data);
        setEditForm(response.data.data);
        
        // Load documents from backend or localStorage
        if (response.data.data.collegeDocs && response.data.data.collegeDocs.length > 0) {
          setDocuments(response.data.data.collegeDocs);
        } else {
          const savedDocs = localStorage.getItem(`employee_docs_${id}`);
          if (savedDocs) {
            setDocuments(JSON.parse(savedDocs));
          }
        }
      } catch (err) {
        console.error("Error fetching employee:", err);
        setError("Could not load employee data.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(emp);
  };

  const handleSave = async () => {
    try {
      // Preserve employeeId and remove MongoDB id from editForm to prevent changing the employee ID
      const { id: _, employeeId, ...updateData } = editForm;
      const payload = { ...updateData, employeeId: emp.employeeId || employeeId };
      
      const response = await api.patch(`/employees/${id}`, payload);
      
      // Refresh employee data from backend to ensure we have the latest data
      const freshResponse = await api.get(`/employees/${id}`);
      setEmp(freshResponse.data.data);
      setEditForm(freshResponse.data.data);
      
      setIsEditing(false);
      alert("Employee updated successfully!");
    } catch (err) {
      console.error("Error updating employee:", err);
      alert("Failed to update employee.");
    }
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // For now, convert to base64 and store as photoUrl
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        setEditForm({ ...editForm, photoUrl: base64String });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error uploading photo:", err);
      alert("Failed to upload photo.");
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingDoc(true);
      // Convert file to base64 for storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const newDoc = {
          id: Date.now(),
          name: file.name,
          type: file.type,
          size: file.size,
          uploadDate: new Date().toISOString(),
          data: reader.result
        };
        const updatedDocs = [...documents, newDoc];
        setDocuments(updatedDocs);
        // Save to localStorage for persistence
        localStorage.setItem(`employee_docs_${id}`, JSON.stringify(updatedDocs));
        alert("Document uploaded successfully!");
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Error uploading document:", err);
      alert("Failed to upload document.");
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleViewDocument = (doc) => {
    if (doc.data) {
      // Open document in new tab
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>${doc.name}</title></head>
            <body style="margin:0;padding:20px;text-align:center;">
              <iframe src="${doc.data}" style="width:100%;height:100vh;border:none;"></iframe>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    } else {
      alert("Document data not available");
    }
  };

  const handleDeleteDocument = (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      const updatedDocs = documents.filter(doc => doc.id !== docId);
      setDocuments(updatedDocs);
      // Update localStorage
      localStorage.setItem(`employee_docs_${id}`, JSON.stringify(updatedDocs));
    }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center bg-[#f8f6f6]"><p className="text-slate-500">Loading...</p></div>;
  }

  if (error || !emp) {
     return (
       <div className="flex-1 flex flex-col items-center justify-center bg-[#f8f6f6]">
         <p className="text-slate-500 mb-4">{error || "Employee not found."}</p>
         <button onClick={() => navigate('/employees')} className="px-4 py-2 bg-primary text-white rounded">Back to Employees</button>
       </div>
     );
  }

  const payslips = MOCK_PAYSLIPS.filter(p => p.employeeId === emp.id);

  const statusColor = emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8f6f6]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="flex items-start gap-6">
          <button onClick={() => navigate('/employees')} className="mt-1 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors">
            <Icon name="arrow_back" />
          </button>
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
              {editForm.photoUrl || emp.photoUrl ? (
                <img src={editForm.photoUrl || emp.photoUrl} alt={emp.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-slate-400">
                  {emp.name ? emp.name.charAt(0).toUpperCase() : '?'}
                </span>
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-0 right-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                <span className="text-xs">+</span>
              </label>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900">{emp.name}</h2>
              <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded uppercase ${statusColor}`}>{emp.status}</span>
            </div>
            <p className="text-slate-500 text-sm mt-0.5">{emp.role} · {emp.department}</p>
            <div className="flex items-center gap-6 mt-3 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><Icon name="cake" className="text-sm" />{emp.dob || '01 Jan 1990'}</span>
              <span className="flex items-center gap-1.5"><Icon name="water_drop" className="text-sm" />{emp.bloodGroup || 'O+'}</span>
              <span className="flex items-center gap-1.5"><Icon name="location_on" className="text-sm" />{emp.city || emp.location || 'London'}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">Employee ID</p>
            <p className="text-lg font-black text-slate-900 mt-0.5">{emp.id}</p>
            {!isEditing ? (
              <button onClick={handleEdit} className="mt-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 transition-colors">
                Edit Profile
              </button>
            ) : (
              <div className="mt-2 flex gap-2">
                <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white text-sm font-bold rounded hover:bg-green-700 transition-colors">
                  Save
                </button>
                <button onClick={handleCancel} className="px-4 py-2 bg-slate-200 text-slate-700 text-sm font-bold rounded hover:bg-slate-300 transition-colors">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-6 mt-5 border-t border-slate-100 pt-4">
          {['overview', 'leaves & timesheet', 'projects', 'payslips', 'documents'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`text-sm font-semibold capitalize pb-2 border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Personal Information</h3>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div><dt className="text-slate-500 text-xs uppercase font-bold">Full Name</dt><dd className="font-medium mt-0.5">
                    {isEditing ? (
                      <input name="name" value={editForm.name || ''} onChange={handleInputChange} className="w-full px-2 py-1 border border-slate-300 rounded" />
                    ) : (
                      emp.name
                    )}
                  </dd></div>
                  <div><dt className="text-slate-500 text-xs uppercase font-bold">Email</dt><dd className="font-medium mt-0.5">
                    {isEditing ? (
                      <input name="email" value={editForm.email || ''} onChange={handleInputChange} className="w-full px-2 py-1 border border-slate-300 rounded" />
                    ) : (
                      emp.email
                    )}
                  </dd></div>
                  <div><dt className="text-slate-500 text-xs uppercase font-bold">Phone</dt><dd className="font-medium mt-0.5">
                    {isEditing ? (
                      <input name="phone" value={editForm.phone || ''} onChange={handleInputChange} className="w-full px-2 py-1 border border-slate-300 rounded" />
                    ) : (
                      emp.phone
                    )}
                  </dd></div>
                  <div><dt className="text-slate-500 text-xs uppercase font-bold">Gender</dt><dd className="font-medium mt-0.5">
                    {isEditing ? (
                      <select name="gender" value={editForm.gender || 'Male'} onChange={handleInputChange} className="w-full px-2 py-1 border border-slate-300 rounded">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      emp.gender || 'Male'
                    )}
                  </dd></div>
                  <div><dt className="text-slate-500 text-xs uppercase font-bold">Join Date</dt><dd className="font-medium mt-0.5">
                    {isEditing ? (
                      <input name="startDate" type="date" value={editForm.startDate || ''} onChange={handleInputChange} className="w-full px-2 py-1 border border-slate-300 rounded" />
                    ) : (
                      emp.joinDate || emp.startDate || '2023-01-15'
                    )}
                  </dd></div>
                  <div className="col-span-2 mt-2">
                       <dt className="text-slate-500 text-xs uppercase font-bold">Family / Emergency Info</dt>
                       <dd className="font-medium mt-1 text-slate-700">
                         {isEditing ? (
                           <div className="space-y-2">
                             <input name="familyMembers" placeholder="Family Members" value={editForm.familyMembers || ''} onChange={handleInputChange} className="w-full px-2 py-1 border border-slate-300 rounded" />
                             <input name="emergencyContactName" placeholder="Emergency Contact Name" value={editForm.emergencyContactName || ''} onChange={handleInputChange} className="w-full px-2 py-1 border border-slate-300 rounded" />
                             <input name="emergencyContactRelation" placeholder="Relation" value={editForm.emergencyContactRelation || ''} onChange={handleInputChange} className="w-full px-2 py-1 border border-slate-300 rounded" />
                             <input 
                               name="emergencyPhone" 
                               placeholder="Emergency Phone (10 digits)" 
                               value={editForm.emergencyPhone || ''} 
                               onChange={e => {
                                 const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                 handleInputChange({ target: { name: 'emergencyPhone', value } });
                               }} 
                               className="w-full px-2 py-1 border border-slate-300 rounded" 
                               maxLength={10}
                             />
                           </div>
                         ) : (
                           <>
                             Family: {emp.familyMembers || '—'}
                             <br />
                             Emergency Contact: {emp.emergencyContactName || '—'} ({emp.emergencyContactRelation || '—'}) - {emp.emergencyPhone || '—'}
                           </>
                         )}
                       </dd>
                  </div>
                </dl>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Academic Information & Skills</h3>
                <div className="mb-4">
                     <p className="text-sm font-medium text-slate-700"><span className="text-slate-500 w-24 inline-block">Education:</span> 
                     {isEditing ? (
                       <input name="highestQualification" value={editForm.highestQualification || ''} onChange={handleInputChange} className="w-32 px-2 py-1 border border-slate-300 rounded mr-2" />
                     ) : (
                       <span>{emp.highestQualification || 'M.Arch'}</span>
                     )}, 
                     {isEditing ? (
                       <input name="university" value={editForm.university || ''} onChange={handleInputChange} className="w-32 px-2 py-1 border border-slate-300 rounded mr-2" />
                     ) : (
                       <span>{emp.university || 'MIT'}</span>
                     )}, 
                     {isEditing ? (
                       <input name="graduationYear" value={editForm.graduationYear || ''} onChange={handleInputChange} className="w-20 px-2 py-1 border border-slate-300 rounded" />
                     ) : (
                       <span>{emp.graduationYear || '2015'}</span>
                     )}
                     </p>
                </div>
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Architecture Skills</h4>
                  {isEditing ? (
                    <input name="architectureSkills" value={editForm.architectureSkills?.join(', ') || ''} onChange={(e) => setEditForm({...editForm, architectureSkills: e.target.value.split(', ')})} className="w-full px-2 py-1 border border-slate-300 rounded" placeholder="Skills separated by commas" />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(emp.architectureSkills && emp.architectureSkills.length > 0 ? emp.architectureSkills : ['Conceptual Design', '3D Modeling', 'Urban Planning']).map(s => (
                        <span key={s} className="px-3 py-1 bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-full">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                 <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tools</h4>
                  {isEditing ? (
                    <input name="toolsSelection" value={editForm.toolsSelection?.join(', ') || ''} onChange={(e) => setEditForm({...editForm, toolsSelection: e.target.value.split(', ')})} className="w-full px-2 py-1 border border-slate-300 rounded" placeholder="Tools separated by commas" />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(emp.toolsSelection && emp.toolsSelection.length > 0 ? emp.toolsSelection : ['AutoCAD', 'Revit', 'SketchUp']).map(s => (
                        <span key={s} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 text-xs font-bold rounded-full">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4">Role Details</h3>
                <dl className="space-y-3 text-sm">
                  <div><dt className="text-slate-500 text-xs uppercase font-bold">Role</dt><dd className="font-medium mt-0.5">
                    {isEditing ? (
                      <input name="role" value={editForm.role || ''} onChange={handleInputChange} className="w-full px-2 py-1 border border-slate-300 rounded" />
                    ) : (
                      emp.role
                    )}
                  </dd></div>
                  <div><dt className="text-slate-500 text-xs uppercase font-bold">Department</dt><dd className="font-medium mt-0.5">
                    {isEditing ? (
                      <select name="department" value={editForm.department || ''} onChange={handleInputChange} className="w-full px-2 py-1 border border-slate-300 rounded">
                        <option value="Design">Design</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Management">Management</option>
                      </select>
                    ) : (
                      emp.department
                    )}
                  </dd></div>
                </dl>
              </div>
              <div className="bg-zinc-900 rounded-xl p-6 text-white">
                <h3 className="font-bold mb-2">Annual Salary</h3>
                {isEditing ? (
                  <input name="salary" type="number" value={editForm.salary || ''} onChange={handleInputChange} className="w-full px-2 py-1 border border-slate-300 rounded text-black" />
                ) : (
                  <p className="text-3xl font-black text-primary">${(emp.salary || 75000).toLocaleString()}</p>
                )}
                <p className="text-slate-400 text-xs mt-1">per year</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaves & timesheet' && (
             <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <Icon name="calendar_month" className="text-5xl text-slate-300" />
                <p className="text-slate-500 text-sm mt-3">No upcoming leaves scheduled. Timesheet is up to date.</p>
            </div>
        )}

         {activeTab === 'projects' && (
             <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Project Assignment History</h3>
                <div className="relative border-l-2 border-slate-200 ml-3 mt-6 space-y-8">
                    <div className="relative pl-6">
                        <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-white"></span>
                        <p className="text-xs font-bold text-primary mb-1">Current</p>
                        <h4 className="text-sm font-bold text-slate-800">Nile River Resort Phase 2</h4>
                        <p className="text-xs text-slate-500 mt-1">Lead Architect • Assigned on Oct 2023</p>
                    </div>
                    <div className="relative pl-6">
                        <span className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-slate-300 ring-4 ring-white"></span>
                        <p className="text-xs font-bold text-slate-500 mb-1">Completed</p>
                        <h4 className="text-sm font-bold text-slate-800">Sunrise Apartments</h4>
                        <p className="text-xs text-slate-500 mt-1">Senior Architect • Jan 2022 - Sep 2023</p>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'payslips' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Payslip History</h3>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  {['Period', 'Gross Salary', 'Deductions', 'Net Salary', 'Status', 'Actions'].map(col => (
                    <th key={col} className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payslips.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">No payslips found for this employee.</td></tr>
                )}
                {payslips.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-700">{p.period}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">${p.grossSalary?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-red-600">-${p.deductions?.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">${p.net?.toLocaleString()}</td>
                    <td className="px-6 py-4"><span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">{p.status}</span></td>
                    <td className="px-6 py-4">
                      <button className="text-slate-400 hover:text-primary transition-colors"><Icon name="download" className="text-lg" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900">Documents</h3>
              <label className="px-4 py-2 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 transition-colors cursor-pointer">
                {uploadingDoc ? 'Uploading...' : 'Upload Document'}
                <input type="file" onChange={handleDocumentUpload} className="hidden" disabled={uploadingDoc} />
              </label>
            </div>
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="folder_open" className="text-5xl text-slate-300 mx-auto" />
                <p className="text-slate-500 text-sm mt-3">No documents uploaded for this employee yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc, index) => (
                  <div key={doc.name || index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => handleViewDocument(doc)}>
                      <Icon name="description" className="text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900 hover:text-primary transition-colors">{doc.name}</p>
                        <p className="text-xs text-slate-500">{new Date(doc.uploadDate).toLocaleDateString()} · {(doc.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleViewDocument(doc)} className="text-slate-400 hover:text-primary transition-colors p-1" title="View">
                        <Icon name="visibility" />
                      </button>
                      <button onClick={() => handleDeleteDocument(doc.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Delete">
                        <Icon name="delete" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeProfilePage;