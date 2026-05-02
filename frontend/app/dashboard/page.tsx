"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatGrid } from "@/components/dashboard/StatGrid";
import { apiFetch, clearStoredToken, getStoredToken } from "@/lib/api";

type RecentReferral = {
  id: number;
  referred_user: { name: string; email: string } | null;
  commission_amount: string;
  status: string;
  created_at: string | null;
};

type DashboardPayload = {
  referral_code: string;
  balance: string;
  total_clicks: number;
  earned_commissions: string;
  successful_registrations: number;
  recent_referrals: RecentReferral[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareUrl, setShareUrl] = useState("");

  const money = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      }),
    []
  );

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;

    void (async () => {
      try {
        const res = await apiFetch("/api/affiliate/dashboard", {
          token,
        });
        const payload = await res.json().catch(() => null);
        if (!res.ok) {
          setError(payload?.message || "Unable to load dashboard.");
          return;
        }
        setData(payload as DashboardPayload);
      } catch {
        setError("Network error. Is the API running?");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!data?.referral_code || typeof window === "undefined") return;
    setShareUrl(
      `${window.location.origin}/?ref=${encodeURIComponent(data.referral_code)}`
    );
  }, [data?.referral_code]);

  async function logout() {
    const token = getStoredToken();
    if (token) {
      try {
        await apiFetch("/api/logout", {
          method: "POST",
          token,
        });
      } catch {
        //
      }
    }
    clearStoredToken();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
      <PageHeader
        title="Overview"
        description="Performance from tracked referral links and attributed registrations."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:border-slate-400"
            >
              View landing
            </Link>
            <button
              type="button"
              onClick={() => void logout()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Sign out
            </button>
          </div>
        }
      />

      {loading ? (
        <p className="text-sm text-slate-600">Loading metrics…</p>
      ) : null}

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {data ? (
        <>
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Your referral link
                </p>
                <p className="mt-2 font-mono text-lg font-semibold text-slate-900">
                  {data.referral_code}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Current balance ·{" "}
                  <span className="font-semibold text-slate-900">
                    {money.format(Number(data.balance))}
                  </span>
                </p>
              </div>
              <div className="space-y-2 md:text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Share URL
                </p>
                <p className="break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-800 md:text-sm">
                  {shareUrl ||
                    `/?ref=${encodeURIComponent(data.referral_code)}`}
                </p>
              </div>
            </div>
          </section>

          <StatGrid>
            <MetricCard
              label="Total link clicks"
              value={new Intl.NumberFormat().format(data.total_clicks)}
              hint="Counted when visitors hit your tracked referral URL."
            />
            <MetricCard
              label="Earned commissions"
              value={money.format(Number(data.earned_commissions))}
              hint="Sum of referral commissions marked as paid."
            />
            <MetricCard
              label="Successful registrations"
              value={new Intl.NumberFormat().format(data.successful_registrations)}
              hint="Users attributed to your affiliate profile."
            />
          </StatGrid>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Recent referrals
              </h2>
              <p className="text-xs text-slate-500">
                Latest rows from your referrals table.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Member</th>
                    <th className="px-6 py-3">Commission</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                  {data.recent_referrals.length === 0 ? (
                    <tr>
                      <td className="px-6 py-6 text-center text-slate-500" colSpan={4}>
                        No referrals yet — share your link to get started.
                      </td>
                    </tr>
                  ) : (
                    data.recent_referrals.map((row) => (
                      <tr key={row.id}>
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">
                            {row.referred_user?.name ?? "Unknown"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {row.referred_user?.email ?? "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs">
                          {money.format(Number(row.commission_amount))}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-700">
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {row.created_at
                            ? new Date(row.created_at).toLocaleString()
                            : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
