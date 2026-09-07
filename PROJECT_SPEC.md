# โปรเจกต์: ราคาน้ำมันวันนี้ (Oil Price Landing Page)

## เป้าหมาย
- Landing page หน้าเดียว แสดงราคาน้ำมันขายปลีกในไทย อัปเดตรายวัน
- ผู้พัฒนาไม่เคยทำโปรเจกต์ส่วนตัวขึ้น production จริงมาก่อน — โปรเจกต์นี้คือก้าวแรก
- นิยามความสำเร็จ: ติดอันดับ 3-4 อันดับแรกของผลค้นหา Google สำหรับคำว่า "ราคาน้ำมันวันนี้"
- งบประมาณ/ต้นทุน infra ต้องต่ำที่สุดเท่าที่จะเป็นไปได้ (เป้าหมายคือใกล้ 0 บาท/เดือน)

## Scope (MVP)
- หน้าเดียว ไม่มี backend ถาวร ไม่มี admin panel ไม่มีดาต้าเบส
- แสดงราคาน้ำมันปัจจุบันของทุกยี่ห้อหลักในไทย (PTT, Bangchak, Shell, Esso, Caltex, IRPC, PT, Susco, Pure ฯลฯ)
- **ไม่รวม** ฟีเจอร์ "ราคาพรุ่งนี้" ใน MVP นี้ (ดูเหตุผลด้านล่าง) — ออกแบบ data schema ให้รองรับการเพิ่มทีหลังได้

## Tech Stack (ตัดสินใจแล้ว)
- **Frontend**: Next.js (static export) — deploy บน Vercel
- **Scraper/data fetcher**: ให้ Claude Code เลือกภาษา/เครื่องมือที่เหมาะสมกับ stack (Node.js แนะนำ เพราะใช้ภาษาเดียวกับ frontend ทั้งโปรเจกต์)
- **ที่เก็บข้อมูลราคา**: JSON file ใน repo (ไม่ใช้ฐานข้อมูล ไม่ใช้ Google Sheet)
- **Automation**: GitHub Actions scheduled workflow

## แหล่งข้อมูล — สำคัญมาก อ่านก่อนเริ่ม

**ไม่ต้อง scrape HTML!** เจอ REST API ของ EPPO ที่ส่งข้อมูลเป็น JSON ตรงๆ:

```
GET https://www.eppo.go.th/wp-json/oil-api/v1/oil-prices
```

ตัวอย่าง response จริง (ทดสอบแล้วเมื่อ 16 ส.ค. 2569):

```json
{
  "status": "success",
  "last_updated": "12 August 2026",
  "data": {
    "ptt": {
      "oil_ptt_gl95": "45.83",
      "oil_ptt_gh95": "36.84",
      "oil_ptt_gh91": "36.47",
      "oil_ptt_e20": "31.84",
      "oil_ptt_e85": "27.78",
      "oil_ptt_ds": "37.54",
      "oil_ptt_pds": "50.05",
      "oil_ptt_dsb20": "32.54",
      "oil_ptt_dsb10": "-",
      "oil_ptt_gs95p": "47.79",
      "oil_ptt_gs99p": "49.79",
      "oil_ptt_gl95p": "-",
      "oil_ptt_date": "2026-08-12",
      "oil_ptt_time": "05:00"
    },
    "bcp": { "...same shape..." },
    "shell": { "...": "..." },
    "esso": { "...": "..." },
    "caltex": { "...": "..." },
    "irpc": { "...": "..." },
    "pt": { "...": "..." },
    "susco1": { "...": "..." },
    "pure": { "...": "..." },
    "susco2": { "...": "..." }
  }
}
```

หมายเหตุ:
- ค่า `"-"` หมายถึงยี่ห้อนั้นไม่มีผลิตภัณฑ์ชนิดนั้นขาย — ให้ frontend แสดง "-" ของแถวนั้นสำหรับยี่ห้อนั้น 
- แต่ละยี่ห้อมี `date`/`time` ของตัวเอง (เวลาที่ราคานี้มีผล) — ไม่จำเป็นต้องตรงกันทุกยี่ห้อเป๊ะ
- Endpoint นี้ไม่ใช่ API ที่มีเอกสารทางการ (พบจาก network request ของหน้าเว็บ) — ควรมี error handling ที่ดีเผื่อ endpoint เปลี่ยนแปลงหรือ EPPO ปิดการเข้าถึง โดยไม่ประกาศล่วงหน้า
- หน้าเว็บต้นทาง (สำหรับอ้างอิง/เผื่อ fallback): https://www.eppo.go.th/data-energy-statistic/energy-price-th/ราคาขายปลีกน้ำมัน/

### เรื่อง "ราคาพรุ่งนี้" (out of scope สำหรับ MVP)
API ข้างต้นให้แค่ราคาปัจจุบัน ไม่มี field ราคาที่ประกาศล่วงหน้าสำหรับวันถัดไป ฟีเจอร์นี้ต้องอาศัย source อื่น (เช่น ข่าวประกาศราคาน้ำมันจากสำนักข่าว) ซึ่งยังไม่ได้สำรวจ — ให้ตัดออกจาก MVP และออกแบบ schema เผื่อไว้เท่านั้น (ดูด้านล่าง)

## Data Schema (แนะนำ)

เก็บเป็น JSON file ใน repo เช่น `data/oil-prices.json`:

```json
{
  "updated_at": "2026-08-16T05:00:00+07:00",
  "brands": {
    "ptt": {
      "name": "PTT",
      "products": {
        "gasohol_95": { "price": 36.84, "effective_date": "2026-08-12", "effective_time": "05:00" },
        "gasohol_91": { "price": 36.47, "effective_date": "2026-08-12", "effective_time": "05:00" },
        "diesel_b7":  { "price": 37.54, "effective_date": "2026-08-12", "effective_time": "05:00" }
      },
      "next_day": null
    }
  }
}
```

`updated_at` คือค่าที่หน้าเว็บแสดงเป็น "อัปเดตล่าสุด" — ถ้าราคาเปลี่ยนจะเป็นเวลาที่เขียนไฟล์จริง
ถ้าไม่เปลี่ยน รอบแรกของวันตั้งแต่ 05:00 น. จะเขียนทับเป็น 05:00 น. ของวันนั้น เพื่อไม่ให้ป้ายดูค้าง

`next_day` เผื่อไว้สำหรับฟีเจอร์ราคาพรุ่งนี้ในอนาคต (โครงสร้างคล้าย `products` แต่มี `effective_at` เป็นวันพรุ่งนี้ตี 5)

## Automation Flow

1. **GitHub Actions scheduled workflow** รันวันละ 5 รอบตามเวลาไทย (ตั้ง cron เป็น UTC): 05:00
   และ 06:00 คือหลังราคาใหม่มีผล จึงเผยแพร่ทันที; 17:30 และ 22:00 ไว้รับประกาศตอนเย็นที่ถือวันมีผล
   เป็นพรุ่งนี้ ซึ่งจะถูกดองไว้ก่อน แล้ว 00:00 เป็นรอบที่ปล่อยออก
2. Fetch JSON จาก `https://www.eppo.go.th/wp-json/oil-api/v1/oil-prices`
3. **Sanity check ก่อนเขียนทับข้อมูล:**
   - ราคาทุกตัวต้องอยู่ในช่วง 20-60 บาท (หรือเป็น `"-"`/null ที่ยอมรับได้)
   - ต้องมีอย่างน้อย N ยี่ห้อ (กำหนดจำนวนขั้นต่ำที่คาดไว้)
   - ราคาที่เปลี่ยนจากค่าก่อนหน้าไม่เกิน threshold ที่กำหนด (เช่น 3 บาท/ลิตร) — ถ้าเกิน ให้ flag ไว้ตรวจสอบ ไม่ auto-merge
4. ถ้าผ่าน sanity check → เขียนทับ `data/oil-prices.json`, commit, push → Vercel auto-deploy
5. ถ้าไม่ผ่าน → คงค่าเดิมไว้ ส่ง notification (เช่น สร้าง GitHub issue อัตโนมัติ หรือ ส่ง LINE Notify) ให้เจ้าของโปรเจกต์ตรวจสอบ
6. **Fallback เมื่อ API ใช้งานไม่ได้/schema เปลี่ยน**: ให้ workflow ที่ล้มเหลวส่งข้อมูล raw response ไปให้ Claude ช่วยวิเคราะห์และเสนอ patch (เช่น field name เปลี่ยน) แต่ยังต้องมี **คนตรวจสอบและ approve merge เอง** ก่อน deploy เสมอ ห้าม auto-deploy ราคาที่ได้จาก AI-patched scraper โดยไม่มีคนเห็นก่อน

## SEO Requirements
- Structured data: ใช้ Schema.org (Product/Offer หรือ dataset ที่เหมาะสม) ให้ราคาที่แสดงเป็น machine-readable
- แสดง timestamp "อัปเดตล่าสุดเมื่อ..." ให้เห็นชัดบนหน้า (trust signal สำคัญ)
- Meta title/description ที่มีคำว่า "ราคาน้ำมันวันนี้" ตรงๆ
- Submit sitemap เข้า Google Search Console หลัง deploy ทันที
- Mobile-first — คนส่วนใหญ่ค้นจากมือถือ
- Page speed สูงสุด (static export ควรทำได้อยู่แล้ว)

## Analytics
- ไม่ต้องสร้างระบบเอง ใช้ Google Analytics 4 + Google Search Console (ฝัง script เดียว ไม่ต้องมี backend)

## สิ่งที่ Claude Code ควรทำเมื่อเริ่มงาน
1. ยืนยันว่า endpoint `wp-json/oil-api/v1/oil-prices` ยังใช้งานได้และ schema ตรงกับตัวอย่างข้างบน
2. Scaffold Next.js project (static export config สำหรับ Vercel)
3. เขียน fetcher script (Node.js) + sanity check logic
4. เขียน GitHub Actions workflow (cron 05:00, 06:00, 17:30, 22:00, 00:00 Asia/Bangkok)
5. ออกแบบหน้า UI: ตารางราคาต่อยี่ห้อ/ผลิตภัณฑ์ + timestamp อัปเดตล่าสุด + structured data
6. Setup deploy ไป Vercel
