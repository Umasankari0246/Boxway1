import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoiceStore } from '../store/invoiceStore';
import axios from 'axios';
import Icon from "../components/ui/Icon.jsx"

window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'https://boxxway.onrender.com'

const CreateInvoicePage = () => {
  const navigate = useNavigate();
  const { invoiceData, updateField, updateItem, addItem, removeItem, resetInvoice } = useInvoiceStore();
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItem, setNewItem] = useState({ description: '', hsn: '', qty: 1, rate: 0, disc: 0 });

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

  const handleSaveDraft = async () => {
    try {
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
        client: invoiceData.client || 'Unknown Client',
        project: invoiceData.project || 'Unknown Project',
        date: invoiceData.issueDate || new Date().toISOString().split('T')[0],
        amount: total,
        status: 'Draft',
        dueDate: invoiceData.dueDate,
        notes: invoiceData.notes,
      };

      await api.post('/invoices/', invoicePayload);
      alert('Invoice saved as draft!');
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

  const handleFileUpload = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      alert(`Uploaded ${files.length} file(s)`);
    }
  };

  const handleAddItemModal = () => {
    if (newItem.description && newItem.rate > 0) {
      addItem();
      updateItem(invoiceData.items[invoiceData.items.length - 1].id, 'description', newItem.description);
      updateItem(invoiceData.items[invoiceData.items.length - 1].id, 'hsn', newItem.hsn);
      updateItem(invoiceData.items[invoiceData.items.length - 1].id, 'qty', newItem.qty);
      updateItem(invoiceData.items[invoiceData.items.length - 1].id, 'rate', newItem.rate);
      updateItem(invoiceData.items[invoiceData.items.length - 1].id, 'disc', newItem.disc);
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
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Invoice Number</label>
            <div className="text-slate-900 font-mono font-semibold">{generateInvoiceNumber()}</div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Issue Date</label>
            <input 
              className="w-full text-sm border-slate-200 rounded focus:ring-primary focus:border-primary" 
              type="date" 
              value={invoiceData.issueDate}
              onChange={(e) => updateField('issueDate', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Due Date</label>
            <input 
              className="w-full text-sm border-slate-200 rounded focus:ring-primary focus:border-primary" 
              type="date" 
              value={invoiceData.dueDate}
              onChange={(e) => updateField('dueDate', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Project Link</label>
            <select 
              className="w-full text-sm border-slate-200 rounded focus:ring-primary focus:border-primary"
              value={invoiceData.projectLink}
              onChange={(e) => updateField('projectLink', e.target.value)}
            >
              <option>The Urban Loft - Interior Design</option>
              <option>Skye Residency - Facade</option>
              <option>Harbor Hotel Renovation</option>
            </select>
          </div>
        </div>

        {/* Details Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Firm Details (Read-only) */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">From: BOXWAY STUDIO</h3>
              <Icon name="lock" className="text-slate-300 text-sm" />
            </div>
            <div className="space-y-2 text-sm text-slate-600">
              <p className="font-bold text-slate-900">Boxway Studio Architects</p>
              <p>Suite 402, Creative Hub, South Industrial Park</p>
              <p>Mumbai, Maharashtra, 400013</p>
              <div className="pt-2">
                <p className="text-[10px] text-slate-400 uppercase font-bold">GSTIN</p>
                <p className="font-mono">27AAAAA0000A1Z5</p>
              </div>
              <div className="pt-2">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Contact</p>
                <p>accounts@boxwaystudio.com | +91 22 4567 8900</p>
              </div>
            </div>
          </div>
          
          {/* Client Details Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest">Bill To: Client</h3>
              <button className="text-[10px] text-primary hover:underline font-bold">SEARCH CLIENT</button>
            </div>
            <div className="space-y-4">
              <input 
                className="w-full text-sm border-slate-200 rounded focus:ring-primary focus:border-primary" 
                placeholder="Client Name" type="text" 
                value={invoiceData.clientName}
                onChange={(e) => updateField('clientName', e.target.value)}
              />
              <textarea 
                className="w-full text-sm border-slate-200 rounded focus:ring-primary focus:border-primary" 
                placeholder="Billing Address" rows="2"
                value={invoiceData.billingAddress}
                onChange={(e) => updateField('billingAddress', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <input 
                  className="w-full text-sm border-slate-200 rounded focus:ring-primary focus:border-primary" 
                  placeholder="GSTIN" type="text" 
                  value={invoiceData.gstin}
                  onChange={(e) => updateField('gstin', e.target.value)}
                />
                <input 
                  className="w-full text-sm border-slate-200 rounded focus:ring-primary focus:border-primary" 
                  placeholder="Contact Person" type="text" 
                  value={invoiceData.contactPerson}
                  onChange={(e) => updateField('contactPerson', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-800">Invoice Items</h3>
            <button
              onClick={() => setShowAddItemModal(true)}
              className="flex items-center gap-1 text-primary text-xs font-bold hover:opacity-80 transition-opacity"
            >
              <Icon name="add" className="text-sm" /> ADD LINE ITEM
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Description</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase w-28">HSN/SAC</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase w-20">Qty</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase w-32">Rate</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase w-20">Disc %</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase w-32 text-right">Amount</th>
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
                        ₹{discountedAmount.toFixed(2)}
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
              <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Payment Terms</label>
              <select className="w-full text-sm border-slate-200 rounded focus:ring-primary focus:border-primary mb-3"
                value={invoiceData.paymentTerms} onChange={(e) => updateField('paymentTerms', e.target.value)}>
                <option>Consultation Template</option>
                <option>Turnkey Project Template</option>
                <option>Custom Terms</option>
              </select>
              <textarea className="w-full text-xs border-slate-100 bg-slate-50 rounded focus:ring-primary focus:border-primary" rows="3" readOnly defaultValue={"1. Payment to be made within 15 days of invoice date.\n2. Mode of payment: Bank Transfer / NEFT only.\n3. Delayed payments attract 2% interest per month."}></textarea>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Notes & Attachments</label>
              <textarea 
                className="w-full text-sm border-slate-200 rounded focus:ring-primary focus:border-primary mb-4" 
                placeholder="Add a note..." rows="2"
                value={invoiceData.notes} onChange={(e) => updateField('notes', e.target.value)}
              />
              <div className="border-2 border-dashed border-slate-100 rounded-lg p-6 text-center group cursor-pointer hover:border-primary/50 transition-colors">
                <input type="file" multiple onChange={handleFileUpload} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Icon name="cloud_upload" className="text-slate-300 group-hover:text-primary mb-2" />
                  <p className="text-[10px] text-slate-400 font-medium">Click to upload receipts or supporting documents</p>
                </label>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">CGST (9%)</span>
                  <Icon name="info" className="text-[14px] text-slate-300" />
                </div>
                <span className="font-medium">₹{cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">SGST (9%)</span>
                  <Icon name="info" className="text-[14px] text-slate-300" />
                </div>
                <span className="font-medium">₹{sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm opacity-50">
                <span className="text-slate-500">IGST (0%)</span>
                <span className="font-medium">₹0.00</span>
              </div>
            </div>
            <div className="bg-slate-900 p-6">
              <div className="flex justify-between items-end mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Amount Payable</span>
                <span className="text-2xl font-bold text-white tracking-tight">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sticky Footer Action Bar */}
      <footer className="h-20 bg-white border-t border-slate-200 fixed bottom-0 left-60 right-0 z-20 px-8 flex items-center justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-4">
          <button onClick={handleDiscard} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium">
            <Icon name="delete" className="text-lg" />
            Discard
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleSaveDraft} className="px-6 py-2 border border-slate-300 rounded font-medium text-slate-600 hover:bg-slate-50 transition-colors text-sm">
            Save as Draft
          </button>
          <button onClick={handleNext} className="px-8 py-2 bg-primary text-white rounded font-bold hover:opacity-90 transition-opacity text-sm flex items-center gap-2 cursor-pointer">
            Preview Invoice
            <Icon name="visibility" className="text-sm" />
          </button>
        </div>
      </footer>

      {/* Add Line Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowAddItemModal(false)}>
          <div className="bg-white p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black uppercase tracking-tight mb-4">Add Line Item</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
                <input
                  className="w-full text-sm border-slate-200 rounded focus:ring-primary focus:border-primary"
                  type="text"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Item description"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">HSN/SAC</label>
                <input
                  className="w-full text-sm border-slate-200 rounded focus:ring-primary focus:border-primary"
                  type="text"
                  value={newItem.hsn}
                  onChange={(e) => setNewItem({ ...newItem, hsn: e.target.value })}
                  placeholder="HSN/SAC code"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Quantity</label>
                  <input
                    className="w-full text-sm border-slate-200 rounded focus:ring-primary focus:border-primary"
                    type="number"
                    value={newItem.qty}
                    onChange={(e) => setNewItem({ ...newItem, qty: Number(e.target.value) })}
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Rate</label>
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
              <button onClick={() => setShowAddItemModal(false)} className="flex-1 py-2.5 border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50">Cancel</button>
              <button onClick={handleAddItemModal} className="flex-1 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90">Add Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateInvoicePage;