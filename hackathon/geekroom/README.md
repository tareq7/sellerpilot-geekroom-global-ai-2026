# Geek Room Global AI — Benchmarking prototype (new November 2026 work)

**Primary statement:** Maxim Bifrost Track A, #02 Agent Benchmarking Platform.  
**Secondary integration:** Tavily Search for grounded source retrieval.  
**Status:** Contract implementation and offline CI are implemented. Actual sponsor-backed provider calls, actual Maxim Bifrost process identity/observability, deployed app and submission are **NOT YET VERIFIED**.

This directory is **event-specific work**, separate from inherited October Meta SellerPilot code. The [original Meta project](https://github.com/tareq7/sellerpilot-ai) predates the event. The historical app, screenshots and video are not this Geek Room delivery.

## Small benchmarking core

- **Extractive Tavily baseline:** retrieves Tavily results and exposes the highest-scoring available citation, without calling an LLM. This is a deterministic baseline, **not** an LLM agent.
- **Bifrost-routed agent:** receives **the same Tavily source snapshot**, asks a model through the configured Maxim Bifrost local OpenAI-compatible gateway, and returns grounded text and token counts.
- Each result includes query, scenario, success only if a separately supplied expected fact is available, model calls, tool calls, source URLs, latency for the overall run and any known token counts.
- Estimated dollar cost is **null**, not fabricated as $0 when provider pricing is unavailable. The shared Tavily network call is counted once in overall network calls.
- Injected **model outage**, **broken tool** and **misleading untrusted source** tests are explicitly simulated. They do not prove a real provider incident or actual agent security.

## Test without using credits

Install Node.js 22+ from the root of this repository, then:

    npm ci
    npm run test:geekroom
    npm test
    npm run build

The tests inject local fake HTTP responses. They send **zero** Tavily or Bifrost network requests. Mock results must never be presented as live sponsor integration. A GitHub Actions CI workflow exercises all these steps with no provider secrets.

## Run one genuine live prototype comparison (only after free-usage gates)

First run a **real Maxim Bifrost gateway** using the official [Maxim Bifrost gateway docs](https://docs.getbifrost.ai/overview), configure an already authorized free/no-overage upstream provider, and verify the executable/container version and gateway logs independently. A localhost OpenAI-compatible response alone cannot establish that Maxim's gateway produced it.

The expected local chat-completions endpoint is exactly:

    http://127.0.0.1:8080/v1/chat/completions

A different local port must be explicitly specified with BIFROST_CHAT_URL. Public, arbitrary or remote HTTP gateway targets are intentionally blocked.

After checking the account-side Tavily balance, upstream model entitlements, zero-overage/no-card guarantees and provider caps, set **server-only environment variables**. Do not paste secrets in a public README, issue, screenshot or assistant response:

    TAVILY_API_KEY=...
    BIFROST_MODEL=provider/model-id-configured-on-your-gateway
    BIFROST_CHAT_URL=http://127.0.0.1:8080/v1/chat/completions
    BIFROST_VIRTUAL_KEY=...     # only if your gateway requires one
    GEEKROOM_LIVE_FREE_ONLY=YES
    GEEKROOM_NO_OVERAGE_CONFIRMED=YES

Then execute **one** read-only test using strictly public research content, with an immutable output filename:

    node hackathon/geekroom/run.mjs --live --query "How does Bifrost route AI requests?" --out /tmp/geekroom-live-unique.json

The CLI will not run unless explicitly enabled and credentials/model are configured. It refuses to overwrite the evidence file. The output records both adapter outcomes; it does not log API keys. Save the original result and Bifrost gateway version, request tracing and Tavily usage evidence to private Google Drive, independently verify readback, and include only redacted/permission-safe evidence in the public judge materials.

**Current limitation:** setting the two YES flags is only an operator declaration, **not an actual provider billing hard stop**. Confirm upstream limits and credit exhaustion behavior independently. This project has not actually executed Bifrost or Tavily API calls through this adapter yet. Neither the presence of the code nor passing mock CI qualifies as live sponsor use.

## Next judge gates

1. Real Tavily search through this adapter, matching authenticated Tavily dashboard usage/request ID.
2. Real Maxim Bifrost process initialized, provider routing configured, request visible in Bifrost observability/logging, with a fully free/no-overage upstream model.
3. Record inspectable live run results for baseline and Bifrost agents, with repeated trials and source-provenance checks.
4. Test failure handling on real response shapes; distinguish simulated outages from observed API failures.
5. Integrate a presentation/dashboard or report showing outcomes, screenshots, challenge rationale, reused-source disclosure and deployment instructions.
6. Submit public GitHub URL and PPT through existing HackCulture team by November 15; preserve actual submission receipt. Do **not** claim a final has been sent before portal confirmation.
