import type { Metadata } from "next";
import ResetAdminPasswordForm from "./ResetAdminPasswordForm";

export const metadata: Metadata = {
  title: "Set a New Admin Password | CloudLedger",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function ResetAdminPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center py-10">
      <section className="w-full max-w-md space-y-5">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">CloudLedger</p>
          <h1 className="mt-2 text-2xl font-bold text-navy">Choose a new password</h1>
          <p className="mt-2 text-sm text-slate-600">Reset links expire after 30 minutes and can only be used once.</p>
        </div>
        <ResetAdminPasswordForm />
      </section>
    </div>
  );
}
