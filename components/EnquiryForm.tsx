"use client";
import { useState } from "react";

type Props = {
  type: "SERVICE" | "COURSE" | "GENERAL";
  whatsappNumber: string;
  options?: string[];
  topicLabel?: string;
};

export default function EnquiryForm({ type, whatsappNumber, options = [], topicLabel = "Topic" }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const enquiryType = { GENERAL: "General enquiry", SERVICE: "Accounting services", COURSE: "Training course" }[type];
    const whatsappMessage = [
      "Hello CloudLedger, I would like to make an enquiry.",
      `Enquiry type: ${enquiryType}`,
      `Name: ${data.fullName}`,
      `Email: ${data.email}`,
      `Phone: ${data.phone}`,
      data.topic ? `${topicLabel}: ${data.topic}` : "",
      `Message: ${data.message}`,
    ].filter(Boolean).join("\n");
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    setWhatsappUrl(url);
    setMsg("");
    setState("loading");

    const whatsappWindow = window.open(url, "_blank");
    if (whatsappWindow) whatsappWindow.opener = null;
    const whatsappOpened = Boolean(whatsappWindow);

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      setState("ok");
      setMsg(`${whatsappOpened
        ? "Your details are ready in WhatsApp. Review the message and tap Send to deliver it."
        : "Your enquiry was saved, but WhatsApp did not open. Use the link below to send it."}${json.warning ? ` ${json.warning}` : ""}`);
      form.reset();
    } catch (err) {
      setState("error");
      setMsg(`${whatsappOpened ? "WhatsApp was opened" : "WhatsApp did not open"}. We could not save your enquiry on the website. ${err instanceof Error ? err.message : "Something went wrong."}`);
    }
  }

  const input = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-brand focus:outline-none";
  return (
    <form onSubmit={onSubmit} className="card space-y-3">
      <label className="block text-sm font-medium">Full name
        <input name="fullName" required maxLength={100} className={input} /></label>
      <label className="block text-sm font-medium">Email
        <input name="email" type="email" required maxLength={150} className={input} /></label>
      <label className="block text-sm font-medium">Phone
        <input name="phone" type="tel" required maxLength={30} className={input} /></label>
      {options.length > 0 && (
        <label className="block text-sm font-medium">{topicLabel}
          <select name="topic" className={input}>{options.map((o) => <option key={o}>{o}</option>)}</select></label>
      )}
      <label className="block text-sm font-medium">Message
        <textarea name="message" required rows={4} maxLength={2000} className={input} /></label>
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <button disabled={state === "loading"} className="btn btn-primary w-full disabled:opacity-60">
        {state === "loading" ? "Opening WhatsApp..." : "Send enquiry"}
      </button>
      {state !== "idle" && state !== "loading" && (
        <div role="status" className={`space-y-2 text-sm ${state === "ok" ? "text-emerald-600" : "text-red-600"}`}>
          <p>{msg}</p>
          {whatsappUrl && <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-block font-semibold underline">Open WhatsApp message</a>}
        </div>
      )}
    </form>
  );
}
