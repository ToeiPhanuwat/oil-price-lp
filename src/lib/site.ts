// Set NEXT_PUBLIC_SITE_URL in Vercel once the real domain is attached.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://oil-price-lp.vercel.app"
).replace(/\/$/, "");

// Google Analytics 4 measurement ID (G-XXXXXXXXXX). Analytics is skipped when unset.
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";
