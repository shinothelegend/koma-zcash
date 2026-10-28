# KOMA / Zcash

Private comics. Stories backed by their readers.

An in-progress Zecathon Wildcard adaptation of the author's earlier KOMA comic studio. The new work is a Zcash series launchpad: direct shielded ZEC backing, paid episode access, server-side incoming-viewing-key payment checks, and supporter canon votes.

Live prototype: https://koma-zcash.vercel.app

The static frontend runs on Vercel. `/api/*` and `/art/*` use a same-origin transport function in Vercel's `iad1` region to reach the isolated Node/SQLite backend on the existing VPS at https://koma-zcash.201-18-198-162.sslip.io. The transport preserves secure cookies and never caches private responses. All application state and payment logic remain on the VPS. Backend data lives in a persistent Docker volume mount, separate from the other projects. No Railway deployment is used.

Short prototype video (75 seconds): https://drive.google.com/file/d/1uZmJdKzTUqFfU2f_R6qdngpAZyqIGccv/view

The video is an annotated walkthrough of actual app captures, with a newly generated comic shown in labelled creator preview. It does not claim a completed blockchain payment. Full feature parity with the earlier Monad product remains incomplete; every feature and migration gap is retained in [MIGRATION.md](MIGRATION.md).

## Product boundary

Creators launch a character and series with a funding goal and a shielded payment address. Readers back it or buy an episode through a ZIP 321 invoice. A server that holds an incoming viewing key, never a spending key, verifies the amount and unique memo. Verified readers receive browser-bound access and can vote on published canon choices.

Funding totals, access passes, deadlines and votes are application records, not Zcash-native NFTs, tokens, smart contracts or guaranteed financial returns. Creators receive payments directly; the application cannot claw them back. The publisher and verification infrastructure remain trusted. Testnet only.

## Reuse disclosure

KOMA's name, visual identity, comic creation concept and existing demonstration comics predate this adaptation. Earlier Arbitrum/Monad/Celo projects are separate; their contracts and transaction records are not evidence of a Zcash deployment. Payment verification integrates the same author's Hanko service and its documented trust limitations.

## Run

Node 22.13 or newer. `npm ci`, then `npm start`. Copy `.env.example` values into your process environment. The server generates its encryption key and operator key in `.data/`; preserve this directory. Supply only a dedicated testnet shielded address and incoming viewing key, never a spending seed. Set `KOMA_PUBLIC_ORIGINS` to the exact frontend origin when proxying from Vercel.

`npm test` passes five checks covering ZIP 321 encoding, browser-bound access, payment replay protection, encrypted storage and supporter vote deadlines. The production Vercel URL has been checked for catalog loading, invoice creation, secure reader cookies and rejection of untrusted request origins. An unauthenticated reader receives HTTP 402 for protected chapters and non-cover panels; creator job results require operator authentication.

A real Kimi/FLUX run produced the four-panel **The Night Courier: Homeward** chapter, published on the live launchpad. The result can be reopened without another provider call. Its provider budget reservation was US$0.10; actual provider billing was not independently retrieved. Only one generation test was performed. A fresh end-to-end KOMA blockchain payment remains unverified: the isolated copy of the prior demo wallet had no spendable testnet funds. No entitlement, funding or vote was fabricated to fill that gap. Operator access is curated; this is not a production multi-tenant creator service.

The interface was rebuilt against private reference material while preserving KOMA's original comic identity. Desktop and 375px home, launchpad and creator flows were checked; phone document width matched its viewport without horizontal overflow. Guided reader navigation and persistent locked-chapter recovery were exercised. The independent UI reviewer scored five listed corrections resolved; that is not a full feature-parity or security approval.

`vercel deploy --prod` deploys `public/` as frontend output plus `api/proxy.mjs` as the transport function, using the rewrites in `vercel.json`. Direct edge-to-origin rewrites showed intermittent connection errors; the regional function was verified with series details, a 1.7 MB cover image and episode invoice creation. The backend runs with the supplied Dockerfile, persistent `/data`, and server-only provider credentials. The current CLI deployment is live; automatic GitHub deploys are not connected. Vercel request limits apply to uploads; use small comic pages.

MIT, Copyright (c) 2026 Nivesh Gajengi.
