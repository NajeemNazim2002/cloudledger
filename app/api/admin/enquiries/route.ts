import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated } from "@/lib/admin-auth";

const statusSchema = z.enum(["NEW", "CONTACTED", "IN_PROGRESS", "COMPLETED", "ARCHIVED"]);
const typeSchema = z.enum(["SERVICE", "COURSE", "GENERAL"]);

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const params = new URL(request.url).searchParams;
  const parsedStatus = params.get("status") ? statusSchema.safeParse(params.get("status")) : null;
  const parsedType = params.get("type") ? typeSchema.safeParse(params.get("type")) : null;
  if (parsedStatus && !parsedStatus.success || parsedType && !parsedType.success) {
    return NextResponse.json({ error: "Invalid enquiry filter." }, { status: 400 });
  }

  const search = params.get("q")?.trim().slice(0, 150);
  try {
    const { prisma } = await import("@/lib/prisma");
    const enquiries = await prisma.enquiry.findMany({
      where: {
        ...(parsedStatus?.success ? { status: parsedStatus.data } : {}),
        ...(parsedType?.success ? { type: parsedType.data } : {}),
        ...(search
          ? {
              OR: [
                { fullName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
                { topic: { contains: search, mode: "insensitive" } },
                { message: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 500,
      include: { history: { orderBy: { changedAt: "desc" } } },
    });
    return NextResponse.json(
      { enquiries },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Could not search admin enquiries.", error);
    return NextResponse.json({ error: "Could not load enquiries." }, { status: 500 });
  }
}

function unauthorized() {
  return NextResponse.json({ error: "Admin sign-in is required." }, { status: 401 });
}
