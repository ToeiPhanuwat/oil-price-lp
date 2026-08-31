import {
  brandList,
  columns,
  formatDate,
  formatUpdatedAt,
  latestEffectiveDate,
  prices,
} from "@/lib/prices";
import { SITE_URL } from "@/lib/site";

const effective = formatDate(latestEffectiveDate);

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
      brand: { "@type": "Brand", name: brand.name },
      offers: Object.entries(brand.products).map(([slug, product]) => ({
        "@type": "Offer",
        name: product.name,
        sku: `${brand.key}-${slug}`,
        price: product.price,
        priceCurrency: "THB",
        priceValidUntil: product.effective_date,
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

      <header className="header">
        <h1>ราคาน้ำมันวันนี้</h1>
        <p className="effective">ราคามีผล {effective} เวลา 05:00 น.</p>
        <p className="updated">
          อัปเดตล่าสุดเมื่อ{" "}
          <time dateTime={prices.updated_at}>
            {formatUpdatedAt(prices.updated_at)} น.
          </time>
        </p>
      </header>

      <main>
        <div className="table-wrap" role="region" aria-label="ตารางราคาน้ำมันแยกตามยี่ห้อ" tabIndex={0}>
          <table>
            <caption className="sr-only">
              ราคาน้ำมันขายปลีกในเขตกรุงเทพฯ และปริมณฑล หน่วยเป็นบาทต่อลิตร
            </caption>
            <thead>
              <tr>
                <th scope="col" className="brand-col">
                  ยี่ห้อ
                </th>
                {columns.map((column) => (
                  <th scope="col" key={column.slug}>
                    {column.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {brandList.map((brand) => (
                <tr key={brand.key}>
                  <th scope="row" className="brand-col">
                    {brand.name}
                    {brand.effective_date !== latestEffectiveDate && (
                      <span className="stale" title="ยี่ห้อนี้ยังไม่ได้ประกาศราคาใหม่">
                        ณ {formatDate(brand.effective_date)}
                      </span>
                    )}
                  </th>
                  {columns.map((column) => {
                    const product = brand.products[column.slug];
                    return (
                      <td key={column.slug} className={product ? "price" : "empty"}>
                        {product ? product.price.toFixed(2) : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="hint">← เลื่อนตารางเพื่อดูน้ำมันชนิดอื่น →</p>

        <section className="notes">
          <h2>เกี่ยวกับราคานี้</h2>
          <ul>
            <li>ราคาทั้งหมดเป็นบาทต่อลิตร สำหรับเขตกรุงเทพฯ และปริมณฑล</li>
            <li>เครื่องหมาย &ldquo;-&rdquo; หมายถึงยี่ห้อนั้นไม่มีน้ำมันชนิดนั้นจำหน่าย</li>
            <li>
              แต่ละยี่ห้อประกาศราคาไม่พร้อมกัน ยี่ห้อที่ราคายังไม่อัปเดตจะมีวันที่กำกับไว้
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
