import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import Icon from "../../components/ui/Icon.jsx"
import { useTranslation } from '../../store/settingsStore';
import { useFormatters } from '../../store/settingsStore';

const api = axios.create({
  baseURL: window.location.hostname === 'localhost'
    ? 'http://localhost:8001/api'
    : 'https://boxxway.onrender.com/api'
});

const APPROVAL_STAGES = [
  { key: 'initial', label: 'Initial Enquiry', desc: 'Submitted by studio team' },
  { key: 'review', label: 'Review Discussion', desc: 'Internal review & client consultation' },
  { key: 'approved', label: 'Approved', desc: 'Client has signed off' },
];

const statusConfig = {
  Draft: { cls: 'bg-zinc-100 text-zinc-600' },
  Submitted: { cls: 'bg-blue-100 text-blue-700' },
  'Under Review': { cls: 'bg-amber-100 text-amber-700' },
  Won: { cls: 'bg-emerald-100 text-emerald-700' },
  Lost: { cls: 'bg-red-100 text-red-700' },
};

const ViewProposalPage = () => {
  const { formatCurrency, formatDate } = useFormatters();

  const { t } = useTranslation();

  const navigate = useNavigate();
  const { id } = useParams();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentStage, setCurrentStage] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [likedIds, setLikedIds] = useState([]);
  const [expandedReplies, setExpandedReplies] = useState([]);
  const [showFeeBreakdown, setShowFeeBreakdown] = useState(false);
  const [feeBreakdown, setFeeBreakdown] = useState({
    retainer: 10,
    monthlyFixed: 0,
    contingency: 15,
    designPhase: 20,
    documentationPhase: 30,
    constructionAdmin: 25,
  });

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const response = await api.get(`/proposals/${id}`);
        setProposal(response.data.data);
        setCurrentStage(
          response.data.data.status === 'Won' ? 2 : response.data.data.status === 'Under Review' ? 1 : 0
        );
        setFeeBreakdown({
          retainer: 10,
          monthlyFixed: Math.round(response.data.data.value / 12),
          contingency: 15,
          designPhase: 20,
          documentationPhase: 30,
          constructionAdmin: 25,
        });

        // Fetch comments
        try {
          const commentsRes = await api.get(`/proposals/${id}/comments`);
          setComments(commentsRes.data.data || []);
        } catch (err) {
          console.error('Error fetching comments:', err);
        }
      } catch (err) {
        console.error("Error fetching proposal:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProposal();
  }, [id]);

  const stageColors = ['bg-zinc-100 text-zinc-400', 'bg-amber-50 text-amber-700 border-amber-200', 'bg-emerald-50 text-emerald-700 border-emerald-200'];

  const cfg = statusConfig[proposal?.status] || statusConfig.Draft;

  const submitComment = () => {
    if (!newComment.trim()) return;
    setComments(prev => [...prev, {
      id: Date.now(),
      author: 'Alex Carter',
      role: 'Admin',
      avatar: 'AC',
      color: 'bg-primary',
      time: 'Just now',
      stage: APPROVAL_STAGES[currentStage].key,
      text: newComment,
      actions: { like: 0, reply: 0 },
    }]);
    setNewComment('');
  };

  const advanceStage = async () => {
    if (currentStage < APPROVAL_STAGES.length - 1) {
      try {
        const next = currentStage + 1;
        const statusMap = { 0: 'Draft', 1: 'Under Review', 2: 'Won' };
        await api.patch(`/proposals/${id}`, { status: statusMap[next] });
        setCurrentStage(next);
        setProposal(prev => ({ ...prev, status: statusMap[next] }));
        setComments(prev => [...prev, {
          id: Date.now(),
          author: 'System',
          role: 'Boxway Studio',
          avatar: '⚡',
          color: 'bg-zinc-500',
          time: 'Just now',
          stage: APPROVAL_STAGES[next].key,
          text: `Status advanced to "${APPROVAL_STAGES[next].label}". This action was recorded automatically.`,
          actions: { like: 0, reply: 0 },
          isSystem: true,
        }]);
      } catch (err) {
        console.error("Error advancing stage:", err);
        alert("Failed to advance stage. Please try again.");
      }
    }
  };

  const handleSendToClient = async () => {
    try {
      await api.patch(`/proposals/${id}`, { status: 'Submitted' });
      setProposal(prev => ({ ...prev, status: 'Submitted' }));
      alert('Proposal sent to client successfully!');
    } catch (err) {
      console.error("Error sending proposal:", err);
      alert("Failed to send proposal. Please try again.");
    }
  };

  const handleDownload = () => {
    if (!proposal) return;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('PROPOSAL', 20, 20);
    doc.setFontSize(12);
    doc.text(`Title: ${proposal.title}`, 20, 35);
    doc.text(`Client: ${proposal.client}`, 20, 45);
    doc.text(`Lead: ${proposal.lead}`, 20, 55);
    doc.text(`Status: ${proposal.status}`, 20, 65);
    doc.text(`Phase: ${proposal.phase}`, 20, 75);
    doc.text(`Value: $${formatCurrency(proposal.value.toLocaleString())}`, 20, 85);
    doc.text(`Submitted: ${proposal.submittedDate || 'Not yet submitted'}`, 20, 95);
    doc.save(`proposal-${proposal.id}.pdf`);
  };

  const handleFeeBreakdown = () => {
    setShowFeeBreakdown(!showFeeBreakdown);
  };

  const handleFeeChange = (field, value) => {
    setFeeBreakdown(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleSaveFeeBreakdown = async () => {
    try {
      const totalValue = feeBreakdown.monthlyFixed * 12;
      await api.patch(`/proposals/${id}`, {
        value: totalValue,
      });
      setProposal(prev => ({ ...prev, value: totalValue }));
      alert('Fee breakdown saved successfully!');
    } catch (err) {
      console.error('Error saving fee breakdown:', err);
      alert('Failed to save fee breakdown. Please try again.');
    }
  };

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'scope', label: 'Detailed Scope' },
    { key: 'budget', label: 'Budget' },
    { key: 'timeline', label: 'Timeline' },
    { key: 'documents', label: 'Documents' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#fcf9f8]">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-[#fcf9f8]/95 backdrop-blur border-b border-zinc-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/proposals')} className="text-zinc-400 hover:text-zinc-700 transition-colors">
            <Icon name="arrow_back" className="text-[20px]" />
          </button>
          <div>
            <h2 className="text-lg font-black tracking-tight text-zinc-900 uppercase">{proposal?.title || 'Loading...'}</h2>
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Proposal #{proposal?.id || '...'} · v{proposal?.version || '1'}</p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${cfg.cls}`}>{proposal?.status || 'Loading'}</span>
          <button onClick={handleDownload} className="px-5 py-2.5 border border-zinc-200 text-zinc-700 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-colors">{t('Download PDF')}</button>
        </div>
      </div>

      <div className="px-8 pb-16 pt-6 max-w-7xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-zinc-400">{t('Loading proposal...')}</div>
          </div>
        ) : !proposal ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-zinc-400">{t('Proposal not found')}</div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="text-[10px] tracking-[0.15em] text-primary uppercase font-black">Proposal #{proposal.id}</span>
                <h3 className="text-4xl font-black tracking-tighter text-zinc-900 mt-1">{proposal.title}</h3>
                <p className="text-zinc-500 mt-2">{proposal.client} · {proposal.lead}</p>
              </div>
            </div>

            {/* Approval Stage Timeline */}
            <div className="grid grid-cols-3 gap-0 mb-8 overflow-hidden border border-zinc-100">
              {APPROVAL_STAGES.map((stage, i) => {
                const isDone = i < currentStage;
                const isCurrent = i === currentStage;
                return (
                  <div key={stage.key} className={`p-6 relative transition-all ${isDone ? 'bg-emerald-50' : isCurrent ? 'bg-white' : 'bg-zinc-50/50 opacity-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] tracking-[0.15em] uppercase font-black ${isDone ? 'text-emerald-600' : isCurrent ? 'text-primary' : 'text-zinc-400'}`}>
                      Phase {String(i + 1).padStart(2, '0')}
                    </span>
                    {isDone && <Icon name="check_circle" style={{ fontVariationSettings: "'FILL' 1" }} className="text-emerald-500 text-[16px]" />}
                    {isCurrent && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                  </div>
                  <h4 className="font-black text-zinc-900">{stage.label}</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{stage.desc}</p>
                  <div className={`absolute bottom-0 left-0 h-1 transition-all ${isDone ? 'w-full bg-emerald-500' : isCurrent ? 'w-1/2 bg-primary' : 'w-0 bg-zinc-200'}`} />
                  </div>
                );
              })}
            </div>

            {/* Stage Action Button */}
            {currentStage < APPROVAL_STAGES.length - 1 && (
              <div className="mb-6 flex items-center gap-3 p-4 bg-amber-50 border border-amber-200">
                <Icon name="pending_actions" className="text-amber-600 text-[20px]" />
                <p className="text-xs text-amber-800 font-semibold flex-1">{t('Currently in')}<strong>{APPROVAL_STAGES[currentStage].label}</strong> phase. Ready to advance?
                </p>
                <button onClick={advanceStage} className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors">
                  Advance to {APPROVAL_STAGES[currentStage + 1].label} →
                </button>
              </div>
            )}
            {currentStage === APPROVAL_STAGES.length - 1 && (
              <div className="mb-6 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200">
                <Icon name="check_circle" style={{ fontVariationSettings: "'FILL' 1" }} className="text-emerald-600 text-[20px]" />
                <p className="text-xs text-emerald-800 font-semibold">{t('This proposal has been fully')}<strong>{t('Approved')}</strong>. All stages complete.</p>
              </div>
            )}

            <div className="grid grid-cols-12 gap-8">
              {/* Left */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                {/* Tabs */}
                <div className="border-b border-zinc-100 flex gap-8">
                  {TABS.map(t => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)} className={`pb-3.5 text-[10px] font-black uppercase tracking-widest transition-colors border-b-2 ${activeTab === t.key ? 'border-primary text-primary' : 'border-transparent text-zinc-400 hover:text-zinc-700'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Client', val: proposal.client },
                        { label: 'Client Contact', val: proposal.clientContact },
                        { label: 'Proposal Value', val: `$${formatCurrency(proposal.value.toLocaleString())}`, cls: 'text-primary font-black text-lg' },
                        { label: 'Lead Architect', val: proposal.lead },
                        { label: 'Submitted', val: proposal.submittedDate || 'Not yet submitted' },
                        { label: 'Expires', val: proposal.expiryDate || '—' },
                      ].map(f => (
                      <div key={f.label} className="bg-zinc-50 p-4 border-l-4 border-zinc-100">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">{f.label}</p>
                        <p className={`text-sm font-semibold ${f.cls || 'text-zinc-900'}`}>{f.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scope Tab */}
              {activeTab === 'scope' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-black mb-4">{t('Scope of Work')}</h3>
                  {[
                    { num: '01', title: 'Architectural Concept Design', desc: 'Initial spatial programming, massing studies, and exterior aesthetic direction. Includes 3D visualization and site integration analysis.', hours: '40 Hours' },
                    { num: '02', title: 'Material Specification & Sourcing', desc: 'Curation of bespoke materials including carbonized wood cladding, basalt flooring, and custom glazing solutions.', hours: '24 Hours' },
                    { num: '03', title: 'Structural Engineering Liaison', desc: 'Coordinating with regional structural engineers to ensure the cantilevered elements meet safety and regulatory requirements.', hours: '16 Hours' },
                    { num: '04', title: 'Planning Application Support', desc: 'Preparation and submission of planning documentation, liaison with local authority planning officers.', hours: '20 Hours' },
                  ].map(item => (
                    <div key={item.num} className="p-6 bg-zinc-50 hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-zinc-100">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex gap-5">
                          <span className="text-primary font-black font-mono text-sm">{item.num}</span>
                          <div>
                            <h5 className="font-black text-zinc-900 mb-1">{item.title}</h5>
                            <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 whitespace-nowrap">{item.hours}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Budget Tab */}
              {activeTab === 'budget' && (
                <div>
                  <div className="bg-zinc-900 text-white p-8 mb-4">
                    <p className="text-[9px] text-white/40 uppercase tracking-widest mb-2">{t('Total Professional Fees')}</p>
                    <p className="text-4xl font-black">{formatCurrency(proposal.value.toLocaleString())}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Retainer (10%)', val: `$${formatCurrency(Math.round(proposal.value * 0.1).toLocaleString())}` },
                      { label: 'Monthly Fixed', val: `$${formatCurrency(Math.round(proposal.value / 12).toLocaleString())}` },
                      { label: 'Contingency (15%)', val: `$${formatCurrency(Math.round(proposal.value * 0.15).toLocaleString())}` },
                    ].map(f => (
                      <div key={f.label} className="bg-zinc-50 border border-zinc-100 p-4">
                        <p className="text-[9px] text-zinc-400 uppercase tracking-widest mb-1">{f.label}</p>
                        <p className="text-lg font-black text-zinc-900">{f.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline Tab */}
              {activeTab === 'timeline' && (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { phase: 'M01', title: 'Concept Approval', date: 'Week 4', sub: 'Feb 15, 2024' },
                    { phase: 'M02', title: 'Detailed Documentation', date: 'Week 12', sub: 'Apr 10, 2024' },
                    { phase: 'M03', title: 'Planning Submission', date: 'Week 20', sub: 'Jun 5, 2024' },
                    { phase: 'M04', title: 'Construction Start', date: 'Week 32', sub: 'Sep 1, 2024' },
                  ].map((m, i) => (
                    <div key={m.phase} className={`p-5 border-l-4 ${i === 0 ? 'border-primary bg-white shadow-sm' : 'border-zinc-200 bg-zinc-50'}`}>
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary">{m.phase}</span>
                      <h6 className="font-black text-zinc-900 mt-1">{m.title}</h6>
                      <p className="text-xs text-zinc-400 mt-1">{m.date} — {m.sub}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="space-y-2">
                  {[
                    { name: 'Initial_Brief.pdf', size: '2.1 MB', type: 'PDF', date: proposal.submittedDate },
                    { name: 'Site_Survey.dwg', size: '18.4 MB', type: 'DWG', date: proposal.submittedDate },
                    { name: 'Client_References.zip', size: '45 MB', type: 'ZIP', date: proposal.submittedDate },
                  ].map(doc => (
                    <div key={doc.name} className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 hover:bg-white transition-all group">
                      <div className="flex items-center gap-3">
                        <Icon name="description" className="text-zinc-400 text-[20px]" />
                        <div>
                          <p className="text-xs font-black text-zinc-800">{doc.name}</p>
                          <p className="text-[10px] text-zinc-400">{doc.size} · {doc.date}</p>
                        </div>
                      </div>
                      <button className="p-1.5 hover:bg-zinc-200 opacity-0 group-hover:opacity-100 transition-all">
                        <Icon name="download" className="text-[18px] text-zinc-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ─── COMMENTS / APPROVAL TIMELINE ─── */}
              <div className="mt-10 pt-8 border-t border-zinc-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-black text-zinc-900 text-lg">{t('Approval Activity Log')}</h3>
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{comments.length} entries</span>
                </div>

                {/* Compose */}
                <div className="flex gap-3 mb-8">
                  <div className="w-8 h-8 bg-primary text-white text-[11px] font-black flex items-center justify-center shrink-0">{t('AC')}</div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      rows={2}
                      placeholder={t('Add a note, update, or action item...')}
                      className="w-full border border-zinc-200 bg-zinc-50 text-sm px-4 py-3 focus:outline-none focus:border-primary resize-none"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex gap-2">
                        {APPROVAL_STAGES.map((s, i) => (
                          <button key={s.key} onClick={() => setCurrentStage(i)} className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 border transition-colors ${currentStage === i ? 'bg-primary text-white border-primary' : 'border-zinc-200 text-zinc-400 hover:border-zinc-400'}`}>{s.label}</button>
                        ))}
                      </div>
                      <button onClick={submitComment} disabled={!newComment.trim()} className="px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-40">{t('Post')}</button>
                    </div>
                  </div>
                </div>

                {/* Comments list */}
                <div className="space-y-6">
                  {comments.map(c => (
                    <div key={c.id} className={`flex gap-3 ${c.isSystem ? 'opacity-60' : ''}`}>
                      <div className={`w-8 h-8 ${c.color} text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5`}>
                        {typeof c.avatar === 'string' && c.avatar.length <= 2 ? c.avatar : '⚡'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-xs font-black text-zinc-900">{c.author}</span>
                          <span className="text-[9px] text-zinc-400 font-medium">{c.role}</span>
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 ${
                            c.stage === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                            c.stage === 'review' ? 'bg-amber-100 text-amber-700' :
                            'bg-zinc-100 text-zinc-500'
                          }`}>{APPROVAL_STAGES.find(s => s.key === c.stage)?.label}</span>
                          <span className="text-[9px] text-zinc-300 ml-auto">{c.time}</span>
                        </div>
                        <p className={`text-sm leading-relaxed ${c.isSystem ? 'text-zinc-400 italic' : 'text-zinc-700'}`}>{c.text}</p>
                        {!c.isSystem && (
                          <div className="flex items-center gap-4 mt-2">
                            <button
                              onClick={() => setLikedIds(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id])}
                              className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${likedIds.includes(c.id) ? 'text-primary' : 'text-zinc-400 hover:text-zinc-700'}`}
                            >
                              <Icon name="thumb_up" style={{ fontVariationSettings: `'FILL' ${likedIds.includes(c.id) ? 1 : 0}` }} className="text-[14px]" />
                              {c.actions.like + (likedIds.includes(c.id) ? 1 : 0)}
                            </button>
                            <button
                              onClick={() => setExpandedReplies(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id])}
                              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-700 transition-colors"
                            >
                              <Icon name="reply" className="text-[14px]" />{t('Reply')}</button>
                          </div>
                        )}
                        {expandedReplies.includes(c.id) && (
                          <div className="mt-3 ml-4 border-l-2 border-zinc-100 pl-4">
                            <input
                              placeholder={t('Write a reply...')}
                              className="w-full text-sm border border-zinc-200 px-3 py-2 bg-zinc-50 focus:outline-none focus:border-primary"
                              onKeyDown={e => e.key === 'Enter' && setExpandedReplies(prev => prev.filter(x => x !== c.id))}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="col-span-12 lg:col-span-4 space-y-5 overflow-y-auto max-h-screen">
              {/* Dark Client Card */}
              <div className="bg-zinc-900 text-white p-7">
                <span className="text-[9px] tracking-[0.15em] uppercase text-white/40 font-black">{t('Client Entity')}</span>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-11 h-11 bg-white/10 flex items-center justify-center font-black text-lg">
                    {proposal.client?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{proposal.client}</h4>
                    <p className="text-white/50 text-xs">{proposal.clientContact}</p>
                  </div>
                </div>
                <hr className="my-5 border-white/10" />
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/40 uppercase tracking-wider">{t('Status')}</span>
                    <span className="font-bold text-white">{proposal.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40 uppercase tracking-wider">{t('Version')}</span>
                    <span className="font-bold text-white">v{proposal.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/40 uppercase tracking-wider">{t('Lead')}</span>
                    <span className="font-bold text-white">{proposal.lead}</span>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-white border-l-4 border-primary p-7 shadow-sm">
                <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-black">{t('Financial Summary')}</span>
                <div className="mt-4">
                  <p className="text-3xl font-black tracking-tighter text-zinc-900">{formatCurrency(proposal.value.toLocaleString())}</p>
                  <p className="text-xs text-zinc-400 mt-1">{t('Total Estimated Professional Fees')}</p>
                </div>
                <hr className="my-4 border-zinc-100" />
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-zinc-400">Retainer (10%)</span><span className="font-black">{formatCurrency(Math.round(proposal.value * 0.1).toLocaleString())}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-400">{t('Monthly Fixed')}</span><span className="font-black">{formatCurrency(Math.round(proposal.value / 12).toLocaleString())}</span></div>
                </div>
                <button onClick={handleFeeBreakdown} className="w-full mt-5 py-2.5 border border-zinc-200 text-zinc-700 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-colors">{t('View Fee Breakdown')}</button>
                {showFeeBreakdown && (
                  <div className="mt-4 p-4 bg-zinc-50 border border-zinc-200 space-y-3 text-xs max-h-96 overflow-y-auto">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-zinc-400">Retainer (%)</span>
                      <input
                        type="number"
                        value={feeBreakdown.retainer}
                        onChange={(e) => handleFeeChange('retainer', e.target.value)}
                        className="w-20 px-2 py-1 border border-zinc-200 text-right font-black"
                      />
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-zinc-400">Monthly Fixed ($)</span>
                      <input
                        type="number"
                        value={feeBreakdown.monthlyFixed}
                        onChange={(e) => handleFeeChange('monthlyFixed', e.target.value)}
                        className="w-24 px-2 py-1 border border-zinc-200 text-right font-black"
                      />
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-zinc-400">Contingency (%)</span>
                      <input
                        type="number"
                        value={feeBreakdown.contingency}
                        onChange={(e) => handleFeeChange('contingency', e.target.value)}
                        className="w-20 px-2 py-1 border border-zinc-200 text-right font-black"
                      />
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-zinc-400">Design Phase (%)</span>
                      <input
                        type="number"
                        value={feeBreakdown.designPhase}
                        onChange={(e) => handleFeeChange('designPhase', e.target.value)}
                        className="w-20 px-2 py-1 border border-zinc-200 text-right font-black"
                      />
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-zinc-400">Documentation Phase (%)</span>
                      <input
                        type="number"
                        value={feeBreakdown.documentationPhase}
                        onChange={(e) => handleFeeChange('documentationPhase', e.target.value)}
                        className="w-20 px-2 py-1 border border-zinc-200 text-right font-black"
                      />
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-zinc-400">Construction Admin (%)</span>
                      <input
                        type="number"
                        value={feeBreakdown.constructionAdmin}
                        onChange={(e) => handleFeeChange('constructionAdmin', e.target.value)}
                        className="w-20 px-2 py-1 border border-zinc-200 text-right font-black"
                      />
                    </div>
                    <button onClick={handleSaveFeeBreakdown} className="w-full mt-3 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors">{t('Save Fee Breakdown')}</button>
                  </div>
                )}
              </div>

              {/* Approval action */}
              <div className="bg-white border border-zinc-100 p-5 shadow-sm space-y-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">{t('Quick Actions')}</p>
                <button onClick={() => navigate(`/proposals/${id}/edit`)} className="w-full py-2.5 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-2">
                  <Icon name="edit" className="text-[16px]" />{t('Edit Proposal')}</button>
                {currentStage < APPROVAL_STAGES.length - 1 && (
                  <button onClick={advanceStage} className="w-full py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-2">
                    <Icon name="arrow_forward" className="text-[16px]" />
                    Advance to {APPROVAL_STAGES[currentStage + 1].label}
                  </button>
                )}
              </div>
            </div>
          </div>
          </>
        )}
        </div>
    </div>
  );
};

export default ViewProposalPage;