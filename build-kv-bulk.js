#!/usr/bin/env node
// Converts a seed-facts JSON array into the bulk-upload format wrangler's
// `kv bulk put` expects: an array of { key, value } pairs.
//
// Usage: node build-kv-bulk.js <input-facts.json> <output-kv-bulk.json>

const fs = require("fs");

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error("Usage: node build-kv-bulk.js <input-facts.json> <output-kv-bulk.json>");
  process.exit(1);
}

const facts = JSON.parse(fs.readFileSync(inputPath, "utf8"));

if (!Array.isArray(facts) || facts.length === 0) {
  console.error("Input file must be a non-empty JSON array.");
  process.exit(1);
}

const entries = facts.map((f, i) => {
  const key = `fact:${String(i + 1).padStart(4, "0")}`;
  const value = JSON.stringify({
    fact: f.fact,
    source_url: f.source_url,
    domain: f.domain,
    why_weird: f.why_weird,
    lane: f.lane,
  });
  return { key, value };
});

entries.push({ key: "meta:count", value: String(facts.length) });

fs.writeFileSync(outputPath, JSON.stringify(entries, null, 2));

console.log(`Wrote ${entries.length} entries (${facts.length} facts + meta:count) to ${outputPath}`);
