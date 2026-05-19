"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRightIcon, BriefcaseIcon, BuildingIcon,
  ClipboardListIcon, UsersIcon, TrendingUpIcon,
  ActivityIcon, CircleIcon,
} from "lucide-react";

interface OverviewData {
  metrics: { usersCount: number; jobsCount: number; applicationsCount: number };
  roleCounts: Array<{ role: string; _count: { role: number } }>;
  recentUsers: Array<{ id: string; name: string | null; email: string; role: string; createdAt: string }>;
  recentJobs: Array<{
    id: string; title: string; location: string; isActive: boolean; createdAt: string;
    employer: { name: string | null; profile: { companyName: string | null } | null };
    _count: { applications: number };
  }>;
  recentApplications: Array<{
    id: string; status: string; createdAt: string;
    user: { email: string; name: string | null };
    job: { id: string; title: string };
  }>;
}

const STATUS_COLOR: Record<string, { dot: string; label: string }> = {
  PENDING:  { dot: "#F59E0B", label: "Хүлээгдэж буй" },
  REVIEWED: { dot: "#4B7BF5", label: "Хянагдсан"     },
  ACCEPTED: { dot: "#22C55E", label: "Хүлээн авсан"   },
  REJECTED: { dot: "#EF4444", label: "Татгалзсан"     },
};

const ROLE_COLOR: Record<string, string> = {
  JOBSEEKER: "#4B7BF5",
  EMPLOYER:  "#22C55E",
  ADMIN:     "#A855F7",
};

const CARD = "rounded-2xl border p-5" as const;
const BORDER = "rgba(255,255,255,0.07)" as const;
const SURFACE = "#0F1624" as const;

export default function AdminDashboard() {
  const [data, setData]       = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    fetch("/api/admin/overview")
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json() as Promise<OverviewData>;
      })
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, []);

  const roleTotals = useMemo(() => {
    const m: Record<string, number> = { JOBSEEKER: 0, EMPLOYER: 0, ADMIN: 0 };
    if (!data) return m;
    for (const r of data.roleCounts) m[r.role] = r._count.role;
    return m;
  }, [data]);

  if (loading)
    return (
      <div className="flex items-center justify-center py-40">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
      </div>
    );

  if (error || !data)
    return (
      <div className="rounded-xl px-5 py-4 text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
        {error || "Өгөгдөл ачааллахад алдаа гарлаа"}
      </div>
    );

  const stats = [
    { href: "/admin/users",        label: "Нийт хэрэглэгч", value: data.metrics.usersCount,        icon: UsersIcon,        color: "#4B7BF5", glow: "rgba(75,123,245,0.15)"  },
    { href: "/admin/users?role=EMPLOYER", label: "Байгууллага", value: roleTotals.EMPLOYER,         icon: BuildingIcon,     color: "#22C55E", glow: "rgba(34,197,94,0.12)"   },
    { href: "/admin/jobs",         label: "Ажлын байр",      value: data.metrics.jobsCount,         icon: BriefcaseIcon,    color: "#F59E0B", glow: "rgba(245,158,11,0.12)"  },
    { href: "/admin/applications", label: "Өргөдлүүд",       value: data.metrics.applicationsCount, icon: ClipboardListIcon, color: "#A855F7", glow: "rgba(168,85,247,0.12)" },
  ];

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Дашбоард</h1>
          <p className="text-sm mt-0.5" style={{ color: "#4B5563" }}>Платформын ерөнхий байдал</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.15)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Систем ажиллаж байна
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ href, label, value, icon: Icon, color, glow }) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl p-5 flex flex-col gap-4 transition-all hover:-translate-y-0.5 hover:shadow-lg group"
            style={{ background: SURFACE, border: `1px solid ${BORDER}`, boxShadow: `0 0 0 0 ${glow}` }}
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: glow }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <TrendingUpIcon className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }} />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white leading-none">{value.toLocaleString()}</p>
              <p className="text-xs mt-1.5 font-medium" style={{ color: "#4B5563" }}>{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Role breakdown */}
      <div className={CARD} style={{ background: SURFACE, borderColor: BORDER }}>
        <div className="flex items-center gap-2 mb-5">
          <ActivityIcon className="h-4 w-4" style={{ color: "#4B7BF5" }} />
          <h2 className="text-sm font-bold text-white">Хэрэглэгчдийн бүтэц</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Ажил хайгч",  count: roleTotals.JOBSEEKER, color: "#4B7BF5", pct: data.metrics.usersCount ? Math.round(roleTotals.JOBSEEKER / data.metrics.usersCount * 100) : 0 },
            { label: "Байгууллага", count: roleTotals.EMPLOYER,  color: "#22C55E", pct: data.metrics.usersCount ? Math.round(roleTotals.EMPLOYER  / data.metrics.usersCount * 100) : 0 },
            { label: "Админ",       count: roleTotals.ADMIN,     color: "#A855F7", pct: data.metrics.usersCount ? Math.round(roleTotals.ADMIN     / data.metrics.usersCount * 100) : 0 },
          ].map(({ label, count, color, pct }) => (
            <div key={label} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium" style={{ color: "#6B7280" }}>{label}</p>
                <p className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: color + "20", color }}>{pct}%</p>
              </div>
              <p className="text-2xl font-extrabold" style={{ color }}>{count}</p>
              <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent users */}
        <div className="rounded-2xl overflow-hidden" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <TableHeader label="Сүүлийн хэрэглэгчид" href="/admin/users" />
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {data.recentUsers.slice(0, 6).map((u) => (
              <div key={u.id} className="px-4 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 text-white"
                  style={{ background: (ROLE_COLOR[u.role] ?? "#4B5563") + "30", color: ROLE_COLOR[u.role] ?? "#4B5563" }}
                >
                  {(u.name?.[0] ?? u.email[0]).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate text-white">{u.name ?? u.email}</p>
                  <p className="text-[10px] truncate" style={{ color: "#4B5563" }}>{u.email}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: (ROLE_COLOR[u.role] ?? "#4B5563") + "20", color: ROLE_COLOR[u.role] ?? "#4B5563" }}>
                  {u.role === "JOBSEEKER" ? "Ажил хайгч" : u.role === "EMPLOYER" ? "Байгууллага" : "Админ"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent jobs */}
        <div className="rounded-2xl overflow-hidden" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <TableHeader label="Сүүлийн ажлын байр" href="/admin/jobs" />
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {data.recentJobs.slice(0, 6).map((j) => (
              <div key={j.id} className="px-4 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-white truncate">{j.title}</p>
                  <span className="text-[10px] font-bold shrink-0 px-1.5 py-0.5 rounded" style={{
                    background: j.isActive ? "rgba(34,197,94,0.12)" : "rgba(107,114,128,0.12)",
                    color:      j.isActive ? "#22C55E"              : "#6B7280",
                  }}>
                    {j.isActive ? "Идэвхтэй" : "Идэвхгүй"}
                  </span>
                </div>
                <p className="text-[10px] mt-1 truncate" style={{ color: "#4B5563" }}>
                  {j.employer.profile?.companyName ?? j.employer.name ?? "Тодорхойгүй"}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: "#374151" }}>
                  {j._count.applications} өргөдөл
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent applications */}
        <div className="rounded-2xl overflow-hidden" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <TableHeader label="Сүүлийн өргөдлүүд" href="/admin/applications" />
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
            {data.recentApplications.slice(0, 6).map((a) => {
              const st = STATUS_COLOR[a.status] ?? { dot: "#6B7280", label: a.status };
              return (
                <div key={a.id} className="px-4 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-xs font-semibold text-white truncate">{a.user.name ?? a.user.email}</p>
                    <span className="flex items-center gap-1 text-[10px] font-semibold shrink-0" style={{ color: st.dot }}>
                      <CircleIcon className="h-1.5 w-1.5 fill-current" />
                      {st.label}
                    </span>
                  </div>
                  <p className="text-[10px] truncate" style={{ color: "#4B5563" }}>{a.job.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function TableHeader({ label, href }: { label: string; href: string }) {
  return (
    <div className="px-4 py-3.5 flex items-center justify-between border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
      <h2 className="text-xs font-bold text-white uppercase tracking-wide">{label}</h2>
      <Link href={href} className="flex items-center gap-1 text-[11px] font-semibold transition-opacity hover:opacity-70" style={{ color: "#4B7BF5" }}>
        Бүгдийг харах <ArrowRightIcon className="h-3 w-3" />
      </Link>
    </div>
  );
}
