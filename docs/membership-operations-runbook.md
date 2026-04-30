# Membership Operations Runbook

## Scope

This runbook covers **production membership operations**:
- Stripe checkout confirmation email via Cloudflare Email Send.
- Membership card lifecycle logging and support reconciliation (card id, tier, dates, email delivery status in Stripe metadata).
- **Generic membership card** in confirmation email: image from `GENERIC_MEMBERSHIP_CARD_IMAGE_URL` (or the documented default URL in code).

Related test document:
- `docs/stripe-card-testing-playbook.md` (pre-deploy Stripe card scenario matrix and verification flow)

**Out of scope here (separate project / optional R&D):**
- AI-generated or highly personalized membership card images and copy experiments. Those use `POST /api/membership-card-preview` only when you choose to run that workstream; they are not required for live onboarding.

## API Endpoints

- `POST /api/stripe`
- `POST /api/stripe-webhook`
- `GET /api/membership-card-status`
- `POST /api/membership-card-preview` (optional; see appendix — not part of live onboarding)

## UX/Route context for operations

Operationally relevant entry points in current app state:
- Primary conversion surface: Home page membership CTA (`/`)
- Legacy direct checkout route (`/checkout`) now redirects to Home (`/`)
- Support/objection handling route: `/faq` (footer link)
- Recovery route for stale/removed URLs: custom `404` page (catch-all)

## Environment Setup Checklist

Required:
- `STRIPE_SECRET_KEY`
- `SUPPORT_API_TOKEN`

Email path (choose one):
- Preferred: Worker `EMAIL` binding
- Fallback REST: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_EMAIL_FROM`

Optional:
- `DISCORD_COMMUNITY_INVITE_URL`
- `GENERIC_MEMBERSHIP_CARD_IMAGE_URL` (public URL for the generic membership card asset)
- `AI_GATEWAY_URL`
- `AI_GATEWAY_API_KEY`
- `AI_MODEL`

## Week 1 Validation - Transactional Confirmation Email

### Trigger event
- `checkout.session.completed`

### Expected behavior
1. Webhook creates membership card payload.
2. Webhook logs `card_issued`.
3. Confirmation email is sent by Cloudflare Email service and may include a hosted generic card image link during refresh phase.
4. Webhook logs either `card_email_sent` or `card_delivery_failed`.
5. Stripe customer/subscription metadata are updated with latest card status fields.

### Test matrix

| Case | Input | Expected |
|---|---|---|
| Happy path | Valid completed checkout session with email | 200 response, email accepted, Stripe metadata `membership_card_status=card_email_sent` |
| Failure path | Email service misconfigured | 200 response, Stripe metadata `membership_card_status=card_delivery_failed`, error field populated |

## Week 2 Validation - Card Status Reconciliation

Use support token header for all support status checks.

### By customer id

```bash
curl -X GET "https://<your-domain>/api/membership-card-status?customer_id=cus_123" \
  -H "x-support-token: <SUPPORT_API_TOKEN>"
```

### By email

```bash
curl -X GET "https://<your-domain>/api/membership-card-status?email=fan@example.com" \
  -H "x-support-token: <SUPPORT_API_TOKEN>"
```

### Support workflow for "I didn't get my card"
1. Query status endpoint by email.
2. Check `membership_card_email_status` and `membership_card_email_error`.
3. If failed, resolve configuration issue and reissue through Stripe workflow.
4. Confirm updated metadata timestamp and status.

### Lookup by card ID (from welcome email)

If a customer contacts `service@idols4life.com` and provides the membership card ID from their welcome email, use Stripe Customer Search in test/live mode as appropriate.

#### Stripe CLI command (full record)

```bash
stripe customers search --query "metadata['membership_card_id']:'<CARD_ID>'"
```

Example:

```bash
stripe customers search --query "metadata['membership_card_id']:'2c745488-ad2a-4f89-8acf-218462f75c2a'"
```

#### Stripe CLI command (support-friendly summary)

```bash
stripe customers search --query "metadata['membership_card_id']:'<CARD_ID>'" \
| jq '.data[0] | {customer_id: .id, email: .email, card_id: .metadata.membership_card_id, card_status: .metadata.membership_card_status, email_status: .metadata.membership_card_email_status, valid_through: .metadata.membership_card_valid_through}'
```

#### Notes

- Keep the entire `--query` value wrapped in quotes.
- Search is not ideal for immediate read-after-write; wait up to ~1 minute if record does not appear immediately.
- Ensure Stripe is in the correct mode (Test vs Live) before searching.

## Phase 3 Test Order (Checklist)

Use this order for each end-to-end Phase 3 test so failures are isolated quickly.

### A) Preflight setup

- [ ] Build app assets: `npm run build`
- [ ] Start local runtime: `npx wrangler pages dev dist --port 8788`
- [ ] Start Stripe forwarding: `stripe listen --forward-to http://127.0.0.1:8788/api/stripe-webhook`
- [ ] Confirm `.dev.vars` is populated for Stripe + email + card image URL
- [ ] Confirm `.env.local` contains `VITE_CLOUDFLARE_STREAM_DOMAIN`
- [ ] Open monitoring surfaces before test:
  - Stripe Dashboard (events + webhook deliveries)
  - Wrangler/local runtime terminal logs
  - Cloudflare Email logs
  - Gmail test inbox (`campanell+i4ltest@gmail.com`)

### B) Trigger checkout

- [ ] From Home CTA, open Stripe Checkout
- [ ] Complete one happy-path payment using test card `4242 4242 4242 4242`

### C) Verify in causality order

- [ ] **Stripe first**
  - [ ] `checkout.session.completed` event exists
  - [ ] Webhook delivery attempt recorded
  - [ ] Webhook delivery returns HTTP `200`
- [ ] **Runtime logs second**
  - [ ] `card_issued` log appears
  - [ ] `card_email_sent` appears (or `card_delivery_failed` with error details)
- [ ] **Cloudflare Email logs third**
  - [ ] Send attempt is visible
  - [ ] Accepted/delivered (or actionable error captured)
- [ ] **Gmail inbox fourth**
  - [ ] Email received at `campanell+i4ltest@gmail.com`
  - [ ] Subject/body copy is correct
  - [ ] Membership card image link loads
  - [ ] Community invite link is present and correct
  - [ ] Check Spam/Promotions if not in Primary

### D) Cancel/negative-path sanity check

- [ ] Start checkout and cancel before payment completion
- [ ] Confirm app lands on `/cancel` with clear retry path
- [ ] Confirm no false-positive “payment complete” messaging

### E) Quick triage map (if failed)

- [ ] Stripe event missing -> checkout flow did not complete
- [ ] Stripe event present, webhook non-200 -> webhook endpoint/forwarding/runtime issue
- [ ] Webhook 200 + `card_delivery_failed` -> Cloudflare email configuration/delivery issue
- [ ] Cloudflare sent but no inbox -> mailbox filtering/delivery delay
- [ ] Inbox received but copy/link issues -> email template/content issue

## Latest Validated Run (Phase 3)

- Date: 2026-04-27
- Environment: local (`wrangler pages dev`) + Stripe sandbox + ngrok forwarding
- Test inbox: `campanell+i4ltest@gmail.com`
- Outcome: end-to-end success
  - `POST /api/stripe` returned `200`
  - Runtime logs showed `membership-card-event` transition:
    - `card_issued`
    - `card_email_sent`
  - Cloudflare Email activity status: `Delivered`
  - Gmail receipt confirmed with:
    - membership card image visible
    - community invite link valid
    - support contact `service@idols4life.com`

## Optional appendix - Card message prototype (`/api/membership-card-preview`)

Use this **only** when you are actively testing AI Gateway messaging for a future personalized-card feature. It does **not** affect live membership email or Stripe webhook behavior.

**Prerequisites:** `AI_GATEWAY_URL`, `AI_GATEWAY_API_KEY`, `AI_MODEL` (see README).

### Sample request

```bash
curl -X POST "https://<your-domain>/api/membership-card-preview" \
  -H "Content-Type: application/json" \
  -d '{
    "member_name": "Aiko",
    "tier": "Founding Member",
    "favorite_genre": "city pop",
    "locale": "en-US"
  }'
```

### Response fields (prototype only)
- `mode`: `ai_gateway`, `fallback`, or `fallback_after_error`
- `prototype_card.personalized_message`
- `metrics.latency_ms`
- `metrics.usage` (when AI Gateway responds with usage)

### Optional metrics capture (R&D)
- Total requests: ___
- Average latency (ms): ___
- P95 latency (ms): ___
- Fallback rate (%): ___
- Error rate (%): ___
- Estimated cost per generated card: ___

## Rollback Guidance

If Stripe checkout is impacted:
1. Disable webhook routing temporarily in Stripe dashboard.
2. Fix Email binding/configuration.
3. Replay events after remediation.

If only email sending is impacted:
1. Keep webhook live so Stripe metadata still captures failure state.
2. Reprocess failed members after fix.

