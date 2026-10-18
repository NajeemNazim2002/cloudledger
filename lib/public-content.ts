import { site, services as defaultServices, courses as defaultCourses } from "@/lib/config";

export type PublicCourse = {
  slug: string;
  title: string;
  level: string;
  desc: string;
  imageUrl?: string | null;
  duration: string;
  deliveryMethod: string;
  price: string;
};

export type PublicService = {
  slug: string;
  icon: string;
  title: string;
  desc: string;
};

export async function getPublicCourses(): Promise<PublicCourse[]> {
  if (!process.env.DATABASE_URL || !(await isDatabaseReachable())) {
    return fallbackCourses();
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const courses = await prisma.course.findMany({ where: { isPublished: true }, orderBy: { title: "asc" } });
    return courses.map(({ description, ...course }) => ({ ...course, desc: description }));
  } catch (error) {
    if (!isUnavailableContent(error)) throw error;
    console.error("Could not load database course content; using the built-in public courses.", error);
    return fallbackCourses();
  }
}

export async function getPublicServices(): Promise<PublicService[]> {
  if (!process.env.DATABASE_URL || !(await isDatabaseReachable())) return defaultServices;

  try {
    const { prisma } = await import("@/lib/prisma");
    const services = await prisma.accountingService.findMany({
      where: { isPublished: true },
      orderBy: { title: "asc" },
    });
    return services.map(({ description, ...service }) => ({ ...service, desc: description }));
  } catch (error) {
    if (!isUnavailableContent(error)) throw error;
    console.error("Could not load database service content; using the built-in public services.", error);
    return defaultServices;
  }
}

export async function getPublicSettings() {
  if (!process.env.DATABASE_URL || !(await isDatabaseReachable())) return site;
  try {
    const { prisma } = await import("@/lib/prisma");
    const settings = await prisma.siteSettings.findUnique({ where: { id: "main" } });
    if (!settings) return site;
    return {
      name: settings.companyName,
      tagline: settings.tagline,
      email: settings.email,
      whatsappDisplay: settings.whatsappDisplay,
      whatsappNumber: settings.whatsappNumber,
      whatsappMessage: settings.whatsappMessage,
      hours: settings.hours,
    };
  } catch (error) {
    if (!isUnavailableContent(error)) throw error;
    console.error("Could not load database website settings; using the built-in public settings.", error);
    return site;
  }
}

export async function getPublicTestimonials() {
  if (!process.env.DATABASE_URL || !(await isDatabaseReachable())) return [];
  try {
    const { prisma } = await import("@/lib/prisma");
    return await prisma.testimonial.findMany({ where: { isPublished: true }, orderBy: { createdAt: "desc" } });
  } catch (error) {
    if (!isUnavailableContent(error)) throw error;
    console.error("Could not load database testimonials; omitting testimonials from the public page.", error);
    return [];
  }
}

export async function getPublicFaqs() {
  if (!process.env.DATABASE_URL || !(await isDatabaseReachable())) return [];
  try {
    const { prisma } = await import("@/lib/prisma");
    return await prisma.faq.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } });
  } catch (error) {
    if (!isUnavailableContent(error)) throw error;
    console.error("Could not load database FAQs; omitting FAQs from the public page.", error);
    return [];
  }
}

function fallbackCourses(): PublicCourse[] {
  return defaultCourses.map((course) => ({
    ...course,
    duration: "Contact us for details",
    deliveryMethod: "Contact us for details",
    price: "Contact us for pricing",
  }));
}

async function isDatabaseReachable(): Promise<boolean> {
  try {
    const { prisma } = await import("@/lib/prisma");
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Database connection timed out.")), 2000)),
    ]);
    return true;
  } catch {
    return false;
  }
}

function isUnavailableContent(error: unknown): error is { code?: string; errorCode?: string; message?: string; name?: string } {
  if (typeof error !== "object" || error === null) return false;

  const prismaError = error as {
    code?: string;
    errorCode?: string;
    message?: string;
    name?: string;
    cause?: { code?: string };
  };
  const errorCode = prismaError.code ?? prismaError.errorCode ?? prismaError.cause?.code ?? "";
  const message = prismaError.message ?? "";

  return (
    ["P1001", "P1002", "P1017", "P2021", "ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "ENOTFOUND"].includes(errorCode) ||
    prismaError.name === "PrismaClientInitializationError" ||
    /can't reach database server|database server.*(running|reachable)|ECONNREFUSED|timed out/i.test(message)
  );
}
