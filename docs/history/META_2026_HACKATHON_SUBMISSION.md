# SellerPilot AI — Updated hackathon submission

**Status:** Saved in the original Cerebral Valley entry on October 27, 2026, independently verified by reopening the persisted edit form.

**Team:** SellerPilot AI  
**Track:** Startups Track  
**Problem statement:** Build for Your World  
**Free, open-source repository:** https://github.com/tareq7/sellerpilot-ai  
**Live application:** https://sellerpilot-ai-phi.vercel.app  
**Exactly 180-second updated cinematic demo:** https://sellerpilot-ai-phi.vercel.app/demo-video.mp4  
**Existing submission:** https://cerebralvalley.ai/e/meta-ai-developer-hackathon/hackathon/3667016a-f10d-47aa-9da4-1a13902bd9cd/edit

## Project Description

What if your best-performing ad is also your biggest inventory risk? In our synthetic example, a TV protector campaign shows 7x ROAS, but stock lasts only 10 days while replenishment takes 30. Increasing advertising just because ROAS looks good could leave customers ordering products you cannot fulfill. That's why I built SellerPilot AI.

SellerPilot is a free, open-source Arabic-English marketplace operations copilot for Amazon.sa and Noon.sa sellers. It connects advertising results to inventory, calculates ROAS, ACoS, estimated contribution and days of stock cover with auditable TypeScript functions, and ranks campaign risks based on business evidence—not just revenue. Open a recommendation to see its SKU, attributed sales, remaining inventory and supplier lead time. A what-if simulator models the implications of a hypothetical +15% spend change, clearly labeling its assumptions rather than presenting a sales forecast.

The seller stays in control: inspect the evidence, stage a proposal and export an approval-marked CSV. SellerPilot never quietly changes campaigns. Data Lab imports daily Amazon Sponsored Products reports with separate cost and VAT inputs, plus guided column-by-column mapping for Noon exports. A data-trust monitor identifies stale or duplicated reports, missing stock and conflicting product costs, blocking unsafe approvals.

Built during the hackathon in React, TypeScript, Vite, Hono and Zod, with responsive Arabic RTL support, 50 passing automated tests and Lighthouse accessibility of 100/100 on mobile and desktop. The updated 180-second film uses natural ElevenLabs v4 narration and 18 cinematic scenes and a seller-decision ending—not a generic LLM-chat scene. Public examples are synthetic.

Live demo: https://sellerpilot-ai-phi.vercel.app

## Describe use of Meta products

Meta Muse Spark 1.3 Contributor (muse-spark-1.3-contributor) is the language-reasoning layer designed for SellerPilot. The Hono backend integrates with Meta Model API Chat Completions and implements two narrowly scoped read-only tools: get_verified_kpis and get_ranked_opportunities. They return deterministic, evidence-backed campaign and stock metrics so Muse can explain trade-offs naturally in Arabic or English without inventing monetary figures or changing seller accounts.

Real hosted-model inference WAS verified on October 27, 2026, in Meta's authenticated Model API playground. On synthetic data showing 10 days of stock cover, a 30-day supplier lead time and 7x ROAS, Contributor correctly identified the stockout risk. The SellerPilot server-side tool-calling loop is implemented and passes mocked-provider tests, but its entire path has NOT yet been verified end-to-end against the live model. The public /api/agent endpoint remains gated and disabled to avoid uncontrolled spending.

Contributor receives only a fixed server-owned synthetic dataset; uploaded merchant reports never go to Meta. Tool calls are read-only and bounded, with seller approval required for any proposed action. We deliberately distinguish genuine provider inference from application-side integration tests in our code and demo.

## Why Meta's models are important

Sellers don't need another chatbot that invents financial advice. ROAS, contribution, stock cover and unit economics must be calculated precisely and traced back to their source. Muse addresses the part a spreadsheet cannot: understanding a merchant's question, selecting the right evidence, reconciling apparently conflicting signals (like 7x ROAS against a looming stockout), and explaining the practical options in Arabic or English. The goal is an understandable, evidence-backed decision the seller can approve—not autonomous advertising changes. Contributor's cost efficiency helps make the synthetic prototype accessible; its content-use terms are why private seller files stay outside model inference.

## Partner technologies

We used ElevenLabs Eleven v4 (Mark – Natural Conversations) with restrained inline performance tags for the new 112-second first-person demo narration. Its 12 motion-treated scenes are built from real SellerPilot interface captures, with no LLM chat finale. GitHub hosts the free and open-source code and release assets; Vercel hosts the accessible public demo.

## Update verification

The official form persisted the new **1789-character Project Description**, **1318-character Meta tooling description**, **709-character Why Meta answer**, and partner-technology answer after a fresh navigation. The same public video and GitHub URLs remained, and the Update Project button returned to disabled (no unsaved changes). No new project entry was created.

## October 28 video revision

The original submitted URL now serves an exactly 180-second Full-HD film with significantly larger real-product screens and 18 cinematic scenes. Original narration and appropriate 11.ai attribution remain. Details: VIDEO_3MIN_PRODUCTION.md.

## October 28 final voice-only video replacement

The existing submitted video URL has been updated in place to an exactly 180.000-second Full-HD film. Two newly generated ElevenLabs Eleven v4 voice segments provide continuous narration, including an immediate spoken introduction. No music, sound effects, ambient audio or long introductory silence are included. The opening and closing title-layer bugs were corrected, and UI captures are now displayed without destructive cropping. The links and seller-controlled application functionality are unchanged. A separate clean narration is available at https://sellerpilot-ai-phi.vercel.app/demo-voiceover.mp3.
