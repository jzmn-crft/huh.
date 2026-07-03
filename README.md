# huh.

One fact per day. Free. That's the product.

**[live site →](https://huh.jazmeen.com/)**

## The Problem

I was paying a subscription for an iOS widget that showed me one interesting fact a day. The content was good; the price for what is functionally a flashcard was not. Knowledge this small shouldn't sit behind a paywall.

## The Bet

People don't want a knowledge *platform*. They want a tiny, delightful moment of learning with zero friction. So v1 is exactly one interaction: land on the page, read a fact, click for another. No accounts, no streaks, no push notifications begging you to come back.

## What's Here

A new fact every day, sourced and timestamped. Tap for a random one. Save the ones you like. Share them with a tap. That's the whole interaction.

## What I Cut (on purpose)

- **Accounts and progress tracking** — the value is the fact, not the metadata about your facts
- **Categories and search** — curation beats navigation at this scale
- **Daily email** — if the product is good, people return; if it isn't, an email won't save it

Each cut is reversible. None of them blocked shipping.

## Stack

Vanilla JS, web app (PWA), Cloudflare Pages + KV. Total hosting cost: $0 (Cloudflare's free tier). Facts live in KV, not in this repo — added by hand, never via commit.

```sh
npx wrangler pages dev .
```

Runs it locally against a bundled sample fact set, no KV binding required.

## What's Next (maybe)

- A browser extension — a fact in every new tab
- An archive of past facts of the day
- Nothing else unless usage says so

## Honest Notes

AI-assisted build, human-directed decisions. I use AI coding tools the way I'd delegate to a fast junior engineer: I decide what to build and why, review everything, and own the outcome. The product judgment — what to cut, when to ship — is the part that doesn't delegate.

## Contributing

Not accepting contributions — this is a personal project.

## License

MIT

---

by [jzmn-crft](https://github.com/jzmn-crft)
