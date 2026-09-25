"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

async function markSeen() {
  await fetch("/api/cuenta/approval-seen", { method: "POST" });
}

export function MarkApprovalSeen() {
  const router = useRouter();
  useEffect(() => {
    markSeen()
      .then(() => router.refresh())
      .catch(() => {});
  }, [router]);
  return null;
}

export function AutorizadoLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function go() {
    if (loading) return;
    setLoading(true);
    try {
      await markSeen();
    } catch {
      /* continuar */
    }
    router.push(href);
    router.refresh();
  }

  return (
    <button type="button" className={className} disabled={loading} onClick={go}>
      {loading ? "Abriendo..." : children}
    </button>
  );
}
