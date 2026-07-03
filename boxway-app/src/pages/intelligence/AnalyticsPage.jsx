import React, { useState, useEffect } from 'react';
import { TrendingUp, Building, DollarSign, Receipt, Users, RefreshCw, Download, BarChart3 } from 'lucide-react';
import axios from 'axios';

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

const AnalyticsPage = () => {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [clients, setClients] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('3M');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, employeesRes, invoicesRes, expensesRes, clientsRes, proposalsRes] = await Promise.all([
          api.get('/projects/'),
          api.get('/employees/'),
          api.get('/invoices/'),
          api.get('/expenses/'),
          api.get('/clients/'),
          api.get('/proposals/'),
        ]);
        setProjects(projectsRes.data.data);
        setEmployees(employeesRes.data.data);
        setInvoices(invoicesRes.data.data);
        setExpenses(expensesRes.data.data);
        setClients(clientsRes.data.data);
        setProposals(proposalsRes.data.data);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Get month abbreviations
  const getMonths = (period) => {
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    let numMonths;

    switch (period) {
      case '3M': numMonths = 3; break;
      case '6M': numMonths = 6; break;
      case '1Y': numMonths = 12; break;
      default: numMonths = 3;
    }

    for (let i = numMonths - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(monthNames[d.getMonth()]);
    }

    return months;
  };

  // Calculate analytics from real data based on period
  const calculateAnalytics = () => {
    const now = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Calculate total revenue from all projects with valid status
    const totalRevenue = projects.filter(p => {
      return REVENUE_PROJECT_STATUSES.has(p.status);
    }).reduce((sum, p) => sum + toNumber(p.budget), 0);

    // Calculate revenue and expenses for the last 3 months
    const revenueByMonth = [];
    const currentMonthIndex = now.getMonth();
    const currentYear = now.getFullYear();

    for (let i = 2; i >= 0; i--) {
      const monthIndex = (currentMonthIndex - i + 12) % 12;
      const year = currentMonthIndex - i >= 0 ? currentYear : currentYear - 1;
      const monthName = monthNames[monthIndex];

      // Show total revenue for all months (not filtered by month)
      const monthRevenue = totalRevenue;

      const monthExpenses = expenses.filter(exp => {
        const expenseDateValue = exp.date && exp.date.trim() !== '' && exp.date !== '-' ? exp.date : exp.createdAt;
        if (!expenseDateValue || exp.status !== 'Approved') {
          return false;
        }
        const expDate = new Date(expenseDateValue);
        if (Number.isNaN(expDate.getTime())) {
          return false;
        }
        return expDate.getMonth() === monthIndex && expDate.getFullYear() === year;
      }).reduce((sum, exp) => sum + toNumber(exp.amount), 0);

      revenueByMonth.push({
        month: monthName,
        revenue: Math.round(monthRevenue),
        expenses: Math.round(monthExpenses)
      });
    }

    // KPIs
    const totalProjectBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const activeProjects = projects.filter(p => p.status === 'In Progress' || p.status === 'Planning').length;
    const avgProjectValue = projects.length > 0 ? totalProjectBudget / projects.length : 0;
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    // Projects by status
    const statusCounts = {};
    projects.forEach(p => {
      const status = p.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    const projectsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      color: status === 'In Progress' ? '#b91c1c' : status === 'Completed' ? '#4b5563' : status === 'On Hold' ? '#6b7280' : '#9ca3af'
    })).sort((a, b) => b.count - a.count);

    // Employees by status
    const employeeStatusCounts = {};
    employees.forEach(e => {
      const status = e.status || 'Unknown';
      employeeStatusCounts[status] = (employeeStatusCounts[status] || 0) + 1;
    });
    const employeesByStatus = Object.entries(employeeStatusCounts).map(([status, count]) => ({
      status,
      count,
      color: status === 'Active' ? '#b91c1c' : status === 'On Leave' ? '#4b5563' : status === 'Inactive' ? '#6b7280' : '#9ca3af'
    })).sort((a, b) => b.count - a.count);

    // Clients by status
    const clientStatusCounts = {};
    clients.forEach(c => {
      const status = c.status || 'Unknown';
      clientStatusCounts[status] = (clientStatusCounts[status] || 0) + 1;
    });
    const clientsByStatus = Object.entries(clientStatusCounts).map(([status, count]) => ({
      status,
      count,
      color: status === 'Active' ? '#b91c1c' : status === 'Inactive' ? '#4b5563' : '#6b7280'
    })).sort((a, b) => b.count - a.count);

    // Proposal win/loss rate based on proposals collection
    const wonProposals = proposals.filter(p => p.status === 'Won').length;
    const lostProposals = proposals.filter(p => p.status === 'Lost').length;
    const totalProposalsCount = wonProposals + lostProposals;
    
    let proposalStats = [];
    if (totalProposalsCount > 0) {
      const wonRate = Math.round((wonProposals / totalProposalsCount) * 100);
      const lostRate = 100 - wonRate;
      proposalStats = [
        { label: 'Won', value: wonRate, color: '#b91c1c' },
        { label: 'Lost', value: lostRate, color: '#4b5563' }
      ];
    } else {
      // Fallback if no proposal data
      proposalStats = [
        { label: 'Won', value: 0, color: '#b91c1c' },
        { label: 'Lost', value: 0, color: '#4b5563' }
      ];
    }

    // Top clients by revenue (from project budgets)
    const clientRevenue = {};
    projects.forEach(p => {
      if (!clientRevenue[p.client]) {
        clientRevenue[p.client] = 0;
      }
      clientRevenue[p.client] += (p.budget || 0);
    });
    const topClients = Object.entries(clientRevenue)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return {
      revenueByMonth,
      kpis: {
        totalRevenue,
        activeProjects,
        avgProjectValue,
        totalExpenses
      },
      projectsByStatus,
      employeesByStatus,
      clientsByStatus,
      topClients,
      proposalStats
    };
  };

  const analytics = calculateAnalytics();
  const revenueMaxValue = Math.max(...analytics.revenueByMonth.map(d => d.revenue), 1) || 1;
  const expenseMaxValue = Math.max(...analytics.revenueByMonth.map(d => d.expenses), 1) || 1;

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const [projectsRes, employeesRes, invoicesRes, expensesRes, clientsRes, proposalsRes] = await Promise.all([
        api.get('/projects/'),
        api.get('/employees/'),
        api.get('/invoices/'),
        api.get('/expenses/'),
        api.get('/clients/'),
        api.get('/proposals/'),
      ]);
      setProjects(projectsRes.data.data);
      setEmployees(employeesRes.data.data);
      setInvoices(invoicesRes.data.data);
      setExpenses(expensesRes.data.data);
      setClients(clientsRes.data.data);
      setProposals(proposalsRes.data.data);
    } catch (err) {
      console.error("Error refreshing analytics data:", err);
      alert("Failed to refresh analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Month', 'Revenue', 'Expenses', 'Profit', 'Margin'].join(','),
      ...analytics.revenueByMonth.map(d => {
        const profit = d.revenue - d.expenses;
        const margin = d.revenue > 0 ? Math.round((profit / d.revenue) * 100) : 0;
        return [d.month, d.revenue, d.expenses, profit, margin].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Bar chart component
  const BarChart = ({ data, keyX, keyA, keyB, labelA, labelB }) => {
    const maxVal = Math.max(...data.map(d => Math.max(d[keyA], d[keyB], 1)));
    return (
      <div className="flex items-end gap-2 h-40">
        {data.map(d => (
        <div key={d[keyX]} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex gap-0.5 items-end" style={{ height: '120px' }}>
            <div className="flex-1 bg-red-700 rounded-t transition-all" style={{ height: `${(d[keyA] / maxVal) * 100}%` }} title={`${labelA}: $${d[keyA].toLocaleString()}`} />
            <div className="flex-1 bg-gray-600 rounded-t transition-all" style={{ height: `${(d[keyB] / maxVal) * 100}%` }} title={`${labelB}: $${d[keyB].toLocaleString()}`} />
          </div>
          <span className="text-[10px] text-zinc-400 font-medium">{d[keyX]}</span>
        </div>
      ))}
      </div>
    );
  };

  // Pie chart component
  const PieChart = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    let currentAngle = 0;
    
    return (
      <div className="flex items-center justify-center">
        <svg width="160" height="160" viewBox="0 0 160 160">
          {data.map((item, index) => {
            if (total === 0) return null;
            const percentage = item.count / total;
            const angle = percentage * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            const x1 = 80 + 70 * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = 80 + 70 * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = 80 + 70 * Math.cos((endAngle - 90) * Math.PI / 180);
            const y2 = 80 + 70 * Math.sin((endAngle - 90) * Math.PI / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            currentAngle += angle;
            
            if (percentage === 1) {
              return (
                <circle key={index} cx="80" cy="80" r="70" fill={item.color} />
              );
            }
            
            return (
              <path
                key={index}
                d={`M 80 80 L ${x1} ${y1} A 70 70 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                fill={item.color}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
          {total === 0 && (
            <circle cx="80" cy="80" r="70" fill="#e5e7eb" />
          )}
        </svg>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f6f6]">
      {/* Header Container */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-slate-500 mt-1">Business performance insights and metrics</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleRefresh} disabled={loading} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 text-sm font-bold rounded hover:bg-slate-50 shadow-sm disabled:opacity-50">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <div className="flex bg-white rounded border border-slate-200 overflow-hidden shadow-sm">
              {['3M', '6M', '1Y'].map(p => (
                <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 text-xs font-bold transition-colors ${period === p ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'}`}>{p}</button>
              ))}
            </div>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 text-sm font-bold rounded hover:bg-slate-50 shadow-sm">
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="px-8 py-6 bg-[#f8f6f6]">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 border border-zinc-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-400 font-black uppercase mb-1">Total Revenue</p>
              <h3 className="text-2xl font-black">${(analytics.kpis.totalRevenue / 1000).toFixed(0)}K</h3>
            </div>
            <div className="text-emerald-600"><DollarSign className="text-[28px]" /></div>
          </div>
          <div className="bg-white p-4 border border-zinc-100 shadow-sm flex items-center justify-between border-l-2 border-l-primary">
            <div>
              <p className="text-[10px] text-zinc-400 font-black uppercase mb-1">Active Projects</p>
              <h3 className="text-2xl font-black">{analytics.kpis.activeProjects}</h3>
            </div>
            <div className="text-primary"><Building className="text-[28px]" /></div>
          </div>
          <div className="bg-white p-4 border border-zinc-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-400 font-black uppercase mb-1">Avg Project Value</p>
              <h3 className="text-2xl font-black">${(analytics.kpis.avgProjectValue / 1000).toFixed(0)}K</h3>
            </div>
            <div className="text-purple-600"><DollarSign className="text-[28px]" /></div>
          </div>
          <div className="bg-white p-4 border border-zinc-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-400 font-black uppercase mb-1">Total Expenses</p>
              <h3 className="text-2xl font-black">${(analytics.kpis.totalExpenses / 1000).toFixed(0)}K</h3>
            </div>
            <div className="text-amber-600"><Receipt className="text-[28px]" /></div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Revenue Chart */}
          <div className="col-span-1 lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider">Revenue vs Expenses</h3>
              <div className="flex items-center gap-4 text-[10px]">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-primary" />Revenue</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-800" />Expenses</span>
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
                  analytics.revenueByMonth.map((item) => {
                    const revenueHeightPercent = Math.max((item.revenue / revenueMaxValue) * 100, 2);
                    const expenseHeightPercent = Math.max((item.expenses / expenseMaxValue) * 100, 2);
                    return (
                      <div key={item.month} className="flex-1 h-full flex flex-col items-center gap-2 min-w-0">
                        <div className="flex h-full w-full gap-2 items-end justify-center px-1">
                          <div className="flex h-full w-6 shrink-0 items-end justify-center">
                            <div
                              className="w-6 bg-primary rounded-t-sm border border-black/10 box-border"
                              style={{ height: `${revenueHeightPercent}%`, minHeight: '4px', maxHeight: '100%' }}
                            />
                          </div>
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
          </div>

          {/* Project Status */}
          <div className="col-span-1 lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-4">Projects by Status</h3>
            <div className="space-y-4">
              {analytics.projectsByStatus.map(item => {
                const max = analytics.projectsByStatus.length > 0 ? analytics.projectsByStatus[0].count : 1;
                return (
                  <div key={item.status}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 font-semibold">{item.status}</span>
                      <span className="font-black" style={{ color: item.color }}>{item.count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full">
                      <div className="h-2 rounded-full" style={{ width: `${(item.count / max) * 100}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Clients */}
          <div className="col-span-1 lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-4">Top Clients by Revenue</h3>
            <div className="space-y-4">
              {analytics.topClients.map((c, i) => {
                const max = analytics.topClients.length > 0 ? analytics.topClients[0].value : 1;
                return (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="text-[10px] font-black w-4 text-slate-400">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-700">{c.name}</span>
                        <span className="font-black text-xs text-slate-900">${(c.value / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full">
                        <div className="h-1.5 bg-primary rounded-full" style={{ width: `${(c.value / max) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Proposal Win/Loss Rate - Bar Chart */}
          <div className="col-span-1 lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-4">Proposal Win/Loss Rate</h3>
            <div className="space-y-4">
              {analytics.proposalStats.map((item, i) => {
                const max = 100;
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-[10px] font-black w-4 text-slate-400">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-700">{item.label}</span>
                        <span className="font-black text-xs text-slate-900">{item.value}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full">
                        <div className="h-1.5 bg-slate-900 rounded-full" style={{ width: `${(item.value / max) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Employee Status - Pie Chart */}
          <div className="col-span-1 lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-4">Employees by Status</h3>
            <div className="flex flex-col items-center gap-4">
              <PieChart data={analytics.employeesByStatus} />
              <div className="flex flex-wrap justify-center gap-3">
                {analytics.employeesByStatus.map(item => (
                  <div key={item.status} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-slate-600">{item.status}</span>
                    <span className="text-xs font-bold text-slate-900">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Client Status - Pie Chart */}
          <div className="col-span-1 lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-4">Clients by Status</h3>
            <div className="flex flex-col items-center gap-4">
              <PieChart data={analytics.clientsByStatus} />
              <div className="flex flex-wrap justify-center gap-3">
                {analytics.clientsByStatus.map(item => (
                  <div key={item.status} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs text-slate-600">{item.status}</span>
                    <span className="text-xs font-bold text-slate-900">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
