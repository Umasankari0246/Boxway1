import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Menu } from 'lucide-react';
import Icon from '../ui/Icon.jsx';
import { useTranslation } from '../../store/settingsStore';
import { useFormatters } from '../../store/settingsStore';

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

const NOTIFICATION_READ_KEY = 'boxway.topbar.readNotifications';

const TopBar = ({ onToggleSidebar, isSidebarCollapsed, isMobileSidebarOpen }) => {
  const { formatCurrency, formatDate } = useFormatters();

  const { t } = useTranslation();

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

  const getReadNotificationIds = () => {
    try {
      const storedValue = window.localStorage.getItem(NOTIFICATION_READ_KEY);
      const parsedValue = storedValue ? JSON.parse(storedValue) : [];
      return new Set(Array.isArray(parsedValue) ? parsedValue : []);
    } catch {
      return new Set();
    }
  };

  const saveReadNotificationIds = (readNotificationIds) => {
    window.localStorage.setItem(NOTIFICATION_READ_KEY, JSON.stringify(Array.from(readNotificationIds)));
  };

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
        const readNotificationIds = getReadNotificationIds();

        // Add invoice notifications
        invoicesRes.data.data.slice(0, 2).forEach(invoice => {
          newNotifications.push({
            id: `invoice-${invoice.id}`,
            title: `Invoice ${invoice.invoiceId || `#${invoice.id}`} ${invoice.status === 'Paid' ? 'has been paid' : 'pending approval'}`,
            content: `Client: ${invoice.client || 'Client'} · Status: ${invoice.status || 'Unknown'}`,
            time: 'Recently'
            , unread: !readNotificationIds.has(`invoice-${invoice.id}`)
          });
        });

        // Add project notifications
        projectsRes.data.data.slice(0, 1).forEach(project => {
          newNotifications.push({
            id: `project-${project.id}`,
            title: `Project "${project.name}" updated`,
            content: `Status: ${project.status || 'Unknown'} · Budget: ${project.budget ? formatCurrency(project.budget) : '—'}`,
            time: 'Recently'
            , unread: !readNotificationIds.has(`project-${project.id}`)
          });
        });

        // Add employee notifications
        employeesRes.data.data.slice(0, 1).forEach(employee => {
          newNotifications.push({
            id: `employee-${employee.id}`,
            title: `New employee joined: ${employee.firstName || 'Employee'} ${employee.lastName || ''}`,
            content: `Role: ${employee.role || 'Team Member'} · Department: ${employee.department || 'General'}`,
            time: 'Recently'
            , unread: !readNotificationIds.has(`employee-${employee.id}`)
          });
        });

        // Add expense notifications
        expensesRes.data.data.slice(0, 1).forEach(expense => {
          newNotifications.push({
            id: `expense-${expense.id}`,
            title: `Expense report "${expense.title || 'Expense'}" ${expense.status === 'Approved' ? 'approved' : 'pending approval'}`,
            content: `Amount: ${expense.amount ? formatCurrency(expense.amount) : '—'} · Submitted by: ${expense.submittedBy || 'User'}`,
            time: 'Recently'
            , unread: !readNotificationIds.has(`expense-${expense.id}`)
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

  const unreadCount = notifications.filter(notification => notification.unread).length;

  const markNotificationAsRead = (notificationId) => {
    const readNotificationIds = getReadNotificationIds();
    readNotificationIds.add(notificationId);
    saveReadNotificationIds(readNotificationIds);
    setNotifications(currentNotifications =>
      currentNotifications.map(notification =>
        notification.id === notificationId ? { ...notification, unread: false } : notification
      )
    );
  };

  const getNotificationIcon = (type) => {
    if (type === 'invoice') return 'receipt';
    if (type === 'expense') return 'payments';
    if (type === 'employee') return 'group';
    if (type === 'project') return 'architecture';
    return 'box';
  };

  const getNotificationBadgeClass = (type, unread) => {
    const base = unread ? 'text-white' : 'text-white/90';
    if (type === 'invoice') return `${base} bg-emerald-500`;
    if (type === 'expense') return `${base} bg-teal-500`;
    if (type === 'employee') return `${base} bg-zinc-500`;
    if (type === 'project') return `${base} bg-primary`;
    return `${base} bg-slate-500`;
  };

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
          aria-label={t('Toggle notifications')}
        >
          <Icon name="notifications" className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
        {showNotifications && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-zinc-200 shadow-2xl shadow-black/10 rounded-2xl overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
              <p className="text-xs font-bold uppercase text-zinc-500 tracking-[0.24em]">{t('Notifications')}</p>
              <span className="min-w-6 h-6 px-2 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center">
                {unreadCount}
              </span>
            </div>
            <div className="max-h-80 overflow-y-auto p-3 space-y-3 bg-zinc-50/60">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => markNotificationAsRead(notification.id)}
                  className={`w-full text-left flex items-start gap-3 p-4 rounded-lg border transition-colors ${notification.unread ? 'bg-white border-zinc-100 shadow-sm' : 'bg-zinc-50 border-zinc-100 opacity-80'} hover:shadow-sm`}
                >
                  <div className={`w-11 h-11 rounded-full shrink-0 flex items-center justify-center ${getNotificationBadgeClass(notification.type, notification.unread)}`}>
                    <Icon name={getNotificationIcon(notification.type)} className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className={`text-sm font-bold leading-5 ${notification.unread ? 'text-slate-950' : 'text-slate-700'}`}>{notification.title}</p>
                      {notification.unread && <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary shrink-0" />}
                    </div>
                    {notification.content && <p className="text-[11px] text-zinc-500 mt-1 leading-4">{notification.content}</p>}
                    <p className="text-[11px] text-zinc-400 font-bold uppercase mt-2 tracking-wide">{notification.time}</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowNotifications(false)}
              className="w-full text-[11px] text-center py-3 text-primary font-bold uppercase border-t border-zinc-100 hover:bg-zinc-50 transition-colors"
            >{t('Close')}</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
