#!/usr/bin/env node
// Fetches retail oil prices from EPPO, sanity-checks them against the previous
// run, and writes data/oil-prices.json. Exits non-zero (leaving the old file
// untouched) whenever a check fails, so CI can raise an issue for a human.
//
//   node scripts/fetch-prices.mjs          normal run
//   node scripts/fetch-prices.mjs --dry    validate + print, don't write

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { API_URL, BRANDS, PRODUCTS, LIMITS } from "./config.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(ROOT, "data/oil-prices.json");
const RAW_OUT = resolve(ROOT, "data/last-raw-response.json");
const DRY = process.argv.includes("--dry");

const failures = [];
const warnings = [];

async function fetchPrices() {
  // EPPO returns 403 to non-browser user agents.
  const res = await fetch(API_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Accept: "application/json",
      Referer: "https://www.eppo.go.th/",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} from ${API_URL}`);
  return res.json();
}

function parsePrice(raw) {
  // "-" (and blanks) mean the brand does not sell that product.
  if (raw == null) return null;
  const s = String(raw).trim();
  if (s === "" || s === "-") return null;
  const n = Number(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

function normalize(payload) {
  if (payload?.status !== "success") {
    failures.push(`API status is "${payload?.status}", expected "success"`);
  }
  const data = payload?.data;
  if (!data || typeof data !== "object") {
    failures.push("Response has no `data` object — the API schema may have changed");
    return null;
  }

  const unknownBrands = Object.keys(data).filter(
    (k) => !BRANDS.some((b) => b.key === k),
  );
  if (unknownBrands.length) {
    warnings.push(`New brand keys not in scripts/config.mjs: ${unknownBrands.join(", ")}`);
  }

  const brands = {};
  for (const brand of BRANDS) {
    const raw = data[brand.key];
    if (!raw) {
      warnings.push(`Brand "${brand.key}" missing from response`);
      continue;
    }

    const products = {};
    for (const p of PRODUCTS) {
      const field = `oil_${brand.key}_${p.suffix}`;
      if (!(field in raw)) {
        warnings.push(`Field ${field} missing — API schema may have changed`);
        continue;
      }
      const price = parsePrice(raw[field]);
      if (price === null) continue; // not sold
      if (Number.isNaN(price)) {
        failures.push(`${field} is not a number: ${JSON.stringify(raw[field])}`);
        continue;
      }
      if (price < LIMITS.minPrice || price > LIMITS.maxPrice) {
        failures.push(
          `${field} = ${price} is outside the plausible range ${LIMITS.minPrice}–${LIMITS.maxPrice} THB`,
        );
        continue;
      }
      products[p.slug] = {
        name: p.name,
        price,
        effective_date: raw[`oil_${brand.key}_date`] ?? null,
        effective_time: raw[`oil_${brand.key}_time`] ?? null,
      };
    }

    if (Object.keys(products).length === 0) {
      warnings.push(`Brand "${brand.key}" has no usable prices`);
      continue;
    }

    brands[brand.key] = {
      name: brand.name,
      effective_date: raw[`oil_${brand.key}_date`] ?? null,
      effective_time: raw[`oil_${brand.key}_time`] ?? null,
      products,
      next_day: null, // reserved for the future "ราคาพรุ่งนี้" feature
    };
  }

  if (Object.keys(brands).length < LIMITS.minBrands) {
    failures.push(
      `Only ${Object.keys(brands).length} usable brands, expected at least ${LIMITS.minBrands}`,
    );
  }

  return {
    updated_at: new Date().toISOString(),
    source: API_URL,
    source_last_updated: payload.last_updated ?? null,
    // Column order for the frontend table.
    products: PRODUCTS.map(({ slug, name }) => ({ slug, name })),
    brands,
  };
}

function comparePrevious(next, prev) {
  if (!prev?.brands) return;
  for (const [brandKey, brand] of Object.entries(next.brands)) {
    for (const [slug, product] of Object.entries(brand.products)) {
      const before = prev.brands[brandKey]?.products?.[slug]?.price;
      if (typeof before !== "number") continue;
      const delta = Math.abs(product.price - before);
      if (delta > LIMITS.maxPriceDelta) {
        failures.push(
          `${brandKey}/${slug} jumped ${delta.toFixed(2)} THB (${before} → ${product.price}), ` +
            `over the ${LIMITS.maxPriceDelta} THB threshold — needs a human to confirm`,
        );
      }
    }
  }
}

async function readPrevious() {
  try {
    return JSON.parse(await readFile(OUT, "utf8"));
  } catch {
    return null; // first run
  }
}

function sameData(a, b) {
  if (!a || !b) return false;
  // `updated_at` changes every run; everything else is what we care about.
  const strip = ({ updated_at, ...rest }) => rest;
  return JSON.stringify(strip(a)) === JSON.stringify(strip(b));
}

async function main() {
  const payload = await fetchPrices();
  await mkdir(dirname(RAW_OUT), { recursive: true });
  await writeFile(RAW_OUT, JSON.stringify(payload, null, 2) + "\n");

  const next = normalize(payload);
  const prev = await readPrevious();
  if (next) comparePrevious(next, prev);

  for (const w of warnings) console.warn(`::warning::${w}`);

  if (failures.length || !next) {
    console.error(`\nSanity check FAILED (${failures.length} problem(s)) — data/oil-prices.json left unchanged:`);
    for (const f of failures) console.error(`  - ${f}`);
    console.error(`\nRaw response saved to data/last-raw-response.json for debugging.`);
    process.exit(1);
  }

  const brandCount = Object.keys(next.brands).length;
  const priceCount = Object.values(next.brands).reduce(
    (n, b) => n + Object.keys(b.products).length,
    0,
  );
  console.log(`OK: ${brandCount} brands, ${priceCount} prices, source updated ${next.source_last_updated}`);

  if (DRY) {
    console.log("--dry: not writing");
    return;
  }
  if (sameData(next, prev)) {
    console.log("No price change since last run — not writing.");
    return;
  }
  await writeFile(OUT, JSON.stringify(next, null, 2) + "\n");
  console.log(`Wrote ${OUT}`);
}

main().catch((err) => {
  console.error(`Fetch failed: ${err.message}`);
  process.exit(1);
});
