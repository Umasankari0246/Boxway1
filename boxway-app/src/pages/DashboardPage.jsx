import React from 'react';
import Icon from '../components/ui/Icon.jsx';

const DashboardPage = () => {
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
              <h3 className="text-2xl font-black">12</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 border border-zinc-100 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 grid place-items-center">
              <Icon name="payments" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 font-black uppercase mb-1">Revenue</p>
              <h3 className="text-2xl font-black">$84,200</h3>
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
              <h3 className="text-2xl font-black">05</h3>
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
              <h3 className="text-2xl font-black">28</h3>
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
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    <span>Modern Villa Design - Palm Jumeirah</span>
                  </div>
                  <span className="text-zinc-500 uppercase">Phase: Concept (75%)</span>
                </div>
                <div className="h-1 bg-zinc-100 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                    <span>Skyline Office Tower - Central Plaza</span>
                  </div>
                  <span className="text-zinc-500 uppercase">Phase: Documentation (40%)</span>
                </div>
                <div className="h-1 bg-zinc-100 overflow-hidden">
                  <div className="h-full bg-black" style={{ width: '40%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    <span>Urban Park Renovation - Sector 4</span>
                  </div>
                  <span className="text-zinc-500 uppercase">Phase: Construction (90%)</span>
                </div>
                <div className="h-1 bg-zinc-100 overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '90%' }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
                    <span>Coastal Resort Planning - Blue Bay</span>
                  </div>
                  <span className="text-zinc-500 uppercase">Phase: Planning (20%)</span>
                </div>
                <div className="h-1 bg-zinc-100 overflow-hidden">
                  <div className="h-full bg-zinc-300" style={{ width: '20%' }}></div>
                </div>
              </div>
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
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-black/10"></span><span className="text-[10px] font-bold uppercase">Expenses</span></div>
                <div className="h-4 w-[1px] bg-zinc-200"></div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Last 6 Months</span>
              </div>
            </div>
            
            <div className="h-48 flex items-end justify-between gap-4 px-2">
              <div className="flex-1 flex flex-col justify-end gap-1"><div className="bg-black w-full h-[30%]"></div><div className="bg-primary w-full h-[60%]"></div></div>
              <div className="flex-1 flex flex-col justify-end gap-1"><div className="bg-black w-full h-[40%]"></div><div className="bg-primary w-full h-[80%]"></div></div>
              <div className="flex-1 flex flex-col justify-end gap-1"><div className="bg-black w-full h-[20%]"></div><div className="bg-primary w-full h-[50%]"></div></div>
              <div className="flex-1 flex flex-col justify-end gap-1"><div className="bg-black w-full h-[35%]"></div><div className="bg-primary w-full h-[70%]"></div></div>
              <div className="flex-1 flex flex-col justify-end gap-1"><div className="bg-black w-full h-[50%]"></div><div className="bg-primary w-full h-[90%]"></div></div>
              <div className="flex-1 flex flex-col justify-end gap-1"><div className="bg-black w-full h-[30%]"></div><div className="bg-primary w-full h-[85%]"></div></div>
            </div>
            <div className="flex justify-between mt-4 text-[10px] font-bold text-zinc-400">
              <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span>
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
            <button className="w-full mt-4 py-2 border border-zinc-100 text-[10px] font-bold text-primary hover:bg-zinc-50 uppercase tracking-widest transition-colors">
              View Full Calendar
            </button>
          </section>

          {/* Recent Activity */}
          <section className="bg-white p-6 border border-zinc-100 shadow-sm">
            <h3 className="text-xs font-black uppercase mb-6">Recent Activity</h3>
            <div className="space-y-6 relative">
              <div className="absolute left-[13px] top-2 bottom-4 w-[1px] bg-zinc-100"></div>
              
              <div className="flex gap-4 relative">
                <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shrink-0 z-10 font-bold text-sm">
                  S
                </div>
                <div>
                  <p className="text-[11px] font-bold">Sarah Chen <span className="text-zinc-500 font-normal">uploaded Floor_Plan_v3.pdf</span></p>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase mt-1">2 hours ago</p>
                </div>
              </div>

              <div className="flex gap-4 relative">
                <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center shrink-0 z-10 font-bold text-sm">
                  M
                </div>
                <div>
                  <p className="text-[11px] font-bold">Marcus T. <span className="text-zinc-500 font-normal">commented on Concept Slides</span></p>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase mt-1">4 hours ago</p>
                </div>
              </div>

              <div className="flex gap-4 relative">
                <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shrink-0 z-10 font-bold text-sm">
                  P
                </div>
                <div>
                  <p className="text-[11px] font-bold">Project Bot <span className="text-zinc-500 font-normal">marked Site Survey complete</span></p>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase mt-1">6 hours ago</p>
                </div>
              </div>
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
