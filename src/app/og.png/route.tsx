/* Social-share card, generated at build time. It doubles as the `image` for the
 * Product structured data, which Search Console flags as required.
 * Prompt SemiBold (assets/Prompt-SemiBold.ttf) is bundled because Satori has no
 * Thai font of its own; it is SIL OFL 1.1 licensed, so redistribution is fine.
 * https://fonts.google.com/specimen/Prompt/license */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { formatDate, latestEffectiveDate, rows } from "@/lib/prices";

// A route handler rather than the `opengraph-image` convention: that one emits
// an extensionless file, which a static host serves with the wrong content
// type. This lands at out/og.png the way robots.ts lands at out/robots.txt.
// Required by `output: "export"` — the card is baked once at build time.
export const dynamic = "force-static";

export const OG_SIZE = { width: 1200, height: 630 };

const prompt = await readFile(join(process.cwd(), "assets/Prompt-SemiBold.ttf"));

/** Cheapest current price for a product, for the three headline chips. */
function lowest(slug: string) {
  const row = rows.find((r) => r.slug === slug);
  const prices = row?.cells.map((c) => c.price).filter((p): p is number => p !== null) ?? [];
  return prices.length ? Math.min(...prices).toFixed(2) : null;
}

const headline = [
  { label: "แก๊สโซฮอล์ 95", slug: "gasohol_95" },
  { label: "แก๊สโซฮอล์ E20", slug: "gasohol_e20" },
  { label: "ดีเซล B7", slug: "diesel_b7" },
]
  .map((item) => ({ ...item, price: lowest(item.slug) }))
  .filter((item) => item.price !== null);

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#020617",
          color: "#e2e8f0",
          padding: 64,
          fontFamily: "Prompt",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              width: 104,
              height: 104,
              borderRadius: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(to top right, #f59e0b, #f97316)",
              color: "#020617",
              fontSize: 60,
            }}
          >
            ฿
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 76, color: "#ffffff", lineHeight: 1.1 }}>
              ราคาน้ำมันวันนี้
            </div>
            <div style={{ fontSize: 40, color: "#fbbf24" }}>
              {`ราคามีผล ${formatDate(latestEffectiveDate)}`}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 24 }}>
          {headline.map((item) => (
            <div
              key={item.slug}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                padding: "28px 32px",
                borderRadius: 24,
                background: "#0f172a",
                border: "2px solid #1e293b",
              }}
            >
              <div style={{ fontSize: 30, color: "#94a3b8" }}>{item.label}</div>
              <div style={{ fontSize: 62, color: "#34d399" }}>{item.price}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", fontSize: 30, color: "#64748b" }}>
          เทียบราคาทุกยี่ห้อ · หน่วย: บาท/ลิตร · ข้อมูลจาก สนพ. (EPPO)
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [{ name: "Prompt", data: prompt, style: "normal", weight: 600 }],
    },
  );
}
