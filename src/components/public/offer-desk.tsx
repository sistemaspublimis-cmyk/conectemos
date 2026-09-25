"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { solicitudHref } from "@/lib/product-catalog";

type Line = {
  slug: string;
  name: string;
  min: number;
  max: number;
  step: number;
  start: number;
  terms: number[];
  startTerm: number;
  rate: number;
  mode: "mensual" | "anticipo";
  cta: string;
};

const LINES: Line[] = [
  {
    slug: "credito-personal",
    name: "Personal",
    min: 50000,
    max: 1000000,
    step: 10000,
    start: 150000,
    terms: [12, 24, 36, 48],
    startTerm: 24,
    rate: 0.024,
    mode: "mensual",
    cta: "Pedir crédito personal",
  },
  {
    slug: "credito-nomina",
    name: "Nómina",
    min: 50000,
    max: 500000,
    step: 10000,
    start: 120000,
    terms: [12, 18, 24, 36],
    startTerm: 24,
    rate: 0.02,
    mode: "mensual",
    cta: "Pedir crédito de nómina",
  },
  {
    slug: "credito-pyme",
    name: "PyME",
    min: 200000,
    max: 10000000,
    step: 100000,
    start: 800000,
    terms: [12, 18, 24, 36],
    startTerm: 24,
    rate: 0.022,
    mode: "mensual",
    cta: "Pedir crédito PyME",
  },
  {
    slug: "credito-automotriz",
    name: "Auto",
    min: 50000,
    max: 2000000,
    step: 10000,
    start: 350000,
    terms: [24, 36, 48, 60],
    startTerm: 48,
    rate: 0.016,
    mode: "mensual",
    cta: "Pedir crédito automotriz",
  },
  {
    slug: "arrendamiento-financiero",
    name: "Arrendamiento",
    min: 100000,
    max: 10000000,
    step: 100000,
    start: 800000,
    terms: [24, 36, 48],
    startTerm: 36,
    rate: 0.017,
    mode: "mensual",
    cta: "Pedir arrendamiento",
  },
  {
    slug: "factoraje",
    name: "Factoraje",
    min: 50000,
    max: 10000000,
    step: 50000,
    start: 400000,
    terms: [30, 60, 90],
    startTerm: 30,
    rate: 0,
    mode: "anticipo",
    cta: "Pedir factoraje",
  },
];

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

function cuota(principal: number, months: number, rate: number) {
  const factor = Math.pow(1 + rate, months);
  return Math.round((principal * rate * factor) / (factor - 1));
}

export function OfferDesk() {
  const [slug, setSlug] = useState(LINES[0].slug);
  const [amount, setAmount] = useState(LINES[0].start);
  const [term, setTerm] = useState(LINES[0].startTerm);
  const line = LINES.find((item) => item.slug === slug) ?? LINES[0];

  function pick(next: Line) {
    setSlug(next.slug);
    setAmount(next.start);
    setTerm(next.startTerm);
  }

  const result = useMemo(() => {
    if (line.mode === "anticipo") return Math.round(amount * 0.8);
    return cuota(amount, term, line.rate);
  }, [amount, term, line]);

  const href = solicitudHref(line.slug, { monto: amount, plazo: line.mode === "mensual" ? term : undefined });

  return (
    <form className="pub-sim" onSubmit={(event) => event.preventDefault()}>
      <p className="pub-kicker">Arma tu solicitud</p>
      <div className="pub-sim-picks" role="group" aria-label="Tipo de crédito">
        {LINES.map((item) => (
          <button key={item.slug} type="button" className={item.slug === slug ? "is-on" : ""} onClick={() => pick(item)}>
            {item.name}
          </button>
        ))}
      </div>
      <label className="pub-sim-amount">
        <span>{line.mode === "anticipo" ? "Tus facturas" : "Monto"}</span>
        <strong>{money.format(amount)}</strong>
        <input
          type="range"
          min={line.min}
          max={line.max}
          step={line.step}
          value={amount}
          aria-valuetext={money.format(amount)}
          onChange={(event) => setAmount(Number(event.target.value))}
        />
      </label>
      <div className="pub-sim-terms" role="group" aria-label={line.mode === "anticipo" ? "Plazo de tus facturas" : "Plazo"}>
        {line.terms.map((item) => (
          <button key={item} type="button" className={item === term ? "is-on" : ""} onClick={() => setTerm(item)}>
            {line.mode === "anticipo" ? `${item} días` : `${item} meses`}
          </button>
        ))}
      </div>
      <div className="pub-sim-result" key={`${slug}-${amount}-${term}`}>
        <span>{line.mode === "anticipo" ? "Recibes desde" : "Desde"}</span>
        <b>{money.format(result)}</b>
        <span>{line.mode === "anticipo" ? "hoy, sobre este monto" : "al mes"}</span>
      </div>
      <Link href={href} className="btn btn-gold pub-sim-go">
        {line.cta}
      </Link>
      <Link href={`/productos/${line.slug}`} className="pub-sim-more">
        Ver qué incluye
      </Link>
    </form>
  );
}
