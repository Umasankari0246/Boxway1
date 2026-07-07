const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'SettingsPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Colors
content = content.replace(/slate/g, 'zinc');
content = content.replace(/bg-\[\#f8f6f6\]/g, 'bg-[#fcf9f8]');

// Rounding
content = content.replace(/rounded-2xl/g, '');
content = content.replace(/rounded-lg/g, '');
content = content.replace(/rounded-full/g, '');

// Typography & Base Styles
content = content.replace(/text-xs font-bold uppercase tracking-wider text-zinc-500/g, 'text-[10px] font-black uppercase tracking-widest text-zinc-400');
content = content.replace(/text-sm font-bold text-zinc-900/g, 'text-xs font-black text-zinc-900');
content = content.replace(/text-2xl font-black text-zinc-900/g, 'text-2xl font-black tracking-tight text-zinc-900');
content = content.replace(/font-bold/g, 'font-black');
content = content.replace(/text-sm font-medium/g, 'text-[10px] font-black uppercase tracking-widest');

// Buttons
content = content.replace(/px-6 py-3 bg-primary text-white text-sm font-black rounded-lg hover:bg-primary\/90 shadow-sm transition-all/g, 'px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors shadow-sm shadow-primary/20');
content = content.replace(/px-4 py-2 bg-zinc-100 text-zinc-700 text-sm font-black rounded-lg hover:bg-zinc-200 transition-colors/g, 'px-4 py-2 bg-zinc-100 text-zinc-700 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors');
content = content.replace(/px-5 py-2.5 bg-primary text-white text-sm font-black rounded-lg hover:bg-primary\/90 transition-colors shadow-sm/g, 'px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors shadow-sm shadow-primary/20');

// Inputs
content = content.replace(/w-full border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors/g, 'w-full border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs focus:outline-none focus:border-primary transition-colors');
content = content.replace(/w-full border border-zinc-200 px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors/g, 'w-full border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs focus:outline-none focus:border-primary transition-colors');

// Tables
content = content.replace(/bg-zinc-50 border-b border-zinc-200/g, 'border-b border-zinc-100 bg-zinc-50/60');
content = content.replace(/px-6 py-4 text-xs font-black text-zinc-500 uppercase tracking-wider/g, 'px-5 py-3.5 text-[9px] font-black uppercase tracking-widest text-zinc-400');
content = content.replace(/px-6 py-4 text-sm/g, 'px-5 py-3.5 text-xs');
content = content.replace(/px-6 py-4/g, 'px-5 py-3.5');

fs.writeFileSync(filePath, content, 'utf8');
console.log("SettingsPage.jsx updated.");
