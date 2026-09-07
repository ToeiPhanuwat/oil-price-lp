@AGENTS.md

# ราคาน้ำมันวันนี้ (oil-price-lp)

Single-page Thai oil price landing page. Goal, scope and rationale live in
`PROJECT_SPEC.md` — read it before changing the data flow.

## How it works

1. `scripts/fetch-prices.mjs` calls the EPPO REST API, sanity-checks the payload,
   and writes `data/oil-prices.json`. It exits non-zero and leaves the old file in
   place whenever a check fails.
2. `.github/workflows/update-prices.yml` runs that five times a day (05:00,
   06:00, 17:30, 22:00 and 00:00 Asia/Bangkok), commits the JSON when it
   changed, and opens/comments on a `price-update-failed` issue when it didn't.
3. Next.js imports the JSON at build time (`src/lib/prices.ts`) and static-exports
   the page. Vercel redeploys on push.

There is no backend, database, or runtime fetch — the page is fully static.

## Conventions

- `scripts/config.mjs` is the single source of truth for the EPPO field mapping,
  the Thai brand/product names, and the sanity-check thresholds. The fetcher
  copies the display names into the JSON so the frontend never re-derives them.
- Prices are `number | absent`. A product a brand does not sell is simply missing
  from `products`; the table renders `-` for it.
- The API carries one price per brand plus its effective date — there is no
  "tomorrow" field. An evening announcement therefore overwrites today's number
  hours before it is real at the pump, so `holdUntil()` keeps a change whose
  brands all take effect in the future out of the JSON until that day arrives.
- `updated_at` is what the page shows as "อัปเดตล่าสุด". It is the moment of the
  write when prices actually moved, and otherwise today's 05:00 Asia/Bangkok
  mark, restamped by the first run at or after 05:00 so the line does not read
  as stale on the many days when nothing changes. That costs one commit and one
  redeploy a day; the bot labels those `data: refresh the price timestamp`.
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
