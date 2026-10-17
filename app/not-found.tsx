import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">404</p>
      <h1 className="mt-3 text-3xl font-bold text-navy">Page not found</h1>
      <p className="mt-2 text-slate-600">The page you were looking for does not exist or may have moved.</p>
      <Link href="/" className="btn btn-primary mt-6">
        Return home
      </Link>
    </main>
  );
}
