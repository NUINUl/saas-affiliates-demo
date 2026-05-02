import Link from "next/link";
import { ReferralTracker } from "@/components/ReferralTracker";

type PageProps = {
  searchParams: Promise<{ ref?: string }>;
};

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const ref = params.ref;

  return (
    <>
      <ReferralTracker referralCode={ref} />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-5">
          <Link href="/" className="text-sm font-semibold tracking-tight text-slate-900">
            Affiliate Portal
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="/login" className="hover:text-slate-900">
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-blue-700 px-4 py-2 text-white hover:bg-blue-800"
            >
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-16 px-6 py-16">
        <section className="max-w-2xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            SaaS Affiliate PoC
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            A calm, structured dashboard for affiliates.
          </h1>
          <p className="text-lg leading-relaxed text-slate-600">
            Track referral clicks, registrations attributed to your code, and commissions marked as paid —
            built as a modular prototype with Laravel and SQLite behind the scenes.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/register"
              className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Get started
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:border-slate-400"
            >
              Sign in
            </Link>
          </div>
        </section>

        <section className="grid gap-6 border-t border-slate-200 pt-16 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Referral links</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Append{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">
                ?ref=YOURCODE
              </code>{" "}
              to any landing URL. Clicks are recorded once per browser session.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Attribution</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              When someone registers after arriving with your code, they appear under successful registrations with pending commission until marked paid.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Design</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Slate surfaces, restrained blue accents, and generous whitespace — optimized for clarity, not spectacle.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        Local prototype · Next.js · Laravel · SQLite
      </footer>
    </>
  );
}
