import os
import re

filepath = r'E:\BOXWAY\boxway-app\src\data\mockData.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('($60,500)', '(₹60,500)')
content = content.replace('at $198,000', 'at ₹198,000')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Fixed stragglers in {os.path.basename(filepath)}")
