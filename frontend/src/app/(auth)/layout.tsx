import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center bg-bone px-5 py-16">
      <Link
        href="/"
        className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-line/70 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-accent hover:text-accent sm:left-8 sm:top-8"
      >
        <span aria-hidden>←</span> Back
      </Link>
      <Link href="/" className="mb-10 font-display text-2xl italic text-ink">
        Shoplux
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
