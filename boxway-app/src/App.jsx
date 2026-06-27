import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';

// Auth
import LoginPage from './pages/LoginPage';

// Core
import DashboardPage from './pages/DashboardPage';

// Employees
import EmployeesPage from './pages/EmployeesPage';
import EmployeeProfilePage from './pages/employees/EmployeeProfilePage';
import NewEmployeePage from './pages/employees/NewEmployeePage';

// Clients
import ClientsPage from './pages/clients/ClientsPage';
import ClientProfilePage from './pages/clients/ClientProfilePage';
import NewClientPage from './pages/clients/NewClientPage';

// Studio
import ProjectsPage from './pages/studio/ProjectsPage';
import ProjectViewPage from './pages/studio/ProjectViewPage';
import NewProjectPage from './pages/studio/NewProjectPage';
import ProposalsPage from './pages/studio/ProposalsPage';
import NewProposalPage from './pages/studio/NewProposalPage';
import ReviewProposalPage from './pages/studio/ReviewProposalPage';
import ViewProposalPage from './pages/studio/ViewProposalPage';
import DocumentsPage from './pages/studio/DocumentsPage';

// Finance
import InvoicesPage from './pages/InvoicesPage';
import CreateInvoicePage from './pages/CreateInvoicePage';
import ReviewInvoicePage from './pages/ReviewInvoicePage';
import ExpensesPage from './pages/finance/ExpensesPage';

// Payroll
import PayrollPage from './pages/payroll/PayrollPage';
import SinglePayrollStep1 from './pages/payroll/single/Step1';
import SinglePayrollStep2 from './pages/payroll/single/Step2';
import SinglePayrollStep3 from './pages/payroll/single/Step3';
import MultiPayrollStep1 from './pages/payroll/multi/Step1';
import MultiPayrollStep2 from './pages/payroll/multi/Step2';
import MultiPayrollStep3 from './pages/payroll/multi/Step3';

// Intelligence
import AnalyticsPage from './pages/intelligence/AnalyticsPage';
import AIInsightsPage from './pages/intelligence/AIInsightsPage';

// Settings
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Layout */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          
          {/* Employees */}
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="employees/new" element={<NewEmployeePage />} />
          <Route path="employees/:id/edit" element={<NewEmployeePage />} />
          <Route path="employees/:id" element={<EmployeeProfilePage />} />

          {/* Clients */}
          <Route path="clients" element={<ClientsPage />} />
          <Route path="clients/new" element={<NewClientPage />} />
          <Route path="clients/:id/edit" element={<NewClientPage />} />
          <Route path="clients/:id" element={<ClientProfilePage />} />

          {/* Studio */}
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/new" element={<NewProjectPage />} />
          <Route path="projects/:id/edit" element={<NewProjectPage />} />
          <Route path="projects/:id" element={<ProjectViewPage />} />
          <Route path="proposals" element={<ProposalsPage />} />
          <Route path="proposals/new" element={<NewProposalPage />} />
          <Route path="proposals/:id/edit" element={<NewProposalPage />} />
          <Route path="proposals/review" element={<ReviewProposalPage />} />
          <Route path="proposals/:id" element={<ViewProposalPage />} />
          <Route path="documents" element={<DocumentsPage />} />

          {/* Finance */}
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="invoices/new" element={<CreateInvoicePage />} />
          <Route path="invoices/review" element={<ReviewInvoicePage />} />
          <Route path="expenses" element={<ExpensesPage />} />

          {/* Payroll */}
          <Route path="payroll" element={<PayrollPage />} />
          <Route path="payroll/run/single/step1" element={<SinglePayrollStep1 />} />
          <Route path="payroll/run/single/step2" element={<SinglePayrollStep2 />} />
          <Route path="payroll/run/single/step3" element={<SinglePayrollStep3 />} />
          <Route path="payroll/run/multi/step1" element={<MultiPayrollStep1 />} />
          <Route path="payroll/run/multi/step2" element={<MultiPayrollStep2 />} />
          <Route path="payroll/run/multi/step3" element={<MultiPayrollStep3 />} />

          {/* Intelligence */}
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="ai-insights" element={<AIInsightsPage />} />

          {/* Settings */}
          <Route path="settings" element={<SettingsPage />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
