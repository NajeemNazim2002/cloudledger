import Image from "next/image";
import EnquiryForm from "@/components/EnquiryForm";
import { getPublicCourses, getPublicSettings } from "@/lib/public-content";

export const metadata = { title: "Training & Courses | CloudLedger" };

export default async function Courses() {
  const [courses, site] = await Promise.all([getPublicCourses(), getPublicSettings()]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy">Learn. Practice. Build Your Career.</h1>
      <p>Develop practical cloud accounting skills through guided lessons, hands-on exercises, and real-world examples.</p>
      <div className="grid gap-3 md:grid-cols-2">
        {courses.map((c) => (
          <article key={c.slug} className="card">
            {c.imageUrl && (
              <Image
                src={c.imageUrl}
                alt={c.title}
                width={800}
                height={450}
                unoptimized
                className="mb-3 aspect-video w-full rounded-xl object-cover"
              />
            )}
            <span className="text-xs font-semibold text-violet">{c.level}</span>
            <h2 className="font-semibold text-navy">{c.title}</h2>
            <p className="text-sm">{c.desc}</p>
            <p className="mt-2 text-xs text-slate-500">Duration: {c.duration} · Delivery: {c.deliveryMethod} · Price: {c.price}</p>
          </article>
        ))}
      </div>
      <h2 className="text-xl font-bold text-navy">Register Your Interest</h2>
      <EnquiryForm type="COURSE" whatsappNumber={site.whatsappNumber} topicLabel="Course of interest" options={courses.map((c) => c.title)} />
    </div>
  );
}
