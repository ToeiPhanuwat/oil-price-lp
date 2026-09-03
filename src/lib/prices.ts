import data from "../../data/oil-prices.json";

export type Product = {
  name: string;
  price: number;
  effective_date: string | null;
  effective_time: string | null;
};

export type Brand = {
  name: string;
  effective_date: string | null;
  effective_time: string | null;
  products: Record<string, Product>;
  next_day: null;
};

export type PriceData = {
  updated_at: string;
  source: string;
  source_last_updated: string | null;
  products: { slug: string; name: string }[];
  brands: Record<string, Brand>;
};

export const prices = data as PriceData;

export const brandList = Object.entries(prices.brands).map(([key, brand]) => ({
  key,
  ...brand,
}));

/** Columns that at least one brand actually sells — keeps the table from
 *  carrying all-empty columns when a product is discontinued everywhere. */
export const columns = prices.products.filter(({ slug }) =>
  brandList.some((brand) => brand.products[slug]),
);

const thaiDate = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "long",
  timeZone: "Asia/Bangkok",
});

// Short form for the header, where the long month name would crowd the title.
const thaiDateShort = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "medium",
  timeZone: "Asia/Bangkok",
});

const thaiTime = new Intl.DateTimeFormat("th-TH", {
  timeStyle: "short",
  hour12: false,
  timeZone: "Asia/Bangkok",
});

export function formatDate(iso: string | null) {
  if (!iso) return "-";
  return thaiDate.format(new Date(`${iso}T00:00:00+07:00`));
}

/** e.g. "2 ก.ย. 2569" */
export function formatDateShort(iso: string | null) {
  if (!iso) return "-";
  return thaiDateShort.format(new Date(`${iso}T00:00:00+07:00`));
}

/** e.g. "3 ก.ย. 2569 เวลา 23:58" */
export function formatUpdatedAt(iso: string) {
  const at = new Date(iso);
  return `${thaiDateShort.format(at)} เวลา ${thaiTime.format(at)}`;
}

/** The most recent effective date across all brands — what the page headline
 *  and the "อัปเดตล่าสุด" trust signal refer to. */
export const latestEffectiveDate = brandList
  .map((b) => b.effective_date)
  .filter((d): d is string => Boolean(d))
  .sort()
  .at(-1) ?? null;

export type PriceCell = { brandKey: string; price: number | null };

export type PriceRow = {
  slug: string;
  name: string;
  /** Premium grades get an amber badge in the first column. */
  isPremium: boolean;
  cells: PriceCell[];
  /** Brands holding the lowest price in this row. Empty when there is nothing
   *  to compare — a single seller, or every brand quoting the same price. */
  cheapestBrands: string[];
};

/** Brands that have published the latest round of prices. A brand that has not
 *  is excluded from the "cheapest" comparison: its number is real but months
 *  old, so crowning it the best deal of the day would mislead. */
const currentBrands = new Set(
  brandList
    .filter((brand) => brand.effective_date === latestEffectiveDate)
    .map((brand) => brand.key),
);

/** The table reads product-by-brand: one row per fuel type, one column per
 *  brand. Built from `columns` and `brandList` so it inherits their ordering
 *  and the "drop products nobody sells" filter. */
export const rows: PriceRow[] = columns.map((column) => {
  const cells = brandList.map((brand) => ({
    brandKey: brand.key,
    price: brand.products[column.slug]?.price ?? null,
  }));

  const comparable = cells.filter(
    (cell): cell is { brandKey: string; price: number } =>
      cell.price !== null && currentBrands.has(cell.brandKey),
  );
  const prices = comparable.map((cell) => cell.price);
  const lowest = new Set(prices).size > 1 ? Math.min(...prices) : null;

  return {
    ...column,
    isPremium: column.slug.includes("premium"),
    cells,
    cheapestBrands: comparable
      .filter((cell) => cell.price === lowest)
      .map((cell) => cell.brandKey),
  };
});
