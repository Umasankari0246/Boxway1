import os
import re

directories_to_scan = [
    r'E:\BOXWAY\boxway-app\src\pages\studio',
    r'E:\BOXWAY\boxway-app\src\pages\DashboardPage.jsx',
    r'E:\BOXWAY\boxway-app\src\pages\intelligence\AnalyticsPage.jsx',
    r'E:\BOXWAY\boxway-app\src\pages\SettingsPage.jsx',
    r'E:\BOXWAY\boxway-app\src\components'
]

def get_files(paths):
    files = []
    for p in paths:
        if os.path.isfile(p):
            files.append(p)
        elif os.path.isdir(p):
            for root, _, filenames in os.walk(p):
                for filename in filenames:
                    if filename.endswith('.jsx'):
                        files.append(os.path.join(root, filename))
    return files

files = get_files(directories_to_scan)

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    content = content.replace('Total project budget ($)', 'Total project budget (₹)')
    content = content.replace('Under $500K', 'Under ₹500K')
    content = content.replace('₹500K – $1.5M', '₹500K – ₹1.5M')
    content = content.replace('₹1.5M – $3.0M', '₹1.5M – ₹3.0M')
    content = content.replace('Over $3.0M', 'Over ₹3.0M')
    content = content.replace('Total Budget ($)', 'Total Budget (₹)')
    content = content.replace('budget ($)', 'budget (₹)')
    content = content.replace('Cost ($)', 'Cost (₹)')
    content = content.replace('Amount ($)', 'Amount (₹)')
    content = content.replace('Rate ($)', 'Rate (₹)')
    
    # Catch stray text replacements, e.g., "$500K" -> "₹500K"
    content = content.replace(' $5', ' ₹5')
    content = content.replace(' $1', ' ₹1')
    content = content.replace(' $2', ' ₹2')
    content = content.replace(' $3', ' ₹3')
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed stragglers in {os.path.basename(filepath)}")

print("Done fixing stragglers.")
