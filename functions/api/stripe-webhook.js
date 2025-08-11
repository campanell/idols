export async function onRequest(context) {
  // Handle CORS preflight request
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
      },
    });
  }

  // Only allow POST requests
  if (context.request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  // Read the raw body for Stripe event
  let bodyText;
  try {
    bodyText = await context.request.text();
  } catch (err) {
    return new Response("Could not read body", { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(bodyText);
  } catch (err) {
    return new Response("Invalid JSON", { status: 400 });
  }

  // Listen for checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const customerEmail = session.customer_details?.email || session.customer_email;

    // SendGrid API key from environment
    const sendgridApiKey = context.env.SENDGRID_API_KEY;
    const templateId = "d-2085ef569f6c4c6c9996e2301d20bcc1"; // Welcome template

    // Build SendGrid payload (no dynamic vars for now)
    const sgPayload = {
      from: { email: "robcamp@idols4life.com", name: "Rob from I4L Creative Studio" },
      personalizations: [
        {
          to: [{ email: customerEmail }],
        },
      ],
      template_id: templateId,
    };

    try {
      const sgResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sendgridApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sgPayload),
      });

      const text = await sgResponse.text();
      if (!sgResponse.ok) {
        console.error("SendGrid API error:", sgResponse.status, text);
      } else {
        console.log("SendGrid accepted message:", sgResponse.status);
      }
    } catch (err) {
      console.error("Fetch to SendGrid failed:", err);
    }
  }

  // Respond with 200 OK to acknowledge receipt
  return new Response("Webhook received", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
} 