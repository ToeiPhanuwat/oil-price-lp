// Single source of truth for the EPPO field mapping.
// The fetcher writes labels into data/oil-prices.json so the frontend can render
// straight from the JSON without duplicating this table.

export const API_URL = "https://www.eppo.go.th/wp-json/oil-api/v1/oil-prices";

// EPPO returns fields as `oil_<brandKey>_<productSuffix>`.
export const BRANDS = [
  { key: "ptt", name: "พีทีที สเตชั่น" },
  { key: "bcp", name: "บางจาก" },
  { key: "shell", name: "เชลล์" },
  { key: "esso", name: "เอสโซ่" },
  { key: "caltex", name: "คาลเท็กซ์" },
  { key: "irpc", name: "ไออาร์พีซี" },
  { key: "pt", name: "พีที" },
  { key: "susco1", name: "ซัสโก้" },
  { key: "susco2", name: "ซัสโก้ ดีลเลอร์" },
  { key: "pure", name: "เพียว" },
];

// Ordered the way the table should read: gasohol first (what most people search),
// then plain benzine, then diesel.
export const PRODUCTS = [
  { suffix: "gh95", slug: "gasohol_95", name: "แก๊สโซฮอล์ 95" },
  { suffix: "gh91", slug: "gasohol_91", name: "แก๊สโซฮอล์ 91" },
  { suffix: "e20", slug: "gasohol_e20", name: "แก๊สโซฮอล์ E20" },
  { suffix: "e85", slug: "gasohol_e85", name: "แก๊สโซฮอล์ E85" },
  { suffix: "gs95p", slug: "gasohol_95_premium", name: "แก๊สโซฮอล์ 95 พรีเมียม" },
  { suffix: "gs99p", slug: "gasohol_99_premium", name: "แก๊สโซฮอล์ 99 พรีเมียม" },
  { suffix: "gl95", slug: "benzine_95", name: "เบนซิน 95" },
  { suffix: "gl95p", slug: "benzine_95_premium", name: "เบนซิน 95 พรีเมียม" },
  { suffix: "ds", slug: "diesel_b7", name: "ดีเซล B7" },
  { suffix: "dsb10", slug: "diesel_b10", name: "ดีเซล B10" },
  { suffix: "dsb20", slug: "diesel_b20", name: "ดีเซล B20" },
  { suffix: "pds", slug: "diesel_premium", name: "ดีเซลพรีเมียม" },
];

// Sanity-check thresholds. See PROJECT_SPEC.md "Automation Flow".
export const LIMITS = {
  minPrice: 20,
  maxPrice: 60,
  minBrands: 8,
  maxPriceDelta: 3, // THB/litre vs. the previous run
};
