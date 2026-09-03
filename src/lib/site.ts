// Set NEXT_PUBLIC_SITE_URL in Vercel once the real domain is attached.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://oil-price-lp.vercel.app"
).replace(/\/$/, "");

// Social-share card, generated at build time by src/app/og.png/route.tsx.
// Also used as the `image` of the Product structured data.
export const OG_IMAGE = `${SITE_URL}/og.png`;

// Google Analytics 4 measurement ID (G-XXXXXXXXXX). Analytics is skipped when unset.
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

// The `content` value of the Search Console "HTML tag" verification meta tag.
// Public by design — it ships in the page's <head> — so it lives in the repo
// rather than in an env var. Override per-environment if the property changes.
export const GOOGLE_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ??
  "SSkWnKP5Q90m4tObo371iEbt4Yt18toa31A7eavGraA";
