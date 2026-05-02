"use client";

import { useEffect, useRef } from "react";
import { apiFetch } from "@/lib/api";

const PENDING_REF_KEY = "pending_ref";

type Props = {
  referralCode?: string;
};

export function ReferralTracker({ referralCode }: Props) {
  const ran = useRef(false);

  useEffect(() => {
    if (!referralCode || ran.current) return;
    ran.current = true;

    const normalized = referralCode.trim().toUpperCase();
    if (!normalized) return;

    try {
      sessionStorage.setItem(PENDING_REF_KEY, normalized);
    } catch {
      // ignore quota / privacy mode
    }

    const dedupeKey = `ref_tracked_${normalized}`;
    try {
      if (sessionStorage.getItem(dedupeKey)) return;
    } catch {
      // continue without dedupe
    }

    void (async () => {
      try {
        await apiFetch("/api/track/click", {
          method: "POST",
          body: JSON.stringify({ ref: normalized }),
        });
        try {
          sessionStorage.setItem(dedupeKey, "1");
        } catch {
          //
        }
      } catch {
        // PoC: silent failure on network errors
      }
    })();
  }, [referralCode]);

  return null;
}

export function consumePendingReferralCode(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const code = sessionStorage.getItem(PENDING_REF_KEY);
    return code;
  } catch {
    return null;
  }
}

export function clearPendingReferralCode(): void {
  try {
    sessionStorage.removeItem(PENDING_REF_KEY);
  } catch {
    //
  }
}
