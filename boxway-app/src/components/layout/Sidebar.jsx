import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

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
        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
          isActive
            ? 'bg-primary text-white font-semibold shadow-lg shadow-primary/20'
            : 'text-zinc-400 hover:text-white hover:bg-white/5'
        }`
      }
    >
      <span className="material-symbols-outlined text-[20px] shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </NavLink>
  );

  return (
    <aside className="w-60 flex-shrink-0 bg-zinc-900 text-white flex flex-col border-r border-white/5">
      {/* Logo */}
      <div className="p-5 flex items-center gap-3 border-b border-white/5">
        <div className="bg-primary text-white w-9 h-9 rounded-lg flex items-center justify-center shadow-lg shadow-primary/30">
          <span className="material-symbols-outlined text-[18px] font-bold">grid_view</span>
        </div>
        <div>
          <h1 className="text-sm font-black tracking-tight text-white">BOXWAY STUDIO</h1>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Admin Console</p>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-5">
        {/* Overview */}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Overview</p>
          <div className="space-y-0.5">
            <NavItem to="/" icon="dashboard" label="Dashboard" exact />
            {isAdmin && <NavItem to="/employees" icon="group" label="Employees" />}
            <NavItem to="/clients" icon="person_pin" label="Clients" />
          </div>
        </div>

        {/* Studio */}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Studio</p>
          <div className="space-y-0.5">
            <NavItem to="/proposals" icon="description" label="Proposals" />
            <NavItem to="/projects" icon="architecture" label="Projects" />
            <NavItem to="/documents" icon="folder" label="Documents" />
          </div>
        </div>

        {/* Finance */}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Finance</p>
          <div className="space-y-0.5">
            <NavItem to="/invoices" icon="receipt_long" label="Invoices" />
            {isAdmin && <NavItem to="/expenses" icon="payments" label="Expenses" />}
            {isAdmin && <NavItem to="/payroll" icon="account_balance_wallet" label="Payroll" />}
          </div>
        </div>

        {/* Intelligence */}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">Intelligence</p>
          <div className="space-y-0.5">
            <NavItem to="/analytics" icon="monitoring" label="Analytics" />
            <NavItem to="/ai-insights" icon="psychology" label="AI Insights" />
          </div>
        </div>

        {/* System */}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2">System</p>
          <div className="space-y-0.5">
            <NavItem to="/settings" icon="settings" label="Settings" />
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate text-white">{user?.name}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wide">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1 text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            title="Logout"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
