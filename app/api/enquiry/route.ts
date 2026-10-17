import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  type: z.enum(["SERVICE", "COURSE", "GENERAL"]),
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(150),
  phone: z.string().trim().min(7).max(30),
  topic: z.string().trim().max(150).optional(),
  message: z.string().trim().min(5).max(2000),
  website: z.string().optional(), // honeypot
});

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Please check your details and try again." }, { status: 400 });
  const { website, ...data } = parsed.data;
  if (website) return NextResponse.json({ ok: true }); // bots get a silent success
  if (!process.env.DATABASE_URL)
    return NextResponse.json({ error: "Enquiries are not available yet. Please use WhatsApp or email." }, { status: 503 });
  try {
    const { prisma } = await import("@/lib/prisma");
    try {
      await prisma.$transaction(async (tx) => {
        const enquiry = await tx.enquiry.create({ data });
        await tx.enquiryStatusHistory.create({ data: { enquiryId: enquiry.id, status: "NEW" } });
      });
      return NextResponse.json({ ok: true });
    } catch (error) {
      if (!isMissingTableError(error)) throw error;
      console.error("Enquiry status history is unavailable until the database schema is synced.", error);
      await prisma.enquiry.create({ data });
      return NextResponse.json({
        ok: true,
        warning: "Your enquiry was received. Admin status history will be available after the database setup is completed.",
      });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not save your enquiry. Please try again." }, { status: 500 });
  }
}

function isMissingTableError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2021";
}
