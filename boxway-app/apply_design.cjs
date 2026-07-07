const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Backgrounds
  content = content.replace(/bg-\[\#fcf9f8\]/g, 'bg-[#f8f6f6]');

  // Colors zinc -> slate
  content = content.replace(/zinc/g, 'slate');

  // Typographies
  content = content.replace(/text-\[9px\]/g, 'text-xs');
  content = content.replace(/text-\[10px\]/g, 'text-sm');
  content = content.replace(/font-black uppercase tracking-widest text-slate-400/g, 'text-xs font-bold text-slate-500 uppercase tracking-wider');
  content = content.replace(/font-black uppercase tracking-widest/g, 'font-bold uppercase tracking-wider');
  content = content.replace(/font-black/g, 'font-bold');

  // Some elements we want to keep black (e.g., page titles or big numbers)
  // But Employee page has `font-black` for headers `text-2xl font-black` and big numbers `text-3xl font-black`.
  // So replacing all `font-black` with `font-bold` might break that.
  // Let's refine typography replacements:
  content = content.replace(/text-xs font-bold uppercase tracking-widest text-slate-400/g, 'text-xs font-bold text-slate-500 uppercase tracking-wider');
  content = content.replace(/text-sm font-bold uppercase tracking-widest text-slate-400/g, 'text-xs font-bold text-slate-500 uppercase tracking-wider');

  // Buttons
  content = content.replace(/px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors shadow-sm shadow-primary\/20/g, 'px-4 py-2 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 transition-colors shadow-sm');
  content = content.replace(/px-4 py-2 bg-primary text-white text-sm font-bold uppercase tracking-widest hover:bg-black transition-colors shadow-sm shadow-primary\/20/g, 'px-4 py-2 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 transition-colors shadow-sm');
  
  // Cards
  // Project blocky cards: `bg-white border border-slate-100 shadow-sm p-5`
  // Make them like Employee cards: `bg-white rounded-xl border border-slate-200 shadow-sm p-5`
  content = content.replace(/bg-white border border-slate-100 shadow-sm/g, 'bg-white rounded-xl border border-slate-200 shadow-sm');

  // Tables
  // Headers in projects: `px-5 py-3.5 text-[9px] font-black uppercase tracking-widest text-slate-400`
  // Employee table headers: `px-8 py-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider`
  content = content.replace(/border-b border-slate-100 bg-slate-50\/60/g, 'bg-slate-50 border-b border-slate-200');
  content = content.replace(/px-5 py-3.5 text-xs font-bold uppercase tracking-widest text-slate-400/g, 'px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider');
  
  // Forms
  content = content.replace(/focus:border-primary transition-colors/g, 'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-colors rounded');
  content = content.replace(/border-slate-100/g, 'border-slate-200');

  // Add rounded classes to buttons globally if they lack it
  content = content.replace(/className="(.*?)bg-primary text-white(.*?)transition-colors(.*?)"/g, (match, p1, p2, p3) => {
    if (!match.includes('rounded')) {
      return `className="${p1}bg-primary text-white${p2}transition-colors rounded${p3}"`;
    }
    return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    let fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      // Don't touch EmployeesPage.jsx itself as it's the reference
      if (!fullPath.includes('EmployeesPage.jsx')) {
        processFile(fullPath);
      }
    }
  });
}

walkDir(path.join(__dirname, 'src', 'pages'));
walkDir(path.join(__dirname, 'src', 'components', 'layout'));
console.log("Global UI design pass completed for pages and layout.");
