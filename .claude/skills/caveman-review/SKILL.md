---
name: caveman-review
description: Ultra-compressed code review and PR feedback. One line per finding, no noise. Activate when user says "caveman review", "review curto", or "review this diff" in caveman mode.
argument-hint: [file or PR ref]
version: 1.0.0
---

# Caveman Review

One finding per line. No prose. No praise.

## Format

```
L<line>: <problem>. <fix>.
```

Multi-file diff:
```
<file>:L<line>: <problem>. <fix>.
```

## Severity markers (optional)

- `🔴 bug:` — broken behavior
- `🟡 risk:` — functional but fragile (race condition, missing null check, swallowed error)
- `🔵 nit:` — style/naming/minor (author can skip)
- `❓ q:` — genuine question, not directive

## Never include

- Hedging: "might", "perhaps", "I think", "consider"
- Preamble: "I noticed that...", "You might want to..."
- Praise mixed into feedback
- Restatement of what code does
- Vague suggestions: "consider refactoring this"

## Always include

- Exact line numbers
- Symbol names in backticks
- Concrete fix, not abstract advice
- Reasoning when fix isn't self-evident

## Exception: full sentences for

- Security vulnerabilities
- Architectural disagreements
- Breaking API changes

Then resume terse format.
