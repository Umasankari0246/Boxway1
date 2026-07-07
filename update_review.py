import os
import re

path = r'E:\BOXWAY\boxway-app\src\pages\studio\NewProjectPage.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add Lead Architect and Currency to the review map
content = re.sub(
    r"\{\[\s*\{\s*label:\s*'Project name'[^\]]+\]\.map\(f => \(",
    r'''{[
                  { label: 'Project name', val: form.name || '—' },
                  { label: 'Type', val: form.type },
                  { label: 'Client', val: form.client || '—' },
                  { label: 'Contact', val: form.clientContact || '—' },
                  { label: 'Lead Architect', val: employees.find(e => e.id === form.leadArchitect || e.employeeId === form.leadArchitect)?.name || form.leadArchitect || '—' },
                  { label: 'Currency', val: form.currency || 'USD ($)' },
                  { label: 'Budget', val: form.budget ? `${form.currency?.includes('₹') ? '₹' : form.currency?.includes('£') ? '£' : form.currency?.includes('€') ? '€' : '$'}${Number(form.budget).toLocaleString()}` : '—' },
                  { label: 'Start date', val: form.startDate || '—' },
                  { label: 'End date', val: form.endDate || '—' },
                  { label: 'Project code', val: form.clientProjectCode || '—' },
                ].map(f => (''',
    content
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Added Lead Architect and Currency to Review page')
