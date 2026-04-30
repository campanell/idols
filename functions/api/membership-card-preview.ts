type Env = {
  AI_GATEWAY_URL?: string;
  AI_GATEWAY_API_KEY?: string;
  AI_MODEL?: string;
};

type PagesContext = {
  request: Request;
  env: Env;
};

type PreviewRequest = {
  member_name?: string;
  tier?: string;
  favorite_genre?: string;
  locale?: string;
};

export async function onRequest(context: PagesContext): Promise<Response> {
  if (context.request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }

  if (context.request.method !== "POST") {
    return jsonResponse({ error: "Method Not Allowed" }, 405);
  }

  const startedAt = Date.now();
  let requestBody: PreviewRequest;
  try {
    requestBody = (await context.request.json()) as PreviewRequest;
  } catch {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const memberName = (requestBody.member_name || "Member").trim();
  const tier = (requestBody.tier || "Founding Member").trim();
  const favoriteGenre = (requestBody.favorite_genre || "J-pop").trim();
  const locale = (requestBody.locale || "en-US").trim();
  const fallbackMessage = buildFallbackMessage({ memberName, tier, favoriteGenre });

  if (!context.env.AI_GATEWAY_URL || !context.env.AI_GATEWAY_API_KEY || !context.env.AI_MODEL) {
    return jsonResponse({
      mode: "fallback",
      prototype_card: {
        member_name: memberName,
        tier,
        locale,
        personalized_message: fallbackMessage,
      },
      metrics: {
        latency_ms: Date.now() - startedAt,
        model: null,
        usage: null,
        cost_estimate_note: "No AI call made because gateway env vars are missing.",
      },
    });
  }

  const prompt = [
    "Generate one short, premium-sounding membership card message.",
    "Constraints:",
    "- Maximum 22 words.",
    "- Warm, inspiring tone.",
    "- No emojis.",
    "- Include fan identity and creative journey theme.",
    `Member name: ${memberName}`,
    `Tier: ${tier}`,
    `Favorite genre: ${favoriteGenre}`,
    `Locale: ${locale}`,
  ].join("\n");

  try {
    const aiResponse = await fetch(context.env.AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${context.env.AI_GATEWAY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: context.env.AI_MODEL,
        messages: [
          { role: "system", content: "You write concise premium membership taglines." },
          { role: "user", content: prompt },
        ],
        max_tokens: 80,
        temperature: 0.8,
      }),
    });

    const aiBody = (await aiResponse.json()) as any;
    if (!aiResponse.ok) {
      return jsonResponse({
        mode: "fallback_after_error",
        prototype_card: {
          member_name: memberName,
          tier,
          locale,
          personalized_message: fallbackMessage,
        },
        metrics: {
          latency_ms: Date.now() - startedAt,
          model: context.env.AI_MODEL,
          usage: null,
          gateway_error: aiBody,
        },
      });
    }

    const text = aiBody?.choices?.[0]?.message?.content?.trim() || fallbackMessage;
    return jsonResponse({
      mode: "ai_gateway",
      prototype_card: {
        member_name: memberName,
        tier,
        locale,
        personalized_message: text,
      },
      metrics: {
        latency_ms: Date.now() - startedAt,
        model: context.env.AI_MODEL,
        usage: aiBody?.usage || null,
        cost_estimate_note:
          "Use token usage from this response plus provider pricing for per-card estimate.",
      },
    });
  } catch (error: unknown) {
    return jsonResponse({
      mode: "fallback_after_exception",
      prototype_card: {
        member_name: memberName,
        tier,
        locale,
        personalized_message: fallbackMessage,
      },
      metrics: {
        latency_ms: Date.now() - startedAt,
        model: context.env.AI_MODEL || null,
        usage: null,
        gateway_error: error instanceof Error ? error.message : String(error),
      },
    });
  }
}

function buildFallbackMessage({
  memberName,
  tier,
  favoriteGenre,
}: {
  memberName: string;
  tier: string;
  favoriteGenre: string;
}): string {
  return `${memberName}, your ${tier} access is live. Keep building your ${favoriteGenre} story with the Idols4Life community.`;
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
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
