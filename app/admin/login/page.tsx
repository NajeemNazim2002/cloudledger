import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import AdminLoginForm from "./AdminLoginForm";

export const metadata: Metadata = { title: "Admin Login | CloudLedger" };

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) redirect("/admin");

  return (
    <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link
            href="/"
            aria-label="CloudLedger home"
            className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-white p-3 shadow-sm ring-1 ring-slate-200"
          >
            <Image src="/logo/cloudledger-logo.png" alt="CloudLedger" width={140} height={64} priority className="h-auto w-full" />
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-navy">Admin sign in</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to manage website enquiries.</p>
        </div>
        <AdminLoginForm />
        <p className="text-center text-sm">
          <Link href="/admin/login/forgot-password" className="font-semibold text-brand hover:underline">
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  );
}
