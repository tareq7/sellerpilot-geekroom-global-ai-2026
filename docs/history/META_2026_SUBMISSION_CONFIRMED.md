# SellerPilot AI — hackathon submission confirmation

**Status: Submitted and independently reopened for verification on October 27, 2026.**

The authenticated Cerebral Valley site displayed the toast **“Project Submitted”** and changed its event action to **“View Submission.”** Opening that action showed a saved, nonempty **“Your Submission”** form with an **“Update Project”** option and all submitted values still present. No submission-status claim is inferred merely from a draft or an unsent form.

| Submitted field | Value |
|---|---|
| Team | SellerPilot AI |
| Track | Startups Track |
| Theme | Build for Your World |
| GitHub repo | https://github.com/tareq7/sellerpilot-ai |
| Narrated video | https://sellerpilot-ai-phi.vercel.app/demo-video.mp4 |
| Video runtime | 174.06 seconds (2m54s; below 3-minute maximum) |
| Live product | https://sellerpilot-ai-phi.vercel.app |
| Demo dataset | Synthetic only |
| Meta | Muse Spark 1.3 Contributor |

**Submission evidence:** Official confirmation toast and the subsequent read-only saved submission view in the authenticated event browser. The entry also recorded the platform's checkbox granting Meta and Cerebral Valley permission to share and promote the submitted materials.

## Verified technical evidence

- React/TypeScript/Vite/Hono application with nine campaign sample and bilingual Arabic/English RTL interface.
- Deterministic ROAS, ACoS, estimated contribution and inventory metrics with seller-controlled approval and export.
- Amazon daily Sponsored Products advertised-product CSV importer and manual Noon SKU-level guided mapper, with data-quality controls.
- 50 automated Vitest cases passing across nine test files.
- Public application, video and health endpoints returned HTTP 200; production gated Meta route returned HTTP 503 intentionally.
- Genuine **Meta provider inference** was verified in the authenticated Model API playground using `muse-spark-1.3-contributor` and synthetic data. The model correctly identified stockout when stock cover was 10 days and lead time 30 days despite 7× ROAS.
- The SellerPilot **server-side** Model API tool-calling route remains gated and is **not** claimed as live end-to-end inference; its implementation has mock-provider automated test evidence.

This document is a release and judging-evidence record, not a submission portal receipt or an access token. It excludes the private participant-specific edit URL.
