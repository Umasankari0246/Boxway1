import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Icon from "../../components/ui/Icon.jsx"
import { useTranslation } from '../../store/settingsStore';
import { useFormatters } from '../../store/settingsStore';

const api = axios.create({
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:8001/api'
    : 'https://boxxway.onrender.com/api',
});

const typeConfig = {
  warning: { bgCard: 'border-l-4 border-red-500 bg-red-50', iconColor: 'text-red-500', badge: 'bg-red-100 text-red-700' },
  opportunity: { bgCard: 'border-l-4 border-green-500 bg-green-50', iconColor: 'text-green-500', badge: 'bg-green-100 text-green-700' },
  alert: { bgCard: 'border-l-4 border-orange-500 bg-orange-50', iconColor: 'text-orange-500', badge: 'bg-orange-100 text-orange-700' },
  insight: { bgCard: 'border-l-4 border-blue-500 bg-blue-50', iconColor: 'text-blue-500', badge: 'bg-blue-100 text-blue-700' },
  positive: { bgCard: 'border-l-4 border-green-500 bg-green-50', iconColor: 'text-green-500', badge: 'bg-green-100 text-green-700' },
};

const AIInsightsPage = () => {
  const navigate = useNavigate();
  const { formatCurrency, formatDate } = useFormatters();

  const { t } = useTranslation();

  const [filter, setFilter] = useState('All');
  const [chat, setChat] = useState([{ role: 'ai', text: 'Hello! I\'m your Boxway AI assistant. I can analyze your project data, financials, and team performance. What would you like to explore today?' }]);
  const [input, setInput] = useState('');
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAiOpen, setIsAiOpen] = useState(true);

  const handleActionClick = (category, action) => {
    if (action === 'View Invoice') return navigate('/invoices');
    if (action === 'Contact Client') return navigate('/clients');
    if (category === 'Finance') return navigate('/analytics');
    if (category === 'Sales') return navigate('/clients');
    if (category === 'Resources') return navigate('/employees');
    if (category === 'Projects') return navigate('/projects');
    navigate('/');
  };

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await api.get('/insights/');
        setInsights(response.data.data || []);
      } catch (err) {
        console.error('Error fetching insights:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  const priorities = ['All', 'High', 'Medium', 'Low'];
  const filtered = insights.filter(i => filter === 'All' || i.priority === filter);

  const predefined = [
    'Which clients are most at risk of churn?',
    'What is the revenue forecast for Q2?',
    'Show me team utilization by department',
    'Which projects are over budget?',
  ];

  const AI_RESPONSES = {
    'Which clients are most at risk of churn?': 'Based on payment history and engagement data, **Sunrise Hospitality** (INV-2023-045 overdue 45+ days) and **Park & Associates** (no new projects in 90 days) are at highest churn risk. Recommend immediate outreach.',
    'What is the revenue forecast for Q2?': 'Projected Q2 2024 revenue: **$198,000–$215,000** based on: Active project milestones ($145K), Pending proposals ($53K expected). This represents a 14% growth over Q1.',
    'Show me team utilization by department': 'Design Dept: 112% (⚠️ Over-allocated). Engineering: 78%. Management: 95%. Finance: 60%. Marcus Johnson is the most over-allocated individual at 115%.',
    'Which projects are over budget?': 'No projects are currently over budget. **Meridian Tower** is at 49% spend with 45% completion (healthy). **Sunrise Boutique Hotel** (completed) came in at 98.4% of budget — excellent.',
  };

  const sendMessage = (msg) => {
    if (!msg.trim()) return;
    const userMsg = { role: 'user', text: msg };
    const aiResponse = AI_RESPONSES[msg] || 'I\'ve analyzed your request. Based on the current project and financial data, I recommend reviewing the Payroll Dashboard for anomalies and reaching out to clients with overdue invoices within the next 48 hours.';
    setChat(prev => [...prev, userMsg, { role: 'ai', text: aiResponse }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f6f6]">
      {/* Header Container */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 z-10">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500 mt-1">{t('Powered by intelligent analysis of your business data')}</p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />{t('AI Active')}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 relative">
        <div className="grid grid-cols-12 gap-6 relative">
        {/* Insights Feed */}
        <div className={`transition-all duration-300 ${isAiOpen ? 'col-span-12 lg:col-span-7' : 'col-span-12'}`}>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="font-bold text-slate-900">{t('Smart Alerts & Recommendations')}</h3>
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{insights.length}</span>
          </div>
          <div className="flex gap-2 mb-4">
            {priorities.map(p => (
              <button key={p} onClick={() => setFilter(p)} className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${filter === p ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{p}</button>
            ))}
          </div>
          <div className="space-y-4">
            {filtered.map(insight => {
              const cfg = typeConfig[insight.type] || typeConfig.insight;
              return (
                <div key={insight.id} className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden`}>
                  <div className={`p-5 ${cfg.bgCard}`}>
                    <div className="flex items-start gap-4">
                      <Icon name={insight.icon} className={`${cfg.iconColor} shrink-0`} />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-bold text-sm text-slate-900">{insight.title}</p>
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${cfg.badge}`}>{insight.priority}</span>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">{insight.category}</span>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">{insight.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-xs text-slate-400">Generated {insight.generatedAt}</p>
                          <button onClick={() => handleActionClick(insight.category, insight.action)} className="text-xs font-bold text-primary hover:underline">{insight.action} →</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Chat */}
        {isAiOpen && (
          <div className="col-span-12 lg:col-span-5 transition-all duration-300 relative">
            <div className="lg:sticky lg:top-6 z-40 w-full">
              <div className="bg-zinc-900 rounded-xl overflow-hidden flex flex-col h-[600px] shadow-2xl">
              <div className="p-5 border-b border-white/10 flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Icon name="psychology" className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{t('Boxway AI')}</p>
                    <p className="text-zinc-400 text-xs">{t('Business Intelligence Assistant')}</p>
                  </div>
                </div>
                <button onClick={() => setIsAiOpen(false)} className="text-zinc-500 hover:text-white transition-colors p-1 bg-white/5 rounded-full hover:bg-white/10">
                  <Icon name="close" className="text-lg" />
                </button>
              </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chat.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white/10 text-zinc-100'}`}>
                    {msg.text.split('**').map((part, j) => j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part)}
                  </div>
                </div>
              ))}
            </div>

            {/* Predefined Questions */}
            <div className="px-4 pb-2 flex gap-2 flex-wrap">
              {predefined.map(q => (
                <button key={q} onClick={() => sendMessage(q)} className="text-[10px] font-semibold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-full transition-colors border border-white/10 text-left leading-tight">
                  {q}
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                  placeholder={t('Ask anything about your business...')}
                  className="flex-1 bg-white/10 text-white placeholder-zinc-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-white/10"
                />
                <button onClick={() => sendMessage(input)} disabled={!input.trim()} className="p-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-40 transition-colors">
                  <Icon name="send" />
                </button>
              </div>
            </div>
          </div>
          </div>
          </div>
        )}

        {/* Floating AI Button when minimized */}
        {!isAiOpen && (
          <button 
            onClick={() => setIsAiOpen(true)}
            className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:bg-zinc-800 transition-all hover:scale-105 z-50 group"
            title="Open Boxway AI"
          >
            <Icon name="psychology" className="text-2xl text-primary group-hover:text-white transition-colors" />
          </button>
        )}
      </div>
      </div>
    </div>
  );
};

export default AIInsightsPage;