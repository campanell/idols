/**
 * OpenAI Ads measurement — SPA page-view bridge.
 *
 * **Purpose:** Mount once inside React Router (`App.jsx`) so the OpenAI
 * measurement pixel initializes on first load and `page_viewed` events fire when
 * users navigate between tracked routes. Renders nothing (`null`).
 *
 * **Does it enable the pixel on all pages?**
 * - **Init (SDK load):** Yes — `initOpenAIPixel()` runs once when this component
 *   mounts, on any route, as long as a pixel ID is available from
 *   `VITE_OPENAI_PIXEL_ID` or `/api/measurement-config` (`OPENAI_PIXEL_ID` in
 *   `wrangler.jsonc`). That loads the `oaiq` script site-wide so other helpers
 *   (e.g. `measureCheckoutStarted`, `measureOrderCreated`) can fire later.
 * - **Automatic page_viewed:** No — only paths listed in `PAGE_VIEWS` send a
 *   `page_viewed` event. Routes like `/success`, `/cancel`, `/privacy-policy`,
 *   and `/terms-of-service` do not get a page view unless you add them to the map
 *   or call `measurePageView` elsewhere.
 *
 * Checkout and purchase events are **not** handled here; they are fired from
 * checkout/success UI or related hooks when the user takes those actions.
 *
 * @see src/lib/openaiMeasurement.js
 * @see public/_headers (CSP allows bzrcdn.openai.com / bzr.openai.com)
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initOpenAIPixel, measurePageView, preloadOpenAIPixelId } from "@/lib/openaiMeasurement";

/**
 * Routes that should emit OpenAI `page_viewed` on navigation.
 * Keys must match `location.pathname` exactly (no trailing slash).
 */
const PAGE_VIEWS = {
  "/": { id: "home", name: "idols4life home" },
  "/roster": { id: "roster", name: "Virtual idol roster" },
  "/faq": { id: "faq", name: "Membership FAQ" },
};

/**
 * Initializes the OpenAI pixel once per session and tracks page views on
 * selected routes when `pathname` changes (including client-side navigations).
 */
export default function OpenAIPageViews() {
  const location = useLocation();

  // Load SDK and call oaiq("init", { pixelId }) once; no-op if pixel id unset.
  useEffect(() => {
    preloadOpenAIPixelId().then(() => initOpenAIPixel());
  }, []);

  // Fire page_viewed only for paths in PAGE_VIEWS; other routes are silent.
  useEffect(() => {
    const page = PAGE_VIEWS[location.pathname];
    if (page) {
      measurePageView(page);
    }
  }, [location.pathname]);

  return null;
}
