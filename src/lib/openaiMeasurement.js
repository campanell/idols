/**
 * OpenAI Ads Measurement Pixel helpers (browser).
 *
 * Pixel ID resolution order:
 * 1. `VITE_OPENAI_PIXEL_ID` (local `vite dev` / optional CI build env)
 * 2. `/api/measurement-config` → `OPENAI_PIXEL_ID` from `wrangler.jsonc`
 *
 * @see https://developers.openai.com/ads/measurement-pixel
 */

const PIXEL_SDK_URL = "https://bzrcdn.openai.com/sdk/oaiq.min.js";
const OPPREF_COOKIE = "__oppref";

let pixelInitialized = false;
let resolvedPixelId = null;
let pixelIdPromise = null;

function ensureOaiqLoader() {
  if (typeof window === "undefined") return false;
  if (window.oaiq) return true;

  window.oaiq = function oaiqStub() {
    window.oaiq.q.push(arguments);
  };
  window.oaiq.q = [];

  const script = document.createElement("script");
  script.async = true;
  script.src = PIXEL_SDK_URL;
  const firstScript = document.getElementsByTagName("script")[0];
  firstScript?.parentNode?.insertBefore(script, firstScript);
  return true;
}

export function getOpenAIPixelId() {
  if (resolvedPixelId) return resolvedPixelId;
  return import.meta.env.VITE_OPENAI_PIXEL_ID?.trim() || "";
}

export function isOpenAIMeasurementEnabled() {
  return Boolean(getOpenAIPixelId()) || pixelIdPromise !== null;
}

async function resolveOpenAIPixelId() {
  if (resolvedPixelId !== null) return resolvedPixelId;

  const vitePixelId = import.meta.env.VITE_OPENAI_PIXEL_ID?.trim();
  if (vitePixelId) {
    resolvedPixelId = vitePixelId;
    return resolvedPixelId;
  }

  try {
    const response = await fetch("/api/measurement-config");
    if (!response.ok) {
      resolvedPixelId = "";
      return resolvedPixelId;
    }

    const data = await response.json();
    resolvedPixelId =
      typeof data.pixelId === "string" ? data.pixelId.trim() : "";
  } catch {
    resolvedPixelId = "";
  }

  return resolvedPixelId;
}

export function preloadOpenAIPixelId() {
  if (!pixelIdPromise) {
    pixelIdPromise = resolveOpenAIPixelId();
  }
  return pixelIdPromise;
}

export async function initOpenAIPixel({ debug = false } = {}) {
  if (pixelInitialized) return false;

  const pixelId = await preloadOpenAIPixelId();
  if (!pixelId) return false;
  if (!ensureOaiqLoader()) return false;

  window.oaiq("init", {
    pixelId,
    debug: debug || import.meta.env.DEV,
  });
  pixelInitialized = true;
  return true;
}

async function measure(eventName, data, options) {
  const pixelId = await preloadOpenAIPixelId();
  if (!pixelId) return;

  await initOpenAIPixel();
  if (typeof window.oaiq !== "function") return;

  if (options) {
    window.oaiq("measure", eventName, data, options);
  } else {
    window.oaiq("measure", eventName, data);
  }
}

export function measurePageView({ id, name }) {
  void measure("page_viewed", {
    type: "contents",
    contents: [
      {
        id,
        name,
        content_type: "page",
      },
    ],
  });
}

export function measureCheckoutStarted({ ctaVariantId = null } = {}) {
  void measure("checkout_started", {
    type: "contents",
    contents: [
      {
        id: "founders_circle",
        name: "Founders Circle Membership",
        content_type: "product",
        quantity: 1,
      },
    ],
  });
}

export function measureOrderCreated({ sessionId, amount = null, currency = "USD" }) {
  if (!sessionId) return;

  const data = {
    type: "contents",
    currency,
    contents: [
      {
        id: "founders_circle",
        name: "Founders Circle Membership",
        content_type: "product",
        quantity: 1,
      },
    ],
  };

  if (typeof amount === "number" && amount > 0) {
    data.amount = amount;
  }

  void measure("order_created", data, { event_id: sessionId });
}

export function measureCheckoutCanceled() {
  void measure(
    "custom",
    { type: "custom" },
    {
      custom_event_name: "checkout_canceled",
      event_id: `checkout_canceled_${Date.now()}`,
    },
  );
}

export function getOppref() {
  if (typeof window === "undefined") return null;

  const fromQuery = new URLSearchParams(window.location.search).get("oppref");
  if (fromQuery) return fromQuery;

  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${OPPREF_COOKIE}=([^;]+)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}
