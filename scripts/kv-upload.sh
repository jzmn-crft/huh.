#!/usr/bin/env bash
# Uploads kv-bulk.json to the FACTS_KV namespace. Run `wrangler auth activate
# jmeen` once in this directory first — that binds the jmeen account profile
# here so this never touches the default wrangler login used by other
# projects.
set -euo pipefail

npx wrangler kv bulk put kv-bulk.json \
  --namespace-id=70c27bdc9e4f40f886fdde4545902e45 \
  --remote
