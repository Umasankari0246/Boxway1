import { create } from 'zustand';

export const useInvoiceStore = create((set) => ({
  invoiceData: {
    issueDate: '2023-10-24',
    dueDate: '2023-11-07',
    projectLink: 'The Urban Loft - Interior Design',
    clientName: 'Modern Living Co.',
    billingAddress: '12th Floor, Corporate Heights, BKC, Mumbai 400051',
    gstin: '27BBBBB1234B1Z2',
    contactPerson: 'Mr. Rahul Khanna',
    items: [
      { id: 1, description: 'Phase 1: Conceptual Design & Layouts', hsn: '9983', qty: 1, rate: 45000, disc: 0 },
      { id: 2, description: 'On-site Consultation Fee (2 Visits)', hsn: '9983', qty: 2, rate: 5000, disc: 10 }
    ],
    paymentTerms: 'Consultation Template',
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
  addItem: () => set((state) => ({
    invoiceData: {
      ...state.invoiceData,
      items: [
        ...state.invoiceData.items, 
        { id: Date.now(), description: '', hsn: '', qty: 1, rate: 0, disc: 0 }
      ]
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
