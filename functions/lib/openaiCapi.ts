/**
 * OpenAI Conversions API (CAPI) helpers for Cloudflare Workers / Pages Functions.
 *
 * Sends server-side `order_created` (and generic) events to OpenAI Ads when the
 * browser pixel cannot be trusted alone (e.g. after Stripe webhook). Requires
 * `OPENAI_PIXEL_ID` and `OPENAI_CAPI_KEY` in the Worker environment.
 *
 * @see https://developers.openai.com/ads/conversions-api
 */

/** Base URL for posting conversion events; append `?pid=<pixelId>` per request. */
const OPENAI_CAPI_EVENTS_URL = "https://bzr.openai.com/v1/events";

/**
 * Default `source_url` on `order_created` when the caller does not pass
 * `sourceUrl` (e.g. Stripe success redirect URL unavailable in webhook).
 */
const DEFAULT_ORDER_SOURCE_URL = "https://idols4life.com/success";

/**
 * Canonical product line item for Founders Circle membership in CAPI payloads.
 * Must stay aligned with browser `measureCheckoutStarted` / `measureOrderCreated`
 * in `src/lib/openaiMeasurement.js` so pixel and CAPI report the same product id.
 */
const FOUNDERS_CIRCLE_PRODUCT = {
  id: "founders_circle",
  name: "Founders Circle Membership",
  content_type: "product" as const,
};

/**
 * Worker/Pages environment variables used by CAPI helpers.
 */
export type OpenAICapiEnv = {
  /** OpenAI Ads pixel id (same value as `VITE_OPENAI_PIXEL_ID` on the client). */
  OPENAI_PIXEL_ID?: string;
  /** Server-side Conversions API bearer token from OpenAI Ads dashboard. */
  OPENAI_CAPI_KEY?: string;
};

/**
 * Inputs for building a single `order_created` CAPI event from Stripe checkout.
 */
export type OrderCreatedInput = {
  /** Stripe Checkout session id (`cs_…`); used as CAPI event `id` for deduplication. */
  sessionId: string;
  /** Order total in major currency units (e.g. dollars); omitted if null or ≤ 0. */
  amountTotal: number | null;
  /** ISO currency code (e.g. `usd`); normalized to uppercase in payload. */
  currency: string | null;
  /** OpenAI attribution reference from landing URL or `__oppref` cookie, if known. */
  oppref?: string | null;
  /** Customer email; hashed to `user.email_sha256` before send (never sent plain). */
  email?: string | null;
  /** Page URL where conversion occurred; defaults to {@link DEFAULT_ORDER_SOURCE_URL}. */
  sourceUrl?: string | null;
  /** Client IP from request headers when available (improves match quality). */
  ipAddress?: string | null;
  /** Client User-Agent when available. */
  userAgent?: string | null;
  /** When true, OpenAI validates the payload without recording a conversion. */
  validateOnly?: boolean;
};

/**
 * SHA-256 hash of a string, lowercase hex digest (no `0x` prefix).
 *
 * OpenAI CAPI expects normalized PII: trim whitespace, lowercase, then hash.
 * Used for `user.email_sha256` so raw email never leaves your Worker in the
 * event body.
 *
 * @param value Raw string (typically an email address).
 * @returns 64-character lowercase hexadecimal hash.
 */
export async function sha256LowerHex(value: string): Promise<string> {
  const normalized = value.trim().toLowerCase();
  const data = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * POST one or more events to the OpenAI Conversions API.
 *
 * Skips the network call when `OPENAI_PIXEL_ID` or `OPENAI_CAPI_KEY` is missing,
 * or when `events` is empty. On HTTP failure, logs `openai-capi-error` and
 * returns the response body for debugging (do not expose raw body to clients).
 *
 * @param env Worker env with pixel id and CAPI key.
 * @param events Array of event objects per OpenAI CAPI schema (`type`, `data`, etc.).
 * @param options.validateOnly If true, sends `validate_only: true` for dry-run validation.
 * @returns `{ ok: true }` on success; `{ ok: false, skipped }` when misconfigured;
 *   `{ ok: false, status, body }` on API error.
 */
export async function sendOpenAICapiEvents(
  env: OpenAICapiEnv,
  events: Record<string, unknown>[],
  { validateOnly = false }: { validateOnly?: boolean } = {},
): Promise<{ ok: boolean; status?: number; body?: string; skipped?: string }> {
  const pixelId = env.OPENAI_PIXEL_ID?.trim();
  const capiKey = env.OPENAI_CAPI_KEY?.trim();

  if (!pixelId || !capiKey) {
    return { ok: false, skipped: "missing_openai_capi_config" };
  }

  if (events.length === 0) {
    return { ok: false, skipped: "no_events" };
  }

  const response = await fetch(
    `${OPENAI_CAPI_EVENTS_URL}?pid=${encodeURIComponent(pixelId)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${capiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        validate_only: validateOnly,
        events,
      }),
    },
  );

  const body = await response.text();
  if (!response.ok) {
    console.error("openai-capi-error", {
      status: response.status,
      body,
    });
    return { ok: false, status: response.status, body };
  }

  return { ok: true, status: response.status, body };
}

/**
 * Build and send a single `order_created` CAPI event for a completed checkout.
 *
 * Typical call site: Stripe `checkout.session.completed` webhook after payment
 * succeeds. Combines session id (dedupe id), optional revenue/currency, hashed
 * email, network hints (`ip`, `user_agent`), and `oppref` for ad attribution.
 *
 * @param env Worker env with `OPENAI_PIXEL_ID` and `OPENAI_CAPI_KEY`.
 * @param input Checkout/session fields from Stripe and the incoming request.
 * @returns Result from {@link sendOpenAICapiEvents} (single-event batch).
 */
export async function sendOrderCreatedEvent(
  env: OpenAICapiEnv,
  input: OrderCreatedInput,
): Promise<{ ok: boolean; status?: number; body?: string; skipped?: string }> {
  const user: Record<string, string> = {};

  if (input.email) {
    user.email_sha256 = await sha256LowerHex(input.email);
  }
  if (input.ipAddress) {
    user.ip_address = input.ipAddress;
  }
  if (input.userAgent) {
    user.user_agent = input.userAgent;
  }

  const data: Record<string, unknown> = {
    type: "contents",
    contents: [
      {
        id: FOUNDERS_CIRCLE_PRODUCT.id,
        name: FOUNDERS_CIRCLE_PRODUCT.name,
        content_type: FOUNDERS_CIRCLE_PRODUCT.content_type,
        quantity: 1,
      },
    ],
  };

  if (typeof input.amountTotal === "number" && input.amountTotal > 0) {
    data.amount = input.amountTotal;
  }
  if (input.currency) {
    data.currency = String(input.currency).toUpperCase();
  }

  const event: Record<string, unknown> = {
    id: input.sessionId,
    type: "order_created",
    timestamp_ms: Date.now(),
    action_source: "web",
    source_url: input.sourceUrl || DEFAULT_ORDER_SOURCE_URL,
    data,
  };

  if (input.oppref) {
    event.oppref = input.oppref;
  }
  if (Object.keys(user).length > 0) {
    event.user = user;
  }

  return sendOpenAICapiEvents(env, [event], {
    validateOnly: input.validateOnly ?? false,
  });
}
