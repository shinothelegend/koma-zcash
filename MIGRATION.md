# KOMA feature preservation and Zcash migration

This is an additive, separate Zcash project. The Arbitrum/Monad originals are not edited, reset, deleted or replaced. A complete feature port is **not finished**. Do not interpret the initial Zecathon submission or this repository's smaller implementation as permission to drop earlier features.

## Source of truth

The latest full Monad source inspected is `/Volumes/Extreme SSD/Projects/koma-monad`, HEAD `459fd241336901f574407b2e7f88ac43e7b6be68` (14 October 2026), plus its existing uncommitted trade-widget/client changes and pending-trade/trade-guard modules/tests. Their contents were preserved separately in the local Codex workspace at `work/koma-original-checkpoint/working-changes/`, and 585 source file hashes were recorded in `source-manifest.json`. That checkpoint contains no environment credentials. Arbitrum provenance, screenshots, plans and tests remain in that source's `docs/base-arbitrum/`. `koma-monad-clean` and the Celo/Arc copies remain separate.

Read the original README, SUBMISSION, sponsor-gap notes and actual feature implementations before making completion claims. Historical Monad videos are evidence of the original build only.

## Feature matrix — keep every row in the handoff

| Original capability | Current Zcash status | Required continuation |
|---|---|---|
| KOMA comic identity and cover-led home | Rebuilt using original orange/black, Anton + Schibsted and private Dribbble references; desktop/375px reviewed, five scored corrections resolved | Retain original comic personality and documented design system |
| Interactive Hunyuan pitch editor | Not ported | Restore conversational pitching and presets; do not replace it with an unrelated chatbot |
| Kimi scripts and FLUX panels | One real run completed and published: The Night Courier: Homeward, four panels | Actual billing not retrieved; improve character-sheet anchoring and preserve provider request evidence |
| Hunyuan character sheet and covers | Not ported | Restore actual sheet/cover generation with explicit cost cap |
| User-created paid comics | Creator-only generation/upload and ZEC episode invoices | Restore reader-initiated paid generation, real payment-before-job flow and retry |
| Paid job retry with no second charge | Generated job data persists; full resumable paid pipeline incomplete | Resume exact stages, preserve successful panels, never silently charge again |
| Series launchpad | Actual creator/character/pitch/goal launch and direct shielded backing | Add complete character sheet, creator tooling and original launch presets |
| Issue ERC-721 ownership | Replaced with browser-bound paid access, disclosed | Native Zcash has no direct ERC-721 equivalent; choose an explicit asset protocol/bridge if tradable ownership is still required |
| Character NFT and ERC-6551 wallet | Not ported | A dedicated shielded receiving account can be creator-controlled, but is not an NFT-owned smart-contract wallet; do not falsely equate them |
| 1B Series Coin, vesting, bonding curve | Not ported | Requires an asset/contract execution design beyond native shielded ZEC; no invented token balances or simulated trades |
| Gasless buys/sells and signed intents | Not ported | Design around the chosen asset layer; direct ZEC backing is not token trading |
| Character trading-fee earnings and remix royalty tree | Not ported | Restore attribution/tree first, then verifiable royalty/payment settlement; no fake earnings |
| Graduation into locked Uniswap v4 pool | Not ported | EVM-dependent; requires explicit settlement layer, cannot claim native Zcash support |
| Holder proposals and canon votes | Paid-supporter choices/votes implemented as app records | Restore episode proposals, snapshot policy, full canon history and generation consuming the winning canon |
| CRE signature/weight revalidation and chain settlement | Not ported | Preserve original workflow; design real Zcash settlement/attestation route and label app tallies honestly |
| Privy embedded wallets and sponsored transactions | Not ported | Choose actual Zcash wallet integration; QR/ZIP321 currently supported |
| Privy policy-limited backer autopilot | Not ported | Require explicit spend policy and authorization; do not add unattended spending as a shortcut |
| Envio board/indexed rankings | Live SQLite catalog/backing totals, search and genre filters | Preserve full indexed board metrics with real Zcash events; Envio EVM events do not represent Zcash |
| Mera passkey encrypted Writers' Room | Not ported | Restore local encryption/PRF and ciphertext-only storage; never use server plaintext drafts |
| Keyboard/swipe/full-screen/guided comic reader | Added; actual new comic and guided next-panel navigation verified in labelled creator preview | Exercise with a real paid entitlement; full keyboard/swipe/full-screen matrix still pending |
| Canon timeline, alternate universes and reveal splash | Basic round list only | Restore settled winners, vote share, alternatives, reveal and evidence links |
| Series sharing, live OG and embed cards | Not ported | Restore actual share cards and explicit safe embed route |
| Creator earnings and 30-day chart | Not ported | Aggregate actual verified receipts, show empty state until real payments exist |
| New-wallet first-use checklist | Simple empty library | Restore state-derived onboarding with testnet wallet guidance |
| Previously-on recaps and changes since last visit | Not ported | Restore cached canon recaps and local last-visit comparison |
| Monad block pipeline / gas and finality receipts | Chain-specific original preserved | Replace with measured Zcash confirmations and verification timing, never recycled Monad speed claims |
| P256 precompile passkey verification | Monad-specific original preserved | Use WebAuthn/platform verification or an explicitly chosen Zcash-compatible design; no fictional Zcash precompile |
| HTTP 402 wallet flow | Zcash/Kage transport endpoint implemented | Exercise with real testnet transfer and verify exact amount/memo/confirmations |
| Public issue catalog and private shelf | Catalog, protected art/chapters, secure browser pass implemented | Add recovery if desired; losing cookies currently loses access |

## Handoff constraints

- Keep the old projects and all long/short videos. Work only in this separate repository/deployment.
- Frontend: Vercel. Backend: isolated Docker container on existing Grokbot VPS. **No Railway.**
- Use `/Users/jaibajrang/.claude/skills/dribbble-frontend/SKILL.md`. References/log stay private in the library; never publish its images.
- Operator and AI credentials stay server-only. Never commit private seeds or incoming viewing keys.
- User approved **USD 0.50 total** provider spend for a basic test. The reservation table is a guard, not a provider billing receipt.
- Initial submission was confirmed for `@shinothelegend`, Wildcard, at 03:01 IST on 29 October. A 75-second prototype video has since been uploaded to the designated public folder: https://drive.google.com/file/d/1uZmJdKzTUqFfU2f_R6qdngpAZyqIGccv/view . Saving a draft retracts the submitted state; use SUBMIT again after any form change.
- Do not claim full feature parity, new end-to-end payment proof, or a finished video until each has actually been verified.
