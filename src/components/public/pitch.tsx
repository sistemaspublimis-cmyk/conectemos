"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type PitchSlide = {
  image: string;
  kicker: string;
  title: string;
  text: string;
  href: string;
  cta: string;
};

export function Pitch({ slides }: { slides: PitchSlide[] }) {
  const root = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const el = root.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      const next = Math.min(slides.length - 1, Math.floor((scrolled / total) * slides.length));
      setIndex(next);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced, slides.length]);

  function go(next: number) {
    const el = root.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    const top = window.scrollY + el.getBoundingClientRect().top + (next / slides.length) * total + 4;
    window.scrollTo({ top, behavior: "smooth" });
    setIndex(next);
  }

  if (reduced) {
    return (
      <section className="pub-pitch is-flat">
        {slides.map((slide) => (
          <article key={slide.title} className="pub-pitch-slide is-on">
            <img src={slide.image} alt="" />
            <div className="pub-pitch-copy">
              <p className="pub-kicker">{slide.kicker}</p>
              <h2>{slide.title}</h2>
              <p>{slide.text}</p>
              <Link href={slide.href} className="btn btn-gold">
                {slide.cta}
              </Link>
            </div>
          </article>
        ))}
      </section>
    );
  }

  return (
    <section className="pub-pitch" ref={root} style={{ height: `${slides.length * 100}vh` }}>
      <div className="pub-pitch-sticky">
        {slides.map((slide, i) => (
          <article key={slide.title} className={i === index ? "pub-pitch-slide is-on" : "pub-pitch-slide"} aria-hidden={i !== index}>
            <img src={slide.image} alt="" />
            <div className="pub-pitch-copy">
              <p className="pub-kicker">{slide.kicker}</p>
              <h2>{slide.title}</h2>
              <p>{slide.text}</p>
              <Link href={slide.href} className="btn btn-gold" tabIndex={i === index ? 0 : -1}>
                {slide.cta}
              </Link>
            </div>
          </article>
        ))}
        <div className="pub-pitch-dots" role="tablist" aria-label="Presentación">
          {slides.map((slide, i) => (
            <button key={slide.title} type="button" className={i === index ? "is-on" : ""} aria-label={slide.title} aria-selected={i === index} onClick={() => go(i)} />
          ))}
        </div>
      </div>
    </section>
  );
}
