import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Icon from '../components/ui/Icon.jsx';

const api = axios.create({
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api'
    : 'https://boxxway.onrender.com/api',
});

const REVENUE_PROJECT_STATUSES = new Set(['Planning', 'In Progress', 'Completed']);

const toNumber = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};




const DashboardPage = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, employeesRes, invoicesRes, expensesRes, clientsRes] = await Promise.all([
          api.get('/projects/'),
          api.get('/employees/'),
          api.get('/invoices/'),
          api.get('/expenses/'),
          api.get('/clients/'),
        ]);
        console.log('=== DASHBOARD API RESPONSE DEBUGGING ===');
        console.log('Projects API Response:');
        console.table(projectsRes.data.data);
        console.log('Projects JSON:', JSON.stringify(projectsRes.data.data, null, 2));
        console.log('Employees API Full Response:', employeesRes.data);
        console.log('Employees API Response:');
        console.table(employeesRes.data.data);
        console.log('Employees JSON:', JSON.stringify(employeesRes.data.data, null, 2));
        const employeeRecords = Array.isArray(employeesRes.data?.data)
          ? employeesRes.data.data
          : Array.isArray(employeesRes.data)
            ? employeesRes.data
            : [];
        console.log('Employees record count:', employeeRecords.length);
        employeeRecords.forEach((employee, index) => {
          console.log(`Employee ${index}:`, {
            id: employee.id,
            name: employee.name,
            status: employee.status,
            department: employee.department,
            role: employee.role
          });
        });
        console.log('Expenses API Full Response:', expensesRes.data);
        console.log('Expenses API Response:');
        console.table(expensesRes.data.data);
        console.log('Expenses JSON:', JSON.stringify(expensesRes.data.data, null, 2));
        console.log('Dashboard API Response - Expenses:', expensesRes.data.data);
        const expenseRecords = expensesRes.data.data;
        console.log('Expenses record count:', Array.isArray(expenseRecords) ? expenseRecords.length : 0);
        (Array.isArray(expenseRecords) ? expenseRecords : []).forEach((expense, index) => {
          console.log(`Expense ${index}:`, {
            id: expense.id,
            amount: expense.amount,
            date: expense.date,
            status: expense.status
          });
        });
        console.log('=== END API RESPONSE DEBUGGING ===');
        setProjects(projectsRes.data.data);
        setEmployees(employeeRecords);
        setInvoices(invoicesRes.data.data);
        setExpenses(expenseRecords);
        setClients(clientsRes.data.data);
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
  const totalRevenue = totalBudget; // Use project budgets as total revenue (same as Analytics)
  const teamCount = employees.length;

  // Financial data from API - calculate last 3 months individually
  const getFinancialData = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const currentMonthIndex = now.getMonth();
    const currentYear = now.getFullYear();
    
    console.log('=== FINANCIAL DATA CALCULATION DEBUGGING ===');
    console.log('Dashboard - Current Month Index:', currentMonthIndex, 'Year:', currentYear);
    console.log('Dashboard - Number of projects:', projects.length);
    console.log('Dashboard - Number of expenses:', expenses.length);
    
    // Inspect each project's fields
    projects.forEach((p, idx) => {
      console.log(`Project ${idx}:`, {
        id: p.id,
        name: p.name,
        startDate: p.startDate,
        budget: p.budget,
        status: p.status,
        startDateType: typeof p.startDate,
        budgetType: typeof p.budget,
        statusType: typeof p.status
      });
      if (p.startDate) {
        console.log(`  - startDate parsed:`, new Date(p.startDate));
      }
    });
    
    // Inspect each expense's fields
    expenses.forEach((e, idx) => {
      console.log(`Expense ${idx}:`, {
        id: e.id,
        title: e.title,
        date: e.date,
        amount: e.amount,
        status: e.status,
        dateType: typeof e.date,
        amountType: typeof e.amount,
        statusType: typeof e.status
      });
      if (e.date) {
        console.log(`  - date parsed:`, new Date(e.date));
      }
    });
    
    const data = [];
    
    // Generate last 3 months data individually
    for (let i = 2; i >= 0; i--) {
      const monthIndex = (currentMonthIndex - i + 12) % 12;
      const year = currentMonthIndex - i >= 0 ? currentYear : currentYear - 1;
      const monthName = monthNames[monthIndex];
      
      console.log(`Dashboard - Processing month: ${monthName} (index: ${monthIndex}, year: ${year})`);
      
      // Calculate revenue from project budgets for this specific month
      const monthRevenue = projects.filter(p => {
        // Use startDate if available, otherwise fall back to createdAt
        const projectDate = p.startDate && p.startDate.trim() !== '' ? p.startDate : p.createdAt;
        if (!projectDate) {
          console.log(`  - Project "${p.name}" skipped: no startDate or createdAt`);
          return false;
        }
        const projDate = new Date(projectDate);
        const matchesMonth = projDate.getMonth() === monthIndex;
        const matchesYear = projDate.getFullYear() === year;
        const matchesStatus = REVENUE_PROJECT_STATUSES.has(p.status);
        
        console.log(`  - Project "${p.name}":`, {
          projectDate,
          projDate: projDate,
          matchesMonth,
          matchesYear,
          status: p.status,
          matchesStatus,
          budget: p.budget
        });
        
        return matchesMonth && matchesYear && matchesStatus;
      }).reduce((sum, p) => sum + toNumber(p.budget), 0);
      
      // Calculate expenses for this specific month
      const monthExpenses = expenses.filter(exp => {
        const expenseDateValue = exp.date && exp.date.trim() !== '' && exp.date !== '-' ? exp.date : exp.createdAt;

        if (!expenseDateValue || exp.status !== 'Approved') {
          if (!expenseDateValue) console.log(`  - Expense "${exp.title}" skipped: no valid date`);
          if (exp.status !== 'Approved') console.log(`  - Expense "${exp.title}" skipped: status is "${exp.status}" not "Approved"`);
          return false;
        }
        const expDate = new Date(expenseDateValue);
        if (Number.isNaN(expDate.getTime())) {
          console.log(`  - Expense "${exp.title}" skipped: invalid date value`, expenseDateValue);
          return false;
        }
        const matchesMonth = expDate.getMonth() === monthIndex;
        const matchesYear = expDate.getFullYear() === year;
        
        console.log(`  - Expense "${exp.title}":`, {
          id: exp.id,
          expenseDateValue,
          expDate: expDate,
          matchesMonth,
          matchesYear,
          status: exp.status,
          amount: exp.amount
        });
        
        return matchesMonth && matchesYear;
      }).reduce((sum, exp) => sum + (exp.amount || 0), 0);
      
      console.log(`Dashboard - ${monthName} Revenue: ${monthRevenue}, Expenses: ${monthExpenses}`);
      
      data.push({
        month: monthName,
        revenue: Math.round(monthRevenue),
        expenses: Math.round(monthExpenses)
      });
    }
    
    console.log('Dashboard - Final financial data:', data);
    console.log('=== END FINANCIAL DATA DEBUGGING ===');
    return data;
  };
  
  const financialData = getFinancialData();
  const allValues = financialData.flatMap(d => [d.revenue, d.expenses]);
  const maxValue = Math.max(...allValues, 1) || 1;
  const revenueMaxValue = Math.max(...financialData.map(d => d.revenue), 1) || 1;
  const expenseMaxValue = Math.max(...financialData.map(d => d.expenses), 1) || 1;
  
  console.log('Dashboard - All values:', allValues);
  console.log('Dashboard - Max value:', maxValue);

  // Generate recent activity from real data with timestamps
  const generateRecentActivity = () => {
    const activities = [];
    const now = new Date();

    const getLifecycleAction = (createdAt, updatedAt, label) => {
      if (createdAt && updatedAt && new Date(updatedAt).getTime() > new Date(createdAt).getTime()) {
        return `updated ${label}`;
      }
      return `added ${label}`;
    };

    // Helper to format time difference
    const formatTime = (date) => {
      if (!date) return 'Recently';
      const diff = now - new Date(date);
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      return 'Recently';
    };

    // Add invoice activities (sorted by date)
    invoices.forEach(invoice => {
      const date = invoice.updatedAt || invoice.createdAt;
      activities.push({
        id: `invoice-${invoice.id}`,
        type: 'invoice',
        user: invoice.client || 'Client',
        action: getLifecycleAction(invoice.createdAt, invoice.updatedAt, 'invoice'),
        item: invoice.invoiceId || `#${invoice.id}`,
        time: formatTime(date),
        timestamp: date ? new Date(date).getTime() : 0,
        avatar: 'I',
        color: invoice.updatedAt && invoice.createdAt && new Date(invoice.updatedAt).getTime() > new Date(invoice.createdAt).getTime() ? 'bg-emerald-500' : 'bg-primary',
      });
    });

    // Add expense activities
    expenses.forEach(expense => {
      const date = expense.updatedAt || expense.createdAt;
      activities.push({
        id: `expense-${expense.id}`,
        type: 'expense',
        user: expense.submittedBy || 'User',
        action: getLifecycleAction(expense.createdAt, expense.updatedAt, 'expense'),
        item: expense.title || 'Expense',
        time: formatTime(date),
        timestamp: date ? new Date(date).getTime() : 0,
        avatar: 'E',
        color: expense.updatedAt && expense.createdAt && new Date(expense.updatedAt).getTime() > new Date(expense.createdAt).getTime() ? 'bg-emerald-500' : 'bg-orange-500',
      });
    });

    // Add project activities
    projects.forEach(project => {
      const date = project.updatedAt || project.createdAt;
      activities.push({
        id: `project-${project.id}`,
        type: 'project',
        user: project.lead || 'Lead',
        action: getLifecycleAction(project.createdAt, project.updatedAt, 'project'),
        item: project.name,
        time: formatTime(date),
        timestamp: date ? new Date(date).getTime() : 0,
        avatar: 'P',
        color: project.updatedAt && project.createdAt && new Date(project.updatedAt).getTime() > new Date(project.createdAt).getTime() ? 'bg-primary' : 'bg-zinc-500',
      });
    });

    // Add employee activities
    employees.forEach(employee => {
      const date = employee.updatedAt || employee.createdAt;
      const employeeName = employee.name || employee.firstName || 'Employee';
      activities.push({
        id: `employee-${employee.id}`,
        type: 'employee',
        user: employeeName,
        action: getLifecycleAction(employee.createdAt, employee.updatedAt, 'employee'),
        item: employee.role || 'Team Member',
        time: formatTime(date),
        timestamp: date ? new Date(date).getTime() : 0,
        avatar: employeeName[0].toUpperCase(),
        color: employee.updatedAt && employee.createdAt && new Date(employee.updatedAt).getTime() > new Date(employee.createdAt).getTime() ? 'bg-sky-500' : 'bg-zinc-500',
      });
    });

    // Add client activities
    clients.forEach(client => {
      const date = client.updatedAt || client.createdAt;
      activities.push({
        id: `client-${client.id}`,
        type: 'client',
        user: client.name || 'Client',
        action: getLifecycleAction(client.createdAt, client.updatedAt, 'client'),
        item: client.company || 'Organization',
        time: formatTime(date),
        timestamp: date ? new Date(date).getTime() : 0,
        avatar: (client.name || 'C')[0].toUpperCase(),
        color: client.updatedAt && client.createdAt && new Date(client.updatedAt).getTime() > new Date(client.createdAt).getTime() ? 'bg-purple-500' : 'bg-zinc-500',
      });
    });

    // Sort by timestamp (most recent first) and take first 5
    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  };

  const activityFeed = generateRecentActivity();
  const recentActivity = activityFeed;

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
              <p className="text-[10px] text-zinc-400 font-black uppercase mb-1">Total Revenue</p>
              <h3 className="text-2xl font-black">
                {loading ? '...' : `$${(totalRevenue / 1000).toFixed(0)}K`}
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
              <button onClick={() => navigate('/projects')} className="text-[10px] font-bold text-primary hover:underline uppercase">View All</button>
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
            
              <div className="h-52 relative overflow-hidden rounded-3xl border border-zinc-100 bg-zinc-50 p-4">
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
                    const revenueHeightPercent = Math.max((item.revenue / revenueMaxValue) * 100, 2);
                    const expenseHeightPercent = Math.max((item.expenses / expenseMaxValue) * 100, 2);
                    return (
                      <div key={item.month} className="flex-1 h-full flex flex-col items-center gap-2 min-w-0">
                        <div className="flex h-full w-full gap-2 items-end justify-center px-1">
                          {/* Revenue bar */}
                          <div className="flex h-full w-6 shrink-0 items-end justify-center">
                            <div 
                              className="w-6 bg-primary rounded-t-sm border border-black/10 box-border" 
                              style={{ height: `${revenueHeightPercent}%`, minHeight: '4px', maxHeight: '100%' }} 
                            />
                          </div>
                          {/* Expenses bar */}
                          <div className="flex h-full w-6 shrink-0 items-end justify-center">
                            <div 
                              className="w-6 bg-slate-800 rounded-t-sm border border-black/10 box-border" 
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
        <div className="flex h-full flex-col gap-6 min-h-0">
          {/* Recent Activity */}
          <section className="bg-white p-6 border border-zinc-100 shadow-sm flex flex-col flex-1 min-h-0">
            <h3 className="text-xs font-black uppercase mb-6">Recent Activity</h3>
            <div className="relative flex-1 min-h-0 space-y-6 overflow-y-auto pr-1">
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
