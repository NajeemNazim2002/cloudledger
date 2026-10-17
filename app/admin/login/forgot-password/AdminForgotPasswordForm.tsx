"use client";

import { useState } from "react";

export default function AdminForgotPasswordForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email") }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Could not request a password reset.");
        return;
      }
      setMessage(result.message);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6">
      <label className="block text-sm font-medium text-slate-700">
        Recovery email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </label>
      <button disabled={loading} className="btn btn-primary w-full disabled:opacity-60">
        {loading ? "Requesting link..." : "Send verification link"}
      </button>
      {message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
