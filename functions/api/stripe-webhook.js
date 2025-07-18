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

    // Prepare Mailjet API credentials
    const apiKey = context.env.MAILJET_API_KEY;
    const secretKey = context.env.MAILJET_SECRET_KEY;
    const auth = btoa(`${apiKey}:${secretKey}`);

    // Use Mailjet template with variables
    const mailjetPayload = {
      Messages: [
        {
          From: {
            Email: "robcamp@idols4life.com", // Replace with your verified sender
            Name: "Rob from I4L Creative Studio"
          },
          To: [
            {
              Email: customerEmail,
              Name: customerEmail
            }
          ],
          Subject: "Welcome to the Founders Circle 🌸 Your Journey Begins Now",
          TemplateID: 7132771,
          TemplateLanguage: true
        }
      ]
    };

    try {
      const mailjetResponse = await fetch("https://api.mailjet.com/v3.1/send", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(mailjetPayload)
      });
      const mailjetText = await mailjetResponse.text();
      let mailjetResult;
      try {
        mailjetResult = JSON.parse(mailjetText);
      } catch (parseErr) {
        mailjetResult = { parseError: parseErr.message, raw: mailjetText };
      }
      if (!mailjetResponse.ok) {
        console.error("Mailjet API error:", mailjetResult);
      } else {
        console.log("Mailjet response:", mailjetResult);
      }
    } catch (err) {
      console.error("Fetch to Mailjet failed:", err);
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