"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import { BRAND } from "@/lib/constants";
import { AdminWelcome } from "@/components/admin/admin-welcome";
import { AdminSectionGate } from "@/components/admin/admin-section-gate";
import type { AdminGuideStats } from "@/lib/admin-counts";
import { ADMIN_WELCOME_KEY, matchAdminSection, sectionStorageKey } from "@/lib/admin-section-copy";
import { navGroupsForRole, ROLE_LABEL } from "@/lib/staff";
import type { Role } from "@prisma/client";

type Counts = Record<string, number>;

export function AdminShell({
  children,
  name,
  role,
  counts = {},
  guide,
}: {
  children: React.ReactNode;
  name: string;
  role: Role;
  counts?: Counts;
  guide: AdminGuideStats;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const [sectionOpen, setSectionOpen] = useState(false);
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useLayoutEffect(() => {
    const welcomeShown = sessionStorage.getItem(ADMIN_WELCOME_KEY) === "1";
    if (!welcomeShown) {
      setWelcomeOpen(true);
      setSectionOpen(false);
      return;
    }
    setWelcomeOpen(false);
    const section = matchAdminSection(pathname);
    if (section && section.href !== "/admin") {
      setSectionOpen(sessionStorage.getItem(sectionStorageKey(section.href)) !== "1");
    } else {
      setSectionOpen(false);
    }
  }, [pathname]);

  useLayoutEffect(() => {
    const lock = welcomeOpen || sectionOpen;
    const prev = document.body.style.overflow;
    document.body.style.overflow = lock ? "hidden" : "";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [welcomeOpen, sectionOpen]);

  function enterWelcome() {
    sessionStorage.setItem(ADMIN_WELCOME_KEY, "1");
    setWelcomeOpen(false);
    const section = matchAdminSection(pathname);
    if (section && section.href !== "/admin") {
      setSectionOpen(sessionStorage.getItem(sectionStorageKey(section.href)) !== "1");
    }
  }

  function enterSection() {
    const section = matchAdminSection(pathname);
    if (section) sessionStorage.setItem(sectionStorageKey(section.href), "1");
    setSectionOpen(false);
  }

  function reopenWelcome() {
    setSectionOpen(false);
    setWelcomeOpen(true);
  }

  function prepareSection(href: string) {
    setOpen(false);
    if (sessionStorage.getItem(ADMIN_WELCOME_KEY) !== "1") return;
    const section = matchAdminSection(href);
    if (section && section.href !== "/admin") {
      setSectionOpen(sessionStorage.getItem(sectionStorageKey(section.href)) !== "1");
    } else {
      setSectionOpen(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const groups = navGroupsForRole(role);
  const nav = (
    <nav className="admin-nav">
      {groups.map((group) => (
        <div key={group.id} className="admin-nav-group">
          <div className="menu-label">{group.label}</div>
          {group.items.map((item) => {
            const active =
              item.href === "/admin" ? pathname === "/admin" : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const count = item.countKey ? counts[item.countKey] || 0 : 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "active" : ""}
                onClick={() => prepareSection(item.href)}
              >
                <span className="w-[18px] text-center">{item.icon}</span>
                <span className="admin-nav-copy">
                  <b>{item.label}</b>
                  <small>{item.hint}</small>
                </span>
                {item.countKey ? <span className="count">{count}</span> : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src="/logo.png" alt={BRAND.legalFull} />
          <div>
            <b>
              {BRAND.short}
              <br />
              <span>JUNTO CONTIGO</span>
            </b>
            <small>{BRAND.legal}</small>
          </div>
        </div>
        {nav}
      </aside>
      <main className="min-w-0">
        <header className="admin-topbar">
          <button className="md:hidden text-2xl" onClick={() => setOpen(!open)}>
            ☰
          </button>
          <form
            className="flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              prepareSection("/admin/clientes");
              router.push(`/admin/clientes?q=${encodeURIComponent(q)}`);
            }}
          >
            <input
              className="w-full max-w-[420px] border border-[var(--line)] rounded-lg px-3 py-2 text-sm"
              placeholder="Buscar cliente, folio, correo, teléfono..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </form>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <button
              type="button"
              className="admin-help-btn"
              title="Ver guía del panel"
              aria-label="Ver guía del panel"
              onClick={reopenWelcome}
            >
              ?
            </button>
            <Link href="/admin/whatsapp" title="WhatsApp" onClick={() => prepareSection("/admin/whatsapp")}>
              ◉
            </Link>
            <Link href="/admin/correos" onClick={() => prepareSection("/admin/correos")}>
              ✉
            </Link>
            <Link href="/admin/notificaciones" onClick={() => prepareSection("/admin/notificaciones")}>
              ♧
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ddb38e] to-[#624130] text-white grid place-items-center font-black text-xs">
                {initials}
              </div>
              <div className="hidden sm:block leading-tight">
                <b className="block text-[11px]">{name}</b>
                <span className="text-[10px] text-[#777]">{ROLE_LABEL[role]}</span>
              </div>
            </div>
            <button onClick={logout} className="text-xs text-[var(--danger)]">
              Salir
            </button>
          </div>
        </header>
        {open && (
          <div className="md:hidden bg-[var(--verde2)] text-white p-3 max-h-[70vh] overflow-auto">{nav}</div>
        )}
        <div className="admin-content">{children}</div>
      </main>
      <AdminWelcome name={name} stats={guide} open={welcomeOpen} onEnter={enterWelcome} />
      <AdminSectionGate pathname={pathname} open={!welcomeOpen && sectionOpen} onEnter={enterSection} />
    </div>
  );
}
