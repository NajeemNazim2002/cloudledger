"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ResetAdminPasswordForm() {
  const [token, setToken] = useState("");
  const [checkingLink, setCheckingLink] = useState(true);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const resetToken = params.get("token") || "";
    window.history.replaceState(null, "", window.location.pathname);
    setToken(resetToken);
    setCheckingLink(false);
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirmation = String(form.get("confirmPassword") || "");
    if (password !== confirmation) {
      setError("The passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Could not reset the password.");
        return;
      }
      setComplete(true);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (complete) {
    return (
      <div className="space-y-4">
        <p role="status" className="text-sm text-emerald-700">Your password has been reset. Sign in with your new password.</p>
        <Link href="/admin/login" className="btn btn-primary w-full">Go to admin sign in</Link>
      </div>
    );
  }

  if (checkingLink) {
    return <p className="card p-6 text-sm text-slate-600">Checking your reset link...</p>;
  }

  if (!token) {
    return (
      <div className="card space-y-4 p-6">
        <p className="text-sm text-red-700">This reset link is missing or invalid. Request a new link to continue.</p>
        <Link href="/admin/login/forgot-password" className="btn btn-primary w-full">Request a new reset link</Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      <label className="block text-sm font-medium text-slate-700">
        New password
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          maxLength={256}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <span className="mt-1 block text-xs text-slate-500">Use at least 12 characters.</span>
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Confirm new password
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          maxLength={256}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </label>
      <button disabled={loading} className="btn btn-primary w-full disabled:opacity-60">
        {loading ? "Resetting password..." : "Reset password"}
      </button>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
