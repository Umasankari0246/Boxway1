import os
import re

def compute_relative_path(from_file, to_file=r'E:\BOXWAY\boxway-app\src\store\settingsStore.js'):
    from_dir = os.path.dirname(from_file)
    rel_path = os.path.relpath(to_file, from_dir)
    rel_path = rel_path.replace('\\', '/')
    if not rel_path.startswith('.'):
        rel_path = './' + rel_path
    if rel_path.endswith('.js'):
        rel_path = rel_path[:-3]
    return rel_path

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    
    if 'useFormatters' in content or 'SettingsPage.jsx' in filepath:
        return False
        
    has_currency = bool(re.search(r'[₹$€£]', content))
    
    if not has_currency:
        return False
        
    rel_import = compute_relative_path(filepath)
    
    imports = re.findall(r'^import .*?;?\n', content, flags=re.MULTILINE)
    if imports:
        last_import = imports[-1]
        insert_pos = content.rfind(last_import) + len(last_import)
        import_stmt = f"import {{ useFormatters }} from '{rel_import}';\n"
        content = content[:insert_pos] + import_stmt + content[insert_pos:]
    else:
        content = f"import {{ useFormatters }} from '{rel_import}';\n" + content
        
    comp_match = re.search(r'(?:const\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{|function\s+\w+\s*\([^)]*\)\s*\{)', content)
    
    if comp_match:
        comp_def = comp_match.group(0)
        inject_pos = content.find(comp_def) + len(comp_def)
        hook_stmt = "\n  const { formatCurrency, formatDate } = useFormatters();\n"
        content = content[:inject_pos] + hook_stmt + content[inject_pos:]
    else:
        print(f"Warning: Could not find component definition in {filepath}")
        return False
        
    # Pattern A: ₹{expression} -> {formatCurrency(expression)}
    content = re.sub(r'[₹$€£]\{([^}]+)\}', r'{formatCurrency(\1)}', content)
    
    # Pattern B: ₹ {expression} -> {formatCurrency(expression)}
    content = re.sub(r'[₹$€£]\s+\{([^}]+)\}', r'{formatCurrency(\1)}', content)
    
    # Pattern C: >₹123< -> >{formatCurrency("123")}<
    content = re.sub(r'>[₹$€£]\s*([\d.,]+)([a-zA-Z]*)<', r'>{formatCurrency("\1")} \2<', content)
    
    # Pattern D: `₹${expression}` -> formatCurrency(expression) (inside JS template literals)
    content = re.sub(r'[₹$€£]\$\{([^}]+)\}', r'${formatCurrency(\1)}', content)
    
    # Clean up any trailing M or K that was hardcoded if we want, but they are useful. So keep them.

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

updated_count = 0
for root, _, files in os.walk(r'E:\BOXWAY\boxway-app\src'):
    for file in files:
        if file.endswith('.jsx'):
            filepath = os.path.join(root, file)
            if process_file(filepath):
                updated_count += 1
                print(f'Updated {filepath}')

print(f'Total files successfully updated: {updated_count}')
