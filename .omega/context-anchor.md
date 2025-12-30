# 🧠 CONTEXT ANCHOR - AI MEMORY REFRESH
# DO NOT EDIT MANUALLY - Auto-updated by OMEGA Protocol
# Purpose: Prevent context drift in long conversations
# Read frequency: Every 10 messages OR at conversation start

---

## 🎯 MISSION STATEMENT
You are building a **production-grade SaaS** according to **OMEGA PROTOCOL v2.1**.
Every line of code you generate will handle **real money**, **real user data**, and **legal compliance**.

---

## 🔴 MODE SYSTEM (ALWAYS DECLARE)

```
🔴 ARCHITECT  → Database, Auth, Money, Security, APIs
🟢 BUILDER    → UI, CSS, Components, Text
⚡ FAST-TRACK → Trivial (colors, copy, spacing) - NEW v2.1
🟡 REFACTOR   → Optimization, cleanup
🔵 DEBUG      → Bug fixes
```

**Rule:** Start EVERY response with your mode (e.g., "🔴 MODE: ARCHITECT")

---

## 🚫 ABSOLUTE PROHIBITIONS (ZERO TOLERANCE)

```
❌ Type `any` in TypeScript
❌ Hardcoded secrets (API keys, passwords)
❌ SQL string concatenation (use ORM)
❌ dangerouslySetInnerHTML without sanitization
❌ Password in plain text (must hash with bcrypt)
❌ Skipping input validation (Zod required)
❌ Installing packages without checking STACK.md
❌ Forgetting to update CHANGELOG.md (ARCHITECT only)
```

---

## ✅ MANDATORY CHECKS (ARCHITECT MODE ONLY)

### 7-Point Security Checklist
```
1. ✅ Input validated with Zod
2. ✅ Auth/permissions checked
3. ✅ Secrets in .env (not code)
4. ✅ Data encrypted if sensitive
5. ✅ Errors logged (not exposed to user)
6. ✅ Rate limiting on auth endpoints
7. ✅ Dependencies audited (no CVEs)
```

### OMEGA Rule (Self-Correction Loop)
Before outputting code, ask yourself:
```
1. Any `any` types? → Fix
2. Hardcoded secrets? → Move to .env
3. Code already exists in /lib? → Import it
4. Huge library for small function? → Write manually
5. Missing error handling? → Add try/catch
6. Accessibility issues? → Fix ARIA/semantic HTML
```

---

## 📚 DOCUMENTATION RULES

**ARCHITECT MODE:**
- ✅ MUST update `/project-docs/CHANGELOG.md` after EVERY change
- ✅ MUST update `/project-docs/STRUCTURE.md` if files added/moved
- ✅ MUST create blueprint in `/project-docs/blueprints/` for complex features

**BUILDER MODE:**
- ✅ Update CHANGELOG only if design system changed

**FAST-TRACK MODE (v2.1):**
- ✅ Skip docs unless design tokens changed

---

## 🎯 CRITICAL BUSINESS RULES

**[This section is auto-populated from /architecture/CONTEXT.md]**

### Financial Rules
- ❌ Never double-charge (use idempotency keys)
- ❌ Never allow negative amounts (except refunds)
- ✅ Log ALL financial transactions (audit trail)

### Data Protection
- ❌ User A cannot see User B's data (RLS enforced)
- ✅ Users can export their data anytime (RGPD)
- ✅ Users can delete their account (RGPD)

### [ADD YOUR SPECIFIC RULES HERE]
```
Example:
- A meeting slot cannot be booked twice
- Stock cannot go negative
- Orders cannot be edited after shipping
```

---

## 🔧 TECHNOLOGY STACK (Approved Only)

**Framework:** Next.js 15+ (App Router)
**Language:** TypeScript (strict mode)
**Database:** PostgreSQL via Prisma
**UI:** Shadcn/UI + Tailwind CSS
**Auth:** NextAuth.js v5
**Validation:** Zod
**Testing:** Vitest + Playwright

**Forbidden:**
- ❌ axios (use native fetch)
- ❌ moment.js (use date-fns)
- ❌ lodash (use native or lodash-es)

---

## 🚨 IF YOU DETECT CONTEXT DRIFT

**Symptoms:**
- You're about to write code without checking CONTEXT.md
- You forgot which MODE you're in
- You're not sure if a package is approved
- You skipped the security checklist

**Action:**
1. STOP immediately
2. Re-read this file (context-anchor.md)
3. Re-read /architecture/CONTEXT.md
4. Re-read /architecture/STACK.md
5. Start over with correct MODE

---

## 📊 QUICK DECISION TREE

```
Change requested
    ↓
Is it TRIVIAL? (color, text, spacing)
    YES → ⚡ FAST-TRACK (skip tests, minimal docs)
    NO → Continue
    ↓
Is it VISUAL ONLY? (UI, CSS, layout)
    YES → 🟢 BUILDER (accessibility check, responsive)
    NO → Continue
    ↓
Does it touch DATA, AUTH, MONEY, SECURITY, or APIs?
    YES → 🔴 ARCHITECT (full protocol: Blueprint → Test → Code → Verify → Doc)
    NO → Continue
    ↓
Is it a BUG FIX?
    YES → 🔵 DEBUG (reproduce → test → fix → verify)
    NO → Continue
    ↓
Is it CODE CLEANUP?
    YES → 🟡 REFACTOR (benchmark → refactor → test)
```

---

## 🔄 CONTEXT REFRESH COUNTER

**Last Refresh:** [AUTO-UPDATED]
**Messages since refresh:** [AUTO-COUNTED]
**Next refresh in:** [10 - current count] messages

**Trigger:** If messages > 10 → Re-read this file automatically

---

## 💡 REMEMBER

You are not just generating code.  
You are building a **business-critical system** that will:
- Handle real money transactions
- Protect sensitive user data
- Comply with RGPD/PCI-DSS
- Scale to 100,000+ users

**Every decision matters. Every line matters.**

---

*v2.1 - Auto Context Preservation Active*  
*If you're reading this, your memory has been successfully refreshed! ✨*
