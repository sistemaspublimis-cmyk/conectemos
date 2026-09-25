import { LockedCard } from "@/components/client/locked-card";

const PROFILES = [
  {
    title: "Conservador",
    copy: "Prioriza preservar capital con menor exposición a mercado.",
  },
  {
    title: "Equilibrio",
    copy: "Combina estabilidad y crecimiento para un horizonte medio.",
  },
  {
    title: "Crecimiento",
    copy: "Busca mayor rendimiento en un horizonte largo.",
  },
];

export default function InversionesPage() {
  return (
    <div className="product-page">
      <section className="product-hero fade-up">
        <p className="client-kicker">Producto Conectemos</p>
        <span className="badge badge-gold product-hero-badge">Próximamente</span>
        <h1>Inversiones</h1>
        <p className="product-hero-lead">
          Estamos habilitando inversiones en tu cuenta. Mientras tanto puedes conocer los perfiles disponibles.
        </p>
      </section>

      <LockedCard title="Inversiones en habilitación" badge="Próximamente" href="/mi-cuenta" cta="Volver al inicio">
        En breve podrás contratar desde aquí. Un asesor te avisará cuando el producto quede activo en tu expediente.
      </LockedCard>

      <section className="fade-up delay-1">
        <h2 className="client-section-title">Perfiles de inversión</h2>
        <p className="client-section-copy">
          Conservador busca preservar en un horizonte corto. Equilibrio mezcla estabilidad y crecimiento en un horizonte
          medio. Crecimiento acepta más variación a cambio de un horizonte largo. El plazo y las condiciones se
          confirman cuando Conectemos habilita el producto en tu expediente.
        </p>
        <div className="product-grid">
          {PROFILES.map((profile) => (
            <article key={profile.title} className="card p-5 bank-card">
              <p className="product-card-kicker">Perfil</p>
              <h3 className="text-lg font-extrabold text-[var(--verde2)] m-0">{profile.title}</h3>
              <p className="product-card-copy mt-2">{profile.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <article className="card p-5 bank-card fade-up delay-2">
        <h2 className="client-section-title">Composición de referencia</h2>
        <p className="client-section-copy">Distribución típica de un portafolio equilibrado.</p>
        <ul className="alloc-list">
          <li>
            <span>Liquidez</span>
            <b>40%</b>
            <i style={{ width: "40%" }} />
          </li>
          <li>
            <span>Renta fija</span>
            <b>35%</b>
            <i style={{ width: "35%" }} />
          </li>
          <li>
            <span>Crecimiento</span>
            <b>25%</b>
            <i style={{ width: "25%" }} />
          </li>
        </ul>
      </article>
    </div>
  );
}
