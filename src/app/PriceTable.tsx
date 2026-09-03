"use client";

import { useState } from "react";
import { brandStyle } from "@/lib/brand-style";
import type { PriceRow } from "@/lib/prices";

export type BrandColumn = {
  key: string;
  name: string;
  /** Thai date shown under the chip when this brand has not published the
   *  latest round of prices yet; null when it is up to date. */
  staleDate: string | null;
};

type Props = {
  rows: PriceRow[];
  brands: BrandColumn[];
  /** Pre-formatted on the server so the page never depends on the visitor's clock. */
  effective: string;
  updatedAt: string;
  updatedAtISO: string;
};

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.3l6.5-.9z" />
    </svg>
  );
}

export function PriceTable({ rows, brands, effective, updatedAt, updatedAtISO }: Props) {
  const [highlight, setHighlight] = useState(true);

  return (
    <div className="card">
      <div className="card-head">
        <div className="brandmark" aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
               strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 21V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16" />
            <path d="M3 21h11" />
            <path d="M5 10h7" />
            <path d="M17 21v-6h-2.5" />
            <path d="M13 7l4 3v7a2 2 0 0 0 4 0V10l-2.5-2.5" />
          </svg>
        </div>

        <div className="card-title">
          <h1>
            ราคาน้ำมันวันนี้ <span className="date">{`(บังคับใช้ ${effective})`}</span>
          </h1>
          <p className="status">
            <span className="dot" aria-hidden />
            อัปเดตล่าสุด: <time dateTime={updatedAtISO}>{updatedAt} น.</time>
          </p>
        </div>

        <button
          type="button"
          className="toggle"
          aria-pressed={highlight}
          onClick={() => setHighlight((on) => !on)}
        >
          <StarIcon className="icon" />
          <span>เน้นถูกที่สุด</span>
        </button>
      </div>

      <div className="table-wrap" role="region" aria-label="ตารางราคาน้ำมันแยกตามยี่ห้อ" tabIndex={0}>
        <table>
          <caption className="sr-only">
            ราคาน้ำมันขายปลีกในเขตกรุงเทพฯ และปริมณฑล หน่วยเป็นบาทต่อลิตร
          </caption>
          <thead>
            <tr>
              <th scope="col" className="fuel-col corner">
                ชนิดน้ำมัน \ ยี่ห้อ
              </th>
              {brands.map((brand) => {
                const style = brandStyle(brand.key);
                return (
                  <th scope="col" key={brand.key}>
                    <span className="brand-head">
                      <span
                        className="chip"
                        style={{ background: style.bg, color: style.fg }}
                        aria-hidden
                      >
                        {style.short}
                      </span>
                      <span className="brand-name" style={{ color: style.label }}>
                        {brand.name}
                      </span>
                      {brand.staleDate && (
                        <span className="stale" title="ยี่ห้อนี้ยังไม่ได้ประกาศราคาใหม่">
                          ณ {brand.staleDate}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.slug}>
                <th scope="row" className={row.isPremium ? "fuel-col premium" : "fuel-col"}>
                  <span className="fuel-label">
                    <span>{row.name}</span>
                    {row.isPremium && <span className="badge">พรีเมียม</span>}
                  </span>
                </th>
                {row.cells.map((cell) => {
                  if (cell.price === null) {
                    return (
                      <td key={cell.brandKey} className="empty">
                        -
                      </td>
                    );
                  }
                  const isCheapest = highlight && row.cheapestBrands.includes(cell.brandKey);
                  return (
                    <td key={cell.brandKey} className={isCheapest ? "price cheapest" : "price"}>
                      <span className="value">
                        {cell.price.toFixed(2)}
                        {isCheapest && <StarIcon className="star" />}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
