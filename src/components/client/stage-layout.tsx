export function StageLayout({
  image,
  title,
  why,
  nextHint,
  children,
  eyebrow,
}: {
  image: string;
  title: string;
  why: string;
  nextHint?: string;
  children: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="fade-up grid gap-5">
      <div className="stage-hero">
        <img src={image} alt="" loading="lazy" />
      </div>
      <div>
        {eyebrow && (
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--dorado)] mb-1">{eyebrow}</p>
        )}
        <h1 className="text-2xl md:text-[28px] font-black text-[var(--verde2)] leading-tight">{title}</h1>
        <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed">{why}</p>
      </div>
      {children}
      {nextHint ? (
        <div className="notice notice-blue">
          <b>¿Qué sigue?</b>
          <div className="mt-1">{nextHint}</div>
        </div>
      ) : null}
    </div>
  );
}
