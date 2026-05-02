"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredToken } from "@/lib/api";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setAllowed(true);
  }, [router]);

  if (!allowed) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-600">
        Checking session…
      </div>
    );
  }

  return children;
}
