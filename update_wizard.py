import os
import re

path = r'E:\BOXWAY\boxway-app\src\pages\studio\NewProjectPage.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace LABEL
content = content.replace("const LABEL = 'block text-sm font-semibold text-slate-700 mb-1.5';", "const LABEL = 'block text-xs font-bold text-slate-600 mb-1.5';")

# Replace headings in wizard
content = re.sub(
    r'<div className="flex items-center gap-3 mb-4">\s*<Icon name="[^"]+" className="[^"]+" />\s*<h3 className="text-lg font-bold text-slate-900">([^<]+)</h3>\s*</div>',
    r'<h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">\1</h3>',
    content
)

# Step 3 had a different format:
content = re.sub(
    r'<div className="flex items-center gap-3 mb-2">\s*<Icon name="timeline" className="[^"]+" />\s*<div>\s*<h3 className="text-lg font-bold text-slate-900">([^<]+)</h3>\s*<p className="text-sm text-slate-500 mt-0.5">[^<]+</p>\s*</div>\s*</div>',
    r'<h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">\1</h3>',
    content
)

# Grid gap
content = content.replace('grid grid-cols-1 md:grid-cols-2 gap-6', 'grid grid-cols-2 gap-5')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated wizard styles')
