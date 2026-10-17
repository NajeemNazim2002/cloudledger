import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const schema = z.object({
  status: z.enum(["NEW", "CONTACTED", "IN_PROGRESS", "COMPLETED", "ARCHIVED"]),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Admin sign-in is required." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid enquiry status." }, { status: 400 });

  const { id } = await context.params;
  try {
    const { prisma } = await import("@/lib/prisma");
    const updated = await prisma.$transaction(async (tx) => {
      const current = await tx.enquiry.findUnique({ where: { id }, select: { status: true } });
      if (!current) return null;
      const enquiry = await tx.enquiry.update({ where: { id }, data: { status: parsed.data.status } });
      if (current.status !== parsed.data.status) {
        await tx.enquiryStatusHistory.create({ data: { enquiryId: id, status: parsed.data.status } });
      }
      return enquiry;
    });
    if (!updated) return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });
    return NextResponse.json({ enquiry: updated });
  } catch (error) {
    console.error("Could not update enquiry status.", error);
    return NextResponse.json({ error: "Could not update enquiry status." }, { status: 500 });
  }
}
