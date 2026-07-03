# huh.

one fact per visit. free. that's the product.

**[live demo →](https://your-url-here.pages.dev)**

## the problem

i was paying a subscription for an iOS widget that showed me one interesting fact a day. the content was good; the price for what is functionally a flashcard was not. knowledge this small shouldn't sit behind a paywall.

## the bet

people don't want a knowledge *platform*. they want a tiny, delightful moment of learning with zero friction. so v1 is exactly one interaction: land on the page, read a fact, click for another. no accounts, no streaks, no push notifications begging you to come back.

## what i cut (on purpose)

- **accounts and progress tracking** — the value is the fact, not the metadata about your facts
- **categories and search** — curation beats navigation at this scale
- **daily email** — if the product is good, people return; if it isn't, an email won't save it

each cut is reversible. none of them blocked shipping.

## stack

vanilla JS, static site, cloudflare pages + KV. no framework, no build step. total hosting cost: $0 (Cloudflare's free tier). facts live in KV, not in this repo — added by hand, never via commit.

```sh
npx wrangler pages dev .
```

runs it locally against a bundled sample fact set, no KV binding required.

## what's next (maybe)

- a "source" link on every fact — trust matters even for trivia
- shareable fact cards
- nothing else unless usage says so

## honest notes

AI-assisted build, human-directed decisions. i use AI coding tools the way i'd delegate to a fast junior engineer: i decide what to build and why, review everything, and own the outcome. the product judgment — what to cut, when to ship — is the part that doesn't delegate.

---

by [jzmn-crft](https://github.com/jzmn-crft)
