import React, { useState } from 'react';
import { MOCK_ANALYTICS } from '../../data/mockData';
import Icon from "../../components/ui/Icon.jsx"

const BarChart = ({ data, keyX, keyA, keyB, labelA, labelB }) => {
  const maxVal = Math.max(...data.map(d => Math.max(d[keyA], d[keyB])));
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map(d => (
        <div key={d[keyX]} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex gap-0.5 items-end" style={{ height: '120px' }}>
            <div className="flex-1 bg-primary rounded-t transition-all" style={{ height: `${(d[keyA] / maxVal) * 100}%` }} title={`${labelA}: $${d[keyA].toLocaleString()}`} />
            <div className="flex-1 bg-slate-200 rounded-t transition-all" style={{ height: `${(d[keyB] / maxVal) * 100}%` }} title={`${labelB}: $${d[keyB].toLocaleString()}`} />
          </div>
          <span className="text-[10px] text-slate-400 font-medium">{d[keyX]}</span>
        </div>
      ))}
    </div>
  );
};

const AnalyticsPage = () => {
  const { kpis, revenueByMonth, projectsByStatus, topClients } = MOCK_ANALYTICS;
  const [period, setPeriod] = useState('7M');

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-[#f8f6f6]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Analytics & Reports</h2>
          <p className="text-sm text-slate-500">Business performance insights for your architecture firm</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded border border-slate-200 overflow-hidden">
            {['3M', '7M', '1Y'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 text-xs font-bold transition-colors ${period === p ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'}`}>{p}</button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 text-sm font-semibold rounded hover:bg-slate-50">
            <Icon name="download" className="text-lg" /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Revenue (YTD)', val: '$' + (kpis.totalRevenue / 1000).toFixed(0) + 'K', sub: `+${kpis.revenueGrowth}% vs last year`, icon: 'trending_up', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Active Projects', val: kpis.activeProjects, sub: 'Currently in progress', icon: 'architecture', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Proposal Win Rate', val: kpis.proposalWinRate + '%', sub: 'Past 6 months', icon: 'thumb_up', color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Avg Project Value', val: '$' + (kpis.avgProjectValue / 1000).toFixed(0) + 'K', sub: 'Per project', icon: 'apartment', color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Outstanding Invoices', val: '$' + (kpis.outstandingInvoices / 1000).toFixed(0) + 'K', sub: 'Needs collection', icon: 'receipt_long', color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Team Utilization', val: '87%', sub: 'Average across teams', icon: 'group', color: 'text-teal-600', bg: 'bg-teal-50' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-start gap-4">
            <div className={`w-10 h-10 ${k.bg} rounded-xl flex items-center justify-center shrink-0`}>
              <Icon name={k.icon} className={`${k.color} text-[20px]`} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{k.label}</p>
              <p className={`text-2xl font-black mt-0.5 ${k.color}`}>{k.val}</p>
              <p className="text-xs text-slate-400 mt-0.5">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Revenue Chart */}
        <div className="col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-slate-900">Revenue vs Expenses</h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-primary" />Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-200" />Expenses</span>
            </div>
          </div>
          <BarChart data={revenueByMonth} keyX="month" keyA="revenue" keyB="expenses" labelA="Revenue" labelB="Expenses" />
        </div>

        {/* Project Status */}
        <div className="col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-4">Projects by Status</h3>
          <div className="space-y-4">
            {projectsByStatus.map(item => (
              <div key={item.status}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 font-medium">{item.status}</span>
                  <span className="font-bold" style={{ color: item.color }}>{item.count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full">
                  <div className="h-2 rounded-full" style={{ width: `${(item.count / 5) * 100}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Clients */}
        <div className="col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 mb-4">Top Clients by Revenue</h3>
          <div className="space-y-4">
            {topClients.map((c, i) => {
              const max = topClients[0].value;
              return (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold w-4 text-slate-400">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700 text-xs">{c.name}</span>
                      <span className="font-bold text-xs text-slate-900">${(c.value / 1000).toFixed(0)}K</span>
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

        {/* Monthly Breakdown Table */}
        <div className="col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Monthly Performance</h3>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50"><tr>
              {['Month', 'Revenue', 'Expenses', 'Profit', 'Margin'].map(col => (
                <th key={col} className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{col}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {revenueByMonth.map(d => {
                const profit = d.revenue - d.expenses;
                const margin = Math.round((profit / d.revenue) * 100);
                return (
                  <tr key={d.month} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-semibold text-sm text-slate-700">{d.month}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">${(d.revenue / 1000).toFixed(0)}K</td>
                    <td className="px-5 py-3 text-sm text-red-500">-${(d.expenses / 1000).toFixed(0)}K</td>
                    <td className="px-5 py-3 text-sm font-bold text-green-600">+${(profit / 1000).toFixed(0)}K</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${margin > 35 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{margin}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;