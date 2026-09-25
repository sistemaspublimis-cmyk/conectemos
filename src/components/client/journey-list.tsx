import type { ClientJourneyStep } from "@/lib/client-journey-fallback";

export function JourneyList({
  steps,
  compact = false,
}: {
  steps: ClientJourneyStep[];
  compact?: boolean;
}) {
  return (
    <ol className={`journey-list ${compact ? "is-compact" : ""}`}>
      {steps.map((step) => (
        <li key={step.key} className={`journey-item journey-${step.state}`}>
          <span className="journey-mark" aria-hidden>
            {step.state === "done" ? "✓" : step.state === "active" ? "●" : "○"}
          </span>
          <div>
            <b>{step.label}</b>
            <small>{step.hint}</small>
          </div>
        </li>
      ))}
    </ol>
  );
}
