# Stripe Production Transition Checklist

Use this checklist when moving the membership checkout flow from Stripe sandbox to Stripe production.

## 1) Scope And Freeze
- Confirm this release scope is only:
  - Stripe production transition readiness
  - Existing checkout + webhook + membership email flow
- Freeze copy, CTA variant IDs, and `STRIPE_PRICE_ID` values for the release window.

## 2) Production Environment Variables (Cloudflare)
- Set and verify in Cloudflare Pages/Workers production environment:
  - `STRIPE_SECRET_KEY=sk_live_...`
  - `STRIPE_PRICE_ID=price_...` (live mode price)
  - `APP_BASE_URL=https://idols4life.com` (or production canonical domain)
  - `ENVIRONMENT=production`
  - `DISCORD_COMMUNITY_INVITE_URL=...`
  - `GENERIC_MEMBERSHIP_CARD_IMAGE_URL=...`
  - `CLOUDFLARE_EMAIL_FROM=...`
- If EMAIL binding is not used in runtime, also set REST fallback vars:
  - `CLOUDFLARE_ACCOUNT_ID`
  - `CLOUDFLARE_API_TOKEN`

## 3) Stripe Live Dashboard Configuration
- Confirm live product and live price exist and match planned offer details.
- Confirm branding (logo and primary color) is correct for Checkout.
- Confirm success/cancel behavior is expected in hosted Checkout.
- Confirm live webhook endpoint is set to:
  - `https://<production-domain>/api/stripe-webhook`
- Confirm webhook is subscribed at minimum to:
  - `checkout.session.completed`

## 4) Webhook And Data Readiness
- Confirm webhook returns HTTP 2xx in production logs.
- Confirm `checkout.session.completed` creates membership card event logs:
  - `card_issued`
  - then `card_email_sent` or `card_delivery_failed`
- Confirm Stripe metadata persistence updates are visible on:
  - Customer metadata
  - Subscription metadata
- Confirm `cta_variant_id` is present on the **Checkout Session** (not Customer/Subscription): Dashboard → **Payments** → open the payment → **Checkout Session** `cs_...` → **Metadata**. `functions/api/stripe.ts` sets `metadata.cta_variant_id` on the session only; `stripe-webhook.ts` writes **membership card** keys onto Customer/Subscription and does **not** copy CTA fields there unless we extend it.

## 5) Transactional Email Readiness
- Confirm sender domain DNS/authentication is valid in Cloudflare Email Send.
- Validate outbound email rendering for:
  - text content
  - html content
  - membership card image link
  - Discord invite link
- Confirm monitoring path for failed deliveries and retry decisions.

## 6) Sandbox Dress Rehearsal (Required)
- In sandbox (`sk_test_*`, test `price_*`), run full flow:
  1. Start checkout from Home CTA
  2. Complete payment with Stripe test card
  3. Verify webhook 200 delivery
  4. Verify metadata write
  5. Verify email send result
- Repeat with at least one failure path (decline or webhook delivery issue) and verify logs.

## 7) Live Smoke Test (Controlled)
- Run one controlled live purchase.
- Verify:
  - Checkout completes
  - Webhook receives event and returns 200
  - Metadata state is updated
  - Confirmation email is delivered
- If any step fails, pause onboarding traffic and resolve before broader rollout.

## 8) Rollback And Recovery Plan
- Keep previous known-good deployment reference ready.
- Define owner for rollback decision during launch window.
- Document replay/recovery steps for missed webhook outcomes:
  - Identify event in Stripe Dashboard
  - Re-send event to webhook endpoint
  - Confirm metadata/email state converges

## 9) Go/No-Go Gate
Proceed only if all are true:
- Live secret and live price are verified in production.
- Webhook deliveries are healthy and observable.
- Membership card metadata transitions are visible.
- Transactional email path is confirmed.
- Recovery runbook owner and steps are explicit.
