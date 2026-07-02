import { getFactCount, getFactByIndex } from "./_facts.js";

export async function onRequestGet({ env }) {
  const count = await getFactCount(env);
  if (count === 0) {
    return jsonError("No facts available");
  }

  const date = todayISO();
  const dayOfYear = getDayOfYear(date);
  const index = dayOfYear % count;

  const fact = await getFactByIndex(env, index);
  return json({ date, ...fact });
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function getDayOfYear(iso) {
  const d = new Date(iso + "T00:00:00Z");
  const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 0));
  const diff = d - start;
  return Math.floor(diff / 86400000);
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
