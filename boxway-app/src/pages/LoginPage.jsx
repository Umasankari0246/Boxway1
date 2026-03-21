import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const LoginPage = () => {
  const [role, setRole] = useState('Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, loginError, user, clearError } = useAuthStore();

  // Already logged in → redirect to dashboard
  if (user) return <Navigate to="/" replace />;

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    // Use the authStore login which validates credentials
    const success = login(email, password);
    setLoading(false);

    if (success) {
      navigate('/');
    }
  };

  // Quick-fill helper for demo
  const fillDemo = (r) => {
    setRole(r);
    clearError();
    if (r === 'Admin') {
      setEmail('admin@boxway.com');
      setPassword('admin123');
    } else {
      setEmail('architect@boxway.com');
      setPassword('arch123');
    }
  };

  return (
    <div className="flex h-screen w-full font-body bg-surface text-on-surface antialiased overflow-hidden">
      {/* Left Section: Architectural Imagery */}
      <div className="hidden lg:flex w-7/12 relative bg-inverse-surface overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-80 bg-inverse-surface">
          <img
            className="w-full h-full object-cover grayscale opacity-50"
            alt="Modern minimalist skyscraper architecture with sharp angles"
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
          />
        </div>
        <div className="absolute inset-0 z-10 bg-gradient-to-tr from-inverse-surface via-transparent to-transparent opacity-60" />
        <div className="relative z-20 flex flex-col justify-between p-20 w-full">
          <div>
            <span className="text-primary-container text-sm uppercase tracking-[0.2em] font-bold">EST. MMXXIV</span>
            <h1 className="text-surface text-[4rem] font-black leading-none tracking-tighter mt-4 uppercase">
              BOXWAY<br />STUDIO
            </h1>
          </div>
          <div className="flex flex-col gap-6">
            <div className="h-[1px] w-24 bg-primary" />
            {/* Demo Credentials Panel */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/20 max-w-sm">
              <p className="text-white/70 text-[10px] uppercase tracking-widest font-bold mb-3">Demo Credentials</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60">Admin</span>
                  <span className="text-white font-mono font-medium">admin@boxway.com / admin123</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60">Architect</span>
                  <span className="text-white font-mono font-medium">architect@boxway.com / arch123</span>
                </div>
              </div>
            </div>
            <p className="text-surface-variant max-w-md font-light leading-relaxed tracking-wide text-sm uppercase italic">
              "Precision is not an attribute; it is the fundamental structure of the modern environment."
            </p>
          </div>
        </div>
      </div>

      {/* Right Section: Authentication Canvas */}
      <div className="w-full lg:w-5/12 flex flex-col justify-center items-center px-8 sm:px-16 lg:px-24 bg-surface relative">
        <div className="lg:hidden absolute top-12 left-12">
          <span className="text-on-surface font-black tracking-tighter text-2xl uppercase">BOXWAY STUDIO</span>
        </div>

        <div className="w-full max-w-md">
          <header className="mb-10">
            <h2 className="text-3xl font-bold tracking-tighter text-on-surface uppercase mb-2">Access Portal</h2>
            <p className="text-on-surface-variant text-xs uppercase tracking-widest font-medium">Internal Project Environment</p>
          </header>

          {/* Role Selector Tabs */}
          <div className="flex gap-0 mb-8 border-b border-surface-container-highest">
            {['Admin', 'Architect'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => fillDemo(r)}
                className={`flex-1 pb-4 text-[0.7rem] font-black uppercase tracking-[0.1em] border-b-2 transition-all ${
                  role === r
                    ? 'border-primary text-on-surface'
                    : 'border-transparent text-on-surface-variant opacity-40 hover:opacity-100'
                }`}
              >
                {r} Login
              </button>
            ))}
          </div>

          {/* Quick Fill Info */}
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700 font-medium">
            💡 Click the tabs above to auto-fill demo credentials, or enter them manually.
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded text-xs text-red-700 font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              {loginError}
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-5">
              <div className="relative group">
                <label className="block text-[0.65rem] uppercase tracking-widest font-bold text-on-surface-variant mb-1 transition-colors group-focus-within:text-primary">
                  Email
                </label>
                <input
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); }}
                  className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 focus:border-primary focus:ring-0 transition-all text-sm font-medium text-on-surface placeholder:text-surface-dim"
                  placeholder="admin@boxway.com"
                  type="email"
                />
              </div>
              <div className="relative group">
                <label className="block text-[0.65rem] uppercase tracking-widest font-bold text-on-surface-variant mb-1 transition-colors group-focus-within:text-primary">
                  Password
                </label>
                <input
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  className="w-full bg-transparent border-0 border-b border-outline-variant py-3 px-0 focus:border-primary focus:ring-0 transition-all text-sm font-medium text-on-surface placeholder:text-surface-dim"
                  placeholder="••••••••••••"
                  type="password"
                />
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <button
                className="w-full bg-primary text-white py-4 text-[0.75rem] font-black tracking-[0.2em] uppercase hover:bg-primary/90 transition-all flex items-center justify-center gap-3 group disabled:opacity-60"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Logging in…' : 'LOG IN'}
                {!loading && <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>}
              </button>
            </div>
          </form>

          <footer className="mt-12 pt-6 border-t border-surface-container-low flex justify-between items-center">
            <span className="text-[0.6rem] text-on-surface-variant font-medium tracking-[0.15em] uppercase opacity-50">
              © 2024 Boxway Studio
            </span>
            <div className="flex gap-4">
              <a className="text-[0.6rem] text-on-surface-variant font-bold tracking-[0.15em] uppercase hover:text-primary transition-colors" href="#">Security</a>
              <a className="text-[0.6rem] text-on-surface-variant font-bold tracking-[0.15em] uppercase hover:text-primary transition-colors" href="#">Privacy</a>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
