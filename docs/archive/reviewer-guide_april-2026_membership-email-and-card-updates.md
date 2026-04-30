# Reviewer Guide - April 2026 Membership Email and Card Updates

## Purpose

Use this guide to review the recent Stripe + Cloudflare email and membership card changes, and to drive focused QA questions.

## What Changed

### Files Added/Updated

- `functions/api/stripe.ts`
- `functions/api/stripe-webhook.ts`
- `functions/api/membership-card-status.ts`
- `functions/api/membership-card-preview.ts`
- `docs/membership-operations-runbook.md`
- `README.md`
- `package.json` / `package-lock.json` (SendGrid dependency removed)

### Primary Functional Changes

1. **Transactional email path migrated** from SendGrid to Cloudflare Email.
2. **Stripe webhook flow expanded** to generate and track membership card lifecycle states.
3. **Support API endpoint added** for card delivery/status lookups.
4. **AI personalization prototype endpoint added** for digital card messaging experiments.
5. **Cloudflare API files migrated to TypeScript** from JavaScript.

---

## Review Scope by Feature

## 1) Stripe Checkout API (`/api/stripe`)

### Reviewer questions

- Does checkout session creation still work for the intended subscription product?
- Is the hardcoded `priceId` acceptable for current scope, or should it be configurable?
- Are `success_url` and `cancel_url` correct in production and non-production environments?
- Are CORS headers sufficient for frontend checkout calls?
- Is error output appropriately safe (no secrets/internal leakage)?

---

## 2) Stripe Webhook + Cloudflare Email (`/api/stripe-webhook`)

### Reviewer questions

- Does the handler correctly process only `checkout.session.completed` events?
- Is missing-customer-email handling correct and observable?
- Does the email payload include:
  - membership confirmation
  - Discord link
  - card ID/tier/valid-through details
- Is Cloudflare Email send behavior correct in both modes:
  - `EMAIL` binding path (preferred)
  - REST fallback path (optional)
- Are failures logged with enough detail for troubleshooting?
- Does the webhook always return a response acceptable for Stripe retries?

### Security/robustness checks

- Is webhook signature validation needed in the next hardening pass?
- Are all env vars referenced safely when missing?
- Is metadata length bounded for Stripe field limits?

---

## 3) Membership Card Lifecycle Logging (Stripe metadata + logs)

### Reviewer questions

- Are lifecycle statuses clear and consistent?
  - `card_issued`
  - `card_email_sent`
  - `card_delivery_failed`
- Is metadata written to the right Stripe objects (customer/subscription)?
- Do updates happen in correct order (issue -> send -> final status)?
- Is there enough data to reconcile support issues ("I didn't get my card")?
- Are failures in metadata updates non-fatal to the webhook flow?

---

## 4) Support Lookup Endpoint (`/api/membership-card-status`)

### Reviewer questions

- Does auth guard work as expected using `x-support-token`?
- Is query behavior correct for both:
  - `customer_id`
  - `email`
- Is response shape useful for support operations?
- Are 400/401/404/500 responses accurate and actionable?
- Is any sensitive information exposed that should be removed?

---

## 5) AI Card Personalization Prototype (`/api/membership-card-preview`)

### Reviewer questions

- Does fallback mode work when AI Gateway env vars are not configured?
- Does AI mode produce concise, on-brand messaging for sample inputs?
- Are latency and usage metrics captured in the response for feasibility assessment?
- Is error handling clear in:
  - gateway non-2xx
  - request exceptions
- Is this endpoint clearly treated as prototype (not production personalization)?

---

## 6) TypeScript Migration Quality

### Reviewer questions

- Did route behavior remain unchanged after `.js` -> `.ts` migration?
- Are local type definitions sufficient and readable?
- Any obvious type holes (`any`) that should be tightened in next pass?
- Are deleted JS files fully replaced by TS routes in Cloudflare Pages Functions?

---

## Environment and Config Review

Confirm these are documented and available in deployment:

- `STRIPE_SECRET_KEY`
- `DISCORD_COMMUNITY_INVITE_URL` (optional)
- `SUPPORT_API_TOKEN`
- Cloudflare Email options:
  - `EMAIL` binding (preferred), or
  - `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_EMAIL_FROM`
- AI prototype (optional):
  - `AI_GATEWAY_URL`, `AI_GATEWAY_API_KEY`, `AI_MODEL`

### Reviewer questions

- Are env vars separated properly across environments (dev/staging/prod)?
- Do we have a rollback path if Cloudflare Email configuration fails?

---

## QA Test Prompts (Copy/Paste)

Use these prompts during review sessions:

- "Show me a successful checkout through to webhook and email send."
- "Show me the exact payload we send to Cloudflare Email."
- "What happens if `EMAIL` binding is missing?"
- "How do we confirm `card_delivery_failed` is recorded and recoverable?"
- "How would support investigate a customer who says they never got the card?"
- "Show me a sample AI card preview response in fallback mode and AI mode."
- "What would we need to do next to productionize AI personalization?"

---

## Sign-off Checklist

- [ ] Checkout endpoint works for subscription flow.
- [ ] Webhook sends confirmation email via Cloudflare path.
- [ ] Membership card lifecycle statuses are written and queryable.
- [ ] Support endpoint is authenticated and useful.
- [ ] AI prototype endpoint returns expected shape with metrics.
- [ ] TypeScript migration does not break route behavior.
- [ ] Runbook and README remain accurate for operators.
