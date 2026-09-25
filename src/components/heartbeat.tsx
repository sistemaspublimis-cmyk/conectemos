"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function Heartbeat() {
  const pathname = usePathname();
  useEffect(() => {
    fetch("/api/session/heartbeat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => null);
  }, [pathname]);
  return null;
}
