/** Tasa de referencia para el estimado de mensualidad. */
export const DEMO_ANNUAL_RATE = 0.24;

/**
 * Mensualidad estimada con amortización francesa (cuota fija).
 */
export function estimatedMonthly(
  principal: number,
  months: number,
  annualRate: number = DEMO_ANNUAL_RATE,
): number {
  if (!Number.isFinite(principal) || principal <= 0) return 0;
  if (!Number.isFinite(months) || months <= 0) return 0;
  const i = annualRate / 12;
  if (i === 0) return roundMoney(principal / months);
  const factor = (1 + i) ** months;
  return roundMoney((principal * (i * factor)) / (factor - 1));
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
