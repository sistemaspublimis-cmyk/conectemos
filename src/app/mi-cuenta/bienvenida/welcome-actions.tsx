"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

async function markWelcomeSeen() {
  try {
    await fetch("/api/cuenta/welcome", { method: "POST" });
  } catch {
    /* el avance no debe bloquearse si el marcado falla */
  }
}

export function WelcomeLink({
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
    await markWelcomeSeen();
    router.push(href);
    router.refresh();
  }

  return (
    <button type="button" className={className} disabled={loading} onClick={go}>
      {loading ? "Continuando..." : children}
    </button>
  );
}
