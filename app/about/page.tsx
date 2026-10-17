import type { Metadata } from "next";

export const metadata: Metadata = { title: "About Us | CloudLedger" };

const values = [
  { title: "Integrity", description: "We treat financial information with care, honesty, and respect." },
  { title: "Clarity", description: "We make accounting information easier to understand and act on." },
  { title: "Practicality", description: "We focus on useful workflows and skills that support real business needs." },
  { title: "Continuous learning", description: "We encourage curiosity and keep building confidence with cloud tools." },
];

export default function AboutPage() {
  return (
    <article className="space-y-8">
      <header className="rounded-3xl bg-navy px-6 py-10 text-white sm:px-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-200">About CloudLedger</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Clearer finances. Stronger skills.</h1>
        <p className="mt-4 max-w-3xl text-sky-100">
          CloudLedger provides accounting support and practical cloud accounting education for businesses and learners.
          We aim to make everyday financial work more organised, understandable, and useful.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <InfoCard title="Our mission">
          To help businesses maintain dependable financial records and help learners build practical accounting skills
          through clear guidance and thoughtful use of cloud tools.
        </InfoCard>
        <InfoCard title="Our vision">
          A future where businesses can make informed decisions with confidence and people can access practical,
          responsible accounting education.
        </InfoCard>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-navy">Our values</h2>
          <p className="mt-1 text-sm text-slate-600">The principles that guide how we support clients and learners.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {values.map((value) => (
            <div key={value.title} className="card">
              <h3 className="font-semibold text-navy">{value.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="text-2xl font-bold text-navy">Accounting services</h2>
        <p className="text-sm leading-6 text-slate-600">
          Our services include bookkeeping and monthly accounts, bank and card reconciliation, payables and receivables,
          financial reporting, tax preparation support, and business advisory. The scope of each engagement is agreed
          with the client and is subject to applicable legal and professional requirements.
        </p>
      </section>

      <section className="rounded-3xl bg-mist p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-navy">How we teach</h2>
        <p className="mt-2 text-sm leading-6 text-slate-700">
          Our training philosophy is practice first: explain a concept, demonstrate it in a cloud accounting workflow,
          and give learners a chance to apply it with guided exercises. Course content, delivery, and prerequisites
          should be confirmed before registration.
        </p>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-2xl font-bold text-navy">Our team</h2>
          <p className="mt-1 text-sm text-slate-600">
            Team biographies are intentionally left as placeholders until verified staff information is provided.
          </p>
        </div>
        <div className="card">
          <h3 className="font-semibold text-navy">Team member profile — details to be added</h3>
          <p className="mt-1 text-sm text-slate-600">
            Add a genuine team member’s name, role, relevant experience, verified qualifications, and professional
            credentials here. No qualifications or staff identities are claimed until confirmed by CloudLedger.
          </p>
        </div>
      </section>
    </article>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card">
      <h2 className="text-xl font-bold text-navy">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{children}</p>
    </section>
  );
}
