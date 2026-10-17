"use client";

import { useState } from "react";

export default function LogoutButton() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function logout() {
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) {
        setError("Could not sign out. Please try again.");
        return;
      }
      window.location.replace("/admin/login");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full text-left">
      <button
        onClick={logout}
        disabled={loading}
        className="w-full rounded-lg border border-white/15 px-4 py-2 text-left text-sm font-medium text-slate-200 hover:bg-white/10 hover:text-white disabled:opacity-60"
      >
        {loading ? "Signing out..." : "Sign out"}
      </button>
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
