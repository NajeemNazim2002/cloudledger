"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Briefcase, GraduationCap, Info, MessageSquare } from "lucide-react";

const items = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/services", label: "Services", Icon: Briefcase },
  { href: "/courses", label: "Courses", Icon: GraduationCap },
  { href: "/about", label: "About", Icon: Info },
  { href: "/contact", label: "Contact", Icon: MessageSquare },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 border-t bg-white md:hidden">
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <li key={href}>
              <Link href={href} className={`flex flex-col items-center gap-1 py-2 text-xs font-bold ${active ? "text-brand" : "text-slate-500"}`}>
                <Icon size={22} />{label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
