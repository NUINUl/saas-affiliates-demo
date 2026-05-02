"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  apiFetch,
  clearStoredToken,
  setStoredToken,
} from "@/lib/api";
import {
  clearPendingReferralCode,
  consumePendingReferralCode,
} from "@/components/ReferralTracker";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const pending = consumePendingReferralCode();
    if (pending) {
      setReferralCode((current) => current || pending);
    }
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    clearStoredToken();

    const payload: Record<string, string> = {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    };

    const trimmedRef = referralCode.trim().toUpperCase();
    if (trimmedRef) {
      payload.referral_code = trimmedRef;
    }

    try {
      const res = await apiFetch("/api/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const message =
          (data && (data.message || data.error)) ||
          "Unable to complete registration.";
        const errors =
          data && data.errors && typeof data.errors === "object"
            ? Object.values(data.errors).flat().join(" ")
            : "";
        setError(errors || message);
        return;
      }

      if (typeof data.access_token === "string") {
        setStoredToken(data.access_token);
      }

      clearPendingReferralCode();
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
          <Link href="/login" className="text-sm font-medium text-blue-700 hover:text-blue-800">
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Create account
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            You receive an affiliate profile with a unique referral code automatically.
          </p>

          <form className="mt-8 space-y-5" onSubmit={onSubmit}>
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-medium uppercase tracking-wide text-slate-600">
                Full name
              </label>
              <input
                id="name"
                required
                value={name}
                onChange={(ev) => setName(ev.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-700/30 focus:border-blue-700 focus:ring-4"
              />
            </div>

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
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-700/30 focus:border-blue-700 focus:ring-4"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="referral_code" className="text-xs font-medium uppercase tracking-wide text-slate-600">
                Referral code <span className="font-normal normal-case text-slate-400">(optional)</span>
              </label>
              <input
                id="referral_code"
                value={referralCode}
                onChange={(ev) => setReferralCode(ev.target.value)}
                placeholder="Pre-filled after visiting ?ref="
                className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm uppercase text-slate-900 outline-none ring-blue-700/30 placeholder:normal-case placeholder:text-slate-400 focus:border-blue-700 focus:ring-4"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-medium uppercase tracking-wide text-slate-600">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-700/30 focus:border-blue-700 focus:ring-4"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password_confirmation" className="text-xs font-medium uppercase tracking-wide text-slate-600">
                Confirm password
              </label>
              <input
                id="password_confirmation"
                type="password"
                autoComplete="new-password"
                required
                value={passwordConfirmation}
                onChange={(ev) => setPasswordConfirmation(ev.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-700/30 focus:border-blue-700 focus:ring-4"
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
              {loading ? "Creating…" : "Create account"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
