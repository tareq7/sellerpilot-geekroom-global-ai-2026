> **Geek Room 2026 adaptation:** Below is the inherited Meta-era baseline. It does NOT prove event-specific functionality or constitute a new Geek Room submission. See [current checklist](SUBMISSION_CHECKLIST.md).

# Quality report — October 27, 2026

## Verified state

- Public repository: https://github.com/tareq7/sellerpilot-ai
- Live deployment: https://sellerpilot-ai-phi.vercel.app
- Hosting: free, open-source hackathon demonstration on Vercel Hobby; no new payment method or subscription.
- Toolchain: TypeScript, React, Vite, Hono, Zod, Vitest, esbuild. Built/tested from Fleet VM \`dev\`, not the owner's laptop.
- Core automated suite at commit \`ea753d9\`: **50/50 tests passing across nine files**. Subsequent simulator and browser UI changes built and tested at \`f00c5f4\`.
- Screenshot: genuine managed Chrome headed/Xvfb, 1920×937 viewport. Source image examples in \`docs/assets\`.

## Verified production HTTP behaviors

| URL | Result | Meaning |
|---|---|---|
| \`/\` | 200 | React application HTML |
| \`/demo/ads.csv\` | 200 | Synthetic CSV file |
| \`/demo/inventory.csv\` | 200 | Synthetic inventory |
| \`GET /api/health\` | 200 | Status, model name, demo-safe mode |
| \`POST /api/analyze\` with empty valid input | 200 | Deterministic computed response |
| \`POST /api/agent\` | 503 | **Intentional** no-billing gate |

A genuine deployment defect was found and fixed: the original \`@hono/node-server/vercel\` adapter returned HTTP 500 from Vercel Node 24 due to ESM module resolution. The corrected build emits standalone self-contained ESM serverless functions with esbuild. This was verified via Vercel runtime error logs, later deployed, then successfully retested as HTTP 200/200/503.

## Browser interaction findings

- English dashboard populated from real **synthetic** fixture CSVs; 9 campaigns and 9 signal cards.
- Arabic button changes the entire page language and HTML direction to RTL.
- Radar opens nine ranked opportunities and human-readable Arabic alert titles.
- Evidence action opens drawer with four financial/stock-source metrics for the sampled critical signal.
- Seller stages a recommendation; Action Studio count changed from zero to one, with staged status visible.
- Campaign intelligence renders 9 campaign rows.
- What-if slider accepted +15%; illustrative spend and constant-ROAS reference changed from SAR 1,980 / SAR 13,730 to SAR 2,277 / SAR 15,790. The stock risk warning remained visible.
- Free copilot returned a **deterministic** response, clearly labeled "ZERO PAID CALLS".
- Opt-in Meta mode returned a clear disabled-credit warning; no model inference was made.

## Additional data trust acceptance

- Seven data-quality tests cover stale/future reports, duplicate campaign-day grain, zero or inconsistent costs, missing inventory, and attributed-order velocity mismatches.
- Live Data Lab showed **100/100 verified synthetic inputs**, zero blockers, zero warnings, latest sample date October 26, 2026. This score describes the supplied canonical sample only, not real marketplace exports.
- GitHub screenshot: docs/assets/data-quality-en.jpg.

## Numeric / security acceptance tests

- Stock protection outranks high ROAS when days of stock cover fall below replenishment lead.
- Zero denominators return \`null\`; no fake infinite ROAS.
- Overlapping alerts do not double count flagged ad spend.
- CSV parser handles BOM, quoted fields, bad numbers, missing headers, duplicate inventory and formula injection.
- Sensitive model configuration is disabled by default and bearer-auth guarded.
- Mocked Meta tool calls test the official API endpoint, bounded tool execution, and failure behavior without an external paid call.
- Spend sensitivity tests prohibit out-of-range adjustments and never assume reducing ads increases stock cover.

## Not yet verified / requires further work

- Genuine paid-hosted Muse model response: **not exercised**, because promotional credits and billing activation were unresolved.
- Native export formats from live Amazon/Noon advertiser accounts: **not yet directly consumed**; canonical normalization is documented.
- Production merchant authentication, vendor write APIs, durable multi-user history and backend rate limiting are outside hackathon MVP.
- No final 3-minute demo video recorded and no event submission posted yet.
- Accessibility was explored via real semantic controls and browser behavior, but no full axe-core/WCAG audit is claimed.
- Live marketplace connections and hosted inference remain separate from the synthetic public demo.

**Conclusion:** The open-source public demo has been deployed and tested. The live marketplace integration and full server-side Meta inference remain separately gated.

## Contributor model upgrade and test evidence (October 27)

- `muse-spark-1.3-contributor` is configured in source, rebuilt and pushed to `main` in commit `5d1c0f3`.
- All **50 tests** passed after the follow-up synthetic-only server-boundary fix in commit `cc0e565`.
- The public `/api/agent` endpoint remains gated (HTTP 503 without server-only activation). A successful live authenticated model response has **not yet been demonstrated**, so this is still an integration readiness milestone rather than proof of hosted inference.
- Meta screenshot confirms $150 free credits and S$0.00 balance, but Meta has no hard spending cap and a credit card is on file.

## Real Meta Contributor provider verification — October 27, 2026

The authenticated Meta Model API playground returned a genuine response from \`muse-spark-1.3-contributor\` to synthetic input: SKU TV85 has 10 days of inventory cover, 30-day replenishment lead time, and 7x ROAS. It correctly identified stockout as the highest-priority risk. The authentic screenshot is \`docs/assets/meta-contributor-playground.jpg\`. This verifies real Meta **provider** inference, **not** SellerPilot's separate private \`/api/agent\` tool-calling path. The production gate remains \`ALLOW_MODEL_CALLS=false\`. The final narrated video is **174.06 seconds** with H.264 video and AAC audio, 1280×720, and a provider-verification scene.
