> **Geek Room 2026 adaptation:** Below is the inherited Meta-era baseline. It does NOT prove event-specific functionality or constitute a new Geek Room submission. See [current checklist](SUBMISSION_CHECKLIST.md).

# SellerPilot AI — architecture and decision provenance

## Layer 1: local canonicalization

Reports from Amazon and Noon vary by export. For the hackathon, synthetic canonical CSVs are shipped and user-uploaded files are parsed **in the browser** via \`src/domain/csv.ts\`. Required schema is documented in [DATA_CONTRACT](DATA_CONTRACT.md). A report is rejected if its structure or numerical fields fail validation. The frontend does not upload its raw CSV files on import. SKU and campaign names are treated as untrusted text.

## Layer 2: deterministic truth

\`src/domain/engine.ts\` groups ad records by marketplace, SKU and campaign and computes spend, attributed revenue, clicks, orders, blended ROAS and ACoS, contribution estimates, stock cover, replenishment lead and evidence trails. All financial arithmetic is deterministic. Missing stock means **no inventory-sensitive scaling advice**. Zero spend yields null ROAS, not infinity. Waste and stock risk can overlap, but flagged spend is deduplicated.

Stock protection ranks higher than speculative growth even when an advertised campaign looks profitable: a robust business decision must account for fulfillment feasibility.

\`src/domain/simulator.ts\` supports hypothetical spend changes. Constant ROAS is explicitly an **assumption**, not a prediction. Positive spend sensitivity adds incremental paid attributed units per observed day to existing reported inventory velocity as a conservative inventory stress scenario. Negative spend changes do **not** promise stock-runway improvement because organic attribution and cannibalization are unknown.

## Layer 3: accountable decisions

Signals include SKU, campaign, marketplace, priority, severity, source metrics, formula descriptions, human-readable explanation, and proposed action. All signal states are \`PROPOSED\`. Seller selection produces a download marked \`SELLER_STAGED_NOT_APPLIED\`; it does not write to any marketplace.

## Layer 4: Meta Muse tool calls

\`src/worker.ts\` implements Meta Model API Chat Completions using \`muse-spark-1.3-contributor\`. Two registered read-only tools are available to the model:
- \`get_verified_kpis\`: obtain deterministic authoritative totals.
- \`get_ranked_opportunities\`: obtain ranked evidence-backed opportunities.

The language model can explain, prioritize, and converse in Arabic/English but cannot create financial amounts, execute arbitrary function names, or update seller accounts. User/CSV strings are untrusted. Structured tool calls are processed in a bounded three-turn loop with timeouts; tests simulate the complete exchange without spending money.

Hosted inference remains **disabled** while Meta promotional credits and account billing status are unresolved. Configuration tokens are never committed or bundled into the browser.

## Layer 5: deployment and operations

Cloudflare Workers + static assets is the intended architecture when Wrangler authentication is re-established. A tested, free Vercel Hobby fallback uses Vite static output and three esbuild-bundled standalone Hono API entrypoints; this bypasses a Vercel Node 24 ESM import failure uncovered during live QA. No private credentials are required to serve the demo. The connected GitHub repository deploys automatically without GitHub Actions runner minutes.

**Deployment scope:** The free, open-source hackathon demo runs on Vercel Hobby without seller-account writes, subscriptions, or payments.

## Future production hardening

Marketplace vendor-specific import adapters, consent/authentication, multi-tenant isolation, PII redaction, budget hard-stop, rate limiting, audit log storage, attribution consistency, shipping/fees/returns modeling, and fully scoped authorized marketplace write connectors are intentionally outside this demo's verified feature set.

## Contributor inference privacy boundary (October 27)

The backend accepts only a question, locale, and an explicit `synthetic-only` marker for the `/api/agent` endpoint. It rejects caller-supplied ads and inventory arrays and uses a trusted static synthetic dataset compiled in `src/domain/server-demo.ts`. This prevents accidentally sending real imported financial reports to the Contributor service, where Meta may use prompts/outputs for model improvement. All API keys remain server-side, the public deployment stays disabled by default, and model turns/output tokens are bounded. A model-generated narrative cannot execute marketplace writes.
