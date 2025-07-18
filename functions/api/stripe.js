import Stripe from 'stripe';

export async function onRequest(context) {
  // Handle CORS preflight request
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // Only allow POST requests
  if (context.request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Initialize Stripe with secret key from environment
  const stripe = new Stripe(context.env.STRIPE_SECRET_KEY);
  const isProduction = context.env.ENVIRONMENT === 'production';
  const protocol = isProduction ? 'https' : 'http';

  // Parse request body (if you want to accept dynamic priceId, add parsing here)
  // For now, use a fixed price ID since we only have one product.  Will need to add dynamic priceId when we have multiple products.
  const priceId = 'price_1RktNKP3lqE87V9IeQkCktN0'; // Replace with your actual Price ID

  try {
    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${protocol}://${context.request.headers.get("Host")}/success`,
      cancel_url: `${protocol}://${context.request.headers.get("Host")}/cancel`,
    });

    // Return session ID and URL to frontend
    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}