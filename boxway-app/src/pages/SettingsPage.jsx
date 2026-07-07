import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Icon from "../components/ui/Icon.jsx"

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Settings rendering error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl my-4">
          <h3 className="font-bold text-lg mb-2">Something went wrong.</h3>
          <p className="text-sm">{this.state.error?.message || "Failed to load content."}</p>
        </div>
      );
    }
    return this.props.children;
  }
}const api = axios.create({
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api'
    : 'https://boxxway.onrender.com/api'
});

const SettingsPage = () => {
  const { section } = useParams();
  const navigate = useNavigate();

  const sectionMap = {
    company: 'Company',
    users: 'Users & Access',
    notifications: 'Notifications',
    appearance: 'Appearance',
    integrations: 'Integrations',
    security: 'Security',
    billing: 'Billing'
  };

  const activeSection = section ? (sectionMap[section.toLowerCase()] || 'Company') : 'Company';

  const handleSectionChange = (s) => {
    const route = Object.keys(sectionMap).find(key => sectionMap[key] === s) || 'company';
    navigate(`/settings/${route}`);
  };
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [companyProfile, setCompanyProfile] = useState({});
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [appearance, setAppearance] = useState({});
  const [integrations, setIntegrations] = useState([]);
  const [security, setSecurity] = useState({});
  const [billingInfo, setBillingInfo] = useState({});
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', role: 'Employee' });
  const [toast, setToast] = useState('');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const availablePlans = [
    { name: 'Starter', price: '$99/month', features: ['Basic Invoicing', 'Employee Database', 'Email Support'] },
    { name: 'Professional', price: '$299/month', features: ['Unlimited Invoices', 'Payroll Management', 'Employee Database', 'Advanced Analytics', 'Priority Support'] },
    { name: 'Enterprise', price: '$599/month', features: ['All Professional Features', 'Custom Integrations', 'Dedicated Support', 'Advanced Security'] }
  ];

  const sections = ['Company', 'Users & Access', 'Notifications', 'Appearance', 'Integrations', 'Security', 'Billing'];

  // Fetch settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings/');
        const data = response.data?.data || {};
        const defaultNotifications = [
          { category: 'Financial', type: 'Invoice Payment Reminders', enabled: true, email: true, inApp: true, sms: false },
          { category: 'Financial', type: 'Expense Approval Notifications', enabled: true, email: true, inApp: true, sms: false },
          { category: 'Financial', type: 'Payroll Processing Alerts', enabled: true, email: true, inApp: true, sms: false },
          { category: 'Financial', type: 'Payment Received Notifications', enabled: true, email: true, inApp: true, sms: false },
          { category: 'Projects', type: 'Project Created', enabled: true, email: true, inApp: true, sms: false },
          { category: 'Projects', type: 'Project Completed', enabled: true, email: true, inApp: true, sms: false },
          { category: 'Projects', type: 'Project Deadline Reminder', enabled: true, email: true, inApp: true, sms: false },
          { category: 'Projects', type: 'Project Status Updated', enabled: true, email: false, inApp: true, sms: false },
          { category: 'Projects', type: 'Budget Limit Warning', enabled: true, email: true, inApp: true, sms: true },
          { category: 'Employees', type: 'New Employee Added', enabled: true, email: true, inApp: true, sms: false },
          { category: 'Employees', type: 'Leave Requests', enabled: true, email: true, inApp: true, sms: false },
          { category: 'Employees', type: 'Attendance Alerts', enabled: true, email: true, inApp: true, sms: false },
          { category: 'Employees', type: 'Employee Profile Updates', enabled: false, email: false, inApp: true, sms: false },
          { category: 'AI & Analytics', type: 'AI Insight Alerts', enabled: true, email: true, inApp: true, sms: false },
          { category: 'AI & Analytics', type: 'Weekly Analytics Report', enabled: true, email: true, inApp: false, sms: false },
          { category: 'AI & Analytics', type: 'Monthly Performance Report', enabled: true, email: true, inApp: false, sms: false },
          { category: 'Security', type: 'Login Alerts', enabled: true, email: true, inApp: true, sms: true },
          { category: 'Security', type: 'Password Changed', enabled: true, email: true, inApp: true, sms: true },
          { category: 'Security', type: 'Two-Factor Authentication Alerts', enabled: true, email: true, inApp: true, sms: true },
          { category: 'Security', type: 'Suspicious Activity Alerts', enabled: true, email: true, inApp: true, sms: true },
        ];
        
        const defaultIntegrations = [
          { name: 'Google Workspace', description: 'Connect your docs, sheets, and calendars.', status: 'Connected', lastSync: '10 mins ago', icon: '🌐' },
          { name: 'Slack', description: 'Get notifications in your Slack channels.', workspaceName: 'boxway-team', status: 'Connected', icon: '💬' },
          { name: 'Microsoft Teams', description: 'Collaborate and stay updated in Teams.', status: 'Disconnected', icon: '👥' },
          { name: 'Stripe', description: 'Accept payments and manage subscriptions.', connectedAccount: 'acct_12345', paymentStatus: 'Active', status: 'Connected', icon: '💳' },
          { name: 'Razorpay', description: 'Payment gateway for India.', status: 'Disconnected', icon: '⚡' },
          { name: 'QuickBooks', description: 'Sync invoices and expenses.', accountingSync: 'Enabled', status: 'Connected', lastSync: '1 hr ago', icon: '📊' },
          { name: 'Zapier', description: 'Automate workflows with 5000+ apps.', automationStatus: 'Running', status: 'Connected', icon: '🔗' },
          { name: 'Webhooks', description: 'Send real-time data to any URL.', webhookUrl: 'https://api.example.com/webhook', apiKey: 'sk_live_...', status: 'Disconnected', icon: '🪝' }
        ];
        
        const defaultBilling = {
          plan: 'Professional',
          price: '/month',
          status: 'Active',
          nextBillingDate: 'Oct 1, 2024',
          features: ['Unlimited Invoices', 'Payroll Management', 'Employee Database', 'Advanced Analytics', 'Priority Support'],
          invoices: [
            { id: 'INV-2024-001', date: 'Sep 1, 2024', amount: '.00', status: 'Paid' },
            { id: 'INV-2024-002', date: 'Aug 1, 2024', amount: '.00', status: 'Paid' }
          ]
        };

        setSettings(data);
        setCompanyProfile(data.companyProfile || {});
        setUsers(data.users || []);
        setNotifications(data.notifications?.length ? data.notifications : defaultNotifications);
        setAppearance(data.appearance || {});
        setIntegrations(data.integrations?.length ? data.integrations : defaultIntegrations);
        setSecurity(data.security || {});
        setBillingInfo(Object.keys(data.billing || {}).length ? data.billing : defaultBilling);
        setCompanyLogo(data.companyProfile?.logo || null);
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Apply theme in real-time
  useEffect(() => {
    if (appearance.theme === 'Dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appearance.theme]);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const payload = {
        companyProfile,
        users,
        notifications,
        appearance,
        integrations,
        security,
        billing: billingInfo
      };
      await api.patch('/settings/', payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      showToast('Settings saved successfully!');
    } catch (err) {
      console.error("Error saving settings:", err);
      showToast('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2000); };

  // Users & Access handlers
  const handleAddUser = () => {
    if (!newUserForm.name || !newUserForm.email) {
      showToast('Please fill in all fields');
      return;
    }
    const newUser = {
      id: Date.now(),
      name: newUserForm.name,
      email: newUserForm.email,
      role: newUserForm.role,
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString()
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

  const handleEditUser = (user) => {
    setEditingUser(user);
    setNewUserForm({ name: user.name, email: user.email, role: user.role });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = () => {
    if (!newUserForm.name || !newUserForm.email) {
      showToast('Please fill in all fields');
      return;
    }
    setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...newUserForm } : u));
    setNewUserForm({ name: '', email: '', role: 'Employee' });
    setShowEditUserModal(false);
    setEditingUser(null);
    showToast('User updated successfully!');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogo(reader.result);
        setCompanyProfile({ ...companyProfile, logo: reader.result });
        showToast('Logo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      showToast('Please fill in all password fields');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      showToast('Password must be at least 8 characters');
      return;
    }
    // Here you would call the API to change password
    showToast('Password changed successfully!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  // Company Profile handlers
  const handleCompanyProfileChange = (field, value) => {
    setCompanyProfile({ ...companyProfile, [field]: value });
  };

  // Notifications handlers - save immediately for real-time
  const handleNotificationToggle = (index) => {
    const updated = [...notifications];
    updated[index].enabled = !updated[index].enabled;
    setNotifications(updated);
    handleSave();
  };

  const handleNotificationDetailToggle = (index, field) => {
    const updated = [...notifications];
    updated[index][field] = !updated[index][field];
    setNotifications(updated);
    handleSave();
  };

  // Appearance handlers
  const handleAppearanceChange = (field, value) => {
    setAppearance({ ...appearance, [field]: value });
    // Save immediately for real-time updates
    handleSave();
  };

  const handleAppearanceSave = () => {
    handleSave();
  };

  // Integrations handlers
  const handleIntegrationAction = (integrationName, action) => {
    setIntegrations(integrations.map(int => {
      if (int.name === integrationName) {
        if (action === 'connect' || action === 'reconnect') {
          return { ...int, status: 'Connected', lastSync: 'Just now' };
        } else if (action === 'disconnect') {
          return { ...int, status: 'Disconnected', lastSync: null };
        } else if (action === 'sync') {
          return { ...int, lastSync: 'Just now' };
        } else if (action === 'generate') {
          return { ...int, apiKey: 'sk_live_' + Math.random().toString(36).substring(2, 11) };
        }
      }
      return int;
    }));
    if (action === 'test') {
      showToast(`Connection to ${integrationName} tested successfully!`);
    } else if (action === 'generate') {
      showToast(`New API Key generated for ${integrationName}!`);
    } else if (action === 'copy') {
      showToast(`API Key copied to clipboard!`);
    } else {
      showToast(`${integrationName} ${action} successful!`);
    }
    setTimeout(handleSave, 100);
  };

  // Security handlers
  const handleSecurityChange = (field, value) => {
    setSecurity({ ...security, [field]: value });
  };

  // Billing handlers
  const handleSelectPlan = (plan) => {
    setBillingInfo({ ...billingInfo, plan: plan.name, price: plan.price });
    setShowPlanModal(false);
    showToast(`Plan changed to ${plan.name} successfully!`);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f8f6f6]">
        <div className="text-center">
          <Icon name="refresh" className="text-4xl text-primary animate-spin" />
          <p className="text-sm text-slate-500 mt-4">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8f6f6]">
      <div className="flex h-full">
        {/* Settings Sidebar */}
        <div className="w-64 shrink-0 border-r border-slate-200 bg-white p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 px-4">Settings</p>
          <nav className="space-y-1">
            {sections.map(s => (
              <button key={s} onClick={() => handleSectionChange(s)}
                className={`w-full text-left flex items-center px-4 py-2.5 rounded text-sm font-medium transition-colors ${activeSection === s ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}>
                {s}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto p-8 lg:p-10">
          {activeSection === 'Company' && (
            <ErrorBoundary>
            <div className="max-w-3xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900">Company Profile</h2>
                <button 
                  onClick={() => setIsEditingCompany(!isEditingCompany)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded hover:bg-slate-200 transition-colors"
                >
                  <Icon name={isEditingCompany ? "close" : "edit"} className="text-lg" />
                  {isEditingCompany ? 'Cancel' : 'Edit'}
                </button>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                  {companyLogo ? (
                    <img src={companyLogo} alt="Company Logo" className="w-20 h-20 rounded-xl object-cover" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-3xl">{companyProfile.companyName?.charAt(0) || 'B'}</div>
                  )}
                  <div>
                    <p className="font-bold text-slate-900 text-base">Company Logo</p>
                    <p className="text-sm text-slate-500 mt-1">Upload a PNG or SVG (recommended: 200x200px)</p>
                    {isEditingCompany && (
                      <div className="mt-3">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label htmlFor="logo-upload" className="inline-block px-4 py-2 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 transition-colors cursor-pointer">
                          Upload Logo
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Company Name', field: 'companyName', type: 'text' },
                    { label: 'Tagline', field: 'tagline', type: 'text' },
                    { label: 'Business Email', field: 'businessEmail', type: 'email' },
                    { label: 'Phone', field: 'phone', type: 'text' },
                    { label: 'Headquarters', field: 'headquarters', type: 'text' },
                    { label: 'Website', field: 'website', type: 'url' },
                    { label: 'Address', field: 'address', type: 'text' },
                    { label: 'Industry', field: 'industry', type: 'text' },
                  ].map(item => (
                    <div key={item.field}>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{item.label}</label>
                      <input 
                        type={item.type} 
                        value={companyProfile[item.field] || ''} 
                        onChange={(e) => handleCompanyProfileChange(item.field, e.target.value)}
                        disabled={!isEditingCompany}
                        className={`w-full border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors ${!isEditingCompany ? 'bg-slate-50 text-slate-600 cursor-not-allowed' : ''}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              {isEditingCompany && (
                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => setIsEditingCompany(false)} className="px-6 py-3 border border-slate-200 text-slate-700 text-sm font-bold rounded hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button onClick={() => { handleSave(); setIsEditingCompany(false); }} className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 shadow-sm transition-all">
                    {saved ? <><Icon name="check" className="text-lg" /> Saved!</> : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
            </ErrorBoundary>
          )}

          {activeSection === 'Notifications' && (
            <ErrorBoundary>
            <div className="max-w-3xl">
              <h2 className="text-2xl font-black text-slate-900 mb-8">Notification Preferences</h2>
              {!(notifications && notifications.length > 0) ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-center">
                  <p className="text-slate-900 font-bold">No notification preferences available.</p>
                  <p className="text-slate-500 mt-2">Configure your notification settings to receive updates.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {['Financial', 'Projects', 'Employees', 'AI & Analytics', 'Security'].map(category => {
                    const categoryNotifs = notifications.filter(n => n.category === category);
                    if (categoryNotifs.length === 0) return null;
                    return (
                      <div key={category} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                          <h3 className="font-bold text-slate-900">{category}</h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                          {categoryNotifs.map((n, idx) => {
                            const actualIndex = notifications.findIndex(nt => nt.type === n.type);
                            return (
                              <div key={n.type} className="p-6 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <p className="font-bold text-sm text-slate-900">{n.type}</p>
                                  </div>
                                  <button onClick={() => handleNotificationToggle(actualIndex)}
                                    className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${n.enabled ? 'bg-primary' : 'bg-slate-300'}`}>
                                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${n.enabled ? 'translate-x-5 left-0.5' : 'translate-x-0 left-0.5'}`} style={{ transform: n.enabled ? 'translateX(20px)' : 'translateX(0)' }} />
                                  </button>
                                </div>
                                <div className="flex gap-6 ml-4">
                                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                    <input type="checkbox" checked={n.email} onChange={() => handleNotificationDetailToggle(actualIndex, 'email')} disabled={!n.enabled} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary disabled:opacity-50" /> Email
                                  </label>
                                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                    <input type="checkbox" checked={n.inApp} onChange={() => handleNotificationDetailToggle(actualIndex, 'inApp')} disabled={!n.enabled} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary disabled:opacity-50" /> In-App
                                  </label>
                                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                    <input type="checkbox" checked={n.sms || false} onChange={() => handleNotificationDetailToggle(actualIndex, 'sms')} disabled={!n.enabled} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary disabled:opacity-50" /> SMS
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 shadow-sm transition-all disabled:opacity-50">
                  {isSaving ? <><Icon name="refresh" className="text-lg animate-spin" /> Saving...</> : saved ? <><Icon name="check" className="text-lg" /> Saved!</> : 'Save Changes'}
                </button>
              </div>
            </div>
            </ErrorBoundary>
          )}

          {activeSection === 'Appearance' && (
            <ErrorBoundary>
            <div className="max-w-3xl">
              <h2 className="text-2xl font-black text-slate-900 mb-8">Appearance & Localization</h2>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Theme</label>
                    <select value={appearance.theme || 'Light'} onChange={(e) => handleAppearanceChange('theme', e.target.value)} className="w-full border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors">
                      <option>Light</option>
                      <option>Dark</option>
                      <option>Auto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Language</label>
                    <select value={appearance.language || 'English'} onChange={(e) => handleAppearanceChange('language', e.target.value)} className="w-full border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date Format</label>
                    <select value={appearance.dateFormat || 'MM/DD/YYYY'} onChange={(e) => handleAppearanceChange('dateFormat', e.target.value)} className="w-full border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors">
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Currency</label>
                    <select value={appearance.currency || 'USD ($)'} onChange={(e) => handleAppearanceChange('currency', e.target.value)} className="w-full border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors">
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                      <option>INR (₹)</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={handleAppearanceSave} className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 shadow-sm transition-all">
                  {saved ? <><Icon name="check" className="text-lg" /> Saved!</> : 'Save Changes'}
                </button>
              </div>
            </div>
            </ErrorBoundary>
          )}

          {activeSection === 'Security' && (
            <ErrorBoundary>
            <div className="max-w-3xl">
              <h2 className="text-2xl font-black text-slate-900 mb-8">Security Settings</h2>
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
                  <h3 className="font-black text-lg text-slate-900 mb-6">Change Password</h3>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Password</label>
                      <input 
                        type="password" 
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        className="w-full border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                      <input 
                        type="password" 
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        className="w-full border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                      <input 
                        type="password" 
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        className="w-full border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors" 
                      />
                    </div>
                  </div>
                  <button onClick={handlePasswordChange} className="mt-6 px-6 py-3 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 transition-colors shadow-sm">Update Password</button>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
                  <h3 className="font-black text-lg text-slate-900 mb-4">Session Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Session Timeout (minutes)</label>
                      <input 
                        type="number" 
                        value={security.sessionTimeout || 30}
                        onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                        className="w-full border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password Requirements</label>
                      <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={security.requireStrongPassword} 
                          onChange={(e) => handleSecurityChange('requireStrongPassword', e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                        />
                        Require strong password (min 8 characters)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 shadow-sm transition-all">
                  {saved ? <><Icon name="check" className="text-lg" /> Saved!</> : 'Save Changes'}
                </button>
              </div>
            </div>
            </ErrorBoundary>
          )}

          {activeSection === 'Users & Access' && (
            <ErrorBoundary>
            <div className="max-w-5xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900">Users & Access</h2>
                <button onClick={() => setShowAddUserModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 transition-colors shadow-sm">
                  <Icon name="add" className="text-lg" /> Add User
                </button>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {!(users && users.length > 0) ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">No users found. Add users to get started.</td>
                      </tr>
                    ) : (
                      users.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">{user.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                        <td className="px-6 py-4 text-sm"><span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded">{user.role}</span></td>
                        <td className="px-6 py-4 text-sm"><span className={`px-3 py-1 text-xs font-bold rounded ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{user.status}</span></td>
                        <td className="px-6 py-4 text-sm text-slate-500">{user.joinedDate}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleEditUser(user)} className="text-primary font-bold text-sm hover:underline mr-4 transition-colors">Edit</button>
                          <button onClick={() => handleRemoveUser(user.id)} className="text-red-600 font-bold text-sm hover:underline transition-colors">Remove</button>
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
              
              {/* Add User Modal */}
              {showAddUserModal && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black text-slate-900">Add New User</h3>
                      <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600 text-3xl leading-none">&times;</button>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                        <input type="text" value={newUserForm.name} onChange={(e) => setNewUserForm({...newUserForm, name: e.target.value})} className="w-full border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" placeholder="John Doe" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                        <input type="email" value={newUserForm.email} onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})} className="w-full border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" placeholder="john@example.com" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role</label>
                        <select value={newUserForm.role} onChange={(e) => setNewUserForm({...newUserForm, role: e.target.value})} className="w-full border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors">
                          <option>Admin</option>
                          <option>Manager</option>
                          <option>Employee</option>
                          <option>Viewer</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-8 flex gap-3 justify-end">
                      <button onClick={() => setShowAddUserModal(false)} className="px-5 py-2.5 border border-slate-200 text-slate-700 font-bold text-sm rounded hover:bg-slate-50 transition-colors">Cancel</button>
                      <button onClick={handleAddUser} className="px-5 py-2.5 bg-primary text-white font-bold text-sm rounded hover:bg-primary/90 transition-colors shadow-sm">Add User</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit User Modal */}
              {showEditUserModal && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-black text-slate-900">Edit User</h3>
                      <button onClick={() => { setShowEditUserModal(false); setEditingUser(null); }} className="text-slate-400 hover:text-slate-600 text-3xl leading-none">&times;</button>
                    </div>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                        <input type="text" value={newUserForm.name} onChange={(e) => setNewUserForm({...newUserForm, name: e.target.value})} className="w-full border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" placeholder="John Doe" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
                        <input type="email" value={newUserForm.email} onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})} className="w-full border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" placeholder="john@example.com" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Role</label>
                        <select value={newUserForm.role} onChange={(e) => setNewUserForm({...newUserForm, role: e.target.value})} className="w-full border border-slate-200 rounded px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors">
                          <option>Admin</option>
                          <option>Manager</option>
                          <option>Employee</option>
                          <option>Viewer</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-8 flex gap-3 justify-end">
                      <button onClick={() => { setShowEditUserModal(false); setEditingUser(null); }} className="px-5 py-2.5 border border-slate-200 text-slate-700 font-bold text-sm rounded hover:bg-slate-50 transition-colors">Cancel</button>
                      <button onClick={handleUpdateUser} className="px-5 py-2.5 bg-primary text-white font-bold text-sm rounded hover:bg-primary/90 transition-colors shadow-sm">Update User</button>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 shadow-sm transition-all">
                  {saved ? <><Icon name="check" className="text-lg" /> Saved!</> : 'Save Changes'}
                </button>
              </div>
            </div>
            </ErrorBoundary>
          )}

          {activeSection === 'Integrations' && (
            <ErrorBoundary>
            <div className="max-w-4xl">
              <h2 className="text-2xl font-black text-slate-900 mb-8">App Integrations</h2>
              {!(integrations && integrations.length > 0) ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm text-center">
                  <p className="text-slate-900 font-bold">No integrations available.</p>
                  <p className="text-slate-500 mt-2">Check back later for new app integrations.</p>
                </div>
              ) : (
              <div className="grid grid-cols-1 gap-5">
                {integrations.map(integration => (
                  <div key={integration.name} className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-sm transition-shadow gap-4">
                    <div className="flex items-center gap-5">
                      <div className="text-4xl shrink-0">{integration.icon}</div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900">{integration.name}</h3>
                        <p className="text-sm text-slate-500 mt-1">{integration.description}</p>
                        {integration.workspaceName && <p className="text-xs text-slate-600 mt-1">Workspace: <strong>{integration.workspaceName}</strong></p>}
                        {integration.connectedAccount && <p className="text-xs text-slate-600 mt-1">Account: <strong>{integration.connectedAccount}</strong></p>}
                        {integration.webhookUrl && <p className="text-xs text-slate-600 mt-1">URL: <strong>{integration.webhookUrl}</strong></p>}
                        {integration.apiKey && (
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-slate-600">Secret: <strong>{integration.apiKey}</strong></p>
                            <button onClick={() => handleIntegrationAction(integration.name, 'copy')} className="text-xs text-primary hover:underline">Copy</button>
                          </div>
                        )}
                        {integration.status === 'Connected' && integration.lastSync && (
                          <p className="text-xs font-medium text-slate-400 mt-2">Last sync: {integration.lastSync}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 shrink-0">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded ${integration.status === 'Connected' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{integration.status}</span>
                      
                      {integration.status === 'Connected' && (
                        <>
                          {integration.name !== 'Webhooks' && <button onClick={() => handleIntegrationAction(integration.name, 'sync')} className="px-4 py-2 text-sm font-bold border border-slate-200 rounded text-slate-700 hover:bg-slate-50 transition-colors">Sync Now</button>}
                          <button onClick={() => handleIntegrationAction(integration.name, 'disconnect')} className="px-4 py-2 text-sm font-bold border border-red-200 rounded text-red-600 hover:bg-red-50 transition-colors">Disconnect</button>
                        </>
                      )}
                      
                      {integration.status === 'Disconnected' && (
                        <>
                          {integration.name === 'Razorpay' || integration.name === 'Webhooks' ? (
                            <button onClick={() => handleIntegrationAction(integration.name, 'test')} className="px-4 py-2 text-sm font-bold border border-slate-200 rounded text-slate-700 hover:bg-slate-50 transition-colors">Test Connection</button>
                          ) : null}
                          {integration.name === 'Webhooks' ? (
                            <button onClick={() => handleIntegrationAction(integration.name, 'generate')} className="px-4 py-2 text-sm font-bold border border-slate-200 rounded text-slate-700 hover:bg-slate-50 transition-colors">Generate Secret</button>
                          ) : null}
                          <button onClick={() => handleIntegrationAction(integration.name, integration.lastSync ? 'reconnect' : 'connect')} className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 shadow-sm transition-colors min-w-[120px]">
                            {integration.lastSync ? 'Reconnect' : 'Connect'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              )}
              <div className="mt-6 flex justify-end">
                <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 shadow-sm transition-all disabled:opacity-50">
                  {isSaving ? <><Icon name="refresh" className="text-lg animate-spin" /> Saving...</> : saved ? <><Icon name="check" className="text-lg" /> Saved!</> : 'Save Changes'}
                </button>
              </div>
            </div>
            </ErrorBoundary>
          )}

          {activeSection === 'Billing' && (
            <ErrorBoundary>
            <div className="max-w-4xl">
              <h2 className="text-2xl font-black text-slate-900 mb-8">Billing & Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm flex flex-col h-full">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Current Plan</p>
                  <h3 className="text-3xl font-black text-slate-900 mb-1">{billingInfo.plan}</h3>
                  <p className="text-xl font-bold text-primary mb-6">{billingInfo.price}</p>
                  <div className="space-y-2 mb-8 flex-1">
                    <p className="text-sm text-slate-600">Status: <span className="font-bold text-green-600">{billingInfo.status}</span></p>
                    <p className="text-sm text-slate-600">Next billing date: <span className="font-semibold">{billingInfo.nextBillingDate || 'Not set'}</span></p>
                  </div>
                  <button onClick={() => setShowPlanModal(true)} className="w-full px-5 py-3 border border-slate-200 text-slate-800 font-bold text-sm rounded hover:bg-slate-50 transition-colors">Change Plan</button>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm h-full">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Plan Features</p>
                  <ul className="space-y-4">
                    {(billingInfo.features || []).map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm font-medium text-slate-700">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <Icon name="check" className="text-green-600 font-bold text-[10px]" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
                  <h3 className="font-bold text-base text-slate-900">Billing History</h3>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead className="border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(billingInfo.invoices || []).length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">No billing history available</td>
                      </tr>
                    ) : (
                      billingInfo.invoices.map(invoice => (
                        <tr key={invoice.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-bold text-slate-900">{invoice.id}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{invoice.date}</td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900">{invoice.amount}</td>
                          <td className="px-6 py-4 text-sm"><span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">{invoice.status}</span></td>
                          <td className="px-6 py-4 text-right"><button onClick={() => showToast(`Downloading invoice ${invoice.id}...`)} className="text-primary font-bold text-sm hover:underline transition-colors">Download</button></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Plan Selection Modal */}
              {showPlanModal && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-white rounded-xl shadow-2xl p-8 max-w-4xl w-full mx-4">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-black text-slate-900">Select a Plan</h3>
                      <button onClick={() => setShowPlanModal(false)} className="text-slate-400 hover:text-slate-600 text-3xl leading-none">&times;</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      {availablePlans.map(plan => (
                        <div key={plan.name} className={`border-2 rounded-xl p-6 cursor-pointer transition-all flex flex-col ${billingInfo.plan === plan.name ? 'border-primary bg-primary/5 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}>
                          <h4 className="font-bold text-xl text-slate-900 mb-2">{plan.name}</h4>
                          <p className="text-2xl font-black text-primary mb-6">{plan.price}</p>
                          <ul className="space-y-3 mb-8 flex-1">
                            {plan.features.map(feature => (
                              <li key={feature} className="text-sm text-slate-700 flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                                  <Icon name="check" className="text-slate-500 font-bold text-[10px]" />
                                </div>
                                {feature}
                              </li>
                            ))}
                          </ul>
                          <button onClick={() => handleSelectPlan(plan)} className={`w-full px-5 py-3 rounded font-bold text-sm transition-colors ${billingInfo.plan === plan.name ? 'bg-primary text-white shadow-sm' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                            {billingInfo.plan === plan.name ? 'Current Plan' : 'Select Plan'}
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => setShowPlanModal(false)} className="px-6 py-3 border border-slate-200 text-slate-700 font-bold text-sm rounded hover:bg-slate-50 transition-colors">Close</button>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 shadow-sm transition-all">
                  {saved ? <><Icon name="check" className="text-lg" /> Saved!</> : 'Save Changes'}
                </button>
              </div>
            </div>
            </ErrorBoundary>
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
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded shadow-lg font-semibold text-sm z-50 animate-pulse">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;