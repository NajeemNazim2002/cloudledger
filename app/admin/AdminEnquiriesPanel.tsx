"use client";

import { useEffect, useState } from "react";

export type AdminEnquiry = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  type: "SERVICE" | "COURSE" | "GENERAL";
  topic: string | null;
  message: string;
  status: "NEW" | "CONTACTED" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
  createdAt: string;
  history: { id: string; status: AdminEnquiry["status"]; changedAt: string }[];
};

const statuses: AdminEnquiry["status"][] = ["NEW", "CONTACTED", "IN_PROGRESS", "COMPLETED", "ARCHIVED"];
const types: AdminEnquiry["type"][] = ["SERVICE", "COURSE", "GENERAL"];

export default function AdminEnquiriesPanel({ initialEnquiries }: { initialEnquiries: AdminEnquiry[] }) {
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (type) params.set("type", type);
    if (search.trim()) params.set("q", search.trim());
    setLoading(true);
    setError("");

    fetch(`/api/admin/enquiries?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not load enquiries.");
        setEnquiries(result.enquiries);
      })
      .catch((cause: unknown) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError(cause instanceof Error ? cause.message : "Could not load enquiries.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [status, type, search]);

  async function updateStatus(enquiry: AdminEnquiry, nextStatus: AdminEnquiry["status"]) {
    setUpdating((current) => ({ ...current, [enquiry.id]: true }));
    setRowErrors((current) => ({ ...current, [enquiry.id]: "" }));
    try {
      const response = await fetch(`/api/admin/enquiries/${encodeURIComponent(enquiry.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update the enquiry.");
      const history = nextStatus === enquiry.status
        ? enquiry.history
        : [{ id: `${enquiry.id}-${Date.now()}`, status: nextStatus, changedAt: new Date().toISOString() }, ...enquiry.history];
      setEnquiries((current) => current.map((item) => item.id === enquiry.id
        ? { ...item, status: result.enquiry.status, history }
        : item));
    } catch (cause) {
      setRowErrors((current) => ({
        ...current,
        [enquiry.id]: cause instanceof Error ? cause.message : "Could not update the enquiry.",
      }));
    } finally {
      setUpdating((current) => ({ ...current, [enquiry.id]: false }));
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-navy">Enquiries</h2>
          <p className="mt-1 text-sm text-slate-500">Search submissions, review their details, and track status history.</p>
        </div>
        <a href="/api/admin/enquiries/export" className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
          Export CSV
        </a>
      </div>

      <div className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:grid-cols-[1fr_190px_190px]">
        <label className="text-sm font-medium text-slate-700">
          Search
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, email, phone, topic, or message" className={inputClass} />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Type
          <select value={type} onChange={(event) => setType(event.target.value)} className={inputClass}>
            <option value="">All types</option>
            {types.map((option) => <option key={option} value={option}>{formatLabel(option)}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)} className={inputClass}>
            <option value="">All statuses</option>
            {statuses.map((option) => <option key={option} value={option}>{formatLabel(option)}</option>)}
          </select>
        </label>
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading && <p role="status" className="text-sm text-slate-500">Loading enquiries...</p>}
      {!loading && !error && enquiries.length === 0 && (
        <p className="card text-sm text-slate-500">No enquiries match these filters.</p>
      )}
      {!loading && enquiries.length >= 500 && (
        <p className="text-xs text-slate-500">Showing the latest 500 matching enquiries. Use search and filters to narrow results. CSV export includes all enquiries.</p>
      )}

      <div className="space-y-3">
        {enquiries.map((enquiry) => (
          <article key={enquiry.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="font-semibold text-navy">{enquiry.fullName}</h3>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
                  <a className="hover:text-brand" href={`mailto:${enquiry.email}`}>{enquiry.email}</a>
                  <a className="hover:text-brand" href={`tel:${enquiry.phone}`}>{enquiry.phone}</a>
                </div>
                <p className="mt-2 text-sm">
                  <span className="font-medium">{formatLabel(enquiry.type)}</span>
                  {enquiry.topic ? ` · ${enquiry.topic}` : ""}
                </p>
                <p className="mt-1 text-xs text-slate-500">Received {new Date(enquiry.createdAt).toLocaleString()}</p>
              </div>
              <label className="text-sm font-medium text-slate-700">
                Status
                <select
                  value={enquiry.status}
                  disabled={updating[enquiry.id]}
                  onChange={(event) => {
                    const selected = statuses.find((candidate) => candidate === event.target.value);
                    if (selected) void updateStatus(enquiry, selected);
                  }}
                  className={`${inputClass} min-w-40`}
                >
                  {statuses.map((option) => <option key={option} value={option}>{formatLabel(option)}</option>)}
                </select>
              </label>
            </div>
            {rowErrors[enquiry.id] && <p role="alert" className="mt-2 text-sm text-red-600">{rowErrors[enquiry.id]}</p>}
            <details className="mt-4 border-t border-slate-100 pt-3">
              <summary className="cursor-pointer text-sm font-medium text-brand">View message and status history</summary>
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{enquiry.message}</p>
              <h4 className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Status history</h4>
              <ul className="mt-2 space-y-1 text-xs text-slate-600">
                {enquiry.history.length === 0 && (
                  <li>{formatLabel("NEW")} · {new Date(enquiry.createdAt).toLocaleString()} (submission)</li>
                )}
                {enquiry.history.map((entry) => (
                  <li key={entry.id}>{formatLabel(entry.status)} · {new Date(entry.changedAt).toLocaleString()}</li>
                ))}
              </ul>
            </details>
          </article>
        ))}
      </div>
    </section>
  );
}

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand focus:outline-none";

function formatLabel(value: string) {
  return value.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}
