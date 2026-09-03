/** Presentation-only styling for the brand column headers.
 *  Kept out of `scripts/config.mjs` on purpose — that file is the source of
 *  truth for the data pipeline, not for how the table looks. */

export type BrandStyle = {
  /** Latin abbreviation shown inside the round chip. */
  short: string;
  /** Chip background. */
  bg: string;
  /** Chip text. */
  fg: string;
  /** Thai brand name under the chip. */
  label: string;
};

const FALLBACK: BrandStyle = {
  short: "•",
  bg: "#334155",
  fg: "#e2e8f0",
  label: "#cbd5e1",
};

const BRAND_STYLE: Record<string, BrandStyle> = {
  ptt: { short: "PTT", bg: "#00529c", fg: "#ffffff", label: "#60a5fa" },
  bcp: { short: "BCP", bg: "#00a859", fg: "#ffffff", label: "#34d399" },
  shell: { short: "SHL", bg: "#dd1d21", fg: "#fde047", label: "#facc15" },
  caltex: { short: "CTX", bg: "#ed1c24", fg: "#ffffff", label: "#f87171" },
  irpc: { short: "IRPC", bg: "#0082c8", fg: "#ffffff", label: "#22d3ee" },
  pt: { short: "PT", bg: "#008542", fg: "#facc15", label: "#22c55e" },
  susco1: { short: "SUS", bg: "#f37023", fg: "#ffffff", label: "#fb923c" },
  susco2: { short: "DLR", bg: "#e05a10", fg: "#ffffff", label: "#f59e0b" },
  pure: { short: "PURE", bg: "#009639", fg: "#fde047", label: "#6ee7b7" },
};

/** Falls back to a neutral chip so a brand EPPO adds later still renders. */
export function brandStyle(key: string): BrandStyle {
  return BRAND_STYLE[key] ?? FALLBACK;
}
