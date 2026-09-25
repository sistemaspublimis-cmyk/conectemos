"use client";

import { matchAdminSection } from "@/lib/admin-section-copy";

export function AdminSectionGate({
  pathname,
  open,
  onEnter,
}: {
  pathname: string;
  open: boolean;
  onEnter: () => void;
}) {
  const copy = matchAdminSection(pathname);
  if (!open || !copy || copy.href === "/admin") return null;

  return (
    <div
      className="admin-overlay admin-overlay-section"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-section-title"
    >
      <div className="admin-section-card">
        <p className="admin-intro-kicker">¿Qué es {copy.title}?</p>
        <h2 id="admin-section-title">{copy.title}</h2>
        <p className="admin-section-lead">{copy.lead}</p>
        <ul>
          {copy.bullets.slice(0, 3).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <button type="button" className="btn btn-gold admin-overlay-enter" onClick={onEnter}>
          Continuar
        </button>
      </div>
    </div>
  );
}
