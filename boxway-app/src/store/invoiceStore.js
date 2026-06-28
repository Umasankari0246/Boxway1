import { create } from 'zustand';

export const useInvoiceStore = create((set) => ({
  invoiceData: {
    issueDate: '',
    dueDate: '',
    projectLink: '',
    projectId: '',
    clientId: '',
    clientName: '',
    billingAddress: '',
    gstin: '',
    contactPerson: '',
    items: [],
    paymentTerms: '',
    attachments: [],
    authorizedSignature: '',
    notes: ''
  },
  updateField: (field, value) => set((state) => ({
    invoiceData: { ...state.invoiceData, [field]: value }
  })),
  updateItem: (id, field, value) => set((state) => ({
    invoiceData: {
      ...state.invoiceData,
      items: state.invoiceData.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }
  })),
  addItem: (item = { id: Date.now(), description: '', hsn: '', qty: 1, rate: 0, disc: 0 }) => set((state) => ({
    invoiceData: {
      ...state.invoiceData,
      items: [...state.invoiceData.items, item]
    }
  })),
  removeItem: (id) => set((state) => ({
    invoiceData: {
      ...state.invoiceData,
      items: state.invoiceData.items.filter(item => item.id !== id)
    }
  })),
  resetInvoice: () => set({
    invoiceData: {
      issueDate: '', dueDate: '', projectLink: '', clientName: '', billingAddress: '',
      gstin: '', contactPerson: '', items: [], paymentTerms: '', notes: ''
    }
  })
}));
