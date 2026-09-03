import { PriceTable, type BrandColumn } from "./PriceTable";
import {
  brandList,
  formatDate,
  formatDateShort,
  formatUpdatedAt,
  latestEffectiveDate,
  prices,
  rows,
} from "@/lib/prices";
import { OG_IMAGE, SITE_URL } from "@/lib/site";

const effective = formatDate(latestEffectiveDate);

const brandColumns: BrandColumn[] = brandList.map((brand) => ({
  key: brand.key,
  name: brand.name,
  staleDate:
    brand.effective_date !== latestEffectiveDate ? formatDate(brand.effective_date) : null,
}));

// Schema.org ItemList of Product/Offer so the prices are machine-readable.
const structuredData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: `ราคาน้ำมันขายปลีกในประเทศไทย ${effective}`,
  url: SITE_URL,
  numberOfItems: brandList.length,
  itemListElement: brandList.map((brand, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Product",
      name: `น้ำมัน ${brand.name}`,
      description:
        `ราคาน้ำมันขายปลีกของ ${brand.name} ในเขตกรุงเทพฯ และปริมณฑล ` +
        `มีผล ${formatDate(brand.effective_date)} หน่วยเป็นบาทต่อลิตร`,
      image: OG_IMAGE,
      brand: { "@type": "Brand", name: brand.name },
      offers: Object.entries(brand.products).map(([slug, product]) => ({
        "@type": "Offer",
        name: product.name,
        sku: `${brand.key}-${slug}`,
        url: SITE_URL,
        price: product.price,
        priceCurrency: "THB",
        // Valid from the moment the announcement takes effect. No
        // `priceValidUntil`: the next announcement's date is unknowable, and a
        // date already in the past would mark the offer expired.
        validFrom: product.effective_date,
        availability: "https://schema.org/InStock",
        eligibleQuantity: {
          "@type": "QuantitativeValue",
          value: 1,
          unitCode: "LTR",
        },
      })),
    },
  })),
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main>
        <PriceTable
          rows={rows}
          brands={brandColumns}
          effective={formatDateShort(latestEffectiveDate)}
          updatedAt={formatUpdatedAt(prices.updated_at)}
          updatedAtISO={prices.updated_at}
        />
        <p className="hint">← เลื่อนตารางเพื่อดูยี่ห้ออื่น →</p>

        <section className="notes">
          <h2>เกี่ยวกับราคานี้</h2>
          <ul>
            <li>ราคาทั้งหมดเป็นบาทต่อลิตร สำหรับเขตกรุงเทพฯ และปริมณฑล</li>
            <li>เครื่องหมาย &ldquo;-&rdquo; หมายถึงยี่ห้อนั้นไม่มีน้ำมันชนิดนั้นจำหน่าย</li>
            <li>
              แต่ละยี่ห้อประกาศราคาไม่พร้อมกัน ยี่ห้อที่ราคายังไม่อัปเดตจะมีวันที่กำกับไว้
            </li>
            <li>
              ราคาที่ถูกที่สุดของน้ำมันแต่ละชนิดจะไฮไลต์สีเขียว
              โดยไม่นับยี่ห้อที่ราคายังไม่อัปเดต
            </li>
            <li>
              แหล่งข้อมูล:{" "}
              <a
                href="https://www.eppo.go.th/data-energy-statistic/energy-price-th/"
                rel="nofollow noopener"
                target="_blank"
              >
                สำนักงานนโยบายและแผนพลังงาน (สนพ.)
              </a>
            </li>
          </ul>
        </section>
      </main>

      <footer>
        <p>
          ข้อมูลนี้จัดทำเพื่อการอ้างอิงเท่านั้น กรุณาตรวจสอบราคา ณ สถานีบริการอีกครั้งก่อนเติม
        </p>
      </footer>
    </>
  );
}
