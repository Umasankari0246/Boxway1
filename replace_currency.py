import os
import re

directories_to_scan = [
    r'E:\BOXWAY\boxway-app\src\pages\studio',
    r'E:\BOXWAY\boxway-app\src\pages\DashboardPage.jsx',
    r'E:\BOXWAY\boxway-app\src\pages\intelligence\AnalyticsPage.jsx',
    r'E:\BOXWAY\boxway-app\src\pages\SettingsPage.jsx'
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

    # 1. Replace "USD ($)" -> "INR (₹)" where it's not already done
    content = content.replace('USD ($)', 'INR (₹)')
    
    # 2. In SettingsPage, we also want to set current: 'USD ($)' to 'INR (₹)'
    if 'SettingsPage.jsx' in filepath:
        content = content.replace("current: 'USD ($)'", "current: 'INR (₹)'")

    # 3. Replace literal '$' used as currency symbol.
    # Case a: Inside JSX text, e.g., >$0.0M< or >$500< or >$${
    # Be careful, in template literals: `$$${var}` means a literal $ then the var. We want `₹${var}`
    content = re.sub(r'`\$(\$\{)', r'`₹\1', content)
    
    # Case b: `+$${` or `'$' +` or something?
    # Usually it's written as `$` followed by `{` like `$`${var}`... wait.
    # In template literals, a literal dollar sign is just `$`. If it's right before `${`, it's `$$ {`.
    # I've handled `\$\$\{` above.
    
    # Case c: Hardcoded text like >$1,200<
    content = re.sub(r'>\$(\d)', r'>₹\1', content)
    
    # Case d: Hardcoded text like '$1,200'
    content = re.sub(r'\'\$(\d)', r"'₹\1", content)
    content = re.sub(r'"\$(\d)', r'"₹\1', content)
    
    # Case e: Template string `$` followed by digits or spaces and digits (e.g., `$10k` or `$ 10k`)
    content = re.sub(r'`\$(\d)', r'`₹\1', content)
    
    # Dashboard formatting e.g., `... ? '$' : ...`
    content = content.replace("'$'", "'₹'")
    content = content.replace('"$"', '"₹"')

    # Case f: In some places, developers might write `${amount}` and expect it to just have $ in front.
    # Wait, if they do `${currency}${amount}`, we already handled `USD ($)`.
    # Let's replace any `$` followed by `{` ONLY IF it's preceded by a string delimiter? No, `${` is syntax.
    # We want to catch instances like `"$" +`
    content = content.replace('"$" +', '"₹" +')
    content = content.replace("'$' +", "'₹' +")
    content = content.replace("+ '$'", "+ '₹'")
    content = content.replace('+ "$"', '+ "₹"')
    
    # Budget dropdown in NewProjectPage was handled, but let's make sure INR is default or at least in the list.
    if 'NewProjectPage.jsx' in filepath:
        # Change initial state currency to INR (₹)
        content = content.replace("currency: 'USD ($)'", "currency: 'INR (₹)'")
        # I previously changed the dropdown to have INR, GBP, EUR.
        
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {os.path.basename(filepath)}")

print("Done replacing currency symbols.")
