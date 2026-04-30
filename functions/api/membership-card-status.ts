import type StripeConstructor from "stripe";

type Env = {
  SUPPORT_API_TOKEN?: string;
  STRIPE_SECRET_KEY?: string;
};

type PagesContext = {
  request: Request;
  env: Env;
};

let Stripe: typeof StripeConstructor | undefined;

export async function onRequest(context: PagesContext): Promise<Response> {
  if (context.request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }

  if (context.request.method !== "GET") {
    return jsonResponse({ error: "Method Not Allowed" }, 405);
  }

  if (!isAuthorizedSupportRequest(context.request, context.env.SUPPORT_API_TOKEN)) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const url = new URL(context.request.url);
  const customerId = url.searchParams.get("customer_id");
  const email = url.searchParams.get("email");

  if (!customerId && !email) {
    return jsonResponse({ error: "Provide either customer_id or email for support lookup." }, 400);
  }

  if (!context.env.STRIPE_SECRET_KEY) {
    return jsonResponse({ error: "Missing STRIPE_SECRET_KEY configuration." }, 500);
  }

  try {
    if (!Stripe) {
      const stripeModule = await import("stripe");
      Stripe = stripeModule.default;
    }

    const stripe = new Stripe(context.env.STRIPE_SECRET_KEY);
    const customer = customerId
      ? await stripe.customers.retrieve(customerId)
      : await findCustomerByEmail(stripe, email);

    if (!customer || "deleted" in customer) {
      return jsonResponse({ error: "Customer not found." }, 404);
    }

    const cardStatus = pickCardStatus(customer.metadata || {});
    return jsonResponse({
      customer_id: customer.id,
      email: customer.email || null,
      name: customer.name || null,
      card_status: cardStatus,
    });
  } catch (error: unknown) {
    return jsonResponse(
      {
        error: "Failed to fetch membership card status.",
        details: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
}

async function findCustomerByEmail(stripe: InstanceType<typeof StripeConstructor>, email: string | null) {
  if (!email) return null;
  const results = await stripe.customers.list({ email, limit: 1 });
  return results.data?.[0] || null;
}

function pickCardStatus(metadata: Record<string, string | null | undefined>) {
  return {
    membership_card_status: metadata.membership_card_status || null,
    membership_card_id: metadata.membership_card_id || null,
    membership_card_tier: metadata.membership_card_tier || null,
    membership_card_valid_through: metadata.membership_card_valid_through || null,
    membership_card_email_status: metadata.membership_card_email_status || null,
    membership_card_last_event_id: metadata.membership_card_last_event_id || null,
    membership_card_last_session_id: metadata.membership_card_last_session_id || null,
    membership_card_last_update: metadata.membership_card_last_update || null,
    membership_card_email_error: metadata.membership_card_email_error || null,
  };
}

function isAuthorizedSupportRequest(request: Request, expectedToken?: string): boolean {
  if (!expectedToken) return false;
  return request.headers.get("x-support-token") === expectedToken;
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders(),
      "Content-Type": "application/json",
    },
  });
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-support-token",
  };
}
