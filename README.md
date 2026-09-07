# ราคาน้ำมันวันนี้

Landing page หน้าเดียว แสดงราคาน้ำมันขายปลีกในประเทศไทยทุกยี่ห้อ อัปเดตอัตโนมัติวันละ 5 รอบ

- **ข้อมูล**: REST API ของสำนักงานนโยบายและแผนพลังงาน (สนพ./EPPO)
- **Frontend**: Next.js static export → Vercel
- **อัปเดต**: GitHub Actions cron 05:00, 06:00, 17:30, 22:00 และ 00:00 น. ไทย commit JSON กลับเข้า repo
- **ป้าย อัปเดตล่าสุด**: ขยับทุกครั้งที่ราคาเปลี่ยน ส่วนวันที่ราคานิ่งจะขยับเป็น 05:00 น. ของวันนั้น

## เริ่มพัฒนา

```bash
npm install
npm run fetch     # ดึงราคาล่าสุดลง data/oil-prices.json
npm run dev       # http://localhost:3000
```

## โครงสร้าง

| ไฟล์ | หน้าที่ |
| --- | --- |
| `scripts/config.mjs` | mapping ชื่อยี่ห้อ/ชนิดน้ำมัน + เกณฑ์ sanity check |
| `scripts/fetch-prices.mjs` | ดึงข้อมูล ตรวจสอบ แล้วเขียน `data/oil-prices.json` |
| `data/oil-prices.json` | ราคาปัจจุบัน (แหล่งข้อมูลเดียวของหน้าเว็บ) |
| `src/lib/prices.ts` | อ่าน JSON ตอน build + จัดรูปแบบวันที่ไทย |
| `src/app/page.tsx` | ตารางราคา + Schema.org structured data |
| `.github/workflows/update-prices.yml` | cron อัปเดตวันละ 5 รอบ + เปิด issue เมื่อล้มเหลว |

## Environment variables (ตั้งใน Vercel)

| ตัวแปร | ตัวอย่าง | ใช้ทำอะไร |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://example.com` | canonical URL, sitemap, robots |
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` | Google Analytics 4 (ไม่ตั้ง = ไม่ฝัง script) |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | `abc123...` | โค้ดยืนยัน Search Console (HTML tag) |

รายละเอียดเป้าหมายและขอบเขตโปรเจกต์อยู่ใน [`PROJECT_SPEC.md`](./PROJECT_SPEC.md)
