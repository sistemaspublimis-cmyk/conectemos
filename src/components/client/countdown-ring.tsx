"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { REVIEW_WINDOW_MS } from "@/lib/process";

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatHms(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function CountdownRing({
  startedAt,
  durationMs = REVIEW_WINDOW_MS,
}: {
  startedAt: string | Date;
  durationMs?: number;
}) {
  const start = useMemo(() => new Date(startedAt).getTime(), [startedAt]);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const elapsed = now == null ? 0 : Math.max(0, now - start);
  const remaining = Math.max(0, durationMs - elapsed);
  const progress = durationMs <= 0 ? 1 : Math.min(1, elapsed / durationMs);
  const expired = now != null && remaining <= 0;
  const fired = useRef(false);

  useEffect(() => {
    if (!expired || fired.current) return;
    fired.current = true;
    fetch("/api/revision/auto", { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        if (data?.approved && data.redirect) window.location.href = data.redirect;
        else window.location.reload();
      })
      .catch(() => {});
  }, [expired]);

  return (
    <div className="countdown-wrap fade-up">
      <div className="countdown-ring">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle className="countdown-track" cx="60" cy="60" r={RADIUS} />
          <circle
            className="countdown-fill"
            cx="60"
            cy="60"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * progress}
          />
        </svg>
        <div className="countdown-time tabular-nums">{expired ? "00:00:00" : formatHms(remaining)}</div>
      </div>
      {expired ? (
        <div className="notice notice-green text-left mt-4">
          <b>La ventana de revisión concluyó.</b>
          <div className="mt-1">Estamos confirmando la autorización de tu crédito.</div>
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)] mt-3">Tiempo estimado de revisión inicial: 1 hora.</p>
      )}
    </div>
  );
}
