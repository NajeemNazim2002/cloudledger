import Icon from "@/components/Icon";
import EnquiryForm from "@/components/EnquiryForm";
import { getPublicServices, getPublicSettings } from "@/lib/public-content";

export const metadata = { title: "Accounting Services | CloudLedger" };

export default async function Services() {
  const [services, site] = await Promise.all([getPublicServices(), getPublicSettings()]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Accounting Services</h1>
      <p className="rounded-2xl bg-mist p-3 text-sm">CloudLedger provides general bookkeeping and accounting support. Some professional services may require specific qualifications or authorisation in Sri Lanka. Ask us for details.</p>
      {services.map((s) => (
        <section id={s.slug} key={s.slug} className="card flex gap-3 scroll-mt-24">
          <span className="h-fit rounded-2xl bg-mist p-3 text-brand"><Icon name={s.icon} size={24} /></span>
          <div><h2 className="font-semibold text-navy">{s.title}</h2><p className="text-sm">{s.desc}</p></div>
        </section>
      ))}
      <h2 className="text-xl font-bold text-navy">Request a Consultation</h2>
      <EnquiryForm type="SERVICE" whatsappNumber={site.whatsappNumber} topicLabel="Service required" options={services.map((s) => s.title)} />
    </div>
  );
}
