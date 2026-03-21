import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MOCK_PROPOSALS } from '../../data/mockData';

const APPROVAL_STAGES = [
  { key: 'initial', label: 'Initial Enquiry', desc: 'Submitted by studio team' },
  { key: 'review', label: 'Review Discussion', desc: 'Internal review & client consultation' },
  { key: 'approved', label: 'Approved', desc: 'Client has signed off' },
];

const MOCK_COMMENTS = [
  { id: 1, author: 'Alex Carter', role: 'Admin', avatar: 'AC', color: 'bg-primary', time: '2 days ago', stage: 'initial', text: 'Enquiry received and logged. All client details verified against our conflict-of-interest register — clear to proceed. Assigned to Marcus Johnson as lead architect.', actions: { like: 4, reply: 1 } },
  { id: 2, author: 'Marcus Johnson', role: 'Senior Architect', avatar: 'MJ', color: 'bg-zinc-700', time: '1 day ago', stage: 'initial', text: 'Reviewed the site brief. The vision aligns well with our brutalist portfolio. Initial thoughts: the cantilevered east wing will require early structural consultant input. Will schedule a client meeting for this week.', actions: { like: 6, reply: 2 } },
  { id: 3, author: 'Priya Nair', role: 'Project Manager', avatar: 'PN', color: 'bg-blue-600', time: '1 day ago', stage: 'review', text: 'Client meeting scheduled for Thursday 2PM. Shared the preliminary concept massing with the client — extremely positive response. They want to explore the "void" aesthetic further. Updating the proposal to v1.2.', actions: { like: 3, reply: 0 } },
  { id: 4, author: 'Alex Carter', role: 'Admin', avatar: 'AC', color: 'bg-primary', time: '18 hours ago', stage: 'review', text: 'Proposal v1.2 reviewed internally. Budget allocation looks solid. Recommend proceeding to client sign-off. Please circulate the updated fee letter.', actions: { like: 2, reply: 1 } },
];

const statusConfig = {
  Draft: { cls: 'bg-zinc-100 text-zinc-600' },
  Submitted: { cls: 'bg-blue-100 text-blue-700' },
  'Under Review': { cls: 'bg-amber-100 text-amber-700' },
  Won: { cls: 'bg-emerald-100 text-emerald-700' },
  Lost: { cls: 'bg-red-100 text-red-700' },
};

const ViewProposalPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const proposal = MOCK_PROPOSALS.find(p => p.id === id) || MOCK_PROPOSALS[0];
  const [activeTab, setActiveTab] = useState('overview');
  const [currentStage, setCurrentStage] = useState(
    proposal.status === 'Won' ? 2 : proposal.status === 'Under Review' ? 1 : 0
  );
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const [likedIds, setLikedIds] = useState([]);
  const [expandedReplies, setExpandedReplies] = useState([]);

  const stageColors = ['bg-zinc-100 text-zinc-400', 'bg-amber-50 text-amber-700 border-amber-200', 'bg-emerald-50 text-emerald-700 border-emerald-200'];

  const cfg = statusConfig[proposal.status] || statusConfig.Draft;

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

  const advanceStage = () => {
    if (currentStage < APPROVAL_STAGES.length - 1) {
      const next = currentStage + 1;
      setCurrentStage(next);
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
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <h2 className="text-lg font-black tracking-tight text-zinc-900 uppercase">{proposal.title}</h2>
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Proposal #{proposal.id} · v{proposal.version}</p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${cfg.cls}`}>{proposal.status}</span>
          <button className="px-5 py-2.5 border border-zinc-200 text-zinc-700 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-colors">Download PDF</button>
          <button className="px-5 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors">Send Proposal</button>
        </div>
      </div>

      <div className="px-8 pb-16 pt-6 max-w-7xl">
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
                  {isDone && <span className="material-symbols-outlined text-emerald-500 text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
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
            <span className="material-symbols-outlined text-amber-600 text-[20px]">pending_actions</span>
            <p className="text-xs text-amber-800 font-semibold flex-1">
              Currently in <strong>{APPROVAL_STAGES[currentStage].label}</strong> phase. Ready to advance?
            </p>
            <button onClick={advanceStage} className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors">
              Advance to {APPROVAL_STAGES[currentStage + 1].label} →
            </button>
          </div>
        )}
        {currentStage === APPROVAL_STAGES.length - 1 && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200">
            <span className="material-symbols-outlined text-emerald-600 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <p className="text-xs text-emerald-800 font-semibold">This proposal has been fully <strong>Approved</strong>. All stages complete.</p>
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
                    { label: 'Proposal Value', val: `$${proposal.value.toLocaleString()}`, cls: 'text-primary font-black text-lg' },
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
                <h3 className="text-xl font-black mb-4">Scope of Work</h3>
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
                  <p className="text-[9px] text-white/40 uppercase tracking-widest mb-2">Total Professional Fees</p>
                  <p className="text-4xl font-black">${proposal.value.toLocaleString()}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Retainer (10%)', val: `$${Math.round(proposal.value * 0.1).toLocaleString()}` },
                    { label: 'Monthly Fixed', val: `$${Math.round(proposal.value / 12).toLocaleString()}` },
                    { label: 'Contingency (15%)', val: `$${Math.round(proposal.value * 0.15).toLocaleString()}` },
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
                      <span className="material-symbols-outlined text-zinc-400 text-[20px]">description</span>
                      <div>
                        <p className="text-xs font-black text-zinc-800">{doc.name}</p>
                        <p className="text-[10px] text-zinc-400">{doc.size} · {doc.date}</p>
                      </div>
                    </div>
                    <button className="p-1.5 hover:bg-zinc-200 opacity-0 group-hover:opacity-100 transition-all">
                      <span className="material-symbols-outlined text-[18px] text-zinc-500">download</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ─── COMMENTS / APPROVAL TIMELINE ─── */}
            <div className="mt-10 pt-8 border-t border-zinc-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-zinc-900 text-lg">Approval Activity Log</h3>
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{comments.length} entries</span>
              </div>

              {/* Compose */}
              <div className="flex gap-3 mb-8">
                <div className="w-8 h-8 bg-primary text-white text-[11px] font-black flex items-center justify-center shrink-0">AC</div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    rows={2}
                    placeholder="Add a note, update, or action item..."
                    className="w-full border border-zinc-200 bg-zinc-50 text-sm px-4 py-3 focus:outline-none focus:border-primary resize-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-2">
                      {APPROVAL_STAGES.map((s, i) => (
                        <button key={s.key} onClick={() => setCurrentStage(i)} className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 border transition-colors ${currentStage === i ? 'bg-primary text-white border-primary' : 'border-zinc-200 text-zinc-400 hover:border-zinc-400'}`}>{s.label}</button>
                      ))}
                    </div>
                    <button onClick={submitComment} disabled={!newComment.trim()} className="px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-40">Post</button>
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
                            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: `'FILL' ${likedIds.includes(c.id) ? 1 : 0}` }}>thumb_up</span>
                            {c.actions.like + (likedIds.includes(c.id) ? 1 : 0)}
                          </button>
                          <button
                            onClick={() => setExpandedReplies(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id])}
                            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-700 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">reply</span>
                            Reply
                          </button>
                        </div>
                      )}
                      {expandedReplies.includes(c.id) && (
                        <div className="mt-3 ml-4 border-l-2 border-zinc-100 pl-4">
                          <input
                            placeholder="Write a reply..."
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
          <div className="col-span-12 lg:col-span-4 space-y-5">
            {/* Dark Client Card */}
            <div className="bg-zinc-900 text-white p-7">
              <span className="text-[9px] tracking-[0.15em] uppercase text-white/40 font-black">Client Entity</span>
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
                  <span className="text-white/40 uppercase tracking-wider">Status</span>
                  <span className="font-bold text-white">{proposal.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 uppercase tracking-wider">Version</span>
                  <span className="font-bold text-white">v{proposal.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 uppercase tracking-wider">Lead</span>
                  <span className="font-bold text-white">{proposal.lead}</span>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-white border-l-4 border-primary p-7 shadow-sm">
              <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-black">Financial Summary</span>
              <div className="mt-4">
                <p className="text-3xl font-black tracking-tighter text-zinc-900">${proposal.value.toLocaleString()}</p>
                <p className="text-xs text-zinc-400 mt-1">Total Estimated Professional Fees</p>
              </div>
              <hr className="my-4 border-zinc-100" />
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-zinc-400">Retainer (10%)</span><span className="font-black">${Math.round(proposal.value * 0.1).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Monthly Fixed</span><span className="font-black">${Math.round(proposal.value / 12).toLocaleString()}</span></div>
              </div>
              <button className="w-full mt-5 py-2.5 border border-zinc-200 text-zinc-700 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-colors">View Fee Breakdown</button>
            </div>

            {/* Approval action */}
            <div className="bg-white border border-zinc-100 p-5 shadow-sm space-y-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">Quick Actions</p>
              <button onClick={() => navigate(`/proposals/new`)} className="w-full py-2.5 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[16px]">edit</span>Edit Proposal
              </button>
              {currentStage < APPROVAL_STAGES.length - 1 && (
                <button onClick={advanceStage} className="w-full py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  Advance to {APPROVAL_STAGES[currentStage + 1].label}
                </button>
              )}
              <button className="w-full py-2.5 border border-zinc-200 text-zinc-600 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-colors">
                Send to Client
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProposalPage;
