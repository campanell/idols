import type StripeConstructor from "stripe";

type Env = {
  STRIPE_SECRET_KEY?: string;
  STRIPE_PRICE_ID?: string;
  ENVIRONMENT?: string;
  APP_BASE_URL?: string;
};

let Stripe: typeof StripeConstructor | undefined;

type PagesContext = {
  request: Request;
  env: Env;
};

type CheckoutRequestBody = {
  cta_variant_id?: string | null;
};

export async function onRequest(context: PagesContext): Promise<Response> {
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (context.request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    if (!Stripe) {
      const stripeModule = await import("stripe");
      Stripe = stripeModule.default;
    }

    if (!context.env.STRIPE_SECRET_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing STRIPE_SECRET_KEY configuration." }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    const stripe = new Stripe(context.env.STRIPE_SECRET_KEY);
    const isProduction = context.env.ENVIRONMENT === "production";
    const protocol = isProduction ? "https" : "http";
    const host = context.request.headers.get("Host");
    const baseUrl = context.env.APP_BASE_URL || (host ? `${protocol}://${host}` : null);
    const priceId = context.env.STRIPE_PRICE_ID;

    if (!priceId) {
      return new Response(
        JSON.stringify({ error: "Missing STRIPE_PRICE_ID configuration." }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    if (!baseUrl) {
      return new Response(
        JSON.stringify({ error: "Missing APP_BASE_URL or Host header." }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    let requestBody: CheckoutRequestBody = {};
    try {
      requestBody = (await context.request.json()) as CheckoutRequestBody;
    } catch {
      requestBody = {};
    }

    const ctaVariantId =
      typeof requestBody.cta_variant_id === "string"
        ? requestBody.cta_variant_id.trim().slice(0, 120)
        : null;

    if (!ctaVariantId) {
      console.warn("checkout-metadata-warning", {
        warning: "Missing cta_variant_id in /api/stripe request body.",
        path: "/api/stripe",
        timestamp: new Date().toISOString(),
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/cancel`,
      metadata: ctaVariantId ? { cta_variant_id: ctaVariantId } : undefined,
    });

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error: unknown) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
}
