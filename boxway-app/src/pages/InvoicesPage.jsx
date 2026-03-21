import React from 'react';
import { Link } from 'react-router-dom';

const InvoicesPage = () => {
  return (
    <div className="flex-1 p-6 overflow-y-auto no-scrollbar space-y-6">
      {/* Top Actions */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Financial Ledger</h1>
          <p className="text-[10px] text-zinc-500 uppercase font-bold mt-0.5">Track and manage client billing and incoming revenue</p>
        </div>
        <Link 
          to="/invoices/new"
          className="bg-primary text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors"
        >
          New Invoice
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 border border-zinc-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-400 font-black uppercase mb-1">Total Billed</p>
            <h3 className="text-2xl font-black">$124,500</h3>
          </div>
          <div className="text-primary"><span className="material-symbols-outlined text-[28px]">payments</span></div>
        </div>
        <div className="bg-white p-4 border border-zinc-100 shadow-sm flex items-center justify-between border-l-2 border-l-primary">
          <div>
            <p className="text-[10px] text-zinc-400 font-black uppercase mb-1">Pending</p>
            <h3 className="text-2xl font-black">$32,400</h3>
          </div>
          <div className="text-black"><span className="material-symbols-outlined text-[28px]">schedule</span></div>
        </div>
        <div className="bg-white p-4 border border-zinc-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-400 font-black uppercase mb-1">Overdue</p>
            <h3 className="text-2xl font-black text-primary">$8,200</h3>
          </div>
          <div className="text-primary"><span className="material-symbols-outlined text-[28px]">warning</span></div>
        </div>
        <div className="bg-white p-4 border border-zinc-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-zinc-400 font-black uppercase mb-1">Paid this Month</p>
            <h3 className="text-2xl font-black">$45,150</h3>
          </div>
          <div className="text-black"><span className="material-symbols-outlined text-[28px]">check_circle</span></div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-zinc-100 shadow-sm p-3 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[20px]">search</span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border-none text-[12px] font-medium placeholder:text-zinc-400 focus:ring-1 focus:ring-primary"
            placeholder="Search by ID, client or project..." 
            type="text" 
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select className="bg-white border border-zinc-200 text-[11px] font-bold uppercase py-2 px-3 focus:ring-0 focus:border-primary">
            <option>All Statuses</option>
            <option>Paid</option>
            <option>Pending</option>
            <option>Overdue</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-zinc-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Invoice ID</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Client</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Issue Date</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Amount</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            <tr className="hover:bg-zinc-50/50 transition-colors">
              <td className="px-6 py-4 text-xs font-black">#INV-2024-001</td>
              <td className="px-6 py-4">
                <div>
                  <p className="text-xs font-black">Metropolis Development</p>
                  <p className="text-[10px] text-zinc-500 uppercase">Skyline Tower Phase II</p>
                </div>
              </td>
              <td className="px-6 py-4 text-[11px] font-medium uppercase text-zinc-600">Oct 12, 2023</td>
              <td className="px-6 py-4 text-[11px] font-black text-right">$12,400.00</td>
              <td className="px-6 py-4 text-center">
                <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-emerald-100 text-emerald-700">Paid</span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-black transition-colors"><span className="material-symbols-outlined text-[18px]">visibility</span></button>
                  <button className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                  <button className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-red-600 transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                </div>
              </td>
            </tr>
            <tr className="hover:bg-zinc-50/50 transition-colors">
              <td className="px-6 py-4 text-xs font-black">#INV-2024-002</td>
              <td className="px-6 py-4">
                <div>
                  <p className="text-xs font-black">Urban Green Co.</p>
                  <p className="text-[10px] text-zinc-500 uppercase">Riverside Pavillion</p>
                </div>
              </td>
              <td className="px-6 py-4 text-[11px] font-medium uppercase text-zinc-600">Oct 24, 2023</td>
              <td className="px-6 py-4 text-[11px] font-black text-right">$8,200.00</td>
              <td className="px-6 py-4 text-center">
                <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-amber-100 text-amber-700">Pending</span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-black transition-colors"><span className="material-symbols-outlined text-[18px]">visibility</span></button>
                  <button className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                  <button className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-red-600 transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                </div>
              </td>
            </tr>
            <tr className="hover:bg-zinc-50/50 transition-colors">
              <td className="px-6 py-4 text-xs font-black">#INV-2024-003</td>
              <td className="px-6 py-4">
                <div>
                  <p className="text-xs font-black">Vanguard Estates</p>
                  <p className="text-[10px] text-zinc-500 uppercase">Oakridge Residential Complex</p>
                </div>
              </td>
              <td className="px-6 py-4 text-[11px] font-medium uppercase text-zinc-600">Nov 02, 2023</td>
              <td className="px-6 py-4 text-[11px] font-black text-right">$24,500.00</td>
              <td className="px-6 py-4 text-center">
                <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-red-100 text-red-600">Overdue</span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-black transition-colors"><span className="material-symbols-outlined text-[18px]">visibility</span></button>
                  <button className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                  <button className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-red-600 transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                </div>
              </td>
            </tr>
            <tr className="hover:bg-zinc-50/50 transition-colors">
              <td className="px-6 py-4 text-xs font-black">#INV-2024-004</td>
              <td className="px-6 py-4">
                <div>
                  <p className="text-xs font-black">Apex Logistics</p>
                  <p className="text-[10px] text-zinc-500 uppercase">Warehouse Retrofit Plan</p>
                </div>
              </td>
              <td className="px-6 py-4 text-[11px] font-medium uppercase text-zinc-600">Nov 15, 2023</td>
              <td className="px-6 py-4 text-[11px] font-black text-right">$5,750.00</td>
              <td className="px-6 py-4 text-center">
                <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-emerald-100 text-emerald-700">Paid</span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-black transition-colors"><span className="material-symbols-outlined text-[18px]">visibility</span></button>
                  <button className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                  <button className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-red-600 transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-3 border-t border-zinc-100 flex items-center justify-between">
          <div className="text-[10px] font-black uppercase text-zinc-400">Showing 1-4 of 128 results</div>
          <div className="flex items-center gap-1">
            <button className="h-8 px-2 text-[10px] font-black uppercase border border-zinc-100 hover:bg-zinc-50">Prev</button>
            <button className="h-8 w-8 bg-black text-white text-[10px] font-black">1</button>
            <button className="h-8 w-8 border border-zinc-100 text-[10px] font-black hover:bg-zinc-50">2</button>
            <button className="h-8 w-8 border border-zinc-100 text-[10px] font-black hover:bg-zinc-50">3</button>
            <button className="h-8 px-2 text-[10px] font-black uppercase border border-zinc-100 hover:bg-zinc-50">Next</button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default InvoicesPage;
