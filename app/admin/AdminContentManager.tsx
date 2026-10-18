"use client";

import Image from "next/image";
import { useState } from "react";

export type ContentItem = {
  id: string;
  [key: string]: unknown;
};

type Resource = "courses" | "services" | "faqs" | "testimonials" | "settings";
type Field = { name: string; label: string; type?: "text" | "email" | "textarea" | "checkbox" | "number" | "image" };

const resourceFields: Record<Resource, Field[]> = {
  courses: [
    { name: "slug", label: "URL slug" },
    { name: "title", label: "Course title" },
    { name: "level", label: "Level" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "imageUrl", label: "Course image", type: "image" },
    { name: "duration", label: "Duration" },
    { name: "deliveryMethod", label: "Delivery method" },
    { name: "price", label: "Price" },
    { name: "isPublished", label: "Published on website", type: "checkbox" },
  ],
  services: [
    { name: "slug", label: "URL slug" },
    { name: "title", label: "Service title" },
    { name: "icon", label: "Icon name (Lucide)" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "isPublished", label: "Published on website", type: "checkbox" },
  ],
  faqs: [
    { name: "question", label: "Question" },
    { name: "answer", label: "Answer", type: "textarea" },
    { name: "sortOrder", label: "Display order", type: "number" },
    { name: "isPublished", label: "Published on website", type: "checkbox" },
  ],
  testimonials: [
    { name: "quote", label: "Testimonial", type: "textarea" },
    { name: "author", label: "Author" },
    { name: "role", label: "Role" },
    { name: "company", label: "Company" },
    { name: "isPublished", label: "Published on website", type: "checkbox" },
  ],
  settings: [
    { name: "companyName", label: "Company name" },
    { name: "tagline", label: "Tagline" },
    { name: "email", label: "Contact email", type: "email" },
    { name: "whatsappDisplay", label: "WhatsApp display number" },
    { name: "whatsappNumber", label: "WhatsApp number (digits only)" },
    { name: "whatsappMessage", label: "WhatsApp message", type: "textarea" },
    { name: "hours", label: "Business hours" },
  ],
};

const defaults: Record<Resource, Record<string, string | number | boolean>> = {
  courses: {
    slug: "",
    title: "",
    level: "Beginner",
    description: "",
    imageUrl: "",
    duration: "Contact us for details",
    deliveryMethod: "Contact us for details",
    price: "Contact us for pricing",
    isPublished: false,
  },
  services: { slug: "", title: "", icon: "BookOpen", description: "", isPublished: false },
  faqs: { question: "", answer: "", sortOrder: 0, isPublished: false },
  testimonials: { quote: "", author: "", role: "", company: "", isPublished: false },
  settings: {},
};

const headings: Record<Resource, string> = {
  courses: "Courses",
  services: "Accounting services",
  faqs: "FAQs",
  testimonials: "Testimonials",
  settings: "Website settings",
};

export default function AdminContentManager({
  resource,
  initialItems,
}: {
  resource: Resource;
  initialItems: ContentItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fields = resourceFields[resource];
  const isSettings = resource === "settings";

  function startNew() {
    setEditing({ id: "", ...defaults[resource] });
    setError("");
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const body: Record<string, unknown> = {};
    try {
      for (const field of fields) {
        if (field.type === "checkbox") body[field.name] = form.get(field.name) === "on";
        else if (field.type === "number") body[field.name] = Number(form.get(field.name));
        else if (field.type === "image") {
          const imageFile = form.get("imageFile");
          const imageUrl = stringValue(form.get(field.name));
          if (imageFile instanceof File && imageFile.size > 0) {
            if (!["image/png", "image/jpeg", "image/webp"].includes(imageFile.type)) {
              setError("Choose a PNG, JPEG, or WebP course image.");
              return;
            }
            if (imageFile.size > 3 * 1024 * 1024) {
              setError("Course images must be 3 MB or smaller.");
              return;
            }
            body[field.name] = await fileToDataUrl(imageFile);
          } else if (imageUrl) {
            body[field.name] = imageUrl;
          } else if (form.get("removeImage") === "on") {
            body[field.name] = "";
          } else {
            body[field.name] = stringValue(editing?.[field.name]);
          }
        } else body[field.name] = form.get(field.name) ?? "";
      }

      const url = editing?.id
        ? `/api/admin/content/${resource}/${encodeURIComponent(editing.id)}`
        : `/api/admin/content/${resource}`;
      const response = await fetch(url, {
        method: editing?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Could not save this content.");
        return;
      }
      setItems((current) => {
        const next = current.filter((item) => item.id !== result.item.id);
        return [...next, result.item].sort((a, b) => displayTitle(resource, a).localeCompare(displayTitle(resource, b)));
      });
      setEditing(null);
    } catch (error) {
      setError(error instanceof Error && error.message === "Could not read the selected image."
        ? "Could not read the selected image. Please choose another file."
        : "Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: ContentItem) {
    if (!window.confirm(`Delete “${displayTitle(resource, item)}”? This cannot be undone.`)) return;
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/content/${resource}/${encodeURIComponent(item.id)}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Could not delete this content.");
        return;
      }
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      if (editing?.id === item.id) setEditing(null);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function togglePublished(item: ContentItem) {
    setError("");
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/content/${resource}/${encodeURIComponent(item.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: item.isPublished !== true }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Could not update website visibility.");
        return;
      }
      setItems((current) => current.map((entry) => entry.id === item.id ? result.item : entry));
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-navy">{headings[resource]}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {isSettings ? "Update the public contact details and website identity." : "Create, edit, publish, or remove website content."}
          </p>
        </div>
        {!isSettings && (
          <button onClick={startNew} className="btn btn-primary">
            Add {resource === "faqs" ? "FAQ" : resource === "services" ? "service" : resource === "testimonials" ? "testimonial" : "course"}
          </button>
        )}
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {editing && (
        <form key={`${resource}-${editing.id || "new"}`} onSubmit={save} className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-navy">{editing.id ? "Edit" : "Create"} {headings[resource].replace(/s$/, "")}</h3>
            <button type="button" onClick={() => setEditing(null)} className="text-sm text-slate-500 hover:text-navy">Cancel</button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <FieldInput key={field.name} field={field} value={editing[field.name]} />
            ))}
          </div>
          <button disabled={busy} className="btn btn-primary disabled:opacity-60">
            {busy ? "Saving..." : "Save changes"}
          </button>
        </form>
      )}

      <div className="grid gap-3">
        {items.length === 0 ? (
          <p className="card text-sm text-slate-500">No {headings[resource].toLowerCase()} have been added yet.</p>
        ) : (
          items.map((item) => (
            <article key={item.id} className="card flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-navy">{displayTitle(resource, item)}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{displaySubtitle(resource, item)}</p>
                {!isSettings && (
                  <span className={`mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
                    item.isPublished === true ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                  }`}>
                    {item.isPublished === true ? "Published" : "Unpublished"}
                  </span>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                {(resource === "courses" || resource === "services") && (
                  <button
                    disabled={busy}
                    onClick={() => togglePublished(item)}
                    className="rounded-lg border border-brand/30 px-3 py-2 text-sm font-medium text-brand hover:bg-brand/5 disabled:opacity-60"
                  >
                    {item.isPublished === true ? "Hide" : "Show"}
                  </button>
                )}
                <button onClick={() => { setEditing(item); setError(""); }} className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
                  Edit
                </button>
                {!isSettings && (
                  <button disabled={busy} onClick={() => remove(item)} className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60">
                    Delete
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function FieldInput({ field, value }: { field: Field; value: unknown }) {
  const commonClass =
    "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand focus:outline-none";
  if (field.type === "image") {
    const imageUrl = stringValue(value);
    return (
      <div className="space-y-3 text-sm font-medium text-slate-700 sm:col-span-2">
        <label className="block">
          {field.label}
          <input
            name={field.name}
            type="text"
            defaultValue={imageUrl.startsWith("data:") ? "" : imageUrl}
            placeholder="Paste an https:// image URL (optional)"
            className={commonClass}
          />
        </label>
        <label className="block">
          Or upload an image (PNG, JPEG, or WebP; max 3 MB)
          <input
            name="imageFile"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className={`${commonClass} file:mr-3 file:rounded-lg file:border-0 file:bg-mist file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-navy`}
          />
        </label>
        {imageUrl && (
          <div className="flex items-center gap-3">
            <Image src={imageUrl} alt="Current course" width={128} height={80} unoptimized className="h-20 w-32 rounded-lg object-cover" />
            <label className="flex items-center gap-2 text-sm font-normal">
              <input name="removeImage" type="checkbox" className="h-4 w-4 accent-brand" />
              Remove current image
            </label>
          </div>
        )}
      </div>
    );
  }
  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
        <input name={field.name} type="checkbox" defaultChecked={value === true} className="h-4 w-4 accent-brand" />
        {field.label}
      </label>
    );
  }
  if (field.type === "textarea") {
    return (
      <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
        {field.label}
        <textarea name={field.name} required defaultValue={stringValue(value)} rows={4} className={commonClass} />
      </label>
    );
  }
  return (
    <label className="block text-sm font-medium text-slate-700">
      {field.label}
      <input
        name={field.name}
        type={field.type === "number" ? "number" : field.type ?? "text"}
        required
        min={field.type === "number" ? 0 : undefined}
        defaultValue={value === undefined || value === null ? "" : String(value)}
        className={commonClass}
      />
    </label>
  );
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read the selected image."));
    });
    reader.addEventListener("error", () => reject(new Error("Could not read the selected image.")));
    reader.readAsDataURL(file);
  });
}

function displayTitle(resource: Resource, item: ContentItem) {
  const key = resource === "courses" || resource === "services"
    ? "title"
    : resource === "faqs"
      ? "question"
      : resource === "testimonials"
        ? "author"
        : "companyName";
  return stringValue(item[key]) || "Untitled";
}

function displaySubtitle(resource: Resource, item: ContentItem) {
  const key = resource === "courses" || resource === "services"
    ? "description"
    : resource === "faqs"
      ? "answer"
      : resource === "testimonials"
        ? "quote"
        : "tagline";
  return stringValue(item[key]);
}
