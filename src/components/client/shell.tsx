"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CLIENT_MOBILE_NAV, CLIENT_NAV, CLIENT_NAV_GROUPS, BRAND } from "@/lib/constants";

const SEEN_NEW_PRODUCTS_KEY = "conectemos-seen-new-products";
const NEW_PRODUCT_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

export type NewContractedProduct = {
  slug: string;
  contractedAt: string;
};

function isAhorroSlug(slug: string) {
  return slug === "fondo-ahorro" || slug === "ahorro" || slug === "cuenta-basica" || slug.includes("ahorro");
}

function newBadgeTimes(items: NewContractedProduct[]): Record<string, number> {
  const times: Record<string, number> = {};
  const now = Date.now();
  for (const item of items) {
    const at = Date.parse(item.contractedAt);
    if (!Number.isFinite(at) || now - at > NEW_PRODUCT_WINDOW_MS) continue;
    times["/mi-cuenta/productos"] = Math.max(times["/mi-cuenta/productos"] ?? 0, at);
    if (item.slug === "cuenta-digital") {
      times["/mi-cuenta/cuenta-digital"] = Math.max(times["/mi-cuenta/cuenta-digital"] ?? 0, at);
    }
    if (isAhorroSlug(item.slug)) {
      times["/mi-cuenta/ahorro"] = Math.max(times["/mi-cuenta/ahorro"] ?? 0, at);
    }
  }
  return times;
}

function loadSeenNewProducts(): Record<string, number> {
  try {
    const raw = localStorage.getItem(SEEN_NEW_PRODUCTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      const now = Date.now();
      return Object.fromEntries(parsed.filter((href): href is string => typeof href === "string").map((href) => [href, now]));
    }
    if (!parsed || typeof parsed !== "object") return {};
    const out: Record<string, number> = {};
    for (const [href, value] of Object.entries(parsed)) {
      if (typeof value === "number") out[href] = value;
      else if (value) out[href] = Date.now();
    }
    return out;
  } catch {
    return {};
  }
}

function saveSeenNewProducts(seen: Record<string, number>) {
  try {
    localStorage.setItem(SEEN_NEW_PRODUCTS_KEY, JSON.stringify(seen));
  } catch {
    // ignore quota / private mode
  }
}

function NavIcon({ name }: { name: string }) {
  const p = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "inicio":
      return (
        <svg {...p}>
          <path d="M4 11 12 4l8 7" />
          <path d="M6 10.5V20h12v-9.5" />
        </svg>
      );
    case "financiamiento":
      return (
        <svg {...p}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M3 10h18M7 15h4" />
        </svg>
      );
    case "oferta":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v8M9.5 10.5h5M9.5 13.5h5" />
        </svg>
      );
    case "documentos":
      return (
        <svg {...p}>
          <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
          <path d="M14 3v5h5M9 13h6M9 17h4" />
        </svg>
      );
    case "contrato":
      return (
        <svg {...p}>
          <path d="M5 4h10l4 4v12H5z" />
          <path d="M15 4v4h4M8 13h6M8 17h4" />
        </svg>
      );
    case "banco":
      return (
        <svg {...p}>
          <path d="M4 10h16M6 10v8M18 10v8M3 18h18M12 4 4 10h16z" />
        </svg>
      );
    case "desembolso":
      return (
        <svg {...p}>
          <path d="M12 3v12" />
          <path d="M8 11l4 4 4-4" />
          <path d="M5 19h14" />
        </svg>
      );
    case "ahorro":
      return (
        <svg {...p}>
          <path d="M12 20a7 7 0 0 0 7-7c0-5-7-10-7-10S5 8 5 13a7 7 0 0 0 7 7z" />
        </svg>
      );
    case "inversiones":
      return (
        <svg {...p}>
          <path d="M4 18V9M10 18V5M16 18v-6M20 18H3" />
        </svg>
      );
    case "productos":
      return (
        <svg {...p}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "cuenta":
      return (
        <svg {...p}>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20M7 15h4" />
        </svg>
      );
    case "avisos":
      return (
        <svg {...p}>
          <path d="M6 9a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
      );
    default:
      return (
        <svg {...p}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 19c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
        </svg>
      );
  }
}

function navActive(href: string, pathname: string) {
  if (href === "/mi-cuenta") return pathname === "/mi-cuenta";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isNeedsAuth(item: unknown) {
  return Boolean((item as { needsAuth?: boolean }).needsAuth);
}

function isNeedsSolicitud(item: unknown) {
  return Boolean((item as { needsSolicitud?: boolean }).needsSolicitud);
}

export function ClientShell({
  children,
  name,
  unread = 0,
  folio,
  authorized = false,
  hasSolicitud = false,
  newContracted = [],
}: {
  children: React.ReactNode;
  name: string;
  unread?: number;
  folio?: string;
  authorized: boolean;
  hasSolicitud?: boolean;
  newContracted?: NewContractedProduct[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [seenNew, setSeenNew] = useState<Record<string, number>>({});
  const [seenReady, setSeenReady] = useState(false);
  const first = name.split(" ")[0] || "Cliente";
  const newAt = useMemo(() => newBadgeTimes(newContracted), [newContracted]);

  useEffect(() => {
    setSeenNew(loadSeenNewProducts());
    setSeenReady(true);
  }, []);

  function markNewSeen(href: string) {
    if (!newAt[href]) return;
    setSeenNew((prev) => {
      const next = { ...prev, [href]: Date.now() };
      saveSeenNewProducts(next);
      return next;
    });
  }

  function showNewBadge(href: string) {
    if (!seenReady) return false;
    const at = newAt[href];
    if (!at) return false;
    const seenAt = seenNew[href];
    return !seenAt || seenAt < at;
  }
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const navItems = CLIENT_NAV.filter((item) => {
    if (isNeedsAuth(item) && !authorized) return false;
    if (isNeedsSolicitud(item) && !hasSolicitud) return false;
    return true;
  });
  const grouped = CLIENT_NAV_GROUPS.map((group) => ({
    ...group,
    items: navItems.filter((item) => item.group === group.id),
  })).filter((group) => group.items.length > 0);

  const mobileNav = CLIENT_MOBILE_NAV.filter((item) => {
    if (isNeedsAuth(item) && !authorized) return false;
    if (isNeedsSolicitud(item) && !hasSolicitud) return false;
    if (item.href === "/mi-cuenta/solicitud" && authorized) return false;
    return true;
  });

  function NavLinks({ onNavigate, withGroups = true }: { onNavigate?: () => void; withGroups?: boolean }) {
    const blocks = withGroups ? grouped : [{ id: "all", label: "", items: navItems }];
    return (
      <>
        {blocks.map((group) => (
          <div key={group.id} className="client-nav-group">
            {group.label ? <p className="client-nav-group-label">{group.label}</p> : null}
            {group.items.map((item) => {
              const active = navActive(item.href, pathname);
              const soon = "soon" in item && item.soon;
              const badge = "badge" in item && item.badge;
              const isNew = showNewBadge(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (isNew) markNewSeen(item.href);
                    onNavigate?.();
                  }}
                  className={`client-nav-link ${active ? "is-active" : ""}`}
                >
                  <span className="client-nav-ico">
                    <NavIcon name={item.icon} />
                  </span>
                  <span className="client-nav-text">{item.label}</span>
                  {isNew && <span className="client-nav-new">Nuevo</span>}
                  {soon && !isNew && <span className="client-nav-soon">Pronto</span>}
                  {badge && unread > 0 && <span className="client-nav-count">{unread > 9 ? "9+" : unread}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </>
    );
  }

  return (
    <div className="client-shell client-bank">
      <aside className="client-desktop-nav client-sidenav">
        <Link href="/mi-cuenta" className="client-sidenav-brand">
          <img src="/logo.png" alt="Conectemos" />
          <div>
            <b>{BRAND.short}</b>
            <small>Junto contigo</small>
          </div>
        </Link>
        <nav className="client-sidenav-nav">
          <NavLinks />
        </nav>
        <div className="client-help-card">
          <b>¿Necesitas ayuda?</b>
          <p>Nuestro equipo te acompaña en cada paso del trámite. Revisa tus avisos o continúa tu expediente.</p>
          <Link href="/mi-cuenta/notificaciones">Ver avisos</Link>
        </div>
      </aside>

      <div className="client-frame">
        <header className="client-topbar">
          <button
            className="client-menu-btn"
            onClick={() => setMenu((v) => !v)}
            aria-label={menu ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menu}
          >
            {menu ? "✕" : "☰"}
          </button>
          <Link href="/mi-cuenta" className="client-top-brand">
            <img src="/logo.png" alt="Conectemos" />
            <div className="leading-tight hidden sm:block">
              <b className="block text-[12px] tracking-wide">
                {BRAND.short} <span className="text-[var(--dorado)]">JUNTO CONTIGO</span>
              </b>
              <small className="text-[9px] text-[#6a7873]">{BRAND.legal}</small>
            </div>
          </Link>
          {folio && (
            <div className="client-folio-chip" title="Folio de expediente">
              Folio <b>{folio}</b>
            </div>
          )}
          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            <Link href="/mi-cuenta/notificaciones" className="client-bell" aria-label="Notificaciones">
              <NavIcon name="avisos" />
              {unread > 0 && <span>{unread > 9 ? "9+" : unread}</span>}
            </Link>
            <div className="flex items-center gap-2">
              <div className="client-avatar">{initials}</div>
              <b className="hidden sm:block text-xs text-[var(--verde2)]">{first}</b>
            </div>
            <button onClick={logout} className="client-logout">
              Salir
            </button>
          </div>
        </header>

        <header className="bank-mobile-header">
          <button
            className="bank-mobile-menu"
            onClick={() => setMenu((v) => !v)}
            aria-label={menu ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menu}
          >
            {menu ? "✕" : "☰"}
          </button>
          <div className="bank-mobile-hello">
            <small>Hola</small>
            <b>{first}</b>
            {folio ? <span>Folio {folio}</span> : null}
          </div>
          <div className="bank-mobile-tools">
            <Link href="/mi-cuenta/notificaciones" className="bank-mobile-bell" aria-label="Notificaciones">
              <NavIcon name="avisos" />
              {unread > 0 && <em>{unread > 9 ? "9+" : unread}</em>}
            </Link>
            <button onClick={logout} className="bank-mobile-logout">
              Salir
            </button>
          </div>
        </header>

        {menu && (
          <div className="client-mobile-drawer">
            <NavLinks onNavigate={() => setMenu(false)} />
            <div className="client-help-card mt-4">
              <b>¿Necesitas ayuda?</b>
              <p>Estamos listos para apoyarte en tu trámite.</p>
            </div>
          </div>
        )}

        <div className="client-main">{children}</div>
      </div>

      <nav className="client-bottom">
        {mobileNav.map((item) => {
          const active = navActive(item.href, pathname);
          return (
            <Link key={item.href} href={item.href} className={`client-bottom-link ${active ? "is-active" : ""}`}>
              <b>
                <NavIcon name={item.icon} />
                {"badge" in item && item.badge && unread > 0 && <span>{unread > 9 ? "9+" : unread}</span>}
              </b>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
