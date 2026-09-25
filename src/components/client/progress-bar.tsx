"use client";

import { useEffect, useState } from "react";
import type { ClientJourney } from "@/lib/process";

export function ProgressBar({
  journey,
  current,
  total,
  percent,
  label,
}: {
  journey?: ClientJourney;
  current?: number;
  total?: number;
  percent?: number;
  label?: string;
}) {
  const stepNumber = journey ? journey.currentIndex + 1 : current ?? 1;
  const stepTotal = journey ? journey.steps.length : total ?? 9;
  const realPercent = journey ? journey.percent : percent ?? 0;
  const stepLabel = journey ? journey.currentLabel : label ?? "";
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setWidth(Math.max(0, Math.min(100, realPercent))));
    return () => cancelAnimationFrame(id);
  }, [realPercent]);

  return (
    <div className="fade-up mb-6">
      <div className="flex items-end justify-between gap-3 mb-2">
        <div>
          <p className="text-[11px] font-extrabold tracking-wide uppercase text-[var(--muted)]">
            Paso {stepNumber} de {stepTotal}
            {stepLabel ? ` · ${stepLabel}` : ""}
          </p>
          {journey?.steps[journey.currentIndex]?.hint && (
            <p className="text-xs text-[var(--muted)] mt-1">{journey.steps[journey.currentIndex]?.hint}</p>
          )}
        </div>
        <b className="text-sm text-[var(--verde2)] tabular-nums">{realPercent}%</b>
      </div>
      <div className="progress-track" role="progressbar" aria-valuenow={realPercent} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-fill" style={{ width: `${width}%` }} />
      </div>
      {journey && (
        <div className="hidden sm:flex gap-1 mt-3">
          {journey.steps.map((step) => (
            <span
              key={step.key}
              title={step.label}
              className={`h-1.5 flex-1 rounded-full ${
                step.state === "done" ? "bg-[var(--verde)]" : step.state === "active" ? "bg-[var(--dorado)]" : "bg-[#e6eeeb]"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
