// Shared helpers for today.js / random.js.
//
// In production, facts live in the FACTS_KV namespace (bound in the Cloudflare
// Pages dashboard) under keys `fact:0001`, `fact:0002`, ... plus `meta:count`.
// In local dev without a KV binding, we fall back to the static
// facts.sample.json asset shipped in this repo so the site runs with zero
// credentials.

let sampleCache = null;

async function loadSample(env) {
  if (sampleCache) return sampleCache;
  const res = await env.ASSETS.fetch(new URL("https://placeholder/facts.sample.json"));
  sampleCache = await res.json();
  return sampleCache;
}

export async function getFactCount(env) {
  if (env.FACTS_KV) {
    const count = await env.FACTS_KV.get("meta:count");
    return count ? parseInt(count, 10) : 0;
  }
  const sample = await loadSample(env);
  return sample.length;
}

export async function getFactByIndex(env, index) {
  if (env.FACTS_KV) {
    const key = `fact:${String(index + 1).padStart(4, "0")}`;
    const value = await env.FACTS_KV.get(key, "json");
    return value ?? { fact: "Fact not found.", source_url: "" };
  }
  const sample = await loadSample(env);
  return sample[index];
}
