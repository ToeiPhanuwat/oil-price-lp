import type { Metadata } from "next";
import Script from "next/script";
import { Noto_Sans_Thai } from "next/font/google";
import { GA_ID, GOOGLE_SITE_VERIFICATION, SITE_URL } from "@/lib/site";
import { formatDate, latestEffectiveDate } from "@/lib/prices";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  display: "swap",
  variable: "--font-thai",
});

const effective = formatDate(latestEffectiveDate);

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `ราคาน้ำมันวันนี้ ${effective} — เช็คราคาทุกปั๊ม ปตท. บางจาก เชลล์`,
  description:
    `ราคาน้ำมันวันนี้ อัปเดตล่าสุด ${effective} เทียบราคาแก๊สโซฮอล์ 95, 91, E20, E85 และดีเซล ` +
    `ทุกยี่ห้อ ปตท. บางจาก เชลล์ คาลเท็กซ์ พีที ซัสโก้ ข้อมูลจาก สนพ. (EPPO)`,
  keywords: ["ราคาน้ำมันวันนี้", "ราคาน้ำมัน", "ราคาแก๊สโซฮอล์", "ราคาดีเซล", "ปตท", "บางจาก"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: SITE_URL,
    siteName: "ราคาน้ำมันวันนี้",
    title: `ราคาน้ำมันวันนี้ ${effective} — เช็คราคาทุกปั๊ม`,
    description: `ราคาน้ำมันขายปลีกทุกยี่ห้อในไทย อัปเดตล่าสุด ${effective}`,
  },
  robots: { index: true, follow: true },
  ...(GOOGLE_SITE_VERIFICATION && {
    verification: { google: GOOGLE_SITE_VERIFICATION },
  }),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body className={notoSansThai.variable}>
        {children}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
