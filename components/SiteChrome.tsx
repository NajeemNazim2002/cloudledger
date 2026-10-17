"use client";

import { usePathname } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";

type SiteDetails = {
  name: string;
  tagline: string;
  email: string;
  whatsappDisplay: string;
  whatsappNumber: string;
  whatsappMessage: string;
};

export default function SiteChrome({ children, site, whatsappLink }: { children: React.ReactNode; site: SiteDetails; whatsappLink: string }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <Header />}
      <main className={isAdmin ? "p-0" : "mx-auto w-full max-w-5xl px-4 pb-28 pt-4 sm:px-6 lg:px-0"}>{children}</main>
      {!isAdmin && (
        <SiteFooter
          name={site.name}
          tagline={site.tagline}
          email={site.email}
          phoneDisplay={site.whatsappDisplay}
          phoneNumber={site.whatsappNumber}
          whatsappNumber={site.whatsappNumber}
          whatsappMessage={site.whatsappMessage}
        />
      )}
      {!isAdmin && <WhatsAppButton href={whatsappLink} />}
      {!isAdmin && <BottomNav />}
    </>
  );
}
