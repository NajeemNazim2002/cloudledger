import type { Metadata, Viewport } from "next";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import { getPublicSettings } from "@/lib/public-content";

export const metadata: Metadata = {
  title: "CloudLedger | Accounting Services & Cloud Accounting Training",
  description:
    "Discover professional accounting support and practical Xero, QuickBooks Online, and Zoho Books training with CloudLedger. Contact us to discuss your needs.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0a1a5c" };
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getPublicSettings();
  const whatsappLink = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(settings.whatsappMessage)}`;

  return (
    <html lang="en">
      <body>
        <SiteChrome site={settings} whatsappLink={whatsappLink}>{children}</SiteChrome>
      </body>
    </html>
  );
}
