"use client";

import { DEMO_ANNUAL_RATE, estimatedMonthly } from "@/lib/finance-demo";
import { formatMXN } from "@/lib/money";

const TERMS = [12, 24, 36, 48, 60];
const MIN = 10_000;
const MAX = 500_000;
const STEP = 1_000;

export function AmountCalculator({
  amount,
  termMonths,
  onAmountChange,
  onTermChange,
}: {
  amount: number;
  termMonths: number;
  onAmountChange: (value: number) => void;
  onTermChange: (value: number) => void;
}) {
  const safeAmount = Math.min(MAX, Math.max(MIN, amount || MIN));
  const safeTerm = TERMS.includes(termMonths) ? termMonths : 24;
  const monthly = estimatedMonthly(safeAmount, safeTerm, DEMO_ANNUAL_RATE);

  return (
    <div className="card p-5 md:p-6 grid gap-5">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--muted)]">Monto solicitado</p>
        <div className="money text-[32px] md:text-4xl mt-1">{formatMXN(safeAmount)}</div>
      </div>
      <label className="grid gap-2">
        <span className="sr-only">Monto</span>
        <input
          className="amount-slider"
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={safeAmount}
          onChange={(e) => onAmountChange(Number(e.target.value))}
        />
        <div className="flex justify-between text-[11px] text-[var(--muted)]">
          <span>{formatMXN(MIN)}</span>
          <span>{formatMXN(MAX)}</span>
        </div>
      </label>
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--muted)] mb-2">Plazo</p>
        <div className="flex flex-wrap gap-2">
          {TERMS.map((term) => (
            <button
              key={term}
              type="button"
              className={`term-chip ${term === safeTerm ? "active" : ""}`}
              onClick={() => onTermChange(term)}
            >
              {term} meses
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-2xl bg-[#f4faf7] border border-[#dceae3] p-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--muted)]">Mensualidad estimada</p>
          <div className="money text-2xl mt-1">{formatMXN(monthly)}</div>
        </div>
        <span className="text-xs text-[var(--muted)]">{safeTerm} meses</span>
      </div>
      <p className="text-xs leading-relaxed text-[#5c6b73] bg-[#f3f8fb] rounded-xl px-3 py-2">
        La tasa puede variar según tu estatus financiero y el monto solicitado. Esta mensualidad es una estimación; las condiciones finales se confirman en tu oferta.
      </p>
    </div>
  );
}
