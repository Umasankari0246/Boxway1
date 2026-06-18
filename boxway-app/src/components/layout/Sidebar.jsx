import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Icon from '../ui/Icon.jsx';

const Sidebar = () => {
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
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-base font-medium ${
          isActive
            ? 'bg-primary text-white font-bold shadow-lg shadow-primary/20'
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/10'
        }`
      }
    >
      <Icon name={icon} className="h-4 w-4" />
      <span className="truncate">{label}</span>
    </NavLink>
  );

  return (
    <aside className="w-72 flex-shrink-0 bg-zinc-900 text-white flex flex-col border-r border-white/5">
      {/* Logo */}
      <div className="p-6 flex items-center gap-4 border-b border-white/5">
        <div className="bg-primary text-white w-12 h-12 rounded-lg flex items-center justify-center shadow-lg shadow-primary/30 flex-shrink-0 font-bold text-xl">
          B
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-black tracking-tight text-white">BOXWAY</h1>
          <p className="text-xs text-zinc-400 uppercase tracking-widest font-semibold">STUDIO</p>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-5 space-y-6">
        {/* Overview */}
        <div>
          <p className="px-4 text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Overview</p>
          <div className="space-y-1">
            <NavItem to="/" icon="dashboard" label="Dashboard" exact />
            {isAdmin && <NavItem to="/employees" icon="group" label="Employees" />}
            <NavItem to="/clients" icon="person_pin" label="Clients" />
          </div>
        </div>

        {/* Studio */}
        <div>
          <p className="px-4 text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Studio</p>
          <div className="space-y-1">
            <NavItem to="/proposals" icon="description" label="Proposals" />
            <NavItem to="/projects" icon="architecture" label="Projects" />
            <NavItem to="/documents" icon="folder" label="Documents" />
          </div>
        </div>

        {/* Finance */}
        <div>
          <p className="px-4 text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Finance</p>
          <div className="space-y-1">
            <NavItem to="/invoices" icon="receipt_long" label="Invoices" />
            {isAdmin && <NavItem to="/expenses" icon="payments" label="Expenses" />}
            {isAdmin && <NavItem to="/payroll" icon="account_balance_wallet" label="Payroll" />}
          </div>
        </div>

        {/* Intelligence */}
        <div>
          <p className="px-4 text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Intelligence</p>
          <div className="space-y-1">
            <NavItem to="/analytics" icon="monitoring" label="Analytics" />
            <NavItem to="/ai-insights" icon="psychology" label="AI Insights" />
          </div>
        </div>

        {/* System */}
        <div>
          <p className="px-4 text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">System</p>
          <div className="space-y-1">
            <NavItem to="/settings" icon="settings" label="Settings" />
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate text-white">{user?.name}</p>
            <p className="text-xs text-zinc-500 uppercase tracking-wide">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1 text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
