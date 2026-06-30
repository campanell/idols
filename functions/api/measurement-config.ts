/**
 * Purpose:
 * Exposes non-secret OpenAI Ads measurement config to the browser at runtime.
 *
 * Wrangler-managed Pages projects read `OPENAI_PIXEL_ID` from `wrangler.jsonc`
 * (not Vite build env). The pixel loader fetches this endpoint when
 * `VITE_OPENAI_PIXEL_ID` is unset locally.
 */

type Env = {
  OPENAI_PIXEL_ID?: string;
};

type PagesContext = {
  env: Env;
};

export async function onRequest(context: PagesContext): Promise<Response> {
  const pixelId = context.env.OPENAI_PIXEL_ID?.trim() || "";

  return new Response(JSON.stringify({ pixelId }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300",
    },
  });
}
