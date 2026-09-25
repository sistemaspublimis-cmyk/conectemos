"use client";

import { useEffect, useState } from "react";

export type StoryStep = {
  n: string;
  title: string;
  text: string;
  image: string;
};

export function StepStory({ steps }: { steps: StoryStep[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const step = steps[index] ?? steps[0];

  useEffect(() => {
    if (paused || steps.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % steps.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, [paused, steps.length]);

  if (!step) return null;

  return (
    <section className="pub-story" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="pub-wrap pub-story-grid">
        <div className="pub-story-visual">
          <img key={step.image} src={step.image} alt="" />
          <span>{step.n}</span>
        </div>
        <div>
          <p className="pub-kicker">Así lo pides</p>
          <h2>Cuatro movimientos. Tú avanzas.</h2>
          <div className="pub-story-list">
            {steps.map((item, i) => (
              <button key={item.n} type="button" className={i === index ? "is-on" : ""} onClick={() => setIndex(i)}>
                <b>{item.n}</b>
                <strong>{item.title}</strong>
                <p>{item.text}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
