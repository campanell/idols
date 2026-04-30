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
   ```
3. Create `.env.local` for frontend build-time config:
   ```dotenv
   VITE_CLOUDFLARE_STREAM_DOMAIN=customer-<your-stream-customer-id>.cloudflarestream.com
   ```
4. Build the app:
   ```bash
   npm run build
   ```
5. Run Cloudflare Pages Functions locally (uses `wrangler.jsonc` bindings, including `EMAIL`):
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
5. Start Stripe webhook forwarding in a separate terminal:
   ```bash
   stripe listen --forward-to http://localhost:8788/api/stripe-webhook
   ```
6. Trigger one event and verify:
   ```bash
   stripe trigger checkout.session.completed
   ```
   - Expect webhook HTTP 200
   - Expect membership card logs (`card_issued`, then `card_email_sent` or `card_delivery_failed`)
   - Confirm test email delivery/inbox placement

### Stripe webhook testing (recommended flow)
Use Stripe CLI forwarding instead of ngrok:

```bash
stripe listen --forward-to http://localhost:8788/api/stripe-webhook
```

Then in another terminal, trigger test events:

```bash
stripe trigger checkout.session.completed
stripe trigger invoice.paid
stripe trigger invoice.payment_failed
```

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
- Use Cloudflare Pages/Workers project secrets for production and preview.
- Keep test and live Stripe variables separate:
  - test: `sk_test_*`, test `price_*`
  - live: `sk_live_*`, live `price_*`
- Always restart Wrangler after changing `.dev.vars`.
