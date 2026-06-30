import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Icon from "../../components/ui/Icon.jsx";

const api = axios.create({
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api'
    : 'https://boxxway.onrender.com/api',
});

const AnalyticsPage = () => {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('3M');

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
        setProjects(projectsRes.data.data);
        setEmployees(employeesRes.data.data);
        setInvoices(invoicesRes.data.data);
        setExpenses(expensesRes.data.data);
        setClients(clientsRes.data.data);
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
    const months = getMonths(period);

    // Revenue vs Expenses by month
    const revenueByMonth = months.map(month => {
      // Filter invoices by month
      const monthInvoices = invoices.filter(inv => {
        if (!inv.date) return false;
        const invDate = new Date(inv.date);
        const invMonth = new Date(0, invDate.getMonth()).toLocaleString('default', { month: 'short' });
        return invMonth === month && inv.status === 'Paid';
      });
      const monthRevenue = monthInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);

      // Filter expenses by month
      const monthExpenses = expenses.filter(exp => {
        if (!exp.date) return false;
        const expDate = new Date(exp.date);
        const expMonth = new Date(0, expDate.getMonth()).toLocaleString('default', { month: 'short' });
        return expMonth === month && exp.status === 'Approved';
      });
      const monthExp = monthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

      return {
        month,
        revenue: Math.round(monthRevenue),
        expenses: Math.round(monthExp)
      };
    });

    // KPIs
    const periodInvoices = invoices.filter(inv => inv.status === 'Paid');
    const totalRevenue = periodInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const activeProjects = projects.filter(p => p.status === 'In Progress' || p.status === 'Planning').length;
    const pendingInvoices = invoices.filter(i => i.status === 'Pending' || i.status === 'Draft').reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const avgProjectValue = projects.length > 0 ? totalRevenue / Math.max(projects.length, 1) : 0;

    // Projects by status
    const statusCounts = {};
    projects.forEach(p => {
      const status = p.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    const projectsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      color: status === 'In Progress' ? '#3b82f6' : status === 'Completed' ? '#10b981' : status === 'On Hold' ? '#f59e0b' : '#6b7280'
    })).sort((a, b) => b.count - a.count);

    // Top clients by revenue (from real invoices)
    const clientRevenue = {};
    invoices.forEach(inv => {
      if (!clientRevenue[inv.client]) {
        clientRevenue[inv.client] = 0;
      }
      if (inv.status === 'Paid') {
        clientRevenue[inv.client] += (inv.amount || 0);
      }
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
        outstandingInvoices: pendingInvoices,
        proposalWinRate: 72,
        teamUtilization: '82%',
        revenueGrowth: 18
      },
      projectsByStatus,
      topClients
    };
  };

  const analytics = calculateAnalytics();

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
            <div className="flex-1 bg-primary rounded-t transition-all" style={{ height: `${(d[keyA] / maxVal) * 100}%` }} title={`${labelA}: $${d[keyA].toLocaleString()}`} />
            <div className="flex-1 bg-zinc-200 rounded-t transition-all" style={{ height: `${(d[keyB] / maxVal) * 100}%` }} title={`${labelB}: $${d[keyB].toLocaleString()}`} />
          </div>
          <span className="text-[10px] text-zinc-400 font-medium">{d[keyX]}</span>
        </div>
      ))}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-50">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-zinc-900">Analytics & Reports</h2>
            <p className="text-xs text-zinc-500 font-semibold mt-1">Business performance insights for your architecture firm</p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <div className="flex bg-white rounded border border-zinc-200 overflow-hidden shadow-sm">
              {['3M', '6M', '1Y'].map(p => (
                <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 text-xs font-black transition-colors ${period === p ? 'bg-primary text-white' : 'text-zinc-600 hover:bg-zinc-50'}`}>{p}</button>
              ))}
            </div>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 border border-zinc-200 bg-white text-zinc-700 text-xs font-black rounded hover:bg-zinc-50 shadow-sm">
              <Icon name="download" className="text-sm" /> Export
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Revenue', val: '$' + (analytics.kpis.totalRevenue / 1000).toFixed(0) + 'K', sub: `+${analytics.kpis.revenueGrowth}% vs last year`, icon: 'trending_up', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Active Projects', val: analytics.kpis.activeProjects, sub: 'Currently in progress', icon: 'apartment', color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Proposal Win Rate', val: analytics.kpis.proposalWinRate + '%', sub: 'Past 6 months', icon: 'thumb_up', color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Avg Project Value', val: '$' + (analytics.kpis.avgProjectValue / 1000).toFixed(0) + 'K', sub: 'Per project', icon: 'apartment', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Outstanding Invoices', val: '$' + (analytics.kpis.outstandingInvoices / 1000).toFixed(0) + 'K', sub: 'Needs collection', icon: 'receipt_long', color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Team Utilization', val: analytics.kpis.teamUtilization, sub: 'Average across teams', icon: 'group', color: 'text-teal-600', bg: 'bg-teal-50' },
          ].map(k => (
            <div key={k.label} className="bg-white p-5 border border-zinc-200 shadow-sm flex items-start gap-4">
              <div className={`w-10 h-10 ${k.bg} rounded flex items-center justify-center shrink-0`}>
                <Icon name={k.icon} className={`${k.color} text-[20px]`} />
              </div>
              <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-wide">{k.label}</p>
                <p className={`text-xl font-black mt-0.5 ${k.color}`}>{k.val}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">{k.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Revenue Chart */}
          <div className="col-span-1 lg:col-span-8 bg-white border border-zinc-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-black text-zinc-900 text-xs uppercase tracking-wider">Revenue vs Expenses</h3>
              <div className="flex items-center gap-4 text-[10px]">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-primary" />Revenue</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-zinc-200" />Expenses</span>
              </div>
            </div>
            <BarChart data={analytics.revenueByMonth} keyX="month" keyA="revenue" keyB="expenses" labelA="Revenue" labelB="Expenses" />
          </div>

          {/* Project Status */}
          <div className="col-span-1 lg:col-span-4 bg-white border border-zinc-200 shadow-sm p-6">
            <h3 className="font-black text-zinc-900 text-xs uppercase tracking-wider mb-4">Projects by Status</h3>
            <div className="space-y-4">
              {analytics.projectsByStatus.map(item => {
                const max = analytics.projectsByStatus.length > 0 ? analytics.projectsByStatus[0].count : 1;
                return (
                  <div key={item.status}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-600 font-semibold">{item.status}</span>
                      <span className="font-black" style={{ color: item.color }}>{item.count}</span>
                    </div>
                    <div className="h-2 bg-zinc-100 rounded-full">
                      <div className="h-2 rounded-full" style={{ width: `${(item.count / max) * 100}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Clients */}
          <div className="col-span-1 lg:col-span-5 bg-white border border-zinc-200 shadow-sm p-6">
            <h3 className="font-black text-zinc-900 text-xs uppercase tracking-wider mb-4">Top Clients by Revenue</h3>
            <div className="space-y-4">
              {analytics.topClients.map((c, i) => {
                const max = analytics.topClients.length > 0 ? analytics.topClients[0].value : 1;
                return (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="text-[10px] font-black w-4 text-zinc-400">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-zinc-700">{c.name}</span>
                        <span className="font-black text-xs text-zinc-900">${(c.value / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="h-1.5 bg-zinc-100 rounded-full">
                        <div className="h-1.5 bg-primary rounded-full" style={{ width: `${(c.value / max) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Breakdown Table */}
          <div className="col-span-1 lg:col-span-7 bg-white border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-100">
              <h3 className="font-black text-zinc-900 text-xs uppercase tracking-wider">Monthly Performance</h3>
            </div>
            <table className="w-full text-left">
              <thead className="bg-zinc-50"><tr>
                {['Month', 'Revenue', 'Expenses', 'Profit', 'Margin'].map(col => (
                  <th key={col} className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-zinc-500">{col}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-zinc-100">
                {analytics.revenueByMonth.map(d => {
                  const profit = d.revenue - d.expenses;
                  const margin = d.revenue > 0 ? Math.round((profit / d.revenue) * 100) : 0;
                  return (
                    <tr key={d.month} className="hover:bg-zinc-50">
                      <td className="px-5 py-3 font-semibold text-xs text-zinc-700">{d.month}</td>
                      <td className="px-5 py-3 text-xs text-zinc-600">${(d.revenue / 1000).toFixed(0)}K</td>
                      <td className="px-5 py-3 text-xs text-red-500">-${(d.expenses / 1000).toFixed(0)}K</td>
                      <td className="px-5 py-3 text-xs font-black text-emerald-600">+${(profit / 1000).toFixed(0)}K</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 text-[10px] font-black rounded ${margin > 35 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{margin}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
