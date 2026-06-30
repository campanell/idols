# Development Guide

## Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.dev.vars` for local secrets used by `wrangler pages dev`:
   ```dotenv
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PRICE_ID=price_...
   APP_BASE_URL=http://localhost:8788
   SUPPORT_API_TOKEN=replace-me
   DISCORD_COMMUNITY_INVITE_URL=https://discord.gg/idols4life
   GENERIC_MEMBERSHIP_CARD_IMAGE_URL=https://<public-host>/assets/membership-card-generic.png
   CLOUDFLARE_ACCOUNT_ID=optional-rest-fallback
   CLOUDFLARE_API_TOKEN=optional-rest-fallback
   CLOUDFLARE_EMAIL_FROM=membership@idols4life.com
   OPENAI_PIXEL_ID=<same as gptads:I4Lpixel_id>
   OPENAI_CAPI_KEY=<gptads:I4Lconversion>
   ```
3. Create `.env.local` for frontend build-time config (optional — pixel ID can also come from `OPENAI_PIXEL_ID` via `/api/measurement-config` when using `wrangler pages dev`):
   ```dotenv
   VITE_CLOUDFLARE_STREAM_DOMAIN=customer-<your-stream-customer-id>.cloudflarestream.com
   VITE_OPENAI_PIXEL_ID=<optional; same as OPENAI_PIXEL_ID for pure vite dev>
   ```
4. Build the app:
   ```bash
   npm run build
   ```
5. Run Cloudflare Pages Functions locally (uses `wrangler.jsonc` bindings):
   ```bash
   npx wrangler pages dev dist --port 8788
   ```
6. Open the app at `http://localhost:8788`.

### Wrangler config safety tip
This project should use `wrangler.jsonc` as the source of truth for local Pages development.
`wrangler pages dev` does not support a custom config path flag; it expects `wrangler.jsonc` in the project root.
If you have an older local `wrangler.toml`, move it out of this folder to avoid ambiguity.

### Preflight checklist (before Stripe + email tests)
1. Confirm `.dev.vars` includes:
   - `STRIPE_SECRET_KEY=sk_test_...`
   - `STRIPE_PRICE_ID=price_...` (test mode)
   - `APP_BASE_URL=http://localhost:8788`
   - `CLOUDFLARE_EMAIL_FROM=membership@...` (or your verified sender)
   - `GENERIC_MEMBERSHIP_CARD_IMAGE_URL=https://...` (when testing generic card delivery links)
2. Confirm `.env.local` includes:
   - `VITE_CLOUDFLARE_STREAM_DOMAIN=customer-...cloudflarestream.com`
3. Build frontend assets:
   ```bash
   npm run build
   ```
4. Start local Pages + Functions:
   ```bash
   npx wrangler pages dev dist --port 8788
   ```
5. Start ngrok in a separate terminal:
   ```bash
   ngrok http 8788
   ```
6. In Stripe sandbox webhook settings, set endpoint to:
   `https://<your-ngrok-domain>/api/stripe-webhook`
7. Trigger one checkout and verify:
   - Expect webhook HTTP 200
   - Expect membership card logs (`card_issued`, then `card_email_sent` or `card_delivery_failed`)
   - Confirm test email delivery/inbox placement

### Stripe webhook testing (recommended flow)
Use ngrok forwarding for local webhook delivery:

```bash
ngrok http 8788
```

Then update Stripe sandbox webhook endpoint to:
`https://<your-ngrok-domain>/api/stripe-webhook`

Use Stripe test cards in Checkout for end-to-end behavior:
- `4242 4242 4242 4242` (success)
- `4000 0000 0000 9995` (declined)
- `4000 0025 0000 3155` (3D Secure required)

## Code Structure
- `src/components/`: Reusable UI components
- `src/pages/`: Page-level components
- `src/data/`: Data files and configurations
- `src/assets/`: Static assets and images
- `functions/api/`: Currently Stripe API calls

## Styling
- Using Tailwind CSS for styling
- Custom styles can be added in `src/index.css`
- UI components follow shadcn + Tailwind patterns in `src/components/ui/*`

## Routing + IA (Current)
- Header nav is intentionally minimal: `Home` and `Roster`
- Footer contains `FAQ`, `Privacy Policy`, and `Terms of Service`
- Membership FAQ content is served from `/faq` via `MembershipFaqPage`
- Unknown routes render `NotFoundPage` (custom 404)

## Data Management
- Main data file: `src/data/i4l_publish.json`
- Update data through the application interface
- Backup data before making major changes

## Git Workflow
1. Create a new branch for features
2. Commit changes with descriptive messages
3. Push to remote repository
4. Create pull request for review

## Working with secrets
- Use `.dev.vars` for local dev secrets with Wrangler.
- Use Cloudflare Pages/Workers project **Secrets** (encrypted) in the dashboard for values that must never be committed, for example:
  - `STRIPE_SECRET_KEY`
  - `CLOUDFLARE_API_TOKEN`
  - `SUPPORT_API_TOKEN` (if you use the support status API)
- If Cloudflare shows that **environment variables are managed through Wrangler**, **plaintext** values for Pages Functions are read from **`wrangler.jsonc`** (`vars` and `env.production.vars`), not from dashboard text fields. Dashboard plaintext entries for those names can be ignored or overwritten on deploy.
- Put **non-secret** Function configuration in `wrangler.jsonc` (e.g. `STRIPE_PRICE_ID`, `APP_BASE_URL`, `OPENAI_PIXEL_ID`, `DISCORD_COMMUNITY_INVITE_URL`, `GENERIC_MEMBERSHIP_CARD_IMAGE_URL`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_EMAIL_FROM`). Use **`env.production.vars`** for live-site values (e.g. live `STRIPE_PRICE_ID` and `https://idols4life.com`).
- **Wrangler-managed Pages:** Dashboard plaintext env vars may be disabled. Runtime vars (including `OPENAI_PIXEL_ID`) live in `wrangler.jsonc`; secrets use `wrangler pages secret put`. The browser pixel reads `OPENAI_PIXEL_ID` at runtime from `/api/measurement-config` — you do **not** need `VITE_OPENAI_PIXEL_ID` in the Cloudflare dashboard.
- Keep test and live Stripe variables separate:
  - test: `sk_test_*`, test `price_*`
  - live: `sk_live_*`, live `price_*`
- Always restart Wrangler after changing `.dev.vars`.

## Stripe Production Transition
- Use `docs/stripe-production-transition-checklist.md` as the execution checklist for sandbox rehearsal, live cutover, and rollback readiness.
