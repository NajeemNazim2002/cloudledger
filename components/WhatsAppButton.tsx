import { MessageCircle } from "lucide-react";

export default function WhatsAppButton({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"
      className="fixed bottom-20 right-4 z-30 rounded-full bg-emerald-500 p-3 text-white shadow-lg md:bottom-6">
      <MessageCircle size={26} />
    </a>
  );
}
