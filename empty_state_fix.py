import os
import re

path = r'E:\BOXWAY\boxway-app\src\pages\studio\NewProjectPage.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Lead Architect select fallback
old_select = r"""<select value={form.leadArchitect} onChange={e => set('leadArchitect', e.target.value)} className={INPUT + ' mb-6'}>
                {employees.map(e => <option key={e.id || e.employeeId} value={e.id || e.employeeId}>{e.name} — {e.role}</option>)}
              </select>"""
new_select = r"""<select value={form.leadArchitect} onChange={e => set('leadArchitect', e.target.value)} className={INPUT + ' mb-6'}>
                {employees.length > 0 ? employees.map(e => <option key={e.id || e.employeeId} value={e.id || e.employeeId}>{e.name} — {e.role}</option>) : <option value="">No employees available</option>}
              </select>"""
content = content.replace(old_select, new_select)

# Fix Team Members fallback
old_team = r"""<div className="space-y-2">
                {employees.map(e => {"""
new_team = r"""<div className="space-y-2">
                {employees.length === 0 && <p className="text-sm text-slate-500 italic p-4 text-center border border-dashed border-slate-300 rounded">No team members available. Please add employees in the Employees module first.</p>}
                {employees.map(e => {"""
content = content.replace(old_team, new_team)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done adding fallback for empty employees')
