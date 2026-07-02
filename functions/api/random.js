import { getFactCount, getFactByIndex } from "./_facts.js";

export async function onRequestGet({ env }) {
  const count = await getFactCount(env);
  if (count === 0) {
    return jsonError("No facts available");
  }

  const index = Math.floor(Math.random() * count);
  const fact = await getFactByIndex(env, index);
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
