# Cleanup Audit Candidates

Purpose: identify legacy or unused files for safe cleanup in small, reviewable batches.

## Scope

- Branch: `chore/cleanup-audit`
- Goal: remove stale files without changing intended app behavior.
- Rule: if uncertain, put in **Needs Review** (do not delete yet).

---

## Keep

Use this section for files that are active, referenced, or still needed for current and near-term work.

- `src/lib/utils.js` - actively used by shadcn UI components (`button`, `card`, `accordion`, `badge`) and checkout UI.
- `src/components/ui/accordion.jsx` - used by `src/components/MembershipFaqAccordion.jsx`.
- `src/components/ui/badge.jsx` - used by success/cancel pages.
- `src/components/ui/button.jsx` - used by header tabs and checkout controls.
- `src/components/ui/card.jsx` - used by membership CTA and success/cancel pages.
- `src/pages/PrivacyPolicy.jsx` and `src/pages/TermsOfService.jsx` - active legal routes.
- `functions/api/stripe.ts`, `functions/api/stripe-webhook.ts`, `functions/api/membership-card-status.ts` - active checkout/webhook/support flow.
- `functions/api/membership-card-preview.ts` - referenced in README and runbook as optional prototype endpoint.
- `docs/membership-and-ui-refresh-execution-plan.md` - active source-of-truth execution doc.
- `docs/membership-operations-runbook.md` - active production operations doc.
- `docs/stripe-card-testing-playbook.md` - active test validation checklist.
- `docs/cta-variant-json-schema-note.md` - referenced by execution plan technical baseline.

---

## Delete

Use this section only for files confirmed unused or superseded.

- `src/components/ui/sheet.jsx` - no imports/usages found in `src`; legacy from prior hamburger menu approach.
- `src/components/ui/separator.jsx` - no imports/usages found in `src`; currently dead code.

---

## Needs Review

Use this section for ambiguous files that need code search, runtime check, or product decision.

- `docs/stripe sandbox notes.md` - appears to be working notes; decide whether to archive into runbook or keep as historical notes.
- `docs/reviewer-guide_april-2026_membership-email-and-card-updates.md` - may overlap with runbook/testing docs; evaluate merge/archive.
- `docs/cleanup-audit-candidates.md` - temporary working doc; keep until cleanup PR merges, then archive or delete in follow-up.

---

## Evidence Checklist (per file candidate)

- [x] Searched for imports/usages in app and functions (first pass)
- [x] Checked route references (if page/component) (first pass)
- [x] Checked docs references (if operational/doc file) (first pass)
- [x] Confirmed replacement exists (if superseded) (for `sheet.jsx`, `separator.jsx`)
- [x] Classified as Keep / Delete / Needs Review (first pass)
- [ ] Second-pass manual review before executing deletions

---

## Deletion Log (execution batches)

Track exactly what was removed in each batch commit.

### Batch 1
- Deleted:
  - `src/components/ui/sheet.jsx`
  - `src/components/ui/separator.jsx`
- Validation:
  - [ ] `npm run build`
  - [ ] `npm run lint`
  - [ ] smoke-check critical routes (`/`, `/roster`, `/faq`, `/privacy-policy`, `/terms-of-service`)

### Batch 2
- Deleted:
  - (docs candidates from Needs Review, only after explicit keep/delete decision)
- Validation:
  - [ ] `npm run build`
  - [ ] `npm run lint`
  - [ ] smoke-check critical routes

