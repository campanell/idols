export async function onRequest(context) {
  return new Response(JSON.stringify({ message: "Test function working!" }), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
} 