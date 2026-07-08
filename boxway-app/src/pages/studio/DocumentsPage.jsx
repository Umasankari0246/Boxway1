import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Icon from "../../components/ui/Icon.jsx"
import { useTranslation } from '../../store/settingsStore';
import { useFormatters } from '../../store/settingsStore';

const api = axios.create({
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:8001/api'
    : 'https://boxxway.onrender.com/api'
});

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('Failed to read file'));
  reader.readAsDataURL(file);
});

const getEntityId = (entity) => entity?.id || entity?._id || entity?.projectId || entity?.clientId || '';
const getProjectLabel = (project) => project?.name || project?.title || project?.projectName || 'Untitled Project';
const getClientLabel = (client) => client?.name || client?.companyName || client?.clientName || 'Untitled Client';
/* ── Folder/Type config matching client's drive structure ─────────────────── */
const FOLDER_TYPES = [
  { key: 'Site',          label: 'Site',              icon: 'terrain',          color: 'bg-amber-50 text-amber-700',   exts: 'DWG · PDF' },
  { key: 'Scheme/CAD',    label: 'Scheme / CAD',      icon: 'architecture',     color: 'bg-blue-50 text-blue-700',     exts: 'DWG (versioned)' },
  { key: 'Email Out',     label: 'Email Out',         icon: 'send',             color: 'bg-violet-50 text-violet-700', exts: 'Folder / Date-named' },
  { key: 'Email In',      label: 'Email In',          icon: 'mail_outline',     color: 'bg-sky-50 text-sky-700',       exts: 'Structural · MEP · Site info' },
  { key: 'SketchUp',      label: 'SketchUp',          icon: 'view_in_ar',       color: 'bg-orange-50 text-orange-700', exts: 'Interior · Exterior · 3D' },
  { key: 'Revit',         label: 'Revit / BIM',       icon: 'domain',           color: 'bg-emerald-50 text-emerald-700', exts: 'Interior · Exterior · BOQ · BIM' },
  { key: 'Renders',       label: 'Renders',           icon: 'panorama',         color: 'bg-rose-50 text-rose-700',     exts: 'JPG · PNG · EXR' },
  { key: '2D Graphics',   label: '2D Graphics',       icon: 'draw',             color: 'bg-teal-50 text-teal-700',     exts: 'AI · PDF · PNG' },
  { key: '2D Animation',  label: '2D Animations',     icon: 'movie',            color: 'bg-pink-50 text-pink-700',     exts: 'MP4 · MOV · GIF' },
];

const FILE_TYPE_ICON  = { PDF: 'picture_as_pdf', DWG: 'architecture', DOCX: 'article', ZIP: 'folder_zip', PNG: 'panorama', JPG: 'panorama', MP4: 'movie', SKP: 'view_in_ar', RVT: 'domain', AI: 'draw' };
const FILE_TYPE_COLOR = { PDF: 'text-red-600', DWG: 'text-blue-600', DOCX: 'text-indigo-600', ZIP: 'text-yellow-600', PNG: 'text-purple-600', JPG: 'text-purple-600', MP4: 'text-pink-600', SKP: 'text-orange-600', RVT: 'text-emerald-600', AI: 'text-teal-600' };

const CATEGORY_FILTERS = ['All', 'Site', 'Scheme/CAD', 'Email Out', 'Email In', 'SketchUp', 'Revit', 'Renders', '2D Graphics', '2D Animation'];

const LABEL = 'text-[9px] uppercase tracking-[0.15em] font-black text-zinc-400';

/* ── Upload Modal ─────────────────────────────────────────────────────────── */
const UploadModal = ({ onClose, onUpload, projects, clients }) => {
  const { formatCurrency, formatDate } = useFormatters();

  const { t } = useTranslation();

  const [form, setForm] = useState({
    projectCode: '', projectId: '', project: '', clientId: '', client: '', folderType: 'Site',
    subFolder: '', version: '1.0', description: '', file: null,
  });
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const ft = FOLDER_TYPES.find(f => f.key === form.folderType);

  const handleProjectChange = (projectId) => {
    const project = projects.find(item => getEntityId(item) === projectId);
    const linkedClient = clients.find(item => getEntityId(item) === project?.clientId || getClientLabel(item) === project?.client);
    setForm(prev => ({
      ...prev,
      projectId,
      project: project ? getProjectLabel(project) : '',
      projectCode: project?.projectId || project?.projectCode || projectId,
      clientId: linkedClient ? getEntityId(linkedClient) : '',
      client: linkedClient ? getClientLabel(linkedClient) : (project?.client || ''),
    }));
  };

  const handleClientChange = (clientId) => {
    const client = clients.find(item => getEntityId(item) === clientId);
    setForm(prev => ({
      ...prev,
      clientId,
      client: client ? getClientLabel(client) : '',
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      set('file', file);
    }
  };

  const handleUpload = () => {
    if (!form.file) {
      alert('Please select a file to upload');
      return;
    }
    onUpload(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-zinc-100 px-7 py-5 flex justify-between items-center">
          <div>
            <h3 className="text-base font-black uppercase tracking-tight">{t('Upload Document')}</h3>
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mt-0.5">{t('Architecture file with full metadata')}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 transition-colors">
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="p-7 space-y-6">
          {/* Project Info */}
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-3">{t('Project Association')}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL + ' mb-1.5 block'}>{t('Project Code')}</label>
                <input value={form.projectCode} onChange={e => set('projectCode', e.target.value)} placeholder={t('e.g. BW24-01BFN-DGL')} className="w-full border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className={LABEL + ' mb-1.5 block'}>{t('Project')}</label>
                <select value={form.projectId} onChange={e => handleProjectChange(e.target.value)} className="w-full border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:outline-none focus:border-primary">
                  <option value="">{t('Select project...')}</option>
                  {projects.map(p => <option key={getEntityId(p)} value={getEntityId(p)}>{getProjectLabel(p)}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL + ' mb-1.5 block'}>{t('Client')}</label>
                <select value={form.clientId} onChange={e => handleClientChange(e.target.value)} className="w-full border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:outline-none focus:border-primary">
                  <option value="">{t('Select client...')}</option>
                  {clients.map(c => <option key={getEntityId(c)} value={getEntityId(c)}>{getClientLabel(c)}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL + ' mb-1.5 block'}>{t('Year Folder')}</label>
                <select className="w-full border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:outline-none focus:border-primary">
                  <option>2024</option><option>2025</option><option>2026</option>
                </select>
              </div>
            </div>
          </div>

          {/* Folder Type */}
          <div>
            <p className={LABEL + ' mb-3'}>Folder Type (Drive Structure)</p>
            <div className="grid grid-cols-3 gap-2">
              {FOLDER_TYPES.map(f => (
                <button key={f.key} type="button" onClick={() => set('folderType', f.key)} className={`flex items-center gap-2 p-2.5 border transition-all text-left ${form.folderType === f.key ? 'border-primary bg-primary/5' : 'border-zinc-100 hover:border-zinc-200 bg-zinc-50'}`}>
                  <Icon name={f.icon} className={`text-[16px] ${form.folderType === f.key ? 'text-primary' : 'text-zinc-400'}`} />
                  <div>
                    <p className={`text-[10px] font-black ${form.folderType === f.key ? 'text-primary' : 'text-zinc-700'}`}>{f.label}</p>
                    <p className="text-[8px] text-zinc-400 leading-tight">{f.exts}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Sub-folder info */}
          {ft && (
            <div className={`p-3 ${ft.color} border border-current/10 text-[10px] font-semibold flex items-center gap-2`}>
              <Icon name={ft.icon} className="text-[16px]" />
              <span>{t('Will be saved under:')}<strong>2024 / {form.projectCode || 'PROJECT-CODE'} / {ft.label}</strong></span>
            </div>
          )}

          {/* File metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL + ' mb-1.5 block'}>
                Version {['Scheme/CAD', 'Revit', 'SketchUp'].includes(form.folderType) && <span className="text-primary">*</span>}
              </label>
              <input value={form.version} onChange={e => set('version', e.target.value)} placeholder={t('e.g. 1.0, 2.3, Final')} className="w-full border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            {['Email Out', 'Email In'].includes(form.folderType) && (
              <div>
                <label className={LABEL + ' mb-1.5 block'}>{t('Date Reference')}</label>
                <input type="date" className="w-full border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:outline-none focus:border-primary" defaultValue="2024-03-20" />
              </div>
            )}
            {form.folderType === 'Email In' && (
              <div>
                <label className={LABEL + ' mb-1.5 block'}>Source (Sender)</label>
                <select className="w-full border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:outline-none focus:border-primary">
                  <option>{t('Structural Engineer')}</option>
                  <option>{t('MEP Consultant')}</option>
                  <option>{t('Client')}</option>
                  <option>{t('Planning Authority')}</option>
                  <option>{t('Site Contractor')}</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className={LABEL + ' mb-1.5 block'}>Description / Notes</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder={t('Brief description of file contents...')} className="w-full border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none" />
          </div>

          {/* Drop Zone */}
          <div className="border-2 border-dashed border-zinc-200 p-6 flex flex-col items-center gap-2 text-center hover:border-primary transition-colors cursor-pointer group">
            <input type="file" onChange={handleFileSelect} className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className="cursor-pointer w-full">
              <Icon name="cloud_upload" className="text-zinc-300 group-hover:text-primary text-[36px] transition-colors mx-auto" />
              <p className="text-xs font-black uppercase tracking-widest text-zinc-700 mt-2">{t('Drop file here or click to browse')}</p>
              <p className="text-[9px] text-zinc-400">DWG · DXF · RVT · SKP · PDF · PNG · JPG · MP4 · AI · ZIP<br/>{t('Max 1 GB per file')}</p>
              {form.file && (
                <p className="text-xs font-semibold text-primary mt-2">Selected: {form.file.name}</p>
              )}
            </label>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-zinc-100 px-7 py-4 flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2 border border-zinc-200 text-zinc-600 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-colors">{t('Cancel')}</button>
          <button onClick={handleUpload} className="px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors flex items-center gap-2">
            <Icon name="upload" className="text-[16px]" />{t('Upload File')}</button>
        </div>
      </div>
    </div>
  );
};

/* ── Edit Modal ─────────────────────────────────────────────────────────── */
const EditModal = ({ doc, onClose, onUpdate, projects, clients }) => {
  const { t } = useTranslation();
  const { formatCurrency, formatDate } = useFormatters();
  const [form, setForm] = useState({
    projectCode: doc.projectCode || '',
    project: doc.project || '',
    projectId: doc.projectId || '',
    client: doc.client || '',
    clientId: doc.clientId || '',
    folderType: doc.folderType || 'Site',
    version: doc.version || '1.0',
    description: doc.description || '',
  });
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const ft = FOLDER_TYPES.find(f => f.key === form.folderType);

  const handleProjectChange = (projectId) => {
    const project = projects.find(item => getEntityId(item) === projectId);
    const linkedClient = clients.find(item => getEntityId(item) === project?.clientId || getClientLabel(item) === project?.client);
    setForm(prev => ({
      ...prev,
      projectId,
      project: project ? getProjectLabel(project) : '',
      projectCode: project?.projectId || project?.projectCode || projectId,
      clientId: linkedClient ? getEntityId(linkedClient) : '',
      client: linkedClient ? getClientLabel(linkedClient) : (project?.client || ''),
    }));
  };

  const handleClientChange = (clientId) => {
    const client = clients.find(item => getEntityId(item) === clientId);
    setForm(prev => ({
      ...prev,
      clientId,
      client: client ? getClientLabel(client) : '',
    }));
  };

  const handleUpdate = () => {
    onUpdate({
      id: doc.id,
      ...doc,
      ...form,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-zinc-100 px-7 py-5 flex justify-between items-center">
          <div>
            <h3 className="text-base font-black uppercase tracking-tight">{t('Edit Document')}</h3>
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mt-0.5">{doc.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 transition-colors">
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="p-7 space-y-6">
          {/* Project Info */}
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-3">{t('Project Association')}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL + ' mb-1.5 block'}>{t('Project Code')}</label>
                <input value={form.projectCode} onChange={e => set('projectCode', e.target.value)} placeholder={t('e.g. BW24-01BFN-DGL')} className="w-full border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-mono focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className={LABEL + ' mb-1.5 block'}>{t('Project')}</label>
                <select value={form.projectId} onChange={e => handleProjectChange(e.target.value)} className="w-full border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:outline-none focus:border-primary">
                  <option value="">{t('Select project...')}</option>
                  {projects.map(p => <option key={getEntityId(p)} value={getEntityId(p)}>{getProjectLabel(p)}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL + ' mb-1.5 block'}>{t('Client')}</label>
                <select value={form.clientId} onChange={e => handleClientChange(e.target.value)} className="w-full border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:outline-none focus:border-primary">
                  <option value="">{t('Select client...')}</option>
                  {clients.map(c => <option key={getEntityId(c)} value={getEntityId(c)}>{getClientLabel(c)}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Folder Type */}
          <div>
            <p className={LABEL + ' mb-3'}>Folder Type (Drive Structure)</p>
            <div className="grid grid-cols-3 gap-2">
              {FOLDER_TYPES.map(f => (
                <button key={f.key} type="button" onClick={() => set('folderType', f.key)} className={`flex items-center gap-2 p-2.5 border transition-all text-left ${form.folderType === f.key ? 'border-primary bg-primary/5' : 'border-zinc-100 hover:border-zinc-200 bg-zinc-50'}`}>
                  <Icon name={f.icon} className={`text-[16px] ${form.folderType === f.key ? 'text-primary' : 'text-zinc-400'}`} />
                  <div>
                    <p className={`text-[10px] font-black ${form.folderType === f.key ? 'text-primary' : 'text-zinc-700'}`}>{f.label}</p>
                    <p className="text-[8px] text-zinc-400 leading-tight">{f.exts}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* File metadata */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL + ' mb-1.5 block'}>{t('Version')}</label>
              <input value={form.version} onChange={e => set('version', e.target.value)} placeholder={t('e.g. 1.0, 2.3, Final')} className="w-full border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>

          <div>
            <label className={LABEL + ' mb-1.5 block'}>Description / Notes</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder={t('Brief description of file contents...')} className="w-full border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none" />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-zinc-100 px-7 py-4 flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2 border border-zinc-200 text-zinc-600 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-colors">{t('Cancel')}</button>
          <button onClick={handleUpdate} className="px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors flex items-center gap-2">
            <Icon name="save" className="text-[16px]" />{t('Save Changes')}</button>
        </div>
      </div>
    </div>
  );
};

/* ── Document Detail Drawer ───────────────────────────────────────────────── */
const DocDrawer = ({ doc, onClose }) => {
  const { t } = useTranslation();
  const { formatCurrency, formatDate } = useFormatters();
  const [comments, setComments] = useState(doc.comments || []);
  const [newText, setNewText] = useState('');
  const [likedIds, setLikedIds] = useState([]);
  const ft = FOLDER_TYPES.find(f => f.key === doc.folderType) || FOLDER_TYPES[0];
  const typeColor = FILE_TYPE_COLOR[doc.type] || 'text-zinc-500';
  const typeIcon = FILE_TYPE_ICON[doc.type] || 'description';

  const post = () => {
    if (!newText.trim()) return;
    setComments(prev => [...prev, { id: Date.now(), author: 'Alex Carter', avatar: 'AC', color: 'bg-primary', role: 'Admin', time: 'Just now', text: newText, likes: 0, liked: false }]);
    setNewText('');
  };

  const handleDrawerDownload = () => {
    if (!doc.fileUrl) {
      alert('No uploaded file is available for this document yet.');
      return;
    }
    const a = document.createElement('a');
    a.href = doc.fileUrl;
    a.download = doc.fileName || doc.name || 'document';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDrawerEdit = () => {
    onClose();
    // This will be handled by the parent component
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-zinc-100 px-6 py-4 flex items-start gap-3 z-10">
          <div className={`w-10 h-10 flex items-center justify-center bg-zinc-50 shrink-0`}>
            <Icon name={typeIcon} className={`text-[22px] ${typeColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm text-zinc-900 leading-tight truncate">{doc.name}</p>
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">{doc.type} · {doc.size}</p>
          </div>
          <div className="flex gap-1 shrink-0">
            <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 text-zinc-400 transition-colors"><Icon name="close" className="text-[18px]" /></button>
          </div>
        </div>

        {/* File Preview placeholder */}
        <div className={`mx-6 mt-5 flex flex-col items-center justify-center h-44 ${ft.color} border border-current/10 relative overflow-hidden`}>
          <Icon name={ft.icon} className="text-[56px] opacity-20" />
          <p className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-50">{doc.type} Preview</p>
        </div>

        {/* Metadata */}
        <div className="px-6 mt-5 space-y-4">
          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{t('File Information')}</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Project Code', val: doc.projectCode },
              { label: 'Project', val: doc.project },
              { label: 'Client', val: doc.client },
              { label: 'Folder Type', val: doc.folderType },
              { label: 'Version', val: doc.version },
              { label: 'Uploaded By', val: doc.uploadedBy },
              { label: 'Upload Date', val: doc.uploadDate },
              { label: 'File Size', val: doc.size },
            ].map(f => (
              <div key={f.label} className="bg-zinc-50 px-3 py-2.5">
                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">{f.label}</p>
                <p className="text-xs font-semibold text-zinc-900 mt-0.5 truncate">{f.val || '—'}</p>
              </div>
            ))}
          </div>

          {/* Google Drive path */}
          <div className="bg-zinc-900 text-white px-4 py-3 flex items-center gap-2">
            <Icon name="folder" className="text-[16px] text-zinc-400" />
            <p className="text-[10px] font-mono text-zinc-300 truncate">
              Google Drive / 2024 / <span className="text-primary">{doc.projectCode}</span> / {doc.folderType} / {doc.name}
            </p>
          </div>
        </div>

        {/* Comments */}
        <div className="px-6 mt-6 pb-6 flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Activity & Comments ({comments.length})</p>
          </div>

          {/* Compose */}
          <div className="flex gap-2.5 mb-5">
            <div className="w-7 h-7 bg-primary text-white text-[10px] font-black flex items-center justify-center shrink-0">{t('AC')}</div>
            <div className="flex-1">
              <textarea value={newText} onChange={e => setNewText(e.target.value)} rows={2} placeholder={t('Add a comment or note about this file...')} className="w-full border border-zinc-200 bg-zinc-50 text-xs px-3 py-2 focus:outline-none focus:border-primary resize-none" />
              <button onClick={post} disabled={!newText.trim()} className="mt-1.5 px-4 py-1.5 bg-primary text-white text-[9px] font-black uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-40">{t('Post')}</button>
            </div>
          </div>

          {/* Comment list */}
          <div className="space-y-4">
            {comments.length === 0 && (
              <p className="text-xs text-zinc-300 text-center py-4">{t('No comments yet. Be the first to add a note.')}</p>
            )}
            {comments.map(c => (
              <div key={c.id} className="flex gap-2.5">
                <div className={`w-7 h-7 ${c.color} text-white text-[10px] font-black flex items-center justify-center shrink-0`}>{c.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-black text-zinc-900">{c.author}</span>
                    <span className="text-[9px] text-zinc-400">{c.role}</span>
                    <span className="text-[9px] text-zinc-300 ml-auto">{c.time}</span>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">{c.text}</p>
                  <button
                    onClick={() => {
                      setLikedIds(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id]);
                    }}
                    className={`flex items-center gap-1 mt-1.5 text-[9px] font-bold uppercase tracking-wider transition-colors ${likedIds.includes(c.id) ? 'text-primary' : 'text-zinc-300 hover:text-zinc-600'}`}
                  >
                    <Icon name="thumb_up" style={{ fontVariationSettings: `'FILL' ${likedIds.includes(c.id) ? 1 : 0}` }} className="text-[13px]" />
                    {c.likes + (likedIds.includes(c.id) ? 1 : 0)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Main Page ────────────────────────────────────────────────────────────── */
const DocumentsPage = () => {
  const { t } = useTranslation();
  const { formatCurrency, formatDate } = useFormatters();
  const [search, setSearch] = useState('');
  const [folderFilter, setFolderFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDoc, setEditingDoc] = useState(null);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const [documentsRes, projectsRes, clientsRes] = await Promise.all([
          api.get('/documents/'),
          api.get('/projects/'),
          api.get('/clients/'),
        ]);
        setDocuments(documentsRes.data.data || []);
        setProjects(projectsRes.data.data || []);
        setClients(clientsRes.data.data || []);
      } catch (err) {
        console.error("Error fetching documents:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const projectOptions = ['All', ...projects.map(project => getProjectLabel(project))];

  const itemsPerPage = 5;

  const resolveProjectLabel = (doc) => {
    const project = projects.find(item => getEntityId(item) === doc.projectId || getProjectLabel(item) === doc.project || item.projectId === doc.projectCode);
    return project ? getProjectLabel(project) : (doc.project || doc.projectCode || '—');
  };

  const resolveClientLabel = (doc) => {
    const client = clients.find(item => getEntityId(item) === doc.clientId || getClientLabel(item) === doc.client);
    return client ? getClientLabel(client) : (doc.client || '—');
  };

  const filtered = documents.filter(d =>
    (folderFilter === 'All' || d.folderType === folderFilter) &&
    (projectFilter === 'All' || resolveProjectLabel(d) === projectFilter || d.projectId === projectFilter || d.projectCode === projectFilter) &&
    (d.name.toLowerCase().includes(search.toLowerCase()) || (d.client || '').toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => {
    if (sortBy === 'date') return new Date(b.uploadDate) - new Date(a.uploadDate);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'size') {
      const sizeA = parseFloat(a.size);
      const sizeB = parseFloat(b.size);
      return sizeB - sizeA;
    }
    if (sortBy === 'type') return a.type.localeCompare(b.type);
    return 0;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, folderFilter, projectFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedDocuments = filtered.slice(startIndex, startIndex + itemsPerPage);

  const ft = (key) => FOLDER_TYPES.find(f => f.key === key);

  const handleUpload = async (form) => {
    console.log('Upload form data:', form);
    console.log('Form projectId:', form.projectId);
    const fileExt = form.file.name.split('.').pop().toUpperCase();
    const fileSize = (form.file.size / (1024 * 1024)).toFixed(1) + ' MB';
    const fileUrl = await readFileAsDataUrl(form.file);
    const project = projects.find(item => getEntityId(item) === form.projectId);
    const client = clients.find(item => getEntityId(item) === form.clientId);
    console.log('Found project:', project);
    console.log('Project entity ID:', project ? getEntityId(project) : 'Not found');
    console.log('Project._id:', project?._id);
    console.log('Project.id:', project?.id);
    console.log('Project.projectId:', project?.projectId);
    
    // Optimistic UI: insert temporary entry immediately
    const tempId = `temp-${Date.now()}`;
    const tempDoc = {
      id: tempId,
      documentId: tempId,
      name: form.file.name,
      type: fileExt,
      folderType: form.folderType,
      size: fileSize,
      uploadedBy: 'Alex Carter',
      uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      projectId: form.projectId || '',
      project: form.project || getProjectLabel(project),
      projectCode: form.projectCode || project?.projectId || project?.projectCode || form.projectId,
      clientId: form.clientId || '',
      client: form.client || getClientLabel(client),
      version: form.version,
      description: form.description,
      comments: [],
      fileUrl,
      fileName: form.file.name,
      createdAt: new Date().toISOString(),
    };

    console.log('Temporary document to be saved:', tempDoc);
    console.log('Document projectId being saved:', tempDoc.projectId);
    setDocuments(prev => [tempDoc, ...prev]);
    setShowUpload(false);

    try {
      const newDoc = { ...tempDoc };
      // Remove temporary id before sending
      delete newDoc.id;
      delete newDoc.documentId;
      const response = await api.post('/documents/', newDoc);
      const saved = response.data.data;
      console.log('Saved document from server:', saved);
      console.log('Saved document projectId:', saved.projectId);
      setDocuments(prev => prev.map(d => d.id === tempId ? saved : d));
    } catch (err) {
      console.error("Error uploading document:", err);
      // rollback
      setDocuments(prev => prev.filter(d => d.id !== tempId));
      alert("Failed to upload document");
    }
  };

  const handleDelete = async () => {
    // Optimistic delete: remove locally first
    const idToDelete = deletingId;
    const deletedDoc = documents.find(d => d.id === idToDelete);
    setDocuments(prev => prev.filter(d => d.id !== idToDelete));
    setDeletingId(null);
    try {
      await api.delete(`/documents/${idToDelete}`);
    } catch (err) {
      console.error("Error deleting document:", err);
      // revert
      if (deletedDoc) setDocuments(prev => [deletedDoc, ...prev]);
      alert("Failed to delete document");
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setCurrentPage(1);
    try {
      const [documentsRes, projectsRes, clientsRes] = await Promise.all([
        api.get('/documents/'),
        api.get('/projects/'),
        api.get('/clients/'),
      ]);
      setDocuments(documentsRes.data.data || []);
      setProjects(projectsRes.data.data || []);
      setClients(clientsRes.data.data || []);
    } catch (err) {
      console.error('Error refreshing documents:', err);
      alert('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (doc) => {
    if (!doc.fileUrl) {
      alert('No uploaded file is available for this document yet.');
      return;
    }
    const a = document.createElement('a');
    a.href = doc.fileUrl;
    a.download = doc.fileName || doc.name || 'document';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleEdit = (doc) => {
    setEditingDoc(doc);
  };

  const handleUpdateDocument = async (updatedDoc) => {
    try {
      const response = await api.patch(`/documents/${updatedDoc.id}`, updatedDoc);
      const savedDoc = response.data.data || updatedDoc;
      setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? { ...d, ...savedDoc } : d));
      setEditingDoc(null);
    } catch (err) {
      console.error("Error updating document:", err);
      alert("Failed to update document");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#fcf9f8]">
      {/* ─── Folder Type Overview Cards ─── */}
      <div className="px-8 pt-6 pb-4">
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-3">
          {/* All Projects Card */}
          <button
            onClick={() => setFolderFilter('All')}
            className={`flex flex-col items-center justify-center p-6 border transition-all text-center col-span-1 ${folderFilter === 'All' ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white border-zinc-100 hover:border-zinc-200'}`}
          >
            <Icon name="folder" className={`text-[32px] mb-1 ${folderFilter === 'All' ? 'text-white' : 'text-zinc-400'}`} />
            <p className={`text-[11px] font-black uppercase tracking-wide leading-tight ${folderFilter === 'All' ? 'text-white' : 'text-zinc-500'}`}>{t('All Projects')}</p>
            <p className={`text-[12px] font-black mt-0.5 ${folderFilter === 'All' ? 'opacity-70' : 'text-zinc-400'}`}>{documents.length}</p>
          </button>
          {FOLDER_TYPES.map(f => {
            const count = documents.filter(d => d.folderType === f.key).length;
            return (
              <button
                key={f.key}
                onClick={() => setFolderFilter(folderFilter === f.key ? 'All' : f.key)}
                className={`flex flex-col items-center justify-center p-4 border transition-all text-center ${folderFilter === f.key ? `${f.color} border-current/30 shadow-sm` : 'bg-white border-zinc-100 hover:border-zinc-200'}`}
              >
                <Icon name={f.icon} className={`text-[24px] mb-1 ${folderFilter === f.key ? '' : 'text-zinc-400'}`} />
                <p className={`text-[9px] font-black uppercase tracking-wide leading-tight ${folderFilter === f.key ? '' : 'text-zinc-500'}`}>{f.label}</p>
                <p className={`text-[10px] font-black mt-0.5 ${folderFilter === f.key ? 'opacity-70' : 'text-zinc-400'}`}>{count}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Search + Filter + Upload row ─── */}
      <div className="px-8 pb-4">
        <div className="bg-white border border-zinc-100 shadow-sm py-3 px-4 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative w-96">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[18px]" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-zinc-50 text-xs font-medium placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-primary" placeholder={t('Search documents, clients...')} />
          </div>
          {/* Project filter */}
          <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="border border-zinc-200 text-[10px] font-black uppercase py-2 px-6 focus:ring-0 focus:border-primary bg-white">
            {projectOptions.map(p => <option key={p} value={p}>{p === 'All' ? 'All Projects' : p}</option>)}
          </select>
          {/* Sort */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border border-zinc-200 text-[10px] font-black uppercase py-2 px-6 focus:ring-0 focus:border-primary bg-white">
            <option value="date">{t('Sort: Date')}</option>
            <option value="name">{t('Sort: Name')}</option>
            <option value="size">{t('Sort: Size')}</option>
            <option value="type">{t('Sort: Type')}</option>
          </select>
          {/* Upload CTA */}
          <div className="ml-auto flex items-center gap-2">
            <button onClick={handleRefresh} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-zinc-200 text-zinc-700 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-colors">
              <Icon name="refresh" className="text-[16px]" />{t('Refresh')}</button>
            <button onClick={() => setShowUpload(true)} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors shadow-sm shadow-primary/20">
              <Icon name="upload" className="text-[16px]" />{t('Upload File')}</button>
          </div>
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="px-8 pb-16">
        <div className="bg-white border border-zinc-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="border-b border-zinc-100 bg-zinc-50/60">
              <tr>
                {['File', 'Type / Folder', 'Project Code', 'Client', 'Version', 'Uploaded By', 'Date', 'Actions'].map(col => (
                  <th key={col} className="px-5 py-3.5 text-[9px] font-black uppercase tracking-widest text-zinc-400 whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <Icon name="folder_open" className="text-zinc-200 text-4xl block mb-2" />
                    <p className="text-zinc-400 text-sm">{t('No documents match your filters.')}</p>
                  </td>
                </tr>
              )}
              {paginatedDocuments.map(doc => {
                const folderInfo = ft(doc.folderType);
                const iconName = FILE_TYPE_ICON[doc.type] || 'description';
                const iconColor = FILE_TYPE_COLOR[doc.type] || 'text-zinc-400';
                return (
                  <tr key={doc.id} className="hover:bg-zinc-50/70 transition-colors cursor-pointer group" onClick={() => setSelectedDoc(doc)}>
                    <td className="px-5 py-3.5 max-w-[200px]">
                      <div className="flex items-center gap-2">
                        <Icon name={iconName} className={`text-[20px] shrink-0 ${iconColor}`} />
                        <div className="min-w-0">
                          <p className="text-xs font-black text-zinc-800 group-hover:text-primary transition-colors truncate">{doc.name}</p>
                          <p className="text-[9px] text-zinc-400">{doc.size}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 ${folderInfo?.color || 'bg-zinc-100 text-zinc-500'} inline-block w-fit`}>{doc.folderType}</span>
                        <span className="text-[9px] text-zinc-400 font-mono">{doc.type}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-mono font-black text-zinc-700">{doc.projectCode || '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-zinc-600">{resolveClientLabel(doc)}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5">v{doc.version}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-zinc-500">{doc.uploadedBy}</td>
                    <td className="px-5 py-3.5 text-xs text-zinc-400 whitespace-nowrap">{doc.uploadDate}</td>
                    <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelectedDoc(doc)} className="p-1.5 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors" title={t('View')}><Icon name="visibility" className="text-[15px]" /></button>
                        <button onClick={() => handleDownload(doc)} className="p-1.5 hover:bg-zinc-100 text-zinc-400 hover:text-primary transition-colors" title={t('Download')}><Icon name="download" className="text-[15px]" /></button>
                        <button onClick={() => handleEdit(doc)} className="p-1.5 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors" title={t('Edit')}><Icon name="edit" className="text-[15px]" /></button>
                        <button onClick={() => setDeletingId(doc.id)} className="p-1.5 hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors" title={t('Delete')}><Icon name="delete" className="text-[15px]" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-5 py-3 border-t border-zinc-50 text-[9px] font-black uppercase tracking-widest text-zinc-400 flex flex-wrap gap-3 items-center justify-between">
            <span>
              Showing {filtered.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length} documents
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={safeCurrentPage === 1}
                className="px-3 py-1.5 border border-zinc-200 text-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50"
              >{t('Previous')}</button>
              <span className="text-zinc-500">Page {safeCurrentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                disabled={safeCurrentPage === totalPages}
                className="px-3 py-1.5 border border-zinc-200 text-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50"
              >{t('Next')}</button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Modals ─── */}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUpload={handleUpload} projects={projects} clients={clients} />}
      {editingDoc && <EditModal doc={editingDoc} onClose={() => setEditingDoc(null)} onUpdate={handleUpdateDocument} projects={projects} clients={clients} />}
      {selectedDoc && <DocDrawer doc={selectedDoc} onClose={() => setSelectedDoc(null)} />}

      {deletingId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setDeletingId(null)}>
          <div className="bg-white p-8 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <Icon name="warning" className="text-red-500 text-3xl mb-3 block" />
            <h3 className="text-lg font-black uppercase tracking-tight mb-2">{t('Delete Document?')}</h3>
            <p className="text-sm text-zinc-500 mb-6">{t('This will permanently remove the file and all its associated metadata and comments.')}</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 border border-zinc-200 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50">{t('Cancel')}</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700">{t('Delete')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;