import type { Metadata } from "next";
import Link from "next/link";
import AdminForgotPasswordForm from "./AdminForgotPasswordForm";

export const metadata: Metadata = {
  title: "Admin Password Recovery | CloudLedger",
  robots: { index: false, follow: false },
};

export default function AdminPasswordRecoveryPage() {
  return (
    <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center py-10">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">CloudLedger</p>
          <h1 className="mt-2 text-2xl font-bold text-navy">Verify your recovery email</h1>
          <p className="mt-2 text-sm text-slate-600">We’ll email a one-time link to the configured admin recovery address.</p>
        </div>
        <AdminForgotPasswordForm />
        <p className="text-center text-sm">
          <Link href="/admin/login" className="font-semibold text-brand hover:underline">Back to admin sign in</Link>
        </p>
      </div>
    </div>
  );
}
