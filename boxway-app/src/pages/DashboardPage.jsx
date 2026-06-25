import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Icon from '../components/ui/Icon.jsx';

const api = axios.create({
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api'
    : 'https://boxxway.onrender.com/api',
});

// Mock financial data for the graph (last 3 months)
const mockFinancialData = [
  { month: 'Apr', revenue: 180, expenses: 110 },
  { month: 'May', revenue: 165, expenses: 90 },
  { month: 'Jun', revenue: 200, expenses: 120 },
];

const upcomingCalendar = [
  { title: 'DA submission - Villa 4', date: 'Oct 24, 2023', status: 'High' },
  { title: 'Structural review', date: 'Oct 28, 2023', status: 'Mid' },
  { title: 'Client kickoff', date: 'Nov 02, 2023', status: 'Low' },
  { title: 'Permitting deadline', date: 'Nov 10, 2023', status: 'High' },
  { title: 'Team sync', date: 'Nov 14, 2023', status: 'Medium' },
];

// Mock recent activity data
const mockRecentActivity = [
  {
    id: 1,
    type: 'invoice',
    user: 'Sarah Chen',
    action: 'created invoice',
    item: '#INV-1234',
    time: '2 hours ago',
    avatar: 'S',
    color: 'bg-primary',
  },
  {
    id: 2,
    type: 'project',
    user: 'Marcus T.',
    action: 'updated project',
    item: 'Villa Renovation',
    time: '4 hours ago',
    avatar: 'M',
    color: 'bg-black',
  },
  {
    id: 3,
    type: 'expense',
    user: 'Emily R.',
    action: 'submitted expense',
    item: 'Materials',
    time: '6 hours ago',
    avatar: 'E',
    color: 'bg-amber-500',
  },
  {
    id: 4,
    type: 'employee',
    user: 'David K.',
    action: 'joined team',
    item: 'Senior Architect',
    time: 'Yesterday',
    avatar: 'D',
    color: 'bg-sky-500',
  },
];

const DashboardPage = () => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, employeesRes, invoicesRes, expensesRes] = await Promise.all([
          api.get('/projects/'),
          api.get('/employees/'),
          api.get('/invoices/'),
          api.get('/expenses/'),
        ]);
        setProjects(projectsRes.data.data);
        setEmployees(employeesRes.data.data);
        setInvoices(invoicesRes.data.data);
        setExpenses(expensesRes.data.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate KPI values
  const activeProjects = projects.filter(p => p.status === 'In Progress' || p.status === 'Planning').length;
  const pendingProjects = projects.filter(p => p.status === 'On Hold').length;
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const teamCount = employees.length;

  // Use mock financial data for the graph
  const financialData = mockFinancialData;
  const allValues = financialData.flatMap(d => [d.revenue, d.expenses]);
  const maxValue = Math.max(...allValues, 1) || 1;

  // Generate recent activity from real data
  const generateRecentActivity = () => {
    const activities = [];

    // Add invoice activities
    invoices.slice(0, 2).forEach(invoice => {
      activities.push({
        id: `invoice-${invoice.id}`,
        type: 'invoice',
        user: invoice.client || 'Client',
        action: invoice.status === 'Paid' ? 'paid invoice' : 'created invoice',
        item: invoice.invoiceId || `#${invoice.id}`,
        time: 'Recently',
        avatar: 'I',
        color: 'bg-primary',
      });
    });

    // Add expense activities
    expenses.slice(0, 2).forEach(expense => {
      activities.push({
        id: `expense-${expense.id}`,
        type: 'expense',
        user: expense.submittedBy || 'User',
        action: 'submitted expense',
        item: expense.title || 'Expense',
        time: 'Recently',
        avatar: 'E',
        color: 'bg-amber-500',
      });
    });

    // Add project activities
    projects.slice(0, 2).forEach(project => {
      activities.push({
        id: `project-${project.id}`,
        type: 'project',
        user: project.lead || 'Lead',
        action: 'updated project',
        item: project.name,
        time: 'Recently',
        avatar: 'P',
        color: 'bg-black',
      });
    });

    // Add employee activities
    employees.slice(0, 1).forEach(employee => {
      activities.push({
        id: `employee-${employee.id}`,
        type: 'employee',
        user: employee.firstName || 'Employee',
        action: 'joined team',
        item: employee.role || 'Team Member',
        time: 'Recently',
        avatar: (employee.firstName || 'E')[0].toUpperCase(),
        color: 'bg-sky-500',
      });
    });

    // Take first 4 activities
    return activities.slice(0, 4);
  };

  const recentActivity = generateRecentActivity();

  return (
    <div className="flex-1 p-6 overflow-y-auto no-scrollbar space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-zinc-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary grid place-items-center">
              <Icon name="box" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-black uppercase mb-1">Active Projects</p>
              <h3 className="text-2xl font-black">{loading ? '...' : activeProjects}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border border-zinc-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 grid place-items-center">
              <Icon name="payments" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-black uppercase mb-1">Total Budget</p>
              <h3 className="text-2xl font-black">
                {loading ? '...' : `$${(totalBudget / 1000).toFixed(0)}K`}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border border-zinc-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 grid place-items-center">
              <Icon name="pending_actions" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-black uppercase mb-1">Pending</p>
              <h3 className="text-2xl font-black">{loading ? '...' : pendingProjects}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border border-zinc-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-700 grid place-items-center">
              <Icon name="group" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-black uppercase mb-1">Team</p>
              <h3 className="text-2xl font-black">{loading ? '...' : teamCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Progress Overview */}
          <section className="bg-white p-6 border border-zinc-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xs font-black uppercase tracking-tight">Project Progress Overview</h3>
                <p className="text-[10px] text-zinc-500 uppercase mt-0.5">Tracking current status of top architectural projects</p>
              </div>
              <button className="text-[10px] font-bold text-primary hover:underline uppercase">View All</button>
            </div>
            
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-8 text-zinc-400">Loading projects...</div>
              ) : (
                projects.slice(0, 4).map((project) => {
                  // Calculate progress if missing
                  let progress = project.progress;
                  if (progress === undefined || progress === null || progress === 0 && (project.phase || 1) > 1) {
                    const totalPhases = project.totalPhases || 8;
                    const phase = project.phase || 1;
                    progress = Math.round((phase / totalPhases) * 100);
                  }
                  
                  const isActive = project.status === 'In Progress' || project.status === 'Planning';
                  const barColor = isActive ? 'bg-primary' : 'bg-zinc-300';
                  
                  return (
                    <div key={project.id} className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <div className="flex items-center gap-3">
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-primary' : 'bg-zinc-300'}`}></span>
                          <span>{project.name}</span>
                        </div>
                        <span className="text-zinc-500 uppercase">
                          Phase: {project.phase || 1} ({progress}%)
                        </span>
                      </div>
                      <div className="h-1 bg-zinc-100 overflow-hidden">
                        <div className={`h-full ${barColor}`} style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Financial Summary */}
          <section className="bg-white p-6 border border-zinc-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xs font-black uppercase tracking-tight">Financial Summary</h3>
                <p className="text-[10px] text-zinc-500 uppercase mt-0.5">Revenue vs Expenditures trend</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-primary"></span><span className="text-[10px] font-bold uppercase">Revenue</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-slate-800"></span><span className="text-[10px] font-bold uppercase">Expenses</span></div>
                <div className="h-4 w-[1px] bg-zinc-200"></div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Last 3 Months</span>
              </div>
            </div>
            
              <div className="h-52 relative rounded-3xl border border-zinc-100 bg-zinc-50 p-4">
              <div className="absolute inset-x-4 top-4 h-px bg-zinc-200" />
              <div className="absolute inset-x-4 top-16 h-px bg-zinc-200" />
              <div className="absolute inset-x-4 top-28 h-px bg-zinc-200" />
              <div className="absolute inset-x-4 top-40 h-px bg-zinc-200" />
              <div className="absolute inset-x-4 bottom-14 h-px bg-zinc-200" />
              <div className="relative h-full flex items-end gap-3 pt-2 pb-2">
                {loading ? (
                  <div className="w-full flex items-center justify-center text-zinc-400 text-[10px]">Loading financial data...</div>
                ) : (
                  financialData.map((item) => {
                    const revenueHeightPercent = Math.max((item.revenue / maxValue) * 100, 2);
                    const expenseHeightPercent = Math.max((item.expenses / maxValue) * 100, 2);
                    return (
                      <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                        <div className="flex w-full gap-2 items-end justify-center">
                          {/* Revenue bar */}
                          <div className="flex-1 flex flex-col items-center">
                            <div 
                              className="w-full bg-primary rounded-t-sm" 
                              style={{ height: `${revenueHeightPercent}%`, minHeight: '4px', maxHeight: '100%' }} 
                            />
                          </div>
                          {/* Expenses bar */}
                          <div className="flex-1 flex flex-col items-center">
                            <div 
                              className="w-full bg-slate-800 rounded-t-sm" 
                              style={{ height: `${expenseHeightPercent}%`, minHeight: '4px', maxHeight: '100%' }} 
                            />
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500">{item.month}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 text-[10px] font-bold text-zinc-400 uppercase">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" />Revenue</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-800" />Expenses</div>
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <section className="bg-white p-6 border border-zinc-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase flex items-center gap-2">
                <Icon name="calendar_today" className="h-4 w-4 text-primary" />
                Upcoming Deadlines
              </h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 border-l-4 border-primary bg-zinc-50">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-black">Submit DA - Villa 4</h4>
                  <span className="text-[9px] font-black bg-primary text-white px-1.5 py-0.5 uppercase">High</span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase">Modern Villa Design</p>
                <p className="text-[9px] text-zinc-400 mt-2 font-bold uppercase">Oct 24, 2023</p>
              </div>
              
              <div className="p-3 border-l-4 border-black bg-zinc-50">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-black">Structural Review</h4>
                  <span className="text-[9px] font-black bg-black text-white px-1.5 py-0.5 uppercase">Mid</span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase">Skyline Office Tower</p>
                <p className="text-[9px] text-zinc-400 mt-2 font-bold uppercase">Oct 28, 2023</p>
              </div>

              <div className="p-3 border-l-4 border-zinc-200 bg-zinc-50">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-black">Client Meeting</h4>
                  <span className="text-[9px] font-black bg-zinc-200 text-zinc-600 px-1.5 py-0.5 uppercase">Low</span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 uppercase">Urban Park Renovation</p>
                <p className="text-[9px] text-zinc-400 mt-2 font-bold uppercase">Nov 02, 2023</p>
              </div>
            </div>
<button
                onClick={() => setShowCalendar(true)}
                className="w-full mt-4 py-2 border border-zinc-100 text-[10px] font-bold text-primary hover:bg-zinc-50 uppercase tracking-widest transition-colors"
              >
                View Full Calendar
              </button>
            </section>
            {showCalendar && (
              <div className="fixed inset-0 z-50 bg-black/40 p-6 flex items-center justify-center">
                <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                    <div>
                      <h3 className="text-sm font-black uppercase">Full Calendar</h3>
                      <p className="text-[11px] text-zinc-500 mt-1">Upcoming schedule and delivery milestones</p>
                    </div>
                    <button
                      onClick={() => setShowCalendar(false)}
                      className="text-zinc-500 hover:text-black transition-colors text-[13px] font-bold"
                    >
                      Close
                    </button>
                  </div>
                  <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {upcomingCalendar.map((event) => (
                      <div key={event.title} className="flex items-center justify-between gap-4 p-4 bg-zinc-50 rounded-3xl">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{event.title}</p>
                          <p className="text-[11px] text-zinc-500 mt-1">{event.date}</p>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                          event.status === 'High'
                            ? 'bg-rose-100 text-rose-700'
                            : event.status === 'Medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                        >
                          {event.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          {/* Recent Activity */}
          <section className="bg-white p-6 border border-zinc-100 shadow-sm">
            <h3 className="text-xs font-black uppercase mb-6">Recent Activity</h3>
            <div className="space-y-6 relative">
              <div className="absolute left-[13px] top-2 bottom-4 w-[1px] bg-zinc-100"></div>
              
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-4 relative">
                  <div className={`w-7 h-7 rounded-full ${activity.color} text-white flex items-center justify-center shrink-0 z-10 font-bold text-sm`}>
                    {activity.avatar}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold">
                      {activity.user} <span className="text-zinc-500 font-normal">{activity.action} {activity.item}</span>
                    </p>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="h-10 flex-shrink-0 border-t border-zinc-100 flex items-center justify-between pb-6 pt-2">
        <p className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">© 2023 BOXWAY DIGITAL SYSTEMS</p>
        <div className="flex gap-4">
          <a className="text-[9px] font-black text-zinc-400 hover:text-primary uppercase" href="#">Security</a>
          <a className="text-[9px] font-black text-zinc-400 hover:text-primary uppercase" href="#">Privacy</a>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;
