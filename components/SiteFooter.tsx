import Image from "next/image";
import Link from "next/link";
import { Facebook, Linkedin, Mail, MessageCircle, Phone } from "lucide-react";

type Props = {
  name: string;
  tagline: string;
  email: string;
  phoneDisplay: string;
  phoneNumber: string;
  whatsappNumber: string;
  whatsappMessage: string;
};

export default function SiteFooter({
  name,
  tagline,
  email,
  phoneDisplay,
  phoneNumber,
  whatsappNumber,
  whatsappMessage,
}: Props) {
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <footer className="bg-navy pb-24 pt-10 text-white md:pb-8">
      <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-0">
        <div>
          <Link
            href="/"
            aria-label={`${name} home`}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white p-1.5 shadow-sm ring-1 ring-white/20"
          >
            <Image src="/logo/cloudledger-logo.png" alt={name} width={140} height={64} className="h-auto w-full" />
          </Link>
          <p className="mt-3 text-sm text-sky-100">{tagline}</p>
        </div>

        <div>
          <h2 className="font-bold">Quick links</h2>
          <ul className="mt-3 space-y-2 text-sm text-sky-100">
            <li><Link className="hover:text-white" href="/">Home</Link></li>
            <li><Link className="hover:text-white" href="/services">Services</Link></li>
            <li><Link className="hover:text-white" href="/courses">Courses</Link></li>
            <li><Link className="hover:text-white" href="/about">About</Link></li>
            <li><Link className="hover:text-white" href="/contact">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold">Contact us</h2>
          <ul className="mt-3 space-y-3 text-sm text-sky-100">
            <li>
              <a className="flex items-center gap-2 hover:text-white" href={`mailto:${email}`}>
                <Mail size={17} aria-hidden="true" />{email}
              </a>
            </li>
            <li>
              <a className="flex items-center gap-2 hover:text-white" href={`tel:${phoneNumber}`}>
                <Phone size={17} aria-hidden="true" />{phoneDisplay}
              </a>
            </li>
            <li>
              <a className="flex items-center gap-2 hover:text-white" href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={17} aria-hidden="true" />Chat on WhatsApp
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-bold">Follow us</h2>
          <ul className="mt-3 space-y-3 text-sm text-sky-100">
            <li className="flex items-center gap-2"><Linkedin size={17} aria-hidden="true" />LinkedIn <span className="text-xs text-sky-300">Coming soon</span></li>
            <li>
              <a
                className="flex items-center gap-2 hover:text-white"
                href="https://www.facebook.com/share/19n95ZSEAV/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook size={17} aria-hidden="true" />Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-8 w-full max-w-5xl border-t border-white/15 px-4 pt-4 text-center text-xs text-sky-200 sm:px-6 lg:px-0">
        &copy; {new Date().getFullYear()} {name}. All rights reserved.
      </div>
    </footer>
  );
}
