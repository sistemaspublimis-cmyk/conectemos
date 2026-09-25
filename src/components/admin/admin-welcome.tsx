"use client";

import { useState } from "react";
import type { AdminGuideStats } from "@/lib/admin-counts";

const STEPS = [
  {
    q: "¿Qué es este panel?",
    title: "Bienvenido a Conectemos",
    body: "Aquí operas el crédito de cada persona: revisas su expediente, autorizas y das seguimiento. El cliente lo ve en su cuenta.",
  },
  {
    q: "¿Qué puedes hacer aquí?",
    title: "Cuatro cosas, todo el tiempo",
    cards: [
      { t: "Clientes", d: "Abres el expediente de cada persona." },
      { t: "Solicitudes", d: "Ves en qué paso va cada crédito." },
      { t: "Comprobantes", d: "Revisas INE, domicilio e ingresos." },
      { t: "Avisos", d: "Apruebas, pides datos o escribes al cliente." },
    ],
  },
  {
    q: "¿Cómo se opera un crédito?",
    title: "Del registro al desembolso",
    flow: ["Solicitud", "Estudio", "Comprobantes", "Aprobar", "Desembolso"],
    body: "Cada cliente tiene un expediente. Tú avanzas esos pasos. No hace falta entrar a todos los menús para operar.",
  },
  {
    q: "¿Dónde está cada cosa?",
    title: "El menú de la izquierda es el mapa",
    body: "Clientes y Solicitudes son el día a día. Documentos, desembolsos y avisos salen del expediente. Configuración es para el equipo y Gmail o WhatsApp.",
  },
  {
    q: "¿Qué sigue?",
    title: "Entra y abre un expediente",
    body: "Busca a la persona, revisa su estudio y comprobantes, y desde Avisos apruebas o le escribes. Puedes volver a esta guía con el signo de pregunta.",
  },
] as const;

export function AdminWelcome({
  name,
  stats,
  open,
  onEnter,
}: {
  name: string;
  stats: AdminGuideStats;
  open: boolean;
  onEnter: () => void;
}) {
  const [step, setStep] = useState(0);
  if (!open) return null;
  const first = name.split(" ")[0] || "Administrador";
  const current = STEPS[step];
  const last = step === STEPS.length - 1;
  const headline = stats.inProcess
    ? `${stats.inProcess} solicitud${stats.inProcess === 1 ? "" : "es"} en proceso`
    : "Panel al día";

  return (
    <div className="admin-overlay" role="dialog" aria-modal="true" aria-labelledby="admin-welcome-title">
      <div className="admin-onb">
        <header className="admin-onb-top">
          <img src="/logo.png" alt="" />
          <span>{headline}</span>
        </header>

        <p className="admin-onb-q">{current.q}</p>
        <div className="admin-onb-dots" aria-hidden="true">
          {STEPS.map((item, i) => (
            <span key={item.q} className={i === step ? "is-on" : i < step ? "is-done" : ""} />
          ))}
        </div>

        <div key={current.q} className="admin-onb-stage">
          <h1 id="admin-welcome-title">{step === 0 ? `Hola, ${first}` : current.title}</h1>
          {step === 0 ? <h2 className="admin-onb-sub">{current.title}</h2> : null}
          {"body" in current && current.body ? <p>{current.body}</p> : null}
          {"cards" in current && current.cards ? (
            <div className="admin-onb-cards">
              {current.cards.map((card) => (
                <article key={card.t}>
                  <strong>{card.t}</strong>
                  <span>{card.d}</span>
                </article>
              ))}
            </div>
          ) : null}
          {"flow" in current && current.flow ? (
            <ol className="admin-intro-flow admin-welcome-flow">
              {current.flow.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          ) : null}
        </div>

        <footer className="admin-onb-foot">
          {step > 0 ? (
            <button type="button" className="admin-onb-skip" onClick={() => setStep((s) => s - 1)}>
              Atrás
            </button>
          ) : (
            <span />
          )}
          <div className="admin-onb-actions">
            <button type="button" className="admin-onb-skip" onClick={onEnter}>
              Saltar y entrar
            </button>
            {last ? (
              <button type="button" className="btn btn-gold" onClick={onEnter}>
                Entrar al panel
              </button>
            ) : (
              <button type="button" className="btn btn-gold" onClick={() => setStep((s) => s + 1)}>
                {step === 0 ? "Comenzar" : "Continuar"}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
