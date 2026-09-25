"use client";

import { useState } from "react";
import { GUIDE_STEPS } from "@/lib/admin-guide";
import type { AdminGuideStats } from "@/lib/admin-counts";

export function AdminIntro({ stats }: { stats: AdminGuideStats }) {
  const [active, setActive] = useState(GUIDE_STEPS[0].id);
  const step = GUIDE_STEPS.find((s) => s.id === active) || GUIDE_STEPS[0];

  return (
    <section className="admin-intro-tour">
      <div className="admin-intro-hero">
        <div>
          <p className="admin-intro-kicker">Cómo se opera</p>
          <h2>Del registro al desembolso</h2>
          <p>
            Encuentra al cliente, abre su expediente, atiende la solicitud, revisa documentos y cierra con contrato y
            desembolso.
          </p>
        </div>
        <figure className="admin-intro-menu-shot">
          <img src="/admin-guide/dashboard-full.png" alt="Vista general del panel" />
          <figcaption>Tablero, menú y búsqueda</figcaption>
        </figure>
      </div>

      <div className="admin-intro-steps" role="tablist" aria-label="Recorrido del administrador">
        {GUIDE_STEPS.map((item) => {
          const on = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={on}
              className={on ? "is-on" : ""}
              onClick={() => setActive(item.id)}
            >
              <em>{item.n}</em>
              <span>{item.title}</span>
              <small>{item.pulse(stats)}</small>
            </button>
          );
        })}
      </div>

      <article className="admin-intro-detail">
        <div className="admin-intro-shot">
          <img src={step.image} alt={step.imageAlt} />
          <span className="admin-intro-pin">{step.where}</span>
        </div>
        <div className="admin-intro-how">
          <p className="admin-intro-kicker">Paso {step.n}</p>
          <h3>{step.title}</h3>
          <p className="admin-intro-pulse">{step.pulse(stats)}</p>
          <ul>
            {step.actions.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </article>
    </section>
  );
}
