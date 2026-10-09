---
name: caveman-compress
description: Compress a natural language file (CLAUDE.md, notes, memory files) into caveman-speak to reduce input tokens. Activate when user says "compress", "caveman-compress", or "comprime" followed by a file path.
argument-hint: <filepath>
version: 1.0.0
---

# Caveman Compress

Compress prose files to reduce input tokens. Preserve all technical content exactly.

## What to compress

Target files: `.md`, `.txt` — project notes, memory files, CLAUDE.md sections.

Never touch: code files, config files, lock files, `.env`, `.json`, `.yaml`, `.ts`, `.tsx`.

## Process

1. Read the target file
2. Create backup: rename original to `FILE.original.md`
3. Compress and write the compressed version to the original path
4. Report: original token count → compressed token count → % reduction

## Compression rules

**Remove:**
- Articles (a, an, the) where meaning survives
- Filler words: "really", "basically", "simply", "just", "very", "quite"
- Pleasantries and hedging: "make sure to", "you should", "it's important to", "please note"
- Redundant phrasing and repeated examples
- Long preambles before the actual content

**Preserve exactly:**
- Code blocks and inline code
- URLs, file paths, commands
- Technical terms, proper nouns
- Dates, version numbers, environment variable names
- All lists — only merge if truly redundant

**Techniques:**
- Shorter synonyms: "big" not "extensive", "use" not "utilize"
- Sentence fragments are fine
- Merge redundant bullets into one
- Accept implicit subject: "Run migration" not "You should run migration"

## Error handling

If compression would alter technical meaning → stop, report which section, do not write.
Maximum 2 retries on unclear sections before reporting failure.
