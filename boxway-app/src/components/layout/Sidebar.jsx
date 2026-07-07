import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Icon from '../ui/Icon.jsx';
import { useTranslation } from '../../store/settingsStore';
import { useFormatters } from '../../store/settingsStore';

const Sidebar = ({ isCollapsed = false, isMobileOpen = false, onCloseMobile, widthClass = 'md:w-[250px]' }) => {
  const { formatCurrency, formatDate } = useFormatters();

  const { t } = useTranslation();

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'Admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavItem = ({ to, icon, label, exact = false }) => (
    <NavLink
      to={to}
      end={exact}
      onClick={onCloseMobile}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-base font-medium ${
          isActive
            ? 'bg-primary text-white font-bold shadow-lg shadow-primary/20'
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/10'
        }`
      }
    >
      <Icon name={icon} className="h-4 w-4" />
      {/* Hide the label text when collapsed on desktop, but keep the icon visible. */}
      <span className={`truncate transition-all duration-300 ${isCollapsed ? 'md:max-w-0 md:opacity-0 md:overflow-hidden md:whitespace-nowrap' : 'md:max-w-[160px] md:opacity-100'}`}>
        {label}
      </span>
    </NavLink>
  );

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-shrink-0 flex-col border-r border-white/5 bg-zinc-900 text-white transition-[width,transform] duration-300 ease-in-out ${widthClass} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
    >
      {/* Logo */}
      <div className={`border-b border-white/5 transition-all duration-300 ${isCollapsed ? 'px-3 py-6 md:justify-center' : 'p-6 flex items-center gap-4'}`}>
        <div className="bg-primary text-white w-12 h-12 rounded-lg flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0 font-bold text-xl">
          B
        </div>
        <div className={`min-w-0 transition-all duration-300 ${isCollapsed ? 'md:max-w-0 md:opacity-0 md:overflow-hidden md:hidden' : ''}`}>
          <h1 className="text-lg font-black tracking-tight text-white">{t('BOXWAY')}</h1>
          <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">{t('STUDIO')}</p>
        </div>
      </div>
      
      <nav className={`flex-1 overflow-y-auto no-scrollbar py-5 space-y-6 transition-all duration-300 ${isCollapsed ? 'px-2 md:px-2' : 'px-3'}`}>
        {/* Overview */}
        <div>
          <p className={`px-4 text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 transition-all duration-300 ${isCollapsed ? 'md:hidden' : ''}`}>{t('Overview')}</p>
          <div className="space-y-1">
            <NavItem to="/" icon="dashboard" label={t('Dashboard')} exact />
            {isAdmin && <NavItem to="/employees" icon="group" label={t('Employees')} />}
            <NavItem to="/clients" icon="person_pin" label={t('Clients')} />
          </div>
        </div>

        {/* Studio */}
        <div>
          <p className={`px-4 text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 transition-all duration-300 ${isCollapsed ? 'md:hidden' : ''}`}>{t('Studio')}</p>
          <div className="space-y-1">
            <NavItem to="/proposals" icon="description" label={t('Proposals')} />
            <NavItem to="/projects" icon="architecture" label={t('Projects')} />
            <NavItem to="/documents" icon="folder" label={t('Documents')} />
          </div>
        </div>

        {/* Finance */}
        <div>
          <p className={`px-4 text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 transition-all duration-300 ${isCollapsed ? 'md:hidden' : ''}`}>{t('Finance')}</p>
          <div className="space-y-1">
            <NavItem to="/invoices" icon="receipt_long" label={t('Invoices')} />
            {isAdmin && <NavItem to="/expenses" icon="payments" label={t('Expenses')} />}
            {isAdmin && <NavItem to="/payroll" icon="account_balance_wallet" label={t('Payroll')} />}
          </div>
        </div>

        {/* Intelligence */}
        <div>
          <p className={`px-4 text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 transition-all duration-300 ${isCollapsed ? 'md:hidden' : ''}`}>{t('Intelligence')}</p>
          <div className="space-y-1">
            <NavItem to="/analytics" icon="monitoring" label={t('Analytics')} />
            <NavItem to="/ai-insights" icon="psychology" label={t('AI Insights')} />
          </div>
        </div>

        {/* System */}
        <div>
          <p className={`px-4 text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3 transition-all duration-300 ${isCollapsed ? 'md:hidden' : ''}`}>{t('System')}</p>
          <div className="space-y-1">
            <NavItem to="/settings" icon="settings" label={t('Settings')} />
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/5">
        <div className={`flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group ${isCollapsed ? 'md:justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0)}
          </div>
          <div className={`flex-1 min-w-0 transition-all duration-300 ${isCollapsed ? 'md:hidden' : ''}`}>
            <p className="text-sm font-bold truncate text-white">{user?.name}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wide">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className={`p-1 text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 ${isCollapsed ? 'md:absolute md:bottom-4 md:right-4' : ''}`}
            title={t('Logout')}
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
