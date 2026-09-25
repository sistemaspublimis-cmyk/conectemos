import Link from "next/link";

export function ProductCard({
  title,
  kicker = "Producto Conectemos",
  description,
  href,
  badge = "Próximamente",
  icon,
}: {
  title: string;
  kicker?: string;
  description: string;
  href: string;
  badge?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link href={href} className="product-card bank-card fade-up">
      <div className="product-card-head">
        <span className="product-card-icon" aria-hidden>
          {icon ?? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M4 19V7l8-4 8 4v12" />
              <path d="M12 11v8" />
            </svg>
          )}
        </span>
        <span className="badge badge-gold">{badge}</span>
      </div>
      <p className="product-card-kicker">{kicker}</p>
      <h3>{title}</h3>
      <p className="product-card-copy">{description}</p>
      <span className="product-card-cta">
        Conocer más <span aria-hidden>→</span>
      </span>
    </Link>
  );
}
