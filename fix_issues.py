import os
import re

path = r'E:\BOXWAY\boxway-app\src\pages\studio\NewProjectPage.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add currency to state
if "currency: 'USD ($)'" not in content:
    content = content.replace("budget: '',", "budget: '',\n    currency: 'USD ($)',")

# 2. Update currency dropdown options and add onChange
# Find the exact string by regex, handling encoding issues
content = re.sub(
    r'<select className=\{INPUT\}><option>USD \(\$\)</option><option>GBP \([^)]+\)</option><option>EUR \([^)]+\)</option></select>',
    r'''<select className={INPUT} value={form.currency} onChange={e => set('currency', e.target.value)}>
                  <option>USD ($)</option>
                  <option>INR (₹)</option>
                  <option>GBP (£)</option>
                  <option>EUR (€)</option>
                </select>''',
    content
)

# Fix Client phone missing value/onChange
content = re.sub(
    r'<input placeholder="\+1 555-2001" className=\{INPUT\} />',
    r'<input value={form.clientPhone || ""} onChange={e => set("clientPhone", e.target.value)} placeholder="+1 555-2001" className={INPUT} />',
    content
)

# Fix Fee Type missing onChange
content = re.sub(
    r'<label className=\{LABEL\}>Fee type</label>\s*<select className=\{INPUT\}>',
    r'<label className={LABEL}>Fee type</label>\n                <select className={INPUT} value={form.feeType || ""} onChange={e => set("feeType", e.target.value)}>',
    content
)

# Fix Payment Schedule missing onChange
content = re.sub(
    r'<label className=\{LABEL\}>Payment schedule</label>\s*<select className=\{INPUT\}>',
    r'<label className={LABEL}>Payment schedule</label>\n                <select className={INPUT} value={form.paymentSchedule || ""} onChange={e => set("paymentSchedule", e.target.value)}>',
    content
)

# Fix Budget notes missing onChange
content = re.sub(
    r'<textarea rows=\{2\} placeholder="Any budget constraints, contingency notes\.\.\." className=\{INPUT\.replace\(\'py-2\.5\', \'py-2\'\) \+ \' resize-none\'\} />',
    r'<textarea rows={2} value={form.budgetNotes || ""} onChange={e => set("budgetNotes", e.target.value)} placeholder="Any budget constraints, contingency notes..." className={INPUT.replace("py-2.5", "py-2") + " resize-none"} />',
    content
)

# 3. Update Review page to show correct currency
content = re.sub(
    r"\{ label: 'Budget', val: form\.budget \? `\$\$\{Number\(form\.budget\)\.toLocaleString\(\)\}` : '[^']+' \},",
    r"{ label: 'Budget', val: form.budget ? `${form.currency?.includes('₹') ? '₹' : form.currency?.includes('£') ? '£' : form.currency?.includes('€') ? '€' : '$'}${Number(form.budget).toLocaleString()}` : '—' },",
    content
)
# And handle encoded em dashes if present
content = re.sub(
    r"\{ label: 'Budget', val: form\.budget \? `\$\$\{Number\(form\.budget\)\.toLocaleString\(\)\}` : '[^']+' \},",
    r"{ label: 'Budget', val: form.budget ? `${form.currency?.includes('₹') ? '₹' : form.currency?.includes('£') ? '£' : form.currency?.includes('€') ? '€' : '$'}${Number(form.budget).toLocaleString()}` : '—' },",
    content
)

content = re.sub(
    r'<p className="text-2xl font-bold text-primary">\{form\.budget \? `\$\$\{Number\(form\.budget\)\.toLocaleString\(\)\}` : \'[^\']+\'\}</p>',
    r'<p className="text-2xl font-bold text-primary">{form.budget ? `${form.currency?.includes(\'₹\') ? \'₹\' : form.currency?.includes(\'£\') ? \'£\' : form.currency?.includes(\'€\') ? \'€\' : \'$\'}${Number(form.budget).toLocaleString()}` : \'—\'}</p>',
    content
)

# 4. Make Start Button in Project Phases work
old_start_button = '''<span className={`text-xs font-bold px-2.5 py-1 rounded-full ${i === 0 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {i === 0 ? 'Start' : 'Upcoming'}
                  </span>'''
new_start_button = '''{ph.status === 'Started' ? (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-white">Started</span>
                  ) : i === 0 ? (
                    <button onClick={(e) => { e.preventDefault(); const phases = [...form.phases]; phases[i] = { ...phases[i], status: 'Started' }; set('phases', phases); }} className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary text-white hover:bg-primary/90">Start</button>
                  ) : (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">Upcoming</span>
                  )}'''
if old_start_button in content:
    content = content.replace(old_start_button, new_start_button)
else:
    # Handle slight whitespace/encoding variations
    content = re.sub(
        r'<span className=\{`text-xs font-bold px-2\.5 py-1 rounded-full \$\{i === 0 \? \'bg-primary text-white\' : \'bg-slate-100 text-slate-600\'\}`\}>\s*\{i === 0 \? \'Start\' : \'Upcoming\'\}\s*</span>',
        new_start_button,
        content
    )

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done python fixes')
