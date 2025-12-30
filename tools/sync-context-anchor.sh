#!/bin/bash
# AUTO-SYNC CONTEXT ANCHOR
# Runs when CONTEXT.md, STACK.md, or SECURITY.md changes

set -e

echo "🔄 Syncing context-anchor.md..."

# Check which file changed
CHANGED_FILES=$(git diff --name-only HEAD~1 HEAD 2>/dev/null || echo "")

NEEDS_UPDATE=false

if echo "$CHANGED_FILES" | grep -q "architecture/CONTEXT.md"; then
  echo "📝 CONTEXT.md changed"
  NEEDS_UPDATE=true
fi

if echo "$CHANGED_FILES" | grep - "architecture/STACK.md"; then
  echo "📝 STACK.md changed"
  NEEDS_UPDATE=true
fi

if echo "$CHANGED_FILES" | grep -q "architecture/SECURITY.md"; then
  echo "📝 SECURITY.md changed"
  NEEDS_UPDATE=true
fi

if [ "$NEEDS_UPDATE" = false ]; then
  echo "✅ No architecture files changed, skipping sync"
  exit 0
fi

# Python script to compress context
python3 - <<'EOF'
import re
import json
from pathlib import Path

def extract_critical_sections(file_path, marker):
    """Extract sections marked as critical"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find all sections with CRITICAL, FORBIDDEN, MANDATORY markers
        critical = re.findall(
            r'##.*?(CRITICAL|🔥|❌|FORBIDDEN|MANDATORY).*?(?=##|\Z)', 
            content, 
            re.DOTALL | re.IGNORECASE
        )
        
        return '\n'.join(critical[:5])  # Max 5 sections per file
    except:
        return ""

def compress_to_bullets(text):
    """Convert long paragraphs to bullet points"""
    lines = text.split('\n')
    compressed = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        if line.startswith('#'):
            compressed.append(line)
        elif line.startswith('-') or line.startswith('*'):
            compressed.append(line)
        elif len(line) > 100:
            # Split long lines
            words = line.split()
            compressed.append('- ' + ' '.join(words[:15]) + '...')
        else:
            compressed.append('- ' + line)
    
    return '\n'.join(compressed)

# Read architecture files
context_critical = extract_critical_sections('architecture/CONTEXT.md', 'CONTEXT')
stack_critical = extract_critical_sections('architecture/STACK.md', 'STACK')
security_critical = extract_critical_sections('architecture/SECURITY.md', 'SECURITY')

# Build compressed context-anchor
anchor_content = f'''# 🧠 CONTEXT ANCHOR - AI MEMORY REFRESH
# AUTO-UPDATED: {Path('.omega/context-anchor.md').stat().st_mtime if Path('.omega/context-anchor.md').exists() else 'NEW'}
# DO NOT EDIT MANUALLY - Generated from architecture files

---

## 🎯 MISSION
Production-grade SaaS with OMEGA PROTOCOL v3.0
Handles: Real money, Real user data, Legal compliance

---

## 🔴 MODE SYSTEM
- 🔴 ARCHITECT → Database, Auth, Money, Security, APIs
- 🟢 BUILDER → UI, Components, CSS
- ⚡ FAST-TRACK → Colors, text, spacing (trivial changes)
- 🟡 REFACTOR → Optimization
- 🔵 DEBUG → Bug fixes

**Auto-detected in v3.0 based on keywords**

---

## 🚫 ABSOLUTE PROHIBITIONS

{compress_to_bullets(security_critical)}

---

## 📚 TECHNOLOGY STACK

{compress_to_bullets(stack_critical)}

---

## 💼 CRITICAL BUSINESS RULES

{compress_to_bullets(context_critical)}

---

## ✅ ARCHITECT MODE CHECKLIST
1. Input validated with Zod
2. Auth/permissions checked
3. Secrets in .env
4. Data encrypted if sensitive
5. Errors logged properly
6. Rate limiting on auth
7. Dependencies audited

---

*v3.0 - Auto-sync enabled*
'''

# Write to context-anchor.md
Path('.omega').mkdir(exist_ok=True)
with open('.omega/context-anchor.md', 'w', encoding='utf-8') as f:
    f.write(anchor_content)

print("✅ Context anchor updated")
print(f"   Size: {len(anchor_content)} chars ({len(anchor_content.split())} words)")

EOF

# Stage the updated file
git add .omega/context-anchor.md

echo "✅ Context anchor synced successfully"
