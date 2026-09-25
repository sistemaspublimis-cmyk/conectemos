"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type ReelCard = {
  image: string;
  title: string;
  text: string;
  href: string;
  cta: string;
};

export function PhotoReel({ cards }: { cards: ReelCard[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  function shift(direction: number) {
    const el = scroller.current;
    if (!el) return;
    const card = el.querySelector("article");
    const width = card ? card.getBoundingClientRect().width + 16 : 320;
    el.scrollBy({ left: direction * width, behavior: "smooth" });
  }

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => shift(1), 3800);
    return () => window.clearInterval(timer);
  }, [paused, cards.length]);

  return (
    <section className="pub-reel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="pub-wrap pub-reel-head">
        <div>
          <p className="pub-kicker">Pasa y elige</p>
          <h2>Otra forma de ver lo que puedes pedir.</h2>
        </div>
        <div className="pub-reel-nav">
          <button type="button" onClick={() => shift(-1)} aria-label="Anterior">
            ←
          </button>
          <button type="button" onClick={() => shift(1)} aria-label="Siguiente">
            →
          </button>
        </div>
      </div>
      <div className="pub-reel-track" ref={scroller}>
        {cards.map((card) => (
          <article key={card.title}>
            <img src={card.image} alt="" />
            <div>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <Link href={card.href}>{card.cta}</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
