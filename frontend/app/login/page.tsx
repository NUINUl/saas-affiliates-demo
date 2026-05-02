"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { apiFetch, setStoredToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError((data && data.message) || "Unable to sign in.");
        return;
      }
      if (typeof data.access_token === "string") {
        setStoredToken(data.access_token);
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Is the API running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-lg items-center justify-between px-6 py-5">
          <Link href="/" className="text-sm font-semibold text-slate-900">
            Affiliate Portal
          </Link>
          <Link href="/register" className="text-sm font-medium text-blue-700 hover:text-blue-800">
            Create account
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Use the credentials you registered with locally.
          </p>

          <form className="mt-8 space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-slate-600">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-700/30 placeholder:text-slate-400 focus:border-blue-700 focus:ring-4"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-medium uppercase tracking-wide text-slate-600">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-700/30 placeholder:text-slate-400 focus:border-blue-700 focus:ring-4"
              />
            </div>

            {error ? (
              <p className="text-sm text-red-700" role="alert">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in…" : "Continue"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
