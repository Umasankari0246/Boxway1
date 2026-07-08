import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoiceStore } from '../store/invoiceStore';
import axios from 'axios';
import Icon from "../components/ui/Icon.jsx"
import { useTranslation } from '../store/settingsStore';
import { useFormatters } from '../store/settingsStore';

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

const CreateInvoicePage = () => {
  const { formatCurrency, formatDate } = useFormatters();

  const { t } = useTranslation();

  const navigate = useNavigate();
  const { invoiceData, updateField, updateItem, addItem, removeItem, resetInvoice } = useInvoiceStore();
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [newItem, setNewItem] = useState({ description: '', hsn: '', qty: 1, rate: 0, disc: 0 });

  useEffect(() => {
    const fetchRefs = async () => {
      try {
        const [clientsRes, projectsRes] = await Promise.all([
          api.get('/clients/'),
          api.get('/projects/'),
        ]);
        setClients(clientsRes.data.data || []);
        setProjects(projectsRes.data.data || []);
      } catch (err) {
        console.error('Error fetching invoice references:', err);
      } finally {
        setLoadingRefs(false);
      }
    };

    fetchRefs();
  }, []);

  // Generate dynamic invoice number
  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `INV-${year}-${month}-${random}`;
  };

  const handleNext = () => {
    navigate('/invoices/review');
  };

  const handleBack = () => {
    navigate('/invoices');
  };

  const handleProjectChange = (projectId) => {
    const project = projects.find(item => (item.id || item._id || item.projectId) === projectId);
    updateField('projectId', projectId);
    updateField('projectLink', project ? project.name : '');
    updateField('project', project ? project.name : '');
    if (project?.client) {
      const linkedClient = clients.find(client => (client.id || client._id || client.clientId) === project.client || client.name === project.client);
      if (linkedClient) {
        updateField('clientId', linkedClient.id || linkedClient._id || linkedClient.clientId || '');
        updateField('clientName', linkedClient.name || '');
        updateField('billingAddress', linkedClient.address || '');
        updateField('gstin', linkedClient.gstin || '');
        updateField('contactPerson', linkedClient.contactPerson || '');
      }
    }
  };

  const handleClientPick = (client) => {
    updateField('clientId', client.id || client._id || client.clientId || '');
    updateField('clientName', client.name || '');
    updateField('billingAddress', client.address || '');
    updateField('gstin', client.gstin || '');
    updateField('contactPerson', client.contactPerson || '');
    setShowClientPicker(false);
  };

  const handleSaveDraft = async () => {
    try {
      const attachmentPayload = invoiceData.attachments || [];
      const subtotal = invoiceData.items.reduce((acc, item) => {
        const amount = item.qty * item.rate;
        const discountAmount = amount * (item.disc / 100);
        return acc + (amount - discountAmount);
      }, 0);
      const cgst = subtotal * 0.09;
      const sgst = subtotal * 0.09;
      const total = subtotal + cgst + sgst;

      const invoicePayload = {
        invoiceId: generateInvoiceNumber(),
        clientId: invoiceData.clientId || '',
        client: invoiceData.clientName || '',
        projectId: invoiceData.projectId || '',
        project: invoiceData.projectLink || '',
        date: invoiceData.issueDate || new Date().toISOString().split('T')[0],
        amount: total,
        status: 'Draft',
        dueDate: invoiceData.dueDate,
        notes: invoiceData.notes,
        paymentTerms: invoiceData.paymentTerms,
        clientName: invoiceData.clientName || '',
        billingAddress: invoiceData.billingAddress || '',
        gstin: invoiceData.gstin || '',
        contactPerson: invoiceData.contactPerson || '',
        items: invoiceData.items || [],
        attachments: attachmentPayload,
        authorizedSignature: invoiceData.authorizedSignature || '',
      };

      await api.post('/invoices/', invoicePayload);
      alert('Invoice saved as draft!');
      resetInvoice();
      navigate('/invoices');
    } catch (err) {
      console.error('Error saving invoice:', err);
      alert('Failed to save invoice. Please try again.');
    }
  };

  const handleDiscard = () => {
    if (window.confirm('Are you sure you want to discard this invoice? All unsaved changes will be lost.')) {
      resetInvoice();
      navigate('/invoices');
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const attachments = [...(invoiceData.attachments || [])];
      for (const file of Array.from(files)) {
        const fileUrl = await readFileAsDataUrl(file);
        attachments.push({
          name: file.name,
          type: file.type,
          size: file.size,
          fileUrl,
        });
      }
      updateField('attachments', attachments);
    }
  };

  const handleAddItemModal = () => {
    if (newItem.description && newItem.rate > 0) {
      addItem({
        id: Date.now(),
        description: newItem.description,
        hsn: newItem.hsn,
        qty: newItem.qty,
        rate: newItem.rate,
        disc: newItem.disc,
      });
      setNewItem({ description: '', hsn: '', qty: 1, rate: 0, disc: 0 });
      setShowAddItemModal(false);
    } else {
      alert('Please fill in at least description and rate');
    }
  };

  // Calculations
  const subtotal = invoiceData.items.reduce((acc, item) => {
    const amount = item.qty * item.rate;
    const discountAmount = amount * (item.disc / 100);
    return acc + (amount - discountAmount);
  }, 0);

  const cgst = subtotal * 0.09;
  const sgst = subtotal * 0.09;
  const total = subtotal + cgst + sgst;

  return (
    <div 
      className="flex-1 overflow-y-auto p-8 custom-scrollbar pb-32 bg-[#f7f7f6]" 
      style={{ '--color-primary': '#4a6841', '--color-brand-red': '#dc2626' }}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('Invoice Number')}</label>
            <div className="text-slate-900 font-mono font-semibold">{generateInvoiceNumber()}</div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('Issue Date')}</label>
            <input 
              className="w-full text-sm border-slate-200 rounded focus:ring-primary focus:border-primary" 
              type="date" 
              value={invoiceData.issueDate}
              onChange={(e) => updateField('issueDate', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('Due Date')}</label>
            <input 
              className="w-full text-sm border-slate-200 rounded focus:ring-primary focus:border-primary" 
              type="date" 
              value={invoiceData.dueDate}
              onChange={(e) => updateField('dueDate', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('Project Link')}</label>
            <select 
              className="w-full text-sm border-slate-200 rounded focus:ring-primary focus:border-primary"
              value={invoiceData.projectLink}
              onChange={(e) => handleProjectChange(e.target.value)}
            >
              <option value="">{t('Select project')}</option>
              {projects.map(project => (
                <option key={project.id || project._id || project.projectId} value={project.id || project._id || project.projectId}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Details Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Firm Details (Read-only) */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('From: BOXWAY STUDIO')}</h3>
              <Icon name="lock" className="text-slate-300 text-sm" />
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <p className="font-bold text-slate-900">{t('Boxway Studio Architects')}</p>
              <p>{t('Suite 402, Creative Hub, South Industrial Park')}</p>
              <p>{t('Mumbai, Maharashtra, 400013')}</p>
              <div className="pt-2">
                <p className="text-[10px] text-slate-400 uppercase font-bold">{t('GSTIN')}</p>
                <p className="font-mono">27AAAAA0000A1Z5</p>
              </div>
              <div className="pt-2">
                <p className="text-[10px] text-slate-400 uppercase font-bold">{t('Contact')}</p>
                <p>accounts@boxwaystudio.com | +91 22 4567 8900</p>
              </div>
            </div>
          </div>
          
          {/* Client Details Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest">{t('Bill To: Client')}</h3>
              <button type="button" onClick={() => setShowClientPicker((current) => !current)} className="text-[10px] text-primary hover:underline font-bold">{t('SEARCH CLIENT')}</button>
            </div>
            <div className="space-y-4">
              <input 
                className="w-full text-sm border-slate-200 rounded focus:ring-primary focus:border-primary" 
                placeholder={t('Client Name')} type="text" 
                value={invoiceData.clientName}
                onChange={(e) => updateField('clientName', e.target.value)}
              />
              <textarea 
                className="w-full text-sm border-slate-200 rounded focus:ring-primary focus:border-primary" 
                placeholder={t('Billing Address')} rows="2"
                value={invoiceData.billingAddress}
                onChange={(e) => updateField('billingAddress', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  className="w-full text-sm border-slate-200 rounded focus:ring-primary focus:border-primary" 
                  placeholder={t('GSTIN')} type="text" 
                  value={invoiceData.gstin}
                  onChange={(e) => updateField('gstin', e.target.value)}
                />
                <input 
                  className="w-full text-sm border-slate-200 rounded focus:ring-primary focus:border-primary" 
                  placeholder={t('Contact Person')} type="text" 
                  value={invoiceData.contactPerson}
                  onChange={(e) => updateField('contactPerson', e.target.value)}
                />
              </div>
              {showClientPicker && (
                <div className="mt-4 border border-slate-100 rounded-lg max-h-64 overflow-y-auto">
                  <div className="p-3 border-b border-slate-100 bg-slate-50">
                    <input
                      className="w-full text-sm border-slate-200 rounded"
                      placeholder={t('Search available clients')}
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                    />
                  </div>
                  <div className="divide-y divide-slate-100">
                    {clients
                      .filter(client => client.name.toLowerCase().includes(clientSearch.toLowerCase()) || client.contactPerson.toLowerCase().includes(clientSearch.toLowerCase()))
                      .map(client => (
                        <button
                          key={client.id || client._id || client.clientId}
                          type="button"
                          onClick={() => handleClientPick(client)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
                        >
                          <p className="text-sm font-semibold text-slate-900">{client.name}</p>
                          <p className="text-xs text-slate-500">{client.contactPerson} · {client.city || 'No city'}</p>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Authorized Signature Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <label className="block text-xs font-bold text-slate-400 uppercase mb-3">{t('Authorized Signature')}</label>
          <input
            className="w-full text-sm border-slate-200 rounded focus:ring-primary focus:border-primary"
            type="text"
            placeholder={t('Type authorized signatory name')}
            value={invoiceData.authorizedSignature}
            onChange={(e) => updateField('authorizedSignature', e.target.value)}
          />
        </div>

        {/* Line Items Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-800">{t('Invoice Items')}</h3>
            <button
              onClick={() => setShowAddItemModal(true)}
              className="flex items-center gap-1 text-primary text-xs font-bold hover:opacity-80 transition-opacity"
            >
              <Icon name="add" className="text-sm" />{t('ADD LINE ITEM')}</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">{t('Description')}</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase w-28">HSN/SAC</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase w-20">{t('Qty')}</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase w-32">{t('Rate')}</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase w-20">Disc %</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase w-32 text-right">{t('Amount')}</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoiceData.items.map(item => {
                  const amount = item.qty * item.rate;
                  const discountedAmount = amount - (amount * (item.disc / 100));
                  return (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <input className="w-full text-sm border-none focus:ring-0 p-0" type="text" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} />
                      </td>
                      <td className="px-6 py-4">
                        <input className="w-full text-sm border-none focus:ring-0 p-0" type="text" value={item.hsn} onChange={(e) => updateItem(item.id, 'hsn', e.target.value)} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <input className="w-full text-sm border-none focus:ring-0 p-0" type="number" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', Number(e.target.value))} />
                      </td>
                      <td className="px-6 py-4">
                        <input className="w-full text-sm border-none focus:ring-0 p-0" type="number" value={item.rate} onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))} />
                      </td>
                      <td className="px-6 py-4">
                        <input className="w-full text-sm border-none focus:ring-0 p-0" type="number" value={item.disc} onChange={(e) => updateItem(item.id, 'disc', Number(e.target.value))} />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700 text-right">
                        {formatCurrency(discountedAmount.toFixed(2))}
                      </td>
                      <td className="px-4 py-4">
                        <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-brand-red"><Icon name="close" className="text-sm" /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals & Payment Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-3">{t('Payment Terms')}</label>
              <select className="w-full text-sm border-slate-200 rounded focus:ring-primary focus:border-primary mb-3"
                value={invoiceData.paymentTerms} onChange={(e) => updateField('paymentTerms', e.target.value)}>
                <option>{t('Consultation Template')}</option>
                <option>{t('Turnkey Project Template')}</option>
                <option>{t('Custom Terms')}</option>
              </select>
              <textarea className="w-full text-xs border-slate-100 bg-slate-50 rounded focus:ring-primary focus:border-primary" rows="3" readOnly defaultValue={"1. Payment to be made within 15 days of invoice date.\n2. Mode of payment: Bank Transfer / NEFT only.\n3. Delayed payments attract 2% interest per month."}></textarea>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-3">{t('Notes & Attachments')}</label>
              <textarea 
                className="w-full text-sm border-slate-200 rounded focus:ring-primary focus:border-primary mb-4" 
                placeholder={t('Add a note...')} rows="2"
                value={invoiceData.notes} onChange={(e) => updateField('notes', e.target.value)}
              />
              <div className="border-2 border-dashed border-slate-100 rounded-lg p-6 text-center group cursor-pointer hover:border-primary/50 transition-colors">
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  id="file-upload" 
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Icon name="cloud_upload" className="text-slate-300 group-hover:text-primary mb-2" />
                  <p className="text-[10px] text-slate-400 font-medium">{t('Click to upload receipts or supporting documents')}</p>
                </label>
              </div>
              {/* Display uploaded files */}
              {invoiceData.attachments && invoiceData.attachments.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{t('Uploaded Files')}</p>
                  {invoiceData.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-50 rounded px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Icon name="attach_file" className="text-slate-400 text-[14px]" />
                        <span className="text-xs text-slate-700 truncate max-w-[200px]">{attachment.name}</span>
                        <span className="text-[10px] text-slate-400">({(attachment.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button
                        onClick={() => {
                          const updatedAttachments = invoiceData.attachments.filter((_, i) => i !== index);
                          updateField('attachments', updatedAttachments);
                        }}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Icon name="close" className="text-[14px]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">{t('Subtotal')}</span>
                <span className="font-medium">{formatCurrency(subtotal.toFixed(2))}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">CGST (9%)</span>
                  <Icon name="info" className="text-[14px] text-slate-300" />
                </div>
                <span className="font-medium">{formatCurrency(cgst.toFixed(2))}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">SGST (9%)</span>
                  <Icon name="info" className="text-[14px] text-slate-300" />
                </div>
                <span className="font-medium">{formatCurrency(sgst.toFixed(2))}</span>
              </div>
              <div className="flex justify-between items-center text-sm opacity-50">
                <span className="text-slate-500">IGST (0%)</span>
                <span className="font-medium">${"0.00"} </span>
              </div>
            </div>
            <div className="bg-slate-900 p-6">
              <div className="flex justify-between items-end mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('Total Amount Payable')}</span>
                <span className="text-2xl font-bold text-white tracking-tight">{formatCurrency(total.toFixed(2))}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sticky Footer Action Bar */}
      <footer className="h-20 bg-white border-t border-slate-200 fixed bottom-0 left-60 right-0 z-20 px-8 flex items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium">
            <Icon name="arrow_back" className="text-lg" />{t('Back')}</button>
          <button onClick={handleDiscard} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium">
            <Icon name="delete" className="text-lg" />{t('Discard')}</button>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleSaveDraft} className="px-6 py-2 border border-slate-300 rounded font-medium text-slate-600 hover:bg-slate-50 transition-colors text-sm">{t('Save as Draft')}</button>
          <button onClick={handleNext} className="px-8 py-2 bg-primary text-white rounded font-bold hover:opacity-90 transition-opacity text-sm flex items-center gap-2 cursor-pointer">{t('Preview Invoice')}<Icon name="visibility" className="text-sm" />
          </button>
        </div>
      </footer>

      {/* Add Line Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowAddItemModal(false)}>
          <div className="bg-white p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black uppercase tracking-tight mb-4">{t('Add Line Item')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('Description')}</label>
                <input
                  className="w-full text-sm border-slate-200 rounded focus:ring-primary focus:border-primary"
                  type="text"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder={t('Item description')}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">HSN/SAC</label>
                <input
                  className="w-full text-sm border-slate-200 rounded focus:ring-primary focus:border-primary"
                  type="text"
                  value={newItem.hsn}
                  onChange={(e) => setNewItem({ ...newItem, hsn: e.target.value })}
                  placeholder={t('HSN/SAC code')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('Quantity')}</label>
                  <input
                    className="w-full text-sm border-slate-200 rounded focus:ring-primary focus:border-primary"
                    type="number"
                    value={newItem.qty}
                    onChange={(e) => setNewItem({ ...newItem, qty: Number(e.target.value) })}
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('Rate')}</label>
                  <input
                    className="w-full text-sm border-slate-200 rounded focus:ring-primary focus:border-primary"
                    type="number"
                    value={newItem.rate}
                    onChange={(e) => setNewItem({ ...newItem, rate: Number(e.target.value) })}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Discount (%)</label>
                <input
                  className="w-full text-sm border-slate-200 rounded focus:ring-primary focus:border-primary"
                  type="number"
                  value={newItem.disc}
                  onChange={(e) => setNewItem({ ...newItem, disc: Number(e.target.value) })}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddItemModal(false)} className="flex-1 py-2.5 border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50">{t('Cancel')}</button>
              <button onClick={handleAddItemModal} className="flex-1 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90">{t('Add Item')}</button>
            </div>
          </div>
        </div>
      )}

      {loadingRefs && (
        <div className="fixed inset-0 z-40 bg-white/60 flex items-center justify-center">
          <p className="text-sm text-slate-500 font-medium">{t('Loading available projects and clients...')}</p>
        </div>
      )}
    </div>
  );
};

export default CreateInvoicePage;