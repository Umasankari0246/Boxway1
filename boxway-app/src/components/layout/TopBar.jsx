import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Menu } from 'lucide-react';
import Icon from '../ui/Icon.jsx';

const api = axios.create({
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api'
    : 'https://boxxway.onrender.com/api',
});

const ROUTE_TITLES = {
  '/': 'Dashboard',
  '/employees': 'Employees',
  '/clients': 'Clients',
  '/projects': 'Projects',
  '/projects/new': 'New Project',
  '/proposals': 'Proposals',
  '/proposals/new': 'New Enquiry',
  '/proposals/review': 'Review Proposal',
  '/documents': 'Documents',
  '/invoices': 'Invoices',
  '/invoices/new': 'Create Invoice',
  '/invoices/review': 'Review Invoice',
  '/expenses': 'Expenses',
  '/payroll': 'Payroll',
  '/analytics': 'Analytics',
  '/ai-insights': 'AI Insights',
  '/settings': 'Settings',
};

const TopBar = ({ onToggleSidebar, isSidebarCollapsed, isMobileSidebarOpen }) => {
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
    if (pathname.startsWith('/projects/')) return 'Project Details';
    if (pathname.startsWith('/proposals/')) return 'Proposal Details';
    if (pathname.startsWith('/employees/')) return 'Employee Profile';
    if (pathname.startsWith('/clients/')) return 'Client Profile';
    if (pathname.startsWith('/payroll/')) return 'Payroll';
    return 'Boxway Studio';
  };

  const title = getPageTitle(location.pathname);

  const [timeStr, setTimeStr] = React.useState('10:42 AM');
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoicesRes, projectsRes, employeesRes, expensesRes] = await Promise.all([
          api.get('/invoices/'),
          api.get('/projects/'),
          api.get('/employees/'),
          api.get('/expenses/'),
        ]);
        
        const newNotifications = [];

        // Add invoice notifications
        invoicesRes.data.data.slice(0, 2).forEach(invoice => {
          newNotifications.push({
            id: `invoice-${invoice.id}`,
            title: `Invoice ${invoice.invoiceId || `#${invoice.id}`} ${invoice.status === 'Paid' ? 'has been paid' : 'pending approval'}`,
            time: 'Recently'
          });
        });

        // Add project notifications
        projectsRes.data.data.slice(0, 1).forEach(project => {
          newNotifications.push({
            id: `project-${project.id}`,
            title: `Project "${project.name}" updated`,
            time: 'Recently'
          });
        });

        // Add employee notifications
        employeesRes.data.data.slice(0, 1).forEach(employee => {
          newNotifications.push({
            id: `employee-${employee.id}`,
            title: `New employee joined: ${employee.firstName || 'Employee'} ${employee.lastName || ''}`,
            time: 'Recently'
          });
        });

        // Add expense notifications
        expensesRes.data.data.slice(0, 1).forEach(expense => {
          newNotifications.push({
            id: `expense-${expense.id}`,
            title: `Expense report "${expense.title || 'Expense'}" ${expense.status === 'Approved' ? 'approved' : 'pending approval'}`,
            time: 'Recently'
          });
        });

        setNotifications(newNotifications);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 md:px-8 bg-white border-b border-zinc-100 relative z-20">
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        {/* Toggle button: desktop collapses the sidebar, mobile opens/closes it. */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`p-2 border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors ${isSidebarCollapsed ? 'bg-zinc-50' : 'bg-white'}`}
          aria-label={isMobileSidebarOpen ? 'Close sidebar' : 'Toggle sidebar'}
        >
          <Menu className="h-5 w-5" />
        </button>
        <h2 className="text-base font-black uppercase tracking-tight">{title}</h2>
      </div>
      
      <div className="flex items-center gap-6 relative">
        <div className="text-xs font-bold text-zinc-400 tabular-nums uppercase">
          {timeStr}
        </div>
        <button
          onClick={() => setShowNotifications((prev) => !prev)}
          className="relative p-1 text-black hover:bg-zinc-50 transition-colors"
          aria-label="Toggle notifications"
        >
          <Icon name="notifications" className="h-6 w-6" />
        </button>
        {showNotifications && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-zinc-200 shadow-2xl shadow-black/10 rounded-2xl overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-zinc-100">
              <p className="text-xs font-bold uppercase text-zinc-500 tracking-[0.24em]">Notifications</p>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.map((notification) => (
                <div key={notification.id} className="px-4 py-3 hover:bg-zinc-50 transition-colors">
                  <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                  <p className="text-[11px] text-zinc-500 mt-1">{notification.time}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowNotifications(false)}
              className="w-full text-[11px] text-center py-3 text-primary font-bold uppercase border-t border-zinc-100 hover:bg-zinc-50 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
