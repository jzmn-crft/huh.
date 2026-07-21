import { getFactCount, getFactByIndex } from "./_facts.js";

const MAX_ATTEMPTS = 8;

export async function onRequestGet({ env, request }) {
  const count = await getFactCount(env);
  if (count === 0) {
    return jsonError("No facts available");
  }

  const url = new URL(request.url);
  const avoid = (url.searchParams.get("avoid") || "")
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);

  let fact = await getFactByIndex(env, Math.floor(Math.random() * count));
  for (let attempt = 1; avoid.includes(fact.domain) && attempt < MAX_ATTEMPTS; attempt++) {
    fact = await getFactByIndex(env, Math.floor(Math.random() * count));
  }

  const date = new Date().toISOString().slice(0, 10);

  return json({ date, ...fact });
}

function json(data) {
  return new Response(JSON.stringify(data), {
    headers: { "content-type": "application/json" },
  });
}

function jsonError(message) {
  return new Response(JSON.stringify({ error: message }), {
    status: 500,
    headers: { "content-type": "application/json" },
  });
}
