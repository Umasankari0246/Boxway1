import React, { useState } from 'react';
import Icon from "../components/ui/Icon.jsx"

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

const USERS_ACCESS = [
  { id: 1, name: 'John Admin', email: 'john@boxway.studio', role: 'Admin', status: 'Active', joinedDate: '2024-01-15' },
  { id: 2, name: 'Sarah Manager', email: 'sarah@boxway.studio', role: 'Manager', status: 'Active', joinedDate: '2024-02-20' },
  { id: 3, name: 'Mike Employee', email: 'mike@boxway.studio', role: 'Employee', status: 'Active', joinedDate: '2024-03-10' },
  { id: 4, name: 'Lisa Viewer', email: 'lisa@boxway.studio', role: 'Viewer', status: 'Inactive', joinedDate: '2024-04-05' },
];

const INTEGRATIONS = [
  { name: 'Google Workspace', description: 'Connect your Google account for email and calendar sync', status: 'Connected', icon: '🔗', lastSync: '2 hours ago' },
  { name: 'Slack', description: 'Send notifications and alerts to your Slack workspace', status: 'Disconnected', icon: '⚙️', lastSync: 'Never' },
  { name: 'Stripe', description: 'Connect for payment processing and invoicing', status: 'Connected', icon: '💳', lastSync: '1 hour ago' },
  { name: 'QuickBooks', description: 'Sync accounting data with QuickBooks Online', status: 'Disconnected', icon: '📊', lastSync: 'Never' },
  { name: 'Zapier', description: 'Automate workflows with other applications', status: 'Disconnected', icon: '⚡', lastSync: 'Never' },
];

const BILLING_INFO = {
  plan: 'Professional',
  price: '$299/month',
  nextBillingDate: '2026-07-22',
  status: 'Active',
  invoices: [
    { id: 'INV-001', date: '2026-05-22', amount: '$299.00', status: 'Paid' },
    { id: 'INV-002', date: '2026-04-22', amount: '$299.00', status: 'Paid' },
    { id: 'INV-003', date: '2026-03-22', amount: '$299.00', status: 'Paid' },
  ],
  features: ['Unlimited Invoices', 'Payroll Management', 'Employee Database', 'Advanced Analytics', 'Priority Support']
};

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('Company');
  const [toggles, setToggles] = useState({ 0: true, 1: true, 2: false, 3: true, 4: false });
  const [saved, setSaved] = useState(false);
  const [users, setUsers] = useState(USERS_ACCESS);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', role: 'Employee' });
  const [toast, setToast] = useState('');
  const [appearance, setAppearance] = useState({
    theme: 'Light',
    language: 'English',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD ($)'
  });
  const [billingInfo, setBillingInfo] = useState(BILLING_INFO);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const availablePlans = [
    { name: 'Starter', price: '$99/month', features: ['Basic Invoicing', 'Employee Database', 'Email Support'] },
    { name: 'Professional', price: '$299/month', features: ['Unlimited Invoices', 'Payroll Management', 'Employee Database', 'Advanced Analytics', 'Priority Support'] },
    { name: 'Enterprise', price: '$599/month', features: ['All Professional Features', 'Custom Integrations', 'Dedicated Support', 'Advanced Security'] }
  ];

  const sections = ['Company', 'Users & Access', 'Notifications', 'Appearance', 'Integrations', 'Security', 'Billing'];

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2000); };

  // Users & Access handlers
  const handleAddUser = () => {
    if (!newUserForm.name || !newUserForm.email) {
      showToast('Please fill in all fields');
      return;
    }
    const newUser = {
      id: users.length + 1,
      name: newUserForm.name,
      email: newUserForm.email,
      role: newUserForm.role,
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setUsers([...users, newUser]);
    setNewUserForm({ name: '', email: '', role: 'Employee' });
    setShowAddUserModal(false);
    showToast('User added successfully!');
  };

  const handleRemoveUser = (id) => {
    setUsers(users.filter(u => u.id !== id));
    showToast('User removed successfully!');
  };

  const handleEditUser = (id) => {
    showToast('Edit functionality for user ' + id);
  };

  // Appearance handlers
  const handleAppearanceChange = (field, value) => {
    setAppearance({ ...appearance, [field]: value });
  };

  const handleAppearanceSave = () => {
    handleSave();
    showToast('Appearance settings saved!');
  };

  // Integrations handlers
  const handleToggleIntegration = (integrationName) => {
    setIntegrations(integrations.map(int => 
      int.name === integrationName 
        ? { ...int, status: int.status === 'Connected' ? 'Disconnected' : 'Connected' }
        : int
    ));
    const isConnecting = integrations.find(i => i.name === integrationName)?.status === 'Disconnected';
    showToast(`${integrationName} ${isConnecting ? 'connected' : 'disconnected'} successfully!`);
  };

  // Billing handlers
  const handleSelectPlan = (plan) => {
    setBillingInfo({ ...billingInfo, plan: plan.name, price: plan.price });
    setShowPlanModal(false);
    showToast(`Plan changed to ${plan.name} successfully!`);
  };

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
                  {saved ? <><Icon name="check" className="text-lg" /> Saved!</> : 'Save Changes'}
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
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Theme</label>
                  <select value={appearance.theme} onChange={(e) => handleAppearanceChange('theme', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
                    <option>Light</option>
                    <option>Dark</option>
                    <option>Auto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Language</label>
                  <select value={appearance.language} onChange={(e) => handleAppearanceChange('language', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Date Format</label>
                  <select value={appearance.dateFormat} onChange={(e) => handleAppearanceChange('dateFormat', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Currency</label>
                  <select value={appearance.currency} onChange={(e) => handleAppearanceChange('currency', e.target.value)} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                    <option>INR (₹)</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button onClick={handleAppearanceSave} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">
                  {saved ? <><Icon name="check" className="text-lg" /> Saved!</> : 'Save Changes'}
                </button>
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

          {activeSection === 'Users & Access' && (
            <div className="max-w-4xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-slate-900">Users & Access</h2>
                <button onClick={() => setShowAddUserModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                  <Icon name="add" className="text-lg" /> Add User
                </button>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 text-sm font-semibold text-slate-900">{user.name}</td>
                        <td className="px-6 py-3 text-sm text-slate-600">{user.email}</td>
                        <td className="px-6 py-3 text-sm"><span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded">{user.role}</span></td>
                        <td className="px-6 py-3 text-sm"><span className={`px-2.5 py-1 text-xs font-bold rounded ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{user.status}</span></td>
                        <td className="px-6 py-3 text-sm text-slate-600">{user.joinedDate}</td>
                        <td className="px-6 py-3 text-right">
                          <button onClick={() => handleEditUser(user.id)} className="text-primary font-semibold text-xs hover:underline mr-3 transition-colors">Edit</button>
                          <button onClick={() => handleRemoveUser(user.id)} className="text-red-600 font-semibold text-xs hover:underline transition-colors">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Add User Modal */}
              {showAddUserModal && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-black text-slate-900">Add New User</h3>
                      <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Full Name</label>
                        <input type="text" value={newUserForm.name} onChange={(e) => setNewUserForm({...newUserForm, name: e.target.value})} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="John Doe" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email</label>
                        <input type="email" value={newUserForm.email} onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="john@example.com" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Role</label>
                        <select value={newUserForm.role} onChange={(e) => setNewUserForm({...newUserForm, role: e.target.value})} className="w-full border border-slate-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-primary">
                          <option>Admin</option>
                          <option>Manager</option>
                          <option>Employee</option>
                          <option>Viewer</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-6 flex gap-3 justify-end">
                      <button onClick={() => setShowAddUserModal(false)} className="px-4 py-2.5 border border-slate-200 text-slate-700 font-bold text-sm rounded hover:bg-slate-50 transition-colors">Cancel</button>
                      <button onClick={handleAddUser} className="px-4 py-2.5 bg-primary text-white font-bold text-sm rounded hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">Add User</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'Integrations' && (
            <div className="max-w-4xl">
              <h2 className="text-xl font-black text-slate-900 mb-6">App Integrations</h2>
              <div className="grid grid-cols-1 gap-4">
                {integrations.map(integration => (
                  <div key={integration.name} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{integration.icon}</div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{integration.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{integration.description}</p>
                        <p className="text-xs text-slate-400 mt-1">Last sync: {integration.lastSync}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded ${integration.status === 'Connected' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{integration.status}</span>
                      <button onClick={() => handleToggleIntegration(integration.name)} className={`px-4 py-2.5 text-xs font-bold rounded transition-colors ${integration.status === 'Connected' ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-primary text-white hover:bg-primary/90'}`}>
                        {integration.status === 'Connected' ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'Billing' && (
            <div className="max-w-4xl">
              <h2 className="text-xl font-black text-slate-900 mb-6">Billing & Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Current Plan</p>
                  <h3 className="text-2xl font-black text-slate-900 mb-1">{billingInfo.plan}</h3>
                  <p className="text-lg font-bold text-primary mb-4">{billingInfo.price}</p>
                  <p className="text-sm text-slate-600 mb-4">Status: <span className="font-bold text-green-600">{billingInfo.status}</span></p>
                  <p className="text-sm text-slate-500 mb-4">Next billing date: {billingInfo.nextBillingDate}</p>
                  <button onClick={() => setShowPlanModal(true)} className="w-full px-4 py-2.5 border border-primary text-primary font-bold text-sm rounded hover:bg-primary/5 transition-colors">Change Plan</button>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4">Plan Features</p>
                  <ul className="space-y-2">
                    {billingInfo.features.map(feature => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                        <Icon name="check" className="text-green-600 font-bold text-sm" /> {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-bold text-sm text-slate-900">Billing History</h3>
                </div>
                <table className="w-full">
                  <thead className="border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Invoice</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {billingInfo.invoices.map(invoice => (
                      <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 text-sm font-semibold text-slate-900">{invoice.id}</td>
                        <td className="px-6 py-3 text-sm text-slate-600">{invoice.date}</td>
                        <td className="px-6 py-3 text-sm font-semibold text-slate-900">{invoice.amount}</td>
                        <td className="px-6 py-3 text-sm"><span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">{invoice.status}</span></td>
                        <td className="px-6 py-3 text-right"><button onClick={() => showToast(`Downloading invoice ${invoice.id}...`)} className="text-primary font-bold text-xs hover:underline transition-colors">Download</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Plan Selection Modal */}
              {showPlanModal && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-black text-slate-900">Select a Plan</h3>
                      <button onClick={() => setShowPlanModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {availablePlans.map(plan => (
                        <div key={plan.name} className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${billingInfo.plan === plan.name ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-primary'}`}>
                          <h4 className="font-bold text-slate-900 mb-1">{plan.name}</h4>
                          <p className="text-lg font-black text-primary mb-3">{plan.price}</p>
                          <ul className="space-y-1.5 mb-4">
                            {plan.features.map(feature => (
                              <li key={feature} className="text-xs text-slate-600 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span> {feature}
                              </li>
                            ))}
                          </ul>
                          <button onClick={() => handleSelectPlan(plan)} className={`w-full px-4 py-2 rounded font-bold text-sm transition-colors ${billingInfo.plan === plan.name ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                            {billingInfo.plan === plan.name ? 'Current Plan' : 'Select'}
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => setShowPlanModal(false)} className="px-4 py-2.5 border border-slate-200 text-slate-700 font-bold text-sm rounded hover:bg-slate-50 transition-colors">Close</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!['Company', 'Notifications', 'Appearance', 'Security', 'Users & Access', 'Integrations', 'Billing'].includes(activeSection) && (
            <div className="max-w-2xl text-center py-20">
              <Icon name="settings" className="text-slate-300 text-5xl" />
              <h2 className="text-xl font-bold text-slate-900 mt-4">{activeSection}</h2>
              <p className="text-slate-400 text-sm mt-2">This settings section is coming soon.</p>
            </div>
          )}
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg font-semibold text-sm z-50 animate-pulse">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;