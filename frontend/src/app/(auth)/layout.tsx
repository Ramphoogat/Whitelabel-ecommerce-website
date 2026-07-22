import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-bone px-5 py-16">
      <Link href="/" className="mb-10 font-display text-2xl italic text-ink">
        Shoplux
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
