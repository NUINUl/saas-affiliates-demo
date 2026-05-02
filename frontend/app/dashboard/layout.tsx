import Link from "next/link";
import type { Metadata } from "next";
import { AuthGate } from "@/components/AuthGate";

export const metadata: Metadata = {
  title: "Dashboard · Affiliate Portal",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <div className="flex min-h-screen bg-slate-50">
        <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white px-6 py-8 md:flex md:flex-col">
          <Link href="/" className="text-sm font-semibold tracking-tight text-slate-900">
            Affiliate Portal
          </Link>
          <nav className="mt-10 flex flex-col gap-2 text-sm font-medium text-slate-600">
            <span className="rounded-lg bg-slate-100 px-3 py-2 text-slate-900">
              Overview
            </span>
            <Link href="/" className="rounded-lg px-3 py-2 hover:bg-slate-50 hover:text-slate-900">
              Marketing site
            </Link>
          </nav>
          <div className="mt-auto pt-10 text-xs text-slate-400">
            PoC · Metrics refresh on load
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 md:hidden">
            <Link href="/dashboard" className="text-sm font-semibold text-slate-900">
              Dashboard
            </Link>
            <Link href="/" className="text-xs font-medium text-blue-700">
              Home
            </Link>
          </header>
          <div className="flex-1 px-6 py-10 md:px-12 md:py-12">{children}</div>
        </div>
      </div>
    </AuthGate>
  );
}
