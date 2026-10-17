"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  CircleHelp,
  Globe2,
  LayoutDashboard,
  LockKeyhole,
  Mail,
  MessageSquareText,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { EnquiryStatus, EnquiryType } from "@prisma/client";
import AdminContentManager, { type ContentItem } from "./AdminContentManager";
import AdminEnquiriesPanel, { type AdminEnquiry } from "./AdminEnquiriesPanel";
import LogoutButton from "./LogoutButton";

export type AdminSettings = {
  id: string;
  companyName: string;
  tagline: string;
  email: string;
  whatsappDisplay: string;
  whatsappNumber: string;
  whatsappMessage: string;
  hours: string;
};

export type AdminDashboardData = {
  counts: {
    serviceTotal: number;
    serviceNew: number;
    courseTotal: number;
    courseNew: number;
    activeCourses: number;
  };
  recent: AdminEnquiry[];
  content: {
    courses: ContentItem[];
    services: ContentItem[];
    faqs: ContentItem[];
    testimonials: ContentItem[];
    settings: AdminSettings;
  };
  databaseError: string;
};

type Section = "overview" | "enquiries" | "courses" | "services" | "faqs" | "testimonials" | "settings";

type DashboardSection = Section | "profile";

const managementNav: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "enquiries", label: "Enquiries", icon: MessageSquareText },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "services", label: "Services", icon: Sparkles },
  { id: "faqs", label: "FAQs", icon: CircleHelp },
  { id: "testimonials", label: "Testimonials", icon: ShieldCheck },
  { id: "settings", label: "Website settings", icon: Settings2 },
];

export default function AdminDashboardClient({
  data,
  adminUsername,
  recoveryEmail,
}: {
  data: AdminDashboardData;
  adminUsername: string;
  recoveryEmail: string;
}) {
  const [section, setSection] = useState<DashboardSection>("overview");
  const sectionTitle = section === "profile"
    ? "Admin profile"
    : managementNav.find((item) => item.id === section)?.label ?? "Overview";

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <aside className="bg-navy text-white md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 md:block md:px-6 md:py-6">
          <Link href="/" aria-label="CloudLedger home" className="inline-flex rounded-lg bg-white px-2 py-1.5">
            <Image src="/logo/cloudledger-logo.png" alt="CloudLedger" width={140} height={64} priority className="h-9 w-auto" />
          </Link>
          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200 md:mt-5 md:inline-flex">
            Admin portal
          </span>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 py-3 md:flex-1 md:flex-col md:overflow-y-auto md:px-4 md:py-6" aria-label="Admin sections">
          <p className="hidden px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 md:block">
            Management
          </p>
          {managementNav.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              aria-current={section === id ? "page" : undefined}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition md:w-full ${
                section === id
                  ? "bg-white text-navy shadow-sm"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
              {section === id && <ChevronRight className="ml-auto hidden md:block" size={16} aria-hidden="true" />}
            </button>
          ))}
          <p className="hidden px-3 pb-2 pt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 md:block">
            Account
          </p>
          <button
            onClick={() => setSection("profile")}
            aria-current={section === "profile" ? "page" : undefined}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition md:w-full ${
              section === "profile"
                ? "bg-white text-navy shadow-sm"
                : "text-slate-200 hover:bg-white/10 hover:text-white"
            }`}
          >
            <UserRound size={18} aria-hidden="true" />
            <span>Admin profile</span>
            {section === "profile" && <ChevronRight className="ml-auto hidden md:block" size={16} aria-hidden="true" />}
          </button>
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            <Globe2 size={18} aria-hidden="true" />
            <span>View website</span>
            <ArrowUpRight className="ml-auto hidden md:block" size={15} aria-hidden="true" />
          </Link>
        </nav>

        <div className="hidden border-t border-white/10 p-4 md:block">
          <div className="mb-3 flex min-w-0 items-center gap-3 rounded-xl bg-white/5 p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-200/15 text-sky-100">
              <UserRound size={17} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{adminUsername}</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex min-h-[76px] items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-8">
          <div>
            <p className="text-xs font-medium text-slate-500">CloudLedger / Admin</p>
            <h1 className="mt-0.5 text-xl font-bold text-navy">{sectionTitle}</h1>
          </div>
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Globe2 size={16} aria-hidden="true" />
            <span className="hidden sm:inline">View website</span>
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </header>

        <div className="space-y-6 p-4 sm:p-8">
          {data.databaseError && (
            <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              {data.databaseError}
            </div>
          )}

          <div hidden={section !== "overview"}>
            <Overview data={data} onOpenEnquiries={() => setSection("enquiries")} />
          </div>
          <div hidden={section !== "enquiries"}>
            <AdminEnquiriesPanel initialEnquiries={data.recent} />
          </div>
          <div hidden={section !== "courses"}>
            <AdminContentManager resource="courses" initialItems={data.content.courses} />
          </div>
          <div hidden={section !== "services"}>
            <AdminContentManager resource="services" initialItems={data.content.services} />
          </div>
          <div hidden={section !== "faqs"}>
            <AdminContentManager resource="faqs" initialItems={data.content.faqs} />
          </div>
          <div hidden={section !== "testimonials"}>
            <AdminContentManager resource="testimonials" initialItems={data.content.testimonials} />
          </div>
          <div hidden={section !== "settings"}>
            <AdminContentManager resource="settings" initialItems={[data.content.settings]} />
          </div>
          <div hidden={section !== "profile"}>
            <AdminProfile username={adminUsername} recoveryEmail={recoveryEmail} />
          </div>
        </div>
      </main>
    </div>
  );
}

function AdminProfile({ username, recoveryEmail }: { username: string; recoveryEmail: string }) {
  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy">Admin profile</h2>
        <p className="mt-1 text-sm text-slate-500">Review your administrator account and security options.</p>
      </div>
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center gap-4 border-b border-slate-100 p-6">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-brand">
            <UserRound size={27} aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-semibold text-navy">{username}</h3>
            <p className="mt-1 text-sm text-slate-500">Administrator account</p>
          </div>
        </div>
        <dl className="divide-y divide-slate-100">
          <div className="flex items-start gap-3 px-6 py-5">
            <UserRound size={18} className="mt-0.5 text-slate-400" aria-hidden="true" />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Username</dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">{username}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3 px-6 py-5">
            <Mail size={18} className="mt-0.5 text-slate-400" aria-hidden="true" />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recovery email</dt>
              <dd className="mt-1 text-sm font-medium text-slate-800">{recoveryEmail || "Not configured"}</dd>
            </div>
          </div>
        </dl>
      </div>
      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <LockKeyhole size={20} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
          <div className="flex-1">
            <h3 className="font-semibold text-navy">Account security</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Password changes are handled through the secure password-reset flow sent to the recovery email.
            </p>
            <Link href="/admin/login/forgot-password" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline">
              Reset admin password <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Overview({ data, onOpenEnquiries }: { data: AdminDashboardData; onOpenEnquiries: () => void }) {
  const metrics = [
    ["Total service enquiries", data.counts.serviceTotal],
    ["New service enquiries", data.counts.serviceNew],
    ["Course interest submissions", data.counts.courseTotal],
    ["New course submissions", data.counts.courseNew],
    ["Active courses", data.counts.activeCourses],
  ] as const;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-navy">Overview</h2>
        <p className="mt-1 text-sm text-slate-500">A summary of recent activity on your website.</p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Dashboard summary">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-navy">{value}</p>
          </div>
        ))}
      </section>
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="font-semibold text-navy">Recent submissions</h3>
            <p className="mt-1 text-xs text-slate-500">Latest eight service and course submissions.</p>
          </div>
          <button onClick={onOpenEnquiries} className="text-sm font-semibold text-brand hover:underline">
            Manage enquiries
          </button>
        </div>
        {data.recent.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-500">No submissions have been received yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Type / topic</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recent.map((enquiry) => (
                  <tr key={enquiry.id}>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">{enquiry.fullName}</p>
                      <p className="text-slate-500">{enquiry.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p>{formatLabel(enquiry.type)}</p>
                      <p className="text-slate-500">{enquiry.topic || "—"}</p>
                    </td>
                    <td className="px-5 py-4">{formatLabel(enquiry.status)}</td>
                    <td className="px-5 py-4 text-slate-500">{new Date(enquiry.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function formatLabel(value: EnquiryType | EnquiryStatus) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}
