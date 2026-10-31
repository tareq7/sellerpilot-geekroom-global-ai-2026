> **Geek Room 2026 adaptation:** Below is the inherited Meta-era baseline. It does NOT prove event-specific functionality or constitute a new Geek Room submission. See [current checklist](SUBMISSION_CHECKLIST.md).

# Security model and explicit spending gate

The public SellerPilot demo works without paid APIs, merchant login or marketplace writes. Canonicalized Amazon/Noon CSVs are analyzed locally in the user's browser. The app is not permitted to send imported private reports to the Meta **Contributor** model, because Meta may use prompts and outputs to improve its models.

## Contributor setup: October 27, 2026

- Model: `muse-spark-1.3-contributor`, using the officially documented Meta Model API.
- The owner verified **$150 in active free credits**, zero current balance, and an existing Visa payment method through an account screenshot. Credits do not provide a hard billing cap. Model use may become chargeable after credits expire or are exhausted.
- The Meta account now has a dedicated **SellerPilot Contributor Live Verification** API key, and Vercel stores its value **encrypted** as `MODEL_API_KEY` for **production only**.
- Vercel also stores a newly generated 256-bit random `AI_ACCESS_TOKEN` **encrypted** for production only.
- `ALLOW_MODEL_CALLS=false` is explicitly set on Vercel production. No model inference is enabled publicly or privately until an authenticated, controlled verification can be performed. A direct live testing attempt from Fleet was blocked by execution-safety checks, so **do not assert that a real Contributor response has been observed**.
- All secrets are confined to Meta and Vercel, not GitHub, frontend bundles, build logs, or user-visible artifacts. Do not reproduce their values in commits, screenshots or tickets.

## Server-side privacy and abuse control

- `POST /api/agent` accepts only a brief question, language and a literal `synthetic-only` marker. It rejects caller-supplied ads and inventory. The backend loads the known public synthetic demonstration fixture `src/domain/server-demo.ts`.
- The Contributor model cannot see real uploaded seller CSVs. The app cannot change bids, budgets or inventory.
- To authorize a model call, the server would require `ALLOW_MODEL_CALLS=true`, a server-side `MODEL_API_KEY`, and a valid `AI_ACCESS_TOKEN` bearer header.
- Model outputs are limited to 400 tokens per turn with a maximum two-turn loop; per-turn timeout is 25 seconds. These are cost limits, **not a guaranteed financial hard stop**.
- The public deployed gate returns HTTP 503 unless the operator explicitly enables it. Leave it off while no durable cost cap or reliable monitoring exists.
- All numeric metrics come from deterministic, unit-tested analysis tools; the model may explain but must not invent amounts.
- Serverless deployment uses self-contained Vercel functions compiled from the same shared Hono Worker code.

## Before activating the Contributor model

1. Confirm credit status, expiry and billing usage in the official Meta account.
2. Test precisely one low-token request on synthetic data using authorized credential handling, without exposing the key or access token.
3. Verify the model ID, tools, response, and any usage increment; document genuine inference separately from mocks.
4. Deploy only for authorized personnel under a private bearer token. Add a **durable** provider-side or application-side spending stop before opening any public model-powered endpoint.
5. Do not replace the card, change subscriptions or enable billing beyond the owner's authorization.

**Last verified:** code and test suites pass, encrypted production secrets exist, and the paid-call gate remains explicitly OFF. Genuine live Meta inference has not yet been demonstrated.
