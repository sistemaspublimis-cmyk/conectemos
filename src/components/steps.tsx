export function Steps({
  items,
}: {
  items: { label: string; state: "done" | "active" | "pending" }[];
}) {
  return (
    <div className="step-row mb-5">
      {items.map((s, i) => (
        <div key={s.label} className={`step ${s.state}`}>
          <div className="dot">{s.state === "done" ? "✓" : i + 1}</div>
          <b className="block text-[10px] mt-2">{s.label}</b>
          <small className="text-[9px] text-[var(--muted)]">
            {s.state === "done" ? "Completado" : s.state === "active" ? "En proceso" : "Pendiente"}
          </small>
        </div>
      ))}
    </div>
  );
}
