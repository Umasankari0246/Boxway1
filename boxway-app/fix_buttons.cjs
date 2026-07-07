const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'SettingsPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Buttons with text-sm font-black -> text-[10px] font-black uppercase tracking-widest
content = content.replace(/text-sm font-black/g, 'text-[10px] font-black uppercase tracking-widest');
content = content.replace(/font-black text-sm/g, 'text-[10px] font-black uppercase tracking-widest');

// Fix primary hover states for some missed buttons
content = content.replace(/hover:bg-primary\/90/g, 'hover:bg-black');

// Update modal backgrounds and paddings if any are off
// We've already removed rounded, but let's make sure modals have the right border/shadow.
content = content.replace(/shadow-2xl p-8 max-w-md w-full mx-4/g, 'shadow-2xl p-8 max-w-md w-full mx-4 border border-zinc-100');
content = content.replace(/shadow-2xl p-8 max-w-4xl w-full mx-4/g, 'shadow-2xl p-8 max-w-4xl w-full mx-4 border border-zinc-100');

fs.writeFileSync(filePath, content, 'utf8');
console.log("SettingsPage.jsx buttons refined.");
