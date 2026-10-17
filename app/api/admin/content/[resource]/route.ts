import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const slug = z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const courseSchema = z.object({
  slug,
  title: z.string().trim().min(2).max(150),
  level: z.string().trim().min(2).max(80),
  description: z.string().trim().min(5).max(3000),
  duration: z.string().trim().min(1).max(100),
  deliveryMethod: z.string().trim().min(1).max(100),
  price: z.string().trim().min(1).max(100),
  isPublished: z.boolean(),
});
const serviceSchema = z.object({
  slug,
  icon: z.string().trim().min(1).max(50),
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().min(5).max(3000),
  isPublished: z.boolean(),
});
const faqSchema = z.object({
  question: z.string().trim().min(5).max(500),
  answer: z.string().trim().min(5).max(3000),
  isPublished: z.boolean(),
  sortOrder: z.number().int().min(0).max(10000),
});
const testimonialSchema = z.object({
  quote: z.string().trim().min(5).max(3000),
  author: z.string().trim().min(2).max(150),
  role: z.string().trim().max(150),
  company: z.string().trim().max(150),
  isPublished: z.boolean(),
});
const settingsSchema = z.object({
  companyName: z.string().trim().min(2).max(150),
  tagline: z.string().trim().min(2).max(200),
  email: z.string().trim().email().max(150),
  whatsappDisplay: z.string().trim().min(5).max(40),
  whatsappNumber: z.string().trim().regex(/^\d{7,20}$/),
  whatsappMessage: z.string().trim().min(2).max(500),
  hours: z.string().trim().min(2).max(150),
});

export async function POST(request: Request, context: { params: Promise<{ resource: string }> }) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { resource } = await context.params;
  try {
    const { prisma } = await import("@/lib/prisma");
    switch (resource) {
      case "courses": {
        const parsed = courseSchema.safeParse(body);
        if (!parsed.success) return invalidContent();
        const item = await prisma.course.create({ data: parsed.data });
        return NextResponse.json({ item }, { status: 201 });
      }
      case "services": {
        const parsed = serviceSchema.safeParse(body);
        if (!parsed.success) return invalidContent();
        const item = await prisma.accountingService.create({ data: parsed.data });
        return NextResponse.json({ item }, { status: 201 });
      }
      case "faqs": {
        const parsed = faqSchema.safeParse(body);
        if (!parsed.success) return invalidContent();
        const item = await prisma.faq.create({ data: parsed.data });
        return NextResponse.json({ item }, { status: 201 });
      }
      case "testimonials": {
        const parsed = testimonialSchema.safeParse(body);
        if (!parsed.success) return invalidContent();
        const item = await prisma.testimonial.create({ data: parsed.data });
        return NextResponse.json({ item }, { status: 201 });
      }
      case "settings": {
        const parsed = settingsSchema.safeParse(body);
        if (!parsed.success) return invalidContent();
        const item = await prisma.siteSettings.upsert({
          where: { id: "main" },
          create: { id: "main", ...parsed.data },
          update: parsed.data,
        });
        return NextResponse.json({ item });
      }
      default:
        return NextResponse.json({ error: "Unknown content type." }, { status: 404 });
    }
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json({ error: "That slug is already in use." }, { status: 409 });
    }
    console.error("Could not create admin content.", error);
    return NextResponse.json({ error: "Could not save content." }, { status: 500 });
  }
}

function unauthorized() {
  return NextResponse.json({ error: "Admin sign-in is required." }, { status: 401 });
}

function invalidContent() {
  return NextResponse.json({ error: "Check the content fields and try again." }, { status: 400 });
}

function isUniqueConstraintError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}
