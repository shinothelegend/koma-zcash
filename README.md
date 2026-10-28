# KOMA / Zcash

Private comics. Stories backed by their readers.

An in-progress Zecathon Wildcard adaptation of the author's earlier KOMA comic studio. The new work is a Zcash series launchpad: direct shielded ZEC backing, paid episode access, server-side incoming-viewing-key payment checks, and supporter canon votes.

This repository is under active development. A working-demo or video claim will be added only after verification. The designated Drive folder is an asset destination, not a playable demo video.

## Product boundary

Creators launch a character and series with a funding goal and a shielded payment address. Readers back it or buy an episode through a ZIP 321 invoice. A server that holds an incoming viewing key, never a spending key, verifies the amount and unique memo. Verified readers receive browser-bound access and can vote on published canon choices.

Funding totals, access passes, deadlines and votes are application records, not Zcash-native NFTs, tokens, smart contracts or guaranteed financial returns. Creators receive payments directly; the application cannot claw them back. The publisher and verification infrastructure remain trusted. Testnet only.

## Reuse disclosure

KOMA's name, visual identity, comic creation concept and existing demonstration comics predate this adaptation. Earlier Arbitrum/Monad/Celo projects are separate; their contracts and transaction records are not evidence of a Zcash deployment. Payment verification integrates the same author's Hanko service and its documented trust limitations.

## Run

Node 22.13 or newer. `npm install`, then `npm start`. Configuration and verified evidence will be documented as implementation lands.

MIT, Copyright (c) 2026 Nivesh Gajengi.
