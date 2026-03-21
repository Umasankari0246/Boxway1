import React from 'react';
import { useLocation } from 'react-router-dom';

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

const TopBar = () => {
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

  // Auto updating mock time
  const [timeStr, setTimeStr] = React.useState('10:42 AM');
  
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
    <header className="h-14 flex-shrink-0 flex items-center justify-between px-8 bg-white border-b border-zinc-100">
      <div className="flex items-center gap-4">
        <h2 className="text-base font-black uppercase tracking-tight">{title}</h2>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="text-xs font-bold text-zinc-400 tabular-nums uppercase">
          {timeStr}
        </div>
        <button className="relative p-1 text-black hover:bg-zinc-50 transition-colors">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full"></span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
