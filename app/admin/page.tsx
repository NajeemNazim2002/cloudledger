import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { site } from "@/lib/config";
import AdminDashboardClient, { type AdminDashboardData, type AdminSettings } from "./AdminDashboardClient";

export const metadata: Metadata = { title: "Admin Dashboard | CloudLedger" };
export const dynamic = "force-dynamic";

const defaultSettings: AdminSettings = {
  id: "main",
  companyName: site.name,
  tagline: site.tagline,
  email: site.email,
  whatsappDisplay: site.whatsappDisplay,
  whatsappNumber: site.whatsappNumber,
  whatsappMessage: site.whatsappMessage,
  hours: site.hours,
};

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  const data: AdminDashboardData = {
    counts: { serviceTotal: 0, serviceNew: 0, courseTotal: 0, courseNew: 0, activeCourses: 0 },
    recent: [],
    content: { courses: [], services: [], faqs: [], testimonials: [], settings: defaultSettings },
    databaseError: "",
  };

  if (!process.env.DATABASE_URL) {
    data.databaseError = "Add DATABASE_URL to .env and run npm run db:push, then npm run db:seed to manage content.";
  } else {
    try {
      const { prisma } = await import("@/lib/prisma");
      const [serviceTotal, serviceNew, courseTotal, courseNew, activeCourses, recent, courses, services, faqs, testimonials, settings] =
        await Promise.all([
          prisma.enquiry.count({ where: { type: "SERVICE" } }),
          prisma.enquiry.count({ where: { type: "SERVICE", status: "NEW" } }),
          prisma.enquiry.count({ where: { type: "COURSE" } }),
          prisma.enquiry.count({ where: { type: "COURSE", status: "NEW" } }),
          prisma.course.count({ where: { isPublished: true } }),
          prisma.enquiry.findMany({
            orderBy: { createdAt: "desc" },
            take: 8,
            include: { history: { orderBy: { changedAt: "desc" } } },
          }),
          prisma.course.findMany({ orderBy: { title: "asc" } }),
          prisma.accountingService.findMany({ orderBy: { title: "asc" } }),
          prisma.faq.findMany({ orderBy: { sortOrder: "asc" } }),
          prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } }),
          prisma.siteSettings.findUnique({ where: { id: "main" } }),
        ]);
      data.counts = { serviceTotal, serviceNew, courseTotal, courseNew, activeCourses };
      data.recent = recent.map((enquiry) => ({
        ...enquiry,
        createdAt: enquiry.createdAt.toISOString(),
        updatedAt: enquiry.updatedAt.toISOString(),
        history: enquiry.history.map((entry) => ({ ...entry, changedAt: entry.changedAt.toISOString() })),
      }));
      data.content = {
        courses,
        services,
        faqs,
        testimonials,
        settings: settings ?? defaultSettings,
      };
    } catch (error) {
      console.error("Could not load admin dashboard data.", error);
      data.databaseError = "Could not load admin data. Check the database connection and run npm run db:push.";
    }
  }

  return (
    <AdminDashboardClient
      data={data}
      adminUsername={process.env.ADMIN_USERNAME ?? "Administrator"}
      recoveryEmail={process.env.ADMIN_RECOVERY_EMAIL ?? ""}
    />
  );
}
