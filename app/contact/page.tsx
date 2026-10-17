import { Mail, MessageCircle } from "lucide-react";
import EnquiryForm from "@/components/EnquiryForm";
import { getPublicSettings } from "@/lib/public-content";

export const metadata = { title: "Contact | CloudLedger" };

export default async function Contact() {
  const site = await getPublicSettings();
  const whatsappLink = `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(site.whatsappMessage)}`;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Contact CloudLedger</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        <a href={`mailto:${site.email}`} className="card flex items-center gap-3"><Mail className="text-brand" /><span className="text-sm">{site.email}</span></a>
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="card flex items-center gap-3"><MessageCircle className="text-emerald-500" /><span className="text-sm">WhatsApp {site.whatsappDisplay}</span></a>
      </div>
      <p className="text-sm text-slate-500">{site.hours}</p>
      <EnquiryForm type="GENERAL" whatsappNumber={site.whatsappNumber} topicLabel="Enquiry category" options={["Accounting services", "Training courses", "Other"]} />
    </div>
  );
}
