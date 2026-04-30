type Env = {
  DISCORD_COMMUNITY_INVITE_URL?: string;
  GENERIC_MEMBERSHIP_CARD_IMAGE_URL?: string;
  EMAIL?: { send: (payload: unknown) => Promise<{ id?: string; messageId?: string }> };
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  CLOUDFLARE_EMAIL_FROM?: string;
  STRIPE_SECRET_KEY?: string;
};

type PagesContext = {
  request: Request;
  env: Env;
};

type StripeEvent = {
  id?: string;
  type?: string;
  data?: { object?: Record<string, unknown> };
};

type MembershipCard = {
  cardId: string;
  membershipTier: string;
  issuedAt: string;
  validThrough: string;
  stripeSessionId: string;
};

export async function onRequest(context: PagesContext): Promise<Response> {
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
      },
    });
  }

  if (context.request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let bodyText: string;
  try {
    bodyText = await context.request.text();
  } catch {
    return new Response("Could not read body", { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(bodyText) as StripeEvent;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = (event.data?.object || {}) as Record<string, any>;
    const customerEmail = session.customer_details?.email || session.customer_email;
    const customerId = session.customer || null;
    const subscriptionId = session.subscription || null;
    const paymentStatus = session.payment_status || "unknown";

    if (!customerEmail) {
      return new Response("Missing customer email", { status: 400 });
    }

    const card = createMembershipCard(session);
    const discordInvite =
      context.env.DISCORD_COMMUNITY_INVITE_URL || "https://discord.gg/4CZfurHb9b";

    await upsertMembershipCardStatus(context, {
      customerId,
      subscriptionId,
      status: "card_issued",
      card,
      emailStatus: "pending",
      eventId: event.id || null,
      sessionId: session.id || null,
    });

    const emailPayload = createEmailPayload({
      toEmail: customerEmail,
      card,
      discordInvite,
      fromEmail: context.env.CLOUDFLARE_EMAIL_FROM || "service@idols4life.com",
      cardImageUrl:
        context.env.GENERIC_MEMBERSHIP_CARD_IMAGE_URL ||
        "https://public-images.campanell.workers.dev/i4lmember.jpg",
    });

    const emailResult = await sendCloudflareEmail(context, emailPayload);

    await upsertMembershipCardStatus(context, {
      customerId,
      subscriptionId,
      status: emailResult.ok ? "card_email_sent" : "card_delivery_failed",
      card,
      emailStatus: emailResult.ok ? "sent" : "failed",
      eventId: event.id || null,
      sessionId: session.id || null,
      emailProviderMessageId: emailResult.messageId || null,
      emailError: emailResult.error || null,
      paymentStatus,
    });
  }

  return new Response("Webhook received", {
    status: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}

function createMembershipCard(session: Record<string, any>): MembershipCard {
  const now = new Date();
  const validThrough = new Date(now);
  validThrough.setFullYear(validThrough.getFullYear() + 1);

  return {
    cardId: crypto.randomUUID(),
    membershipTier: "Founding Member",
    issuedAt: now.toISOString(),
    validThrough: validThrough.toISOString().slice(0, 10),
    stripeSessionId: String(session.id || ""),
  };
}

function createEmailPayload({
  toEmail,
  card,
  discordInvite,
  fromEmail,
  cardImageUrl,
}: {
  toEmail: string;
  card: MembershipCard;
  discordInvite: string;
  fromEmail: string;
  cardImageUrl: string;
}) {
  const subject = "Idols4Life membership confirmed";
  const text = [
    "Welcome to Founders Circle.",
    "Your membership is now active.",
    "",
    "What happens next:",
    "1) Keep this email for your membership record.",
    "2) Use the membership card image link below if you need to download it.",
    "3) Join the community using the invite link below.",
    "",
    `Membership card ID: ${card.cardId}`,
    `Tier: ${card.membershipTier}`,
    `Valid through: ${card.validThrough}`,
    "",
    `Membership card image: ${cardImageUrl}`,
    "",
    `Join the community: ${discordInvite}`,
    "",
    `Need help? Reply to this email or contact ${fromEmail}.`,
    "",
    "Thank you for supporting Idols4Life.",
  ].join("\n");

  const html = [
    "<p><strong>Welcome to Founders Circle.</strong></p>",
    "<p>Your membership is now active.</p>",
    "<p><strong>What happens next</strong></p>",
    "<ol><li>Keep this email for your membership record.</li><li>Use the membership card image link below if you need to download it.</li><li>Join the community using the invite link below.</li></ol>",
    "<p><strong>Digital Membership Card</strong></p>",
    `<p><img src="${cardImageUrl}" alt="Idols4Life Membership Card" style="max-width:100%;height:auto;border-radius:12px;border:1px solid #e5e7eb;" /></p>`,
    `<ul><li>Card ID: ${card.cardId}</li><li>Tier: ${card.membershipTier}</li><li>Valid through: ${card.validThrough}</li></ul>`,
    `<p>Card image link: <a href="${cardImageUrl}">${cardImageUrl}</a></p>`,
    `<p>Join the community: <a href="${discordInvite}">${discordInvite}</a></p>`,
    `<p>Need help? Reply to this email or contact <a href="mailto:${fromEmail}">${fromEmail}</a>.</p>`,
    "<p>Thank you for supporting Idols4Life.</p>",
  ].join("");

  return {
    from: fromEmail,
    fromName: "Idols4Life Service Team",
    to: toEmail,
    subject,
    text,
    html,
  };
}

async function sendCloudflareEmail(
  context: PagesContext,
  payload: Record<string, unknown>,
): Promise<{ ok: boolean; messageId?: string | null; error?: string }> {
  try {
    if (context.env.EMAIL && typeof context.env.EMAIL.send === "function") {
      const result = await context.env.EMAIL.send(payload);
      return { ok: true, messageId: result?.id || result?.messageId || null };
    }

    if (
      context.env.CLOUDFLARE_ACCOUNT_ID &&
      context.env.CLOUDFLARE_API_TOKEN &&
      context.env.CLOUDFLARE_EMAIL_FROM
    ) {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${context.env.CLOUDFLARE_ACCOUNT_ID}/email/sending/send`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${context.env.CLOUDFLARE_API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: payload.to,
            from: String(payload.from || context.env.CLOUDFLARE_EMAIL_FROM),
            subject: payload.subject,
            text: payload.text,
            html: payload.html,
          }),
        },
      );

      const body = await response.text();
      if (!response.ok) {
        return { ok: false, error: `REST send failed (${response.status}): ${body}` };
      }
      return { ok: true, messageId: null };
    }

    return {
      ok: false,
      error: "Cloudflare Email is not configured (missing EMAIL binding or REST credentials).",
    };
  } catch (error: unknown) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function upsertMembershipCardStatus(
  context: PagesContext,
  payload: {
    customerId?: string | null;
    subscriptionId?: string | null;
    status: string;
    card: MembershipCard;
    emailStatus: string;
    eventId?: string | null;
    sessionId?: string | null;
    emailProviderMessageId?: string | null;
    emailError?: string | null;
    paymentStatus?: string | null;
  },
): Promise<void> {
  const { customerId, subscriptionId } = payload;

  console.log("membership-card-event", {
    status: payload.status,
    customerId,
    subscriptionId,
    eventId: payload.eventId,
    sessionId: payload.sessionId,
    cardId: payload.card.cardId,
    emailStatus: payload.emailStatus,
    emailProviderMessageId: payload.emailProviderMessageId || null,
    emailError: payload.emailError || null,
    timestamp: new Date().toISOString(),
  });

  if (!context.env.STRIPE_SECRET_KEY || (!customerId && !subscriptionId)) return;

  try {
    const stripeModule = await import("stripe");
    const Stripe = stripeModule.default;
    const stripe = new Stripe(context.env.STRIPE_SECRET_KEY);

    const metadata = {
      membership_card_status: payload.status,
      membership_card_id: payload.card.cardId,
      membership_card_tier: payload.card.membershipTier,
      membership_card_valid_through: payload.card.validThrough,
      membership_card_email_status: payload.emailStatus,
      membership_card_last_event_id: payload.eventId || "",
      membership_card_last_session_id: payload.sessionId || "",
      membership_card_last_update: new Date().toISOString(),
      membership_card_email_error: truncateMetadataValue(payload.emailError || ""),
    };

    if (customerId) await stripe.customers.update(customerId, { metadata });
    if (subscriptionId) await stripe.subscriptions.update(subscriptionId, { metadata });
  } catch (error: unknown) {
    console.error("Failed to persist membership card metadata to Stripe", {
      customerId,
      subscriptionId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

function truncateMetadataValue(value: string): string {
  if (!value) return "";
  return value.length <= 500 ? value : `${value.slice(0, 497)}...`;
}
