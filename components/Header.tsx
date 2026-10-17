"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  ["Home", "/"], ["Services", "/services"], ["Courses", "/courses"], ["About", "/about"], ["Contact", "/contact"],
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 bg-navy text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="CloudLedger home"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white p-1.5 shadow-sm ring-1 ring-white/20"
        >
          <Image src="/logo/cloudledger-logo.png" alt="CloudLedger" width={140} height={64} priority className="h-auto w-full" />
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-bold md:flex" aria-label="Main">
          {links.map(([label, href]) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap transition-colors hover:text-sky-300 ${active ? "text-sky-300" : "text-white"}`}
              >
                {label}
              </Link>
            );
          })}
          <Link href="/contact" className="btn btn-primary whitespace-nowrap">Get a Consultation</Link>
        </nav>
        <button className="md:hidden" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-white/10 px-4 pb-4 md:hidden" aria-label="Mobile">
          {links.map(([l, h]) => (
            <Link key={h} href={h} onClick={() => setOpen(false)} className="block py-3 text-sm font-bold">{l}</Link>
          ))}
          <Link href="/contact" onClick={() => setOpen(false)} className="btn btn-primary mt-2 w-full">Get a Consultation</Link>
        </nav>
      )}
    </header>
  );
}
