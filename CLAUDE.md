@AGENTS.md

# ราคาน้ำมันวันนี้ (oil-price-lp)

Single-page Thai oil price landing page. Goal, scope and rationale live in
`PROJECT_SPEC.md` — read it before changing the data flow.

## How it works

1. `scripts/fetch-prices.mjs` calls the EPPO REST API, sanity-checks the payload,
   and writes `data/oil-prices.json`. It exits non-zero and leaves the old file in
   place whenever a check fails.
2. `.github/workflows/update-prices.yml` runs that daily at 10:00 UTC (17:00
   Asia/Bangkok), commits the JSON when it changed, and opens/comments on a
   `price-update-failed` issue when it didn't.
3. Next.js imports the JSON at build time (`src/lib/prices.ts`) and static-exports
   the page. Vercel redeploys on push.

There is no backend, database, or runtime fetch — the page is fully static.

## Conventions

- `scripts/config.mjs` is the single source of truth for the EPPO field mapping,
  the Thai brand/product names, and the sanity-check thresholds. The fetcher
  copies the display names into the JSON so the frontend never re-derives them.
- Prices are `number | absent`. A product a brand does not sell is simply missing
  from `products`; the table renders `-` for it.
- Never auto-deploy prices that failed a sanity check, and never merge an
  AI-suggested fix to the scraper without a human reading the raw response first.

## Commands

```
npm run dev        # local dev server
npm run build      # static export to out/
npm run fetch      # refresh data/oil-prices.json
npm run fetch:dry  # validate the API without writing
```

## Environment

Set in Vercel (all optional; the site builds without them):

- `NEXT_PUBLIC_SITE_URL` — canonical origin, used for metadata/sitemap/robots.
- `NEXT_PUBLIC_GA_ID` — GA4 measurement ID; analytics is skipped when unset.
- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` — Search Console HTML-tag token.
