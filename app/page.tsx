import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import Icon from "@/components/Icon";
import HomeBannerCarousel from "@/components/HomeBannerCarousel";
import { getPublicCourses, getPublicFaqs, getPublicServices, getPublicSettings, getPublicTestimonials } from "@/lib/public-content";

export default async function Home() {
  const [services, courses, settings, testimonials, faqs] = await Promise.all([
    getPublicServices(),
    getPublicCourses(),
    getPublicSettings(),
    getPublicTestimonials(),
    getPublicFaqs(),
  ]);
  const whatsappLink = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(settings.whatsappMessage)}`;

  return (
    <div className="space-y-10">
      <section className="lg:relative lg:left-1/2 lg:w-screen lg:max-w-[1440px] lg:-translate-x-1/2 lg:px-6 xl:px-8">
        <HomeBannerCarousel />
      </section>

      <section className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet">{settings.tagline}</p>
        <h1 className="mt-3 text-3xl font-bold text-navy md:text-4xl">Your Trusted Partner in Accounting &amp; Cloud Finance</h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600">Simplify your finances, strengthen your business, and build your future with professional accounting services and practical cloud accounting education.</p>
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/contact" className="btn btn-primary">Get Accounting Support <ArrowRight size={16} /></Link>
          <Link href="/courses" className="btn bg-white text-navy ring-1 ring-slate-200">Explore Training Courses</Link>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-xl font-bold text-navy">Accounting Services</h2>
          <Link href="/services" className="text-sm font-semibold text-brand">View All &rarr;</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {services.map((s) => (
            <Link key={s.slug} href={`/services#${s.slug}`} className="card flex flex-col items-center text-center">
              <span className="rounded-2xl bg-mist p-3 text-brand"><Icon name={s.icon} size={26} /></span>
              <h3 className="mt-2 text-sm font-semibold text-navy">{s.title}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-navy p-5 text-white">
        <h2 className="text-2xl font-bold">Learn. Practice. Build Your Career.</h2>
        <p className="mt-2 text-sm text-sky-100">Develop practical cloud accounting skills through guided lessons, hands-on exercises, and real-world examples.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {courses.map((c) => (
            <div key={c.slug} className="rounded-2xl bg-white/10 p-4">
              <div className="flex items-center gap-2 text-sky-300"><GraduationCap size={18} /><span className="text-xs">{c.level}</span></div>
              <h3 className="mt-1 font-semibold">{c.title}</h3>
              <p className="text-sm text-sky-100">{c.desc}</p>
            </div>
          ))}
        </div>
        <Link href="/courses" className="btn btn-light mt-4">Explore Courses</Link>
      </section>

      <section className="card text-center">
        <h2 className="text-xl font-bold text-navy">Testimonials</h2>
        {testimonials.length === 0 ? (
          <p className="mt-1 text-sm text-slate-500">Client testimonials coming soon.</p>
        ) : (
          <div className="mt-4 grid gap-3 text-left md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <blockquote key={testimonial.id} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-700">“{testimonial.quote}”</p>
                <footer className="mt-3 text-xs font-semibold text-navy">
                  {testimonial.author}{testimonial.role ? ` · ${testimonial.role}` : ""}{testimonial.company ? `, ${testimonial.company}` : ""}
                </footer>
              </blockquote>
            ))}
          </div>
        )}
      </section>

      {faqs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-navy">Frequently asked questions</h2>
          {faqs.map((faq) => (
            <details key={faq.id} className="card">
              <summary className="cursor-pointer font-semibold text-navy">{faq.question}</summary>
              <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </section>
      )}

      <section className="rounded-3xl bg-gradient-to-r from-brand to-violet p-6 text-center text-white">
        <h2 className="text-2xl font-bold">Let&apos;s Make Your Financial Future Stronger.</h2>
        <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="btn btn-light">Talk to Our Team</a>
          <Link href="/courses" className="btn ring-1 ring-white/60">Explore Courses</Link>
        </div>
      </section>

    </div>
  );
}
