---
name: cavecrew
description: Spawn context-efficient subagents for code investigation, surgical edits, and diff review. Use when delegating tasks where compressed output saves significant context. Activate when user says "cavecrew", "use cavecrew", or when a delegation would return large exploratory output.
argument-hint: <investigator|builder|reviewer> <task>
version: 1.0.0
---

# Cavecrew

Three compressed subagents. Each returns ~60% less output than standard agents.

> Use when subagent output would be large and you only need the facts.

## The three agents

### investigator
Locates code definitions, traces call paths, finds usage patterns.

**Output format:** `path:line — symbol — note`

**Use for:** "Where is X defined?", "What calls Y?", "Find all usages of Z"

**Do not use for:** Tasks requiring file edits or multi-file refactors

### builder
Makes surgical edits to 1–2 files with known scope.

**Output format:**
```
path:line-range — change description ≤10 words
STATUS: done | partial | blocked
```

**Use for:** Small, well-scoped changes where you already know the target file

**Do not use for:** Refactors spanning >5 files — too many delegations, use main thread

### reviewer
Audits diffs for bugs. Returns caveman-review format.

**Output format:** `path:line: 🔴/🟡/🔵 severity: problem. fix.`

**Use for:** Reviewing a diff or specific file for issues before committing

## When to use cavecrew vs regular agents

| Situation | Use |
|---|---|
| Need to find a symbol, trace a call | investigator |
| Small edit, file already known | builder |
| Review a diff for bugs | reviewer |
| Complex feature spanning many files | main thread + frontend/backend agents |
| Security audit | security agent (more thorough) |

## Chaining rule

Always run investigator before builder when the target file is unknown. Do not chain investigators into builders for refactors >5 files.
