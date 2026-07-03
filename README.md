# huh

A single-page site that shows one genuinely surprising, sourced fact at a time. No accounts, no categories, no notifications — the entire product is the curation.

- Landing on the page shows **today's fact** — the same fact for every visitor on a given calendar date, chosen deterministically (`day-of-year % fact count`).
- Click anywhere, or press space/enter, for **another** — a random fact, replacing the current one in place.

## Stack

Vanilla HTML/CSS/JS, no framework, no build step. Deploys to Cloudflare Pages with two Pages Functions (`functions/api/today.js`, `functions/api/random.js`) backed by Cloudflare KV.

## Fact data — deliberately not in this repo

This repo is public, but the real facts are not. They live in a Cloudflare KV namespace, added and edited by hand — never via a git commit. Each record:

```json
{ "fact": "One sentence, verifiable, sourced.", "source_url": "https://..." }
```

stored under key `fact:0001`, `fact:0002`, etc., plus one `meta:count` key holding the total number of facts, so "today's fact" can be computed without listing every key.

To add or edit a fact against a deployed KV namespace:

```sh
wrangler kv key put --namespace-id=<ID> "fact:0007" '{"fact":"...","source_url":"https://..."}'
wrangler kv key put --namespace-id=<ID> "meta:count" "22"
```

(or use the Cloudflare dashboard's KV UI). There is no admin panel by design.

## Local development

There's no live KV binding available locally, so the Functions fall back to the bundled `facts.sample.json` — five clearly-marked placeholder entries, safe to commit, good for nothing but checking that the site runs.

```sh
npx wrangler pages dev .
```

Then visit the local URL it prints. `/api/today` and `/api/random` will serve from `facts.sample.json` automatically whenever `env.FACTS_KV` isn't bound.

## Deploying

1. Push this repo to GitHub.
2. Connect the repo in Cloudflare Pages (framework preset: none / static).
3. Create a KV namespace and bind it to the Pages project as `FACTS_KV` (Pages project → Settings → Functions → KV namespace bindings).
4. Populate it with real facts via `wrangler kv key put` as above.

No other configuration needed.

## Add to home screen (iOS)

`manifest.json` + `apple-touch-icon` + meta tags are included so the site can be added to an iOS home screen as a chrome-free, app-like launch straight into today's fact. `/api/today` returns clean, minimal JSON (`{ date, fact, source_url }`) so a future glanceable widget (e.g. via the Scriptable app) is a small follow-up, not a rework. A native iOS app / WidgetKit extension is out of scope for this project.

## Files

- `index.html`, `styles.css`, `app.js` — the whole frontend
- `functions/api/today.js`, `functions/api/random.js`, `functions/api/_facts.js` — Pages Functions, KV-backed with local sample fallback
- `facts.sample.json` — placeholder data for local dev only, not real content
- `manifest.json`, `icons/apple-touch-icon.png` — add-to-home-screen support
