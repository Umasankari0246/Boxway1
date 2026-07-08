import React from 'react';
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

const ReviewInvoicePage = () => {
  const { formatCurrency, formatDate } = useFormatters();

  const { t } = useTranslation();

  const navigate = useNavigate();
  const { invoiceData, resetInvoice } = useInvoiceStore();

  // Generate dynamic invoice number
  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `#INV-${year}-${month}-${random}`;
  };

  const handleBack = () => navigate('/invoices/new');

  const handleSaveDraft = () => {
    alert('Invoice saved as draft!');
  };

  const handleConfirm = async () => {
    // Generate and save the invoice
    const subtotal = invoiceData.items.reduce((acc, item) => {
      const amount = item.qty * item.rate;
      const discountAmount = amount * (item.disc / 100);
      return acc + (amount - discountAmount);
    }, 0);

    const cgst = subtotal * 0.09;
    const sgst = subtotal * 0.09;
    const total = subtotal + cgst + sgst;

    const invoiceNumber = generateInvoiceNumber();

    const newInvoice = {
      id: invoiceNumber,
      invoiceId: invoiceNumber,
      clientId: invoiceData.clientId || '',
      client: invoiceData.clientName || '',
      projectId: invoiceData.projectId || '',
      project: invoiceData.projectLink || '',
      date: invoiceData.issueDate || '',
      amount: total,
      status: 'Pending',
      dueDate: invoiceData.dueDate || '',
      notes: invoiceData.notes || '',
      paymentTerms: invoiceData.paymentTerms || '',
      clientName: invoiceData.clientName || '',
      billingAddress: invoiceData.billingAddress || '',
      gstin: invoiceData.gstin || '',
      contactPerson: invoiceData.contactPerson || '',
      items: invoiceData.items || [],
      attachments: invoiceData.attachments || [],
      authorizedSignature: invoiceData.authorizedSignature || ''
    };

    try {
      await api.post('/invoices/', newInvoice);
        alert('Invoice generated successfully!');
        resetInvoice();
        navigate('/invoices');
    } catch (err) {
      console.error('Error generating invoice:', err);
      alert('Failed to generate invoice. Please try again.');
    }
  };

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
      className="flex-1 overflow-y-auto p-8 pb-32 flex justify-center bg-[#f7f7f6]"
      style={{ '--color-primary': '#e11d48', '--color-sidebar': '#111827' }}
    >
      {/* PDF Style Invoice */}
      <div className="w-full max-w-[850px] bg-white print-shadow rounded border border-slate-200 p-12 min-h-[1100px] flex flex-col mb-10 shadow-lg" style={{ boxShadow: '0 0 40px rgba(0, 0, 0, 0.05)' }}>
        {/* Invoice Header */}
        <div className="flex justify-between items-start mb-16">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="size-8 bg-slate-900 rounded flex items-center justify-center text-white">
                <Icon name="box" className="!text-[18px]" />
              </div>
              <span className="font-black text-xl tracking-tighter uppercase">{t('Boxway Studio')}</span>
            </div>
            <div className="text-sm text-slate-500 leading-relaxed">
              <p>123 Creative Avenue, Suite 400</p>
              <p>{t('New York, NY 10001')}</p>
              <p>billing@boxway.studio</p>
              <p>+1 (555) 000-1234</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-4xl font-black text-slate-900 mb-2">{t('INVOICE')}</h1>
            <p className="text-slate-500 font-medium">{generateInvoiceNumber()}</p>
          </div>
        </div>

        {/* Invoice Meta */}
        <div className="grid grid-cols-2 gap-12 mb-16 pb-12 border-b border-slate-100">
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{t('Bill To:')}</h4>
            <div className="text-slate-900">
              <p className="font-bold text-lg">{invoiceData.clientName || ''}</p>
              <div className="text-sm text-slate-500 mt-1 space-y-0.5">
                  <p>{invoiceData.contactPerson || ''}</p>
                  <p>{invoiceData.billingAddress || ''}</p>
                  <p>GSTIN: {invoiceData.gstin || ''}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-end items-end text-right">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <span className="text-slate-400 font-medium">{t('Issue Date:')}</span>
              <span className="text-slate-900 font-semibold">{invoiceData.issueDate || ''}</span>
              <span className="text-slate-400 font-medium">{t('Due Date:')}</span>
              <span className="text-slate-900 font-semibold">{invoiceData.dueDate || ''}</span>
              <span className="text-slate-400 font-medium">{t('Project ID:')}</span>
              <span className="text-slate-900 font-semibold">{invoiceData.projectLink || ''}</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900">
                <th className="py-4 text-xs font-black uppercase tracking-wider text-slate-900 w-1/2">{t('Description')}</th>
                <th className="py-4 text-xs font-black uppercase tracking-wider text-slate-900 text-center">{t('Qty')}</th>
                <th className="py-4 text-xs font-black uppercase tracking-wider text-slate-900 text-right">{t('Unit Price')}</th>
                <th className="py-4 text-xs font-black uppercase tracking-wider text-slate-900 text-right">{t('Amount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoiceData.items.map(item => {
                const amount = item.qty * item.rate;
                const finalAmt = amount - (amount * (item.disc / 100));
                return (
                  <tr key={item.id}>
                    <td className="py-6">
                      <p className="font-bold text-slate-900">{item.description}</p>
                    </td>
                    <td className="py-6 text-center text-sm font-medium text-slate-700">{item.qty}</td>
                    <td className="py-6 text-right text-sm font-medium text-slate-700">{formatCurrency(item.rate.toFixed(2))}</td>
                    <td className="py-6 text-right text-sm font-bold text-slate-900">{formatCurrency(finalAmt.toFixed(2))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="mt-12 flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{t('Subtotal:')}</span>
              <span className="text-slate-900 font-medium">{formatCurrency(subtotal.toFixed(2))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">CGST (9%):</span>
              <span className="text-slate-900 font-medium">{formatCurrency(cgst.toFixed(2))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">SGST (9%):</span>
              <span className="text-slate-900 font-medium">{formatCurrency(sgst.toFixed(2))}</span>
            </div>
            <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-center">
              <span className="text-sm font-black uppercase text-slate-900">{t('Total Due:')}</span>
              <span className="text-2xl font-black text-primary">{formatCurrency(total.toFixed(2))}</span>
            </div>
          </div>
        </div>

        {/* Notes & Declaration */}
        <div className="mt-20 pt-12 border-t border-slate-100">
          <div className="grid grid-cols-2 gap-12">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4">{t('Payment Terms')}</h4>
              <textarea
                className="w-full text-xs text-slate-500 leading-relaxed italic border-none p-0 resize-none focus:outline-none focus:ring-0"
                rows="4"
                value={invoiceData.paymentTerms || ''}
                onChange={(e) => {
                  // Since this is a preview page, we need to update the store
                  const { updateField } = useInvoiceStore.getState();
                  updateField('paymentTerms', e.target.value);
                }}
              />
            </div>
            <div className="text-right">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4">{t('Declaration')}</h4>
              <textarea
                className="w-full text-xs text-slate-500 leading-relaxed italic border-none p-0 resize-none focus:outline-none focus:ring-0 text-right"
                rows="4"
                value={invoiceData.notes || ''}
                onChange={(e) => {
                  const { updateField } = useInvoiceStore.getState();
                  updateField('notes', e.target.value);
                }}
              />
              <div className="mt-6 inline-block border-b border-slate-900 w-48 h-10"></div>
              <input
                type="text"
                className="text-[10px] uppercase font-bold text-slate-400 mt-2 border-none p-0 text-right focus:outline-none focus:ring-0 w-full"
                value={invoiceData.authorizedSignature || ''}
                onChange={(e) => {
                  const { updateField } = useInvoiceStore.getState();
                  updateField('authorizedSignature', e.target.value);
                }}
                placeholder={t('Authorized Signature')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer Action Bar */}
      <footer className="fixed bottom-0 left-60 right-0 h-24 bg-white border-t border-slate-200 px-8 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-50">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="flex items-center gap-2 px-6 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg font-bold text-sm transition-all cursor-pointer">
            <Icon name="edit" />{t('Back to Edit')}</button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSaveDraft} className="px-6 py-3 text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold text-sm transition-all">{t('Save as Draft')}</button>
          <button onClick={handleConfirm} className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-rose-700 text-white rounded-lg font-black text-sm uppercase tracking-wide shadow-lg shadow-rose-200 transition-all active:scale-95 cursor-pointer">
            <Icon name="send" />{t('Confirm & Generate')}</button>
        </div>
      </footer>
    </div>
  );
};

export default ReviewInvoicePage;