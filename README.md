# IDOLS Project

A React-based web application for managing and displaying idol information, built with Vite and modern web technologies.

## Project Structure

```
idols/
├── functions/
│   └── api/          # Cloudflare Pages Functions API endpoints
├── src/
│   ├── assets/      # Static assets and images
│   ├── components/  # Reusable React components
│   ├── data/        # Data files and configurations
│   ├── pages/       # Page components
│   ├── App.jsx      # Main application component
│   └── main.jsx     # Application entry point
├── docs/            # Ops runbooks and implementation notes
├── public/          # Public static files
└── ...config files
```

## Technologies Used

- React + Vite for fast development and building
- Tailwind CSS for styling
- shad/cn for UI components
- ESLint for code quality
- Git for version control

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Development

- The project uses Vite for fast development with HMR (Hot Module Replacement)
- ESLint is configured for code quality
- Tailwind CSS is set up for styling

## Stripe + Membership APIs

- `POST /api/stripe` creates a Stripe Checkout session.
- `POST /api/stripe-webhook` handles `checkout.session.completed` and sends membership confirmation via Cloudflare Email.
- `GET /api/membership-card-status` returns support-facing membership card status from Stripe metadata.
- `POST /api/membership-card-preview` runs the personalized card message prototype (AI Gateway when configured, fallback otherwise).

## Current Routes (App)

- Primary nav: `/` (Home), `/roster`
- Membership support content: `/faq` (footer link)
- Checkout flow: `/checkout`, `/success`, `/cancel`
- Legal: `/privacy-policy`, `/terms-of-service`
- Unknown paths: custom `404` page via catch-all route

## Required Environment Variables

- `STRIPE_SECRET_KEY` (required for checkout, webhook updates, and status lookup)
- `STRIPE_PRICE_ID` (required; use test price in dev and live price in production)
- `APP_BASE_URL` (recommended in local dev and staging to avoid host/protocol mismatch)
- `VITE_CLOUDFLARE_STREAM_DOMAIN` (required for frontend video embeds, for example `customer-<id>.cloudflarestream.com`)
- `DISCORD_COMMUNITY_INVITE_URL` (optional, used in confirmation email template)
- `GENERIC_MEMBERSHIP_CARD_IMAGE_URL` (optional for refresh phase; hosted image URL used for non-personalized card delivery rollout)
- `SUPPORT_API_TOKEN` (required for `/api/membership-card-status`)
- Cloudflare Email (either option below):
  - Preferred: `EMAIL` Worker binding
  - Fallback REST: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_EMAIL_FROM`
- AI prototype (optional for week 3):
  - `AI_GATEWAY_URL`
  - `AI_GATEWAY_API_KEY`
  - `AI_MODEL`

## Config File Inventory

### Runtime / environment config

- `.dev.vars` — Wrangler/Functions local runtime secrets
- `.env.local` — Vite frontend build-time variables (`VITE_*`)
- `wrangler.jsonc` — Cloudflare Pages/Functions bindings and local/prod runtime config

### Tooling / build config

- `package.json` — scripts, dependencies, and package metadata
- `vite.config.js` — Vite configuration and aliases
- `jsconfig.json` — path alias and editor/module resolution config
- `tailwind.config.js` — Tailwind theme and content scanning config
- `eslint.config.js` — linting rules and code quality config
- `components.json` — shadcn component generator configuration

## Project Notes

- Main data is stored in `src/data/i4l_publish.json`
- Components are organized in the `src/components` directory
- Page components are in the `src/pages` directory
- See `docs/membership-operations-runbook.md` for webhook/email/card testing and support workflows.
