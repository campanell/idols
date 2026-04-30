# CTA Variant JSON Schema Note

This document defines the expected structure for `src/data/membershipCtaVariants.json`.

## Purpose

- Keep CTA data machine-editable (including R script workflows).
- Ensure copy remains visually consistent across many video cards.
- Prevent malformed entries from breaking CTA rendering.

## Required Fields (per variant object)

Each array item must include:

- `id` (string, unique)
- `language` (string, currently `en` for Phase 4A)
- `headline` (string)
- `bullets` (array of strings)
- `buttonText` (string)

## Rules

- `bullets` must contain **exactly 2** entries.
- `id` should be stable and human-readable (example: `en-first-wave`).
- `buttonText` is intended to remain constant across variants in Phase 4A.

## Character Count Guidance

Use these bounds to reduce layout inconsistency and excessive wrapping.

- **Headline**
  - Safe zone: `32-52` characters
  - Hard max: `60` characters
- **Each bullet**
  - Safe zone: `34-62` characters
  - Hard max: `72` characters
- **Button text**
  - Preferred: `18-24` characters
  - Keep constant for this phase

## Example

```json
{
  "id": "en-first-wave",
  "language": "en",
  "headline": "Be Part Of The First Wave.",
  "bullets": [
    "Unlock private behind-the-scenes access",
    "Add your voice to the future idol roadmap"
  ],
  "buttonText": "Claim My Founders Card"
}
```
