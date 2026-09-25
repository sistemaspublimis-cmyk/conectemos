import Link from "next/link";

export function LockedCard({
  title,
  badge = "Próximamente",
  children,
  href,
  cta = "Ver más",
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
  href?: string;
  cta?: string;
}) {
  return (
    <article className="locked-card bank-card fade-up">
      <div className="locked-card-top">
        <span className="locked-icon" aria-hidden>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </span>
        <span className="badge badge-gold">{badge}</span>
      </div>
      <h2 className="locked-card-title">{title}</h2>
      <div className="locked-card-body">{children}</div>
      {href && (
        <Link href={href} className="locked-card-cta">
          {cta}
          <span aria-hidden>→</span>
        </Link>
      )}
    </article>
  );
}
