import React from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';

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

  const [timeStr, setTimeStr] = React.useState('10:42 AM');
  const [showNotifications, setShowNotifications] = React.useState(false);

  const notifications = [
    { id: 1, title: 'New project milestone due', time: '2 hrs ago' },
    { id: 2, title: 'Invoice #INV-032 pending approval', time: '5 hrs ago' },
    { id: 3, title: 'Client meeting scheduled for tomorrow', time: '1 day ago' },
  ];

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
