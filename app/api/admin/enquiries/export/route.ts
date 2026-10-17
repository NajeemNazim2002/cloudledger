import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Admin sign-in is required." }, { status: 401 });
  }

  try {
    const { prisma } = await import("@/lib/prisma");
    const enquiries = await prisma.enquiry.findMany({ orderBy: { createdAt: "desc" } });
    const columns = ["id", "type", "fullName", "email", "phone", "topic", "message", "status", "createdAt"];
    const csv = [
      columns.join(","),
      ...enquiries.map((enquiry) =>
        columns.map((column) => csvCell(enquiry[column as keyof typeof enquiry])).join(","),
      ),
    ].join("\r\n");

    return new NextResponse(`\uFEFF${csv}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="cloudledger-enquiries.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Could not export enquiries.", error);
    return NextResponse.json({ error: "Could not export enquiries." }, { status: 500 });
  }
}

function csvCell(value: unknown) {
  let text = value instanceof Date ? value.toISOString() : String(value ?? "");
  if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
