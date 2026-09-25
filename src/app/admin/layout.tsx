import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { adminCounts, adminGuideStats } from "@/lib/admin-counts";
import { AdminShell } from "@/components/admin/shell";
import { Heartbeat } from "@/components/heartbeat";
import { canAccessAdminPath } from "@/lib/staff";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireAdmin();
  if (!ctx) redirect("/login");
  const path = (await headers()).get("x-pathname") || "/admin";
  if (!canAccessAdminPath(ctx.user.role, path)) redirect("/admin");
  const [counts, guide] = await Promise.all([adminCounts(), adminGuideStats()]);
  return (
    <AdminShell
      name={`${ctx.user.firstName} ${ctx.user.lastName}`}
      role={ctx.user.role}
      counts={counts}
      guide={guide}
    >
      <Heartbeat />
      {children}
    </AdminShell>
  );
}
