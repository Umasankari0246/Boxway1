import React, { useState } from 'react';

const SETTINGS_SECTIONS = [
  {
    title: 'Company Profile',
    icon: 'business',
    items: [
      { label: 'Company Name', type: 'text', value: 'Boxway Architecture Studio' },
      { label: 'Tagline', type: 'text', value: 'Design. Build. Inspire.' },
      { label: 'Business Email', type: 'email', value: 'hello@boxway.studio' },
      { label: 'Phone', type: 'text', value: '+1 (555) 000-1234' },
      { label: 'Headquarters', type: 'text', value: 'New York, NY' },
      { label: 'Website', type: 'url', value: 'https://boxway.studio' },
    ],
  },
  {
    title: 'Notifications',
    icon: 'notifications',
    items: null,
    toggles: [
      { label: 'Invoice Payment Reminders', sub: 'Alert when invoices are approaching due date', on: true },
      { label: 'Payroll Approval Requests', sub: 'Notify approvers when payroll runs need sign-off', on: true },
      { label: 'New Client Registration', sub: 'Email when new client is added to the system', on: false },
      { label: 'Project Phase Updates', sub: 'Alert team when project phases are completed', on: true },
      { label: 'AI Insight Alerts', sub: 'Receive high-priority AI recommendations via email', on: false },
    ],
  },
];

const APPEARANCE = [
  { label: 'Theme', options: ['Light', 'Dark', 'Auto'], current: 'Light' },
  { label: 'Language', options: ['English', 'Spanish', 'French', 'German'], current: 'English' },
  { label: 'Date Format', options: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'], current: 'MM/DD/YYYY' },
  { label: 'Currency', options: ['USD ($)', 'EUR (€)', 'GBP (£)', 'INR (₹)'], current: 'USD ($)' },
];

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('Company');
  const [toggles, setToggles] = useState({ 0: true, 1: true, 2: false, 3: true, 4: false });
  const [saved, setSaved] = useState(false);

  const sections = ['Company', 'Users & Access', 'Notifications', 'Appearance', 'Integrations', 'Security', 'Billing'];

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8f6f6]">
      <div className="flex h-full">
        {/* Settings Sidebar */}
        <div className="w-56 shrink-0 border-r border-slate-200 bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-3">Settings</p>
          <nav className="space-y-0.5">
            {sections.map(s => (
              <button key={s} onClick={() => setActiveSection(s)}
                className={`w-full text-left flex items-center px-3 py-2 rounded text-sm font-medium transition-colors ${activeSection === s ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                {s}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {activeSection === 'Company' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-black text-slate-900 mb-6">Company Profile</h2>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
                <div className="flex items-center gap-5 pb-5 border-b border-slate-100">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-2xl">B</div>
                  <div>
                    <p className="font-bold text-slate-900">Company Logo</p>
                    <p className="text-xs text-slate-400 mt-0.5">Upload a PNG or SVG (recommended: 200x200px)</p>
                    <button className="mt-2 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded hover:bg-slate-200 transition-colors">Upload Logo</button>
                  </div>
                </div>
                {SETTINGS_SECTIONS[0].items.map(item => (
                  <div key={item.label}>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{item.label}</label>
                    <input type={item.type} defaultValue={item.value} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">
                  {saved ? <><span className="material-symbols-outlined text-lg">check</span> Saved!</> : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {activeSection === 'Notifications' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-black text-slate-900 mb-6">Notification Preferences</h2>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
                {SETTINGS_SECTIONS[1].toggles.map((t, i) => (
                  <div key={t.label} className="flex items-center justify-between p-5">
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{t.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{t.sub}</p>
                    </div>
                    <button onClick={() => setToggles(prev => ({ ...prev, [i]: !prev[i] }))}
                      className={`relative w-10 h-6 rounded-full transition-colors ${toggles[i] ? 'bg-primary' : 'bg-slate-300'}`}>
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${toggles[i] ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'Appearance' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-black text-slate-900 mb-6">Appearance & Localization</h2>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
                {APPEARANCE.map(a => (
                  <div key={a.label}>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{a.label}</label>
                    <select defaultValue={a.current} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
                      {a.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'Security' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-black text-slate-900 mb-6">Security Settings</h2>
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Change Password</h3>
                  <div className="space-y-4">
                    {['Current Password', 'New Password', 'Confirm New Password'].map(f => (
                      <div key={f}>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">{f}</label>
                        <input type="password" className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 transition-colors">Update Password</button>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-900 mb-2">Two-Factor Authentication</h3>
                  <p className="text-sm text-slate-500 mb-4">Add an extra layer of security to your account.</p>
                  <button className="px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded hover:bg-slate-50">Enable 2FA</button>
                </div>
              </div>
            </div>
          )}

          {!['Company', 'Notifications', 'Appearance', 'Security'].includes(activeSection) && (
            <div className="max-w-2xl text-center py-20">
              <span className="material-symbols-outlined text-slate-300 text-5xl">settings</span>
              <h2 className="text-xl font-bold text-slate-900 mt-4">{activeSection}</h2>
              <p className="text-slate-400 text-sm mt-2">This settings section is coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
