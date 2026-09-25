"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { BannerDTO } from "@/lib/banners";

export function BannerCarousel({ banners }: { banners: BannerDTO[] }) {
  const slides = banners.filter((b) => b.imageUrl);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [paused, slides.length]);

  if (!slides.length) return null;

  return (
    <section
      className="banner-hero fade-up"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carrusel"
      aria-label="Avisos de la financiera"
    >
      {slides.map((slide, i) => (
        <article
          key={slide.id}
          className={`banner-slide ${i === index ? "is-active" : ""}`}
          aria-hidden={i !== index}
        >
          <img src={slide.imageUrl} alt="" className="banner-slide-img" />
          <div className="banner-overlay">
            {slide.subtitle && <p className="banner-kicker">{slide.subtitle}</p>}
            <h2>{slide.title}</h2>
            <p className="banner-body">{slide.body}</p>
            {slide.cta && slide.href && (
              <Link href={slide.href} className="btn btn-gold banner-cta">
                {slide.cta}
              </Link>
            )}
          </div>
        </article>
      ))}
      {slides.length > 1 && (
        <div className="banner-dots">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Banner ${i + 1}: ${slide.title}`}
              aria-current={i === index}
              className={i === index ? "is-active" : ""}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
