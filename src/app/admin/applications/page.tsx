"use client";

import { useCallback, useEffect, useState } from "react";

type AppStatus = "PENDING" | "REVIEWED" | "ACCEPTED" | "REJECTED";

interface Application {
  id: string; status: AppStatus; createdAt: string; matchScore: number | null;
  user: { id: string; name: string | null; email: string };
  job: { id: string; title: string; employer: { name: string | null; profile: { companyName: string | null } | null } };
}
interface AppsData { applications: Application[]; total: number; page: number; totalPages: number }

const STATUS: Record<AppStatus, { dot: string; label: string; bg: string }> = {
  PENDING:  { dot: "#F59E0B", label: "Хүлээгдэж буй", bg: "rgba(245,158,11,0.12)"  },
  REVIEWED: { dot: "#4B7BF5", label: "Хянагдсан",     bg: "rgba(75,123,245,0.12)"  },
  ACCEPTED: { dot: "#22C55E", label: "Хүлээн авсан",  bg: "rgba(34,197,94,0.12)"   },
  REJECTED: { dot: "#EF4444", label: "Татгалзсан",    bg: "rgba(239,68,68,0.12)"   },
};

const S = "#0F1624";
const B = "rgba(255,255,255,0.07)";

export default function AdminApplicationsPage() {
  const [data,          setData]          = useState<AppsData | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [statusFilter,  setStatusFilter]  = useState<AppStatus | "">("");
  const [page,          setPage]          = useState(1);
  const [statusDrafts,  setStatusDrafts]  = useState<Record<string, AppStatus>>({});
  const [saving,        setSaving]        = useState<string | null>(null);
  const [deleting,      setDeleting]      = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error,         setError]         = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const p = new URLSearchParams({ page: String(page), limit: "15" });
    if (statusFilter) p.set("status", statusFilter);
    fetch(`/api/admin/applications?${p}`)
      .then(async (r) => { if (!r.ok) throw new Error("Failed"); return r.json() as Promise<AppsData>; })
      .then((d) => { setData(d); setStatusDrafts(Object.fromEntries(d.applications.map((a) => [a.id, a.status]))); })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function saveStatus(appId: string) {
    const status = statusDrafts[appId]; if (!status) return;
    setSaving(appId); setError("");
    try {
      const r = await fetch(`/api/admin/applications/${appId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (!r.ok) { const p = (await r.json().catch(() => ({}))) as { error?: string }; throw new Error(p.error ?? "Failed"); }
      setData((prev) => prev ? { ...prev, applications: prev.applications.map((a) => a.id === appId ? { ...a, status } : a) } : prev);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setSaving(null); }
  }

  async function deleteApp(appId: string) {
    setDeleting(appId); setError("");
    try {
      const r = await fetch(`/api/admin/applications/${appId}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed");
      setData((prev) => prev ? { ...prev, applications: prev.applications.filter((a) => a.id !== appId), total: prev.total - 1 } : prev);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setDeleting(null); setConfirmDelete(null); }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.15)" }}>
          <i className="fa-solid fa-clipboard-list text-base" style={{ color: "#A855F7" }} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-white">Өргөдлүүд</h1>
          <p className="text-xs mt-0.5" style={{ color: "#4B5563" }}>
            {data ? `Нийт ${data.total.toLocaleString()} өргөдөл` : "Платформын бүх өргөдлүүд"}
          </p>
        </div>
      </div>

      {error && <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>{error}</div>}

      {/* Filter */}
      <div className="flex gap-3">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as AppStatus | ""); setPage(1); }}
          className="px-4 py-2.5 text-sm rounded-xl outline-none"
          style={{ background: S, border: `1px solid ${B}`, color: "#E5E7EB" }}>
          <option value="">Бүх төлөв</option>
          <option value="PENDING">Хүлээгдэж буй</option>
          <option value="REVIEWED">Хянагдсан</option>
          <option value="ACCEPTED">Хүлээн авсан</option>
          <option value="REJECTED">Татгалзсан</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: S, border: `1px solid ${B}` }}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${B}` }}>
                    {["Өргөдөл гаргагч", "Ажлын байр", "Тохирол", "Төлөв", "Огноо", ""].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#374151" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data?.applications.map((app) => {
                    const draft   = statusDrafts[app.id] ?? app.status;
                    const changed = draft !== app.status;
                    const st      = STATUS[draft];
                    return (
                      <tr key={app.id} className="transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        {/* Applicant */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                              style={{ background: st.dot + "25", color: st.dot }}>
                              {(app.user.name?.[0] ?? app.user.email[0]).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-white truncate">{app.user.name ?? "—"}</p>
                              <p className="text-xs truncate" style={{ color: "#4B5563" }}>{app.user.email}</p>
                            </div>
                          </div>
                        </td>
                        {/* Job */}
                        <td className="px-5 py-3.5">
                          <p className="text-xs font-medium truncate max-w-[160px]" style={{ color: "#9CA3AF" }}>{app.job.title}</p>
                          <p className="text-[11px] truncate" style={{ color: "#374151" }}>
                            {app.job.employer.profile?.companyName ?? app.job.employer.name ?? "Тодорхойгүй"}
                          </p>
                        </td>
                        {/* Match score */}
                        <td className="px-5 py-3.5">
                          {app.matchScore != null ? (
                            <span className="text-xs font-bold" style={{ color: app.matchScore >= 70 ? "#22C55E" : app.matchScore >= 40 ? "#F59E0B" : "#EF4444" }}>
                              {Math.round(app.matchScore)}%
                            </span>
                          ) : (
                            <span className="text-xs" style={{ color: "#374151" }}>—</span>
                          )}
                        </td>
                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <select value={draft}
                              onChange={(e) => setStatusDrafts((p) => ({ ...p, [app.id]: e.target.value as AppStatus }))}
                              className="text-xs rounded-lg px-2.5 py-1.5 outline-none font-semibold"
                              style={{ background: st.bg, border: `1px solid ${st.dot}40`, color: st.dot }}>
                              <option value="PENDING">Хүлээгдэж буй</option>
                              <option value="REVIEWED">Хянагдсан</option>
                              <option value="ACCEPTED">Хүлээн авсан</option>
                              <option value="REJECTED">Татгалзсан</option>
                            </select>
                            {changed && (
                              <button onClick={() => saveStatus(app.id)} disabled={saving === app.id}
                                className="text-xs px-3 py-1.5 rounded-lg font-bold text-white disabled:opacity-50 transition-opacity hover:opacity-80"
                                style={{ background: "#4B7BF5" }}>
                                {saving === app.id ? "..." : "Хадгал"}
                              </button>
                            )}
                          </div>
                        </td>
                        {/* Date */}
                        <td className="px-5 py-3.5 text-xs" style={{ color: "#374151" }}>
                          {new Date(app.createdAt).toLocaleDateString("mn-MN")}
                        </td>
                        {/* Actions */}
                        <td className="px-5 py-3.5">
                          {confirmDelete === app.id ? (
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => deleteApp(app.id)} disabled={deleting === app.id}
                                className="text-xs px-2.5 py-1.5 rounded-lg font-bold text-white disabled:opacity-50"
                                style={{ background: "#EF4444" }}>
                                {deleting === app.id ? "..." : "Устгах"}
                              </button>
                              <button onClick={() => setConfirmDelete(null)} className="text-xs px-2 py-1.5 rounded-lg" style={{ color: "#4B5563" }}>
                                Цуцлах
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDelete(app.id)}
                              className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10"
                              style={{ color: "#374151" }}>
                              <i className="fa-solid fa-trash text-sm" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {data?.applications.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-16 text-center text-sm" style={{ color: "#374151" }}>Өргөдөл олдсонгүй</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t" style={{ borderColor: B }}>
                <p className="text-xs" style={{ color: "#374151" }}>{data.page} / {data.totalPages} хуудас · {data.total} өргөдөл</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-1.5 rounded-lg disabled:opacity-30 transition-opacity hover:opacity-70"
                    style={{ background: "rgba(255,255,255,0.05)", color: "#E5E7EB" }}>
                    <i className="fa-solid fa-chevron-left text-sm" />
                  </button>
                  <button onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}
                    className="p-1.5 rounded-lg disabled:opacity-30 transition-opacity hover:opacity-70"
                    style={{ background: "rgba(255,255,255,0.05)", color: "#E5E7EB" }}>
                    <i className="fa-solid fa-chevron-right text-sm" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
