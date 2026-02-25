# AI Inclusion Checker — MVP

A full-stack Next.js application that scans any website and returns an **AI Inclusion Readiness Score** — showing whether a business is structurally prepared to be cited by AI systems like ChatGPT, Perplexity, and Gemini.

---

## User flow

```
Landing page → Domain input → Personalization (local/national + audience) → Loading (8-12s) → Result (score + gaps + queries) → Trial page (PayPal)
```

---

## Tech stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4
- **HTML Parsing:** Cheerio
- **HTTP Crawling:** Axios
- **LLM (optional):** Anthropic Claude Haiku — category/persona extraction
- **DB (MVP):** In-memory store (replace with PostgreSQL for production)
- **Payments:** PayPal button placeholder (wire real SDK in production)

---

## Getting started

```bash
npm install
npm run dev
# Open http://localhost:3000
```

---

## Environment variables

Create `.env.local`:

```env
# Optional: enables AI-powered category/persona extraction
# Without it, falls back to fast heuristic rules
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Project structure

```
app/
  page.tsx                    # Landing page
  scan/
    personalize/page.tsx      # Personalization screen
    loading/page.tsx          # Animated loading screen
    result/page.tsx           # Result screen (score + gaps + queries)
  trial/page.tsx              # Trial / checkout page
  api/
    scan/request/route.ts     # POST — start scan
    scan/status/route.ts      # GET  — poll scan status
    scan/result/route.ts      # GET  — fetch result
    trial/start/route.ts      # POST — start trial (mock)

lib/
  crawler.ts                  # Web crawler (fetches homepage + candidate pages)
  analyzer.ts                 # Structural HTML analysis (H1/H2/schema/keywords)
  categoryExtractor.ts        # Category + persona extraction (LLM or heuristic)
  intentGenerator.ts          # Generates 5 high-intent queries (template-based)
  coverageMatcher.ts          # TF-IDF + token overlap coverage matching
  scoringEngine.ts            # Readiness score formula + gap detection
  scanOrchestrator.ts         # Orchestrates full scan pipeline
  store.ts                    # In-memory scan store (replace with PostgreSQL)
  types.ts                    # Shared TypeScript types
  demoData.ts                 # Fallback content for unreachable sites (demo mode)
```

---

## Scoring formula

```
structure_score = H1(10) + question_H2s(0-25) + schema(20) + word_count(0-20) + local_signals(0-25)
intent_support_pct = (supported_queries / 5) * 100
readiness_score = round(structure_score * 0.4 + intent_support_pct * 0.6)
```

Status thresholds:
- `< 40` → Not Structurally Prepared
- `40–70` → Limited Inclusion Readiness
- `> 70` → Structurally Prepared but Expandable

---

## Production upgrades (post-MVP)

- Replace in-memory store with **PostgreSQL** (schema in spec)
- Replace demo mode crawler with **real site crawl** (works without restrictions)
- Wire **PayPal SDK** or **Stripe** for real payments
- Add **Redis** queue for concurrent scan workers
- Connect **Mixpanel/Segment** for funnel analytics
- Add **admin panel** to replay scans and view cohorts
