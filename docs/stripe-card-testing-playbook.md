# Stripe Card Testing Playbook

## Purpose

Validate the membership checkout and onboarding flow beyond happy path before deploy.

This playbook is tailored to the current app architecture:
- Home CTA starts checkout
- Success/cancel pages handle user outcomes
- Webhook writes membership metadata to Stripe and sends confirmation email
- Support lookup uses `membership_card_id` in Stripe customer metadata

Reference: [Stripe Testing Docs](https://docs.stripe.com/testing)

---

## Preconditions

- `wrangler pages dev` is running on `http://127.0.0.1:8788`
- Stripe webhook forwarding is active (Stripe CLI or ngrok)
- `.dev.vars` is set (Stripe keys, price ID, Discord invite, email sender)
- `.env.local` contains `VITE_CLOUDFLARE_STREAM_DOMAIN`
- Monitoring surfaces open:
  - Stripe Dashboard (Events + Webhook deliveries)
  - Wrangler terminal logs
  - Cloudflare Email activity
  - Gmail test inbox (`campanell+i4ltest@gmail.com`)

### Webhook Endpoint Guardrail (run before payment tests)

- Confirm ngrok tunnel is live (if using ngrok): `ngrok http 8788`
- Confirm Stripe sandbox webhook endpoint URL ends with `/api/stripe-webhook` (not root `/`)
- Send one test event and verify Wrangler logs `POST /api/stripe-webhook 200`

---

## Core Test Matrix

| Scenario | Card Number | Expected Outcome |
|---|---|---|
| Happy path success | `4242 4242 4242 4242` | Checkout succeeds; `/success`; webhook logs `card_issued` -> `card_email_sent`; email delivered |
| Generic decline | `4000 0000 0000 0002` | Payment fails; `/cancel`; no success email; clear retry path |
| Insufficient funds | `4000 0000 0000 9995` | Payment fails with decline; `/cancel`; no success email |
| Expired card decline | `4000 0000 0000 0069` | Payment blocked; decline shown by Stripe; no success email |
| Incorrect CVC decline | `4000 0000 0000 0127` | Payment blocked with CVC failure; no success email |
| 3DS required | `4000 0025 0000 3155` | Authentication challenge appears; success/cancel behavior remains correct |
| Card velocity decline | `4000 0000 0000 6975` | Checkout UI shows velocity decline; Stripe events show `decline_code: card_velocity_exceeded`; no membership email |

Use any valid future expiry date, any 3-digit CVC, and any valid ZIP unless Stripe test behavior says otherwise.

**Note:** `POST /api/stripe` returning `200` in Wrangler only means the Checkout **session** was created. Card declines and velocity limits are enforced by Stripe on the hosted Checkout page, so `200` on `/api/stripe` can still accompany a failed payment attempt.

---

## Verification Order (for each test)

1. **Stripe**
   - Event status and error/decline reason match scenario
   - Webhook delivery exists and returns expected code
2. **Runtime logs (Wrangler)**
   - Happy path: `card_issued` then `card_email_sent`
   - Declines/cancels: no false positive success logs
3. **Cloudflare Email**
   - Happy path: send event visible and delivered/accepted
   - Declines: no confirmation email should be sent
4. **Inbox**
   - Happy path: email content, card image link, Discord invite link, support email
   - Declines: no “membership active” message appears

---

## Webhook Resilience Checks

- Trigger `checkout.session.completed` with Stripe CLI and verify end-to-end pipeline.
- If webhook processing fails, confirm Stripe retries and replay path works.
- Verify duplicate deliveries do not create inconsistent metadata state.

---

## Support Readiness Checks

After at least one happy-path run:

- Copy `membership_card_id` from welcome email.
- Confirm customer lookup by card ID works:

```bash
stripe customers search --query "metadata['membership_card_id']:'<CARD_ID>'"
```

Optional concise support view:

```bash
stripe customers search --query "metadata['membership_card_id']:'<CARD_ID>'" \
| jq '.data[0] | {customer_id: .id, email: .email, card_id: .metadata.membership_card_id, card_status: .metadata.membership_card_status, email_status: .metadata.membership_card_email_status, valid_through: .metadata.membership_card_valid_through}'
```

---

## Minimum Pre-Deploy Set

Run at least:
- 1x happy path (`4242`)
- 2x declines (`0002`, `9995`)
- 1x auth-required (`3155`)
- 1x user-cancel path
- 1x support lookup by `cardId`
- (Recommended) 1x card velocity decline (`6975`)

If all pass, checkout + onboarding + support lookup are considered ready for deploy prep.

---

## Results Summary (Latest Run)

**Date:** 2026-04-27  
**Environment:** local (`wrangler pages dev`) + Stripe sandbox  
**Status:** Core negative-path, auth-path, and velocity-decline scenarios validated

| Scenario | Card Number | Result | Notes |
|---|---|---|---|
| Generic decline | `4000 0000 0000 0002` | Pass | Stripe event logs confirm `payment_intent.payment_failed` and decline handling |
| Insufficient funds | `4000 0000 0000 9995` | Pass | Stripe event logs confirm insufficient funds decline behavior |
| Expired card decline | `4000 0000 0000 0069` | Pass | Stripe event logs confirm expired card failure path |
| Incorrect CVC decline | `4000 0000 0000 0127` | Pass | Stripe event logs confirm incorrect CVC failure path |
| 3DS required | `4000 0025 0000 3155` | Pass | 3DS challenge modal displayed and event flow captured |
| Card velocity decline | `4000 0000 0000 6975` | Pass | Checkout shows repeated-attempts message; Stripe shows `decline_code: card_velocity_exceeded`; Wrangler still `POST /api/stripe 200` (session creation only) |

### Evidence captured

- Wrangler logs show successful session creation requests (`POST /api/stripe 200`) during tests (including decline scenarios where payment fails later on Stripe Checkout).
- Stripe event logs/screenshots captured for all six scenarios above.
- Test artifacts are available in this workspace (screenshots attached during validation session).
