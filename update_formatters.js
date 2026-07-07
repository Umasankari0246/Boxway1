const fs = require('fs');
const path = require('path');

function computeRelativePath(fromPath, toPath = 'E:/BOXWAY/boxway-app/src/store/settingsStore.js') {
    const fromDir = path.dirname(fromPath);
    let relPath = path.relative(fromDir, toPath).replace(/\\/g, '/');
    if (!relPath.startsWith('.')) relPath = './' + relPath;
    if (relPath.endsWith('.js')) relPath = relPath.slice(0, -3);
    return relPath;
}

function getMatchingBraceEnd(str, startIdx) {
    let depth = 0;
    for (let i = startIdx; i < str.length; i++) {
        if (str[i] === '{') depth++;
        if (str[i] === '}') {
            depth--;
            if (depth === 0) return i;
        }
    }
    return -1;
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;

    if (content.includes('useFormatters') || filePath.includes('SettingsPage.jsx')) return false;
    
    // Check for currency symbols
    if (!/[₹$€£]/.test(content)) return false;

    // Inject import
    const relImport = computeRelativePath(filePath);
    const importRegex = /^import .*?;?\n/gm;
    let match;
    let lastImportIdx = -1;
    while ((match = importRegex.exec(content)) !== null) {
        lastImportIdx = match.index + match[0].length;
    }
    
    const importStmt = `import { useFormatters } from '${relImport}';\n`;
    if (lastImportIdx !== -1) {
        content = content.slice(0, lastImportIdx) + importStmt + content.slice(lastImportIdx);
    } else {
        content = importStmt + content;
    }

    // Inject hook
    const compMatch = content.match(/(?:const\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*\{|function\s+\w+\s*\([^)]*\)\s*\{)/);
    if (compMatch) {
        const injectIdx = compMatch.index + compMatch[0].length;
        content = content.slice(0, injectIdx) + "\n  const { formatCurrency, formatDate } = useFormatters();\n" + content.slice(injectIdx);
    } else {
        console.warn(`Could not find component in ${filePath}`);
        return false;
    }

    // Now replace currencies carefully
    // 1. ₹{...}
    let idx = 0;
    while ((idx = content.search(/[₹$€£]\s*\{/)) !== -1) {
        const braceStart = content.indexOf('{', idx);
        const braceEnd = getMatchingBraceEnd(content, braceStart);
        if (braceEnd !== -1) {
            const inner = content.slice(braceStart + 1, braceEnd);
            content = content.slice(0, idx) + `{formatCurrency(${inner})}` + content.slice(braceEnd + 1);
        } else {
            break; // Failed to parse
        }
    }

    // 2. >₹123K< or >₹ 123< or >₹123.45<
    content = content.replace(/>[₹$€£]\s*([\d.,]+)([a-zA-Z]*)?</g, '>{formatCurrency("$1")} $2<');

    // 3. `₹${...}`
    let tIdx = 0;
    while ((tIdx = content.search(/[₹$€£]\s*\$\{/)) !== -1) {
        const braceStart = content.indexOf('${', tIdx) + 1; // point to {
        const braceEnd = getMatchingBraceEnd(content, braceStart);
        if (braceEnd !== -1) {
            const inner = content.slice(braceStart + 1, braceEnd);
            content = content.slice(0, tIdx) + `\${formatCurrency(${inner})}` + content.slice(braceEnd + 1);
        } else {
            break;
        }
    }
    
    // 4. `${...}` where ... ends with string concatenations containing currency.
    // Ignored for simplicity

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf-8');
        return true;
    }
    return false;
}

function walkDir(dir) {
    let updated = 0;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            updated += walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            if (processFile(fullPath)) {
                updated++;
                console.log(`Updated ${fullPath}`);
            }
        }
    }
    return updated;
}

const total = walkDir('E:/BOXWAY/boxway-app/src');
console.log(`Total files updated: ${total}`);
