import { create } from 'zustand';

export const usePayrollStore = create((set, get) => ({
  // Single payroll run flow state
  singleRun: {
    step: 1,
    selectedEmployee: null,
    salarySetup: {},
    confirmed: false,
  },
  
  // Multi payroll run flow state
  multiRun: {
    step: 1,
    selectedEmployees: [],
    payrollConfig: {},
    confirmed: false,
  },

  setSingleStep: (step) => set(s => ({ singleRun: { ...s.singleRun, step } })),
  setSingleEmployee: (emp) => set(s => ({ singleRun: { ...s.singleRun, selectedEmployee: emp, step: 2 } })),
  setSingleSalarySetup: (data) => set(s => ({ singleRun: { ...s.singleRun, salarySetup: data, step: 3 } })),
  confirmSingleRun: () => set(s => ({ singleRun: { ...s.singleRun, confirmed: true } })),
  resetSingleRun: () => set({ singleRun: { step: 1, selectedEmployee: null, salarySetup: {}, confirmed: false } }),

  setMultiStep: (step) => set(s => ({ multiRun: { ...s.multiRun, step } })),
  setMultiEmployees: (emps) => set(s => ({ multiRun: { ...s.multiRun, selectedEmployees: emps, step: 2 } })),
  setMultiPayrollConfig: (data) => set(s => ({ multiRun: { ...s.multiRun, payrollConfig: data, step: 3 } })),
  confirmMultiRun: () => set(s => ({ multiRun: { ...s.multiRun, confirmed: true } })),
  resetMultiRun: () => set({ multiRun: { step: 1, selectedEmployees: [], payrollConfig: {}, confirmed: false } }),
}));
