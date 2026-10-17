"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.get("username"),
          password: form.get("password"),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Could not sign in.");
        return;
      }
      window.location.assign("/admin");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <form onSubmit={onSubmit} className="card space-y-5 p-6">
      <label className="block text-sm font-medium text-slate-700">
        Username
        <input
          name="username"
          autoComplete="username"
          required
          maxLength={128}
          className={inputClass}
        />
      </label>
      <div className="block text-sm font-medium text-slate-700">
        <label htmlFor="admin-password">Password</label>
        <div className="relative">
          <input
            id="admin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            maxLength={256}
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" size={18} />
            ) : (
              <Eye aria-hidden="true" size={18} />
            )}
          </button>
        </div>
      </div>
      <button disabled={loading} className="btn btn-primary w-full disabled:opacity-60">
        {loading ? "Signing in..." : "Sign in"}
      </button>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
