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

const thaiDateTime = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Bangkok",
});

export function formatDate(iso: string | null) {
  if (!iso) return "-";
  return thaiDate.format(new Date(`${iso}T00:00:00+07:00`));
}

export function formatUpdatedAt(iso: string) {
  return thaiDateTime.format(new Date(iso));
}

/** The most recent effective date across all brands — what the page headline
 *  and the "อัปเดตล่าสุด" trust signal refer to. */
export const latestEffectiveDate = brandList
  .map((b) => b.effective_date)
  .filter((d): d is string => Boolean(d))
  .sort()
  .at(-1) ?? null;
