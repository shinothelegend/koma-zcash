# KOMA / Zcash

Private comics. Stories backed by their readers.

An in-progress Zecathon Wildcard adaptation of the author's earlier KOMA comic studio. The new work is a Zcash series launchpad: direct shielded ZEC backing, paid episode access, server-side incoming-viewing-key payment checks, and supporter canon votes.

Live prototype: https://koma-zcash.vercel.app

The static frontend runs on Vercel. `/api/*` and `/art/*` proxy to the isolated Node/SQLite backend on the existing VPS at https://koma-zcash.201-18-198-162.sslip.io. Backend data lives in a persistent Docker volume mount, separate from the other projects. No Railway deployment is used.

Demo video pending: the designated Drive folder is currently a placeholder, not a playable demo video.

## Product boundary

Creators launch a character and series with a funding goal and a shielded payment address. Readers back it or buy an episode through a ZIP 321 invoice. A server that holds an incoming viewing key, never a spending key, verifies the amount and unique memo. Verified readers receive browser-bound access and can vote on published canon choices.

Funding totals, access passes, deadlines and votes are application records, not Zcash-native NFTs, tokens, smart contracts or guaranteed financial returns. Creators receive payments directly; the application cannot claw them back. The publisher and verification infrastructure remain trusted. Testnet only.

## Reuse disclosure

KOMA's name, visual identity, comic creation concept and existing demonstration comics predate this adaptation. Earlier Arbitrum/Monad/Celo projects are separate; their contracts and transaction records are not evidence of a Zcash deployment. Payment verification integrates the same author's Hanko service and its documented trust limitations.

## Run

Node 22.13 or newer. `npm ci`, then `npm start`. Copy `.env.example` values into your process environment. The server generates its encryption key and operator key in `.data/`; preserve this directory. Supply only a dedicated testnet shielded address and incoming viewing key, never a spending seed. Set `KOMA_PUBLIC_ORIGINS` to the exact frontend origin when proxying from Vercel.

`npm test` passes five checks covering ZIP 321 encoding, browser-bound access, payment replay protection, encrypted storage and supporter vote deadlines. The production Vercel URL has been checked for catalog loading, invoice creation, secure reader cookies and rejection of untrusted request origins. A fresh end-to-end KOMA blockchain payment and AI generation have not yet been demonstrated. Operator access is curated; this is not a production multi-tenant creator service.

`vercel deploy --prod` deploys only `public/` as frontend output using the external rewrites in `vercel.json`. The backend runs with the supplied Dockerfile, persistent `/data`, and server-only provider credentials. The current CLI deployment is live; automatic GitHub deploys are not connected.

MIT, Copyright (c) 2026 Nivesh Gajengi.
