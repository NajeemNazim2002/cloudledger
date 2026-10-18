import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const slug = z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const courseSchema = z.object({
  slug,
  title: z.string().trim().min(2).max(150),
  level: z.string().trim().min(2).max(80),
  description: z.string().trim().min(5).max(3000),
  imageUrl: z.string().max(4_200_000).refine(isValidCourseImage),
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

export async function PATCH(request: Request, context: { params: Promise<{ resource: string; id: string }> }) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { resource, id } = await context.params;
  try {
    const { prisma } = await import("@/lib/prisma");
    if (
      (resource === "courses" || resource === "services") &&
      typeof body === "object" &&
      body !== null &&
      Object.keys(body).length === 1 &&
      "isPublished" in body &&
      typeof body.isPublished === "boolean"
    ) {
      const item = resource === "courses"
        ? await prisma.course.update({ where: { id }, data: { isPublished: body.isPublished } })
        : await prisma.accountingService.update({ where: { id }, data: { isPublished: body.isPublished } });
      return NextResponse.json({ item });
    }

    switch (resource) {
      case "courses": {
        const parsed = courseSchema.safeParse(body);
        if (!parsed.success) return invalidContent();
        return NextResponse.json({ item: await prisma.course.update({ where: { id }, data: parsed.data }) });
      }
      case "services": {
        const parsed = serviceSchema.safeParse(body);
        if (!parsed.success) return invalidContent();
        return NextResponse.json({ item: await prisma.accountingService.update({ where: { id }, data: parsed.data }) });
      }
      case "faqs": {
        const parsed = faqSchema.safeParse(body);
        if (!parsed.success) return invalidContent();
        return NextResponse.json({ item: await prisma.faq.update({ where: { id }, data: parsed.data }) });
      }
      case "testimonials": {
        const parsed = testimonialSchema.safeParse(body);
        if (!parsed.success) return invalidContent();
        return NextResponse.json({ item: await prisma.testimonial.update({ where: { id }, data: parsed.data }) });
      }
      case "settings": {
        if (id !== "main") return NextResponse.json({ error: "Settings record not found." }, { status: 404 });
        const parsed = settingsSchema.safeParse(body);
        if (!parsed.success) return invalidContent();
        return NextResponse.json({
          item: await prisma.siteSettings.upsert({
            where: { id },
            create: { id, ...parsed.data },
            update: parsed.data,
          }),
        });
      }
      default:
        return NextResponse.json({ error: "Unknown content type." }, { status: 404 });
    }
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return NextResponse.json({ error: "That slug is already in use." }, { status: 409 });
    }
    if (isNotFoundError(error)) return NextResponse.json({ error: "Content not found." }, { status: 404 });
    console.error("Could not update admin content.", error);
    return NextResponse.json({ error: "Could not update content." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ resource: string; id: string }> }) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const { resource, id } = await context.params;
  try {
    const { prisma } = await import("@/lib/prisma");
    switch (resource) {
      case "courses":
        await prisma.course.delete({ where: { id } });
        break;
      case "services":
        await prisma.accountingService.delete({ where: { id } });
        break;
      case "faqs":
        await prisma.faq.delete({ where: { id } });
        break;
      case "testimonials":
        await prisma.testimonial.delete({ where: { id } });
        break;
      default:
        return NextResponse.json({ error: "This content cannot be deleted." }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isNotFoundError(error)) return NextResponse.json({ error: "Content not found." }, { status: 404 });
    console.error("Could not delete admin content.", error);
    return NextResponse.json({ error: "Could not delete content." }, { status: 500 });
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

function isNotFoundError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2025";
}

function isValidCourseImage(value: string): boolean {
  if (!value) return true;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  if (/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}
