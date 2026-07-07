import os
import re

pages_dir = r'E:\BOXWAY\boxway-app\src\pages\studio'
files = [f for f in os.listdir(pages_dir) if f.endswith('.jsx')]

def replace_all(content):
    # Standardize table padding px-5 py-4 -> px-8 py-4
    content = content.replace('px-5 py-4', 'px-8 py-4')
    
    # Table header font weight consistency
    content = content.replace('text-xs font-bold text-slate-500', 'text-xs font-bold text-slate-500')
    
    # Buttons in table row
    content = content.replace(
        '<div className="flex gap-1 items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">',
        '<div className="flex justify-end gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">'
    )
    
    # Empty states in tables
    content = re.sub(
        r'<td colSpan=\{10\} className="py-16 text-center">\s*<Icon name="[^"]+" className="[^"]+" />\s*<p className="text-slate-400 text-sm">([^<]+)</p>\s*</td>',
        r'<td colSpan={10}><div className="px-8 py-12 text-center text-slate-500 text-sm flex flex-col items-center"><Icon name="architecture" className="text-[40px] mb-2 text-slate-300" /><p>\1</p></div></td>',
        content
    )
    
    # Fix textarea styling (padding)
    content = content.replace("className={INPUT + ' resize-none'}", "className={INPUT.replace('py-2.5', 'py-2') + ' resize-none'}")
    
    return content

for file in files:
    path = os.path.join(pages_dir, file)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = replace_all(content)
    
    if content != new_content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {file}")

print("Done tables and forms")
