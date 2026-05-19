"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BriefcaseIcon, ChevronLeftIcon, ChevronRightIcon, ExternalLinkIcon, EyeIcon, EyeOffIcon, SearchIcon, TrashIcon } from "lucide-react";

interface Job {
  id: string; title: string; location: string; isActive: boolean;
  createdAt: string; jobType: string; category: string;
  employer: { name: string | null; email: string; profile: { companyName: string | null } | null };
  _count: { applications: number };
}
interface JobsData { jobs: Job[]; total: number; page: number; totalPages: number }

const S = "#0F1624";
const B = "rgba(255,255,255,0.07)";

export default function AdminJobsPage() {
  const [data,          setData]          = useState<JobsData | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [activeFilter,  setActiveFilter]  = useState<"" | "true" | "false">("");
  const [page,          setPage]          = useState(1);
  const [toggling,      setToggling]      = useState<string | null>(null);
  const [deleting,      setDeleting]      = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error,         setError]         = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const p = new URLSearchParams({ page: String(page), limit: "15" });
    if (search)       p.set("search", search);
    if (activeFilter) p.set("active", activeFilter);
    fetch(`/api/admin/jobs?${p}`)
      .then(async (r) => { if (!r.ok) throw new Error("Failed"); return r.json() as Promise<JobsData>; })
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, [page, search, activeFilter]);

  useEffect(() => { load(); }, [load]);

  async function toggleActive(job: Job) {
    setToggling(job.id);
    try {
      const r = await fetch(`/api/admin/jobs/${job.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !job.isActive }) });
      if (!r.ok) throw new Error("Failed");
      setData((prev) => prev ? { ...prev, jobs: prev.jobs.map((j) => j.id === job.id ? { ...j, isActive: !j.isActive } : j) } : prev);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setToggling(null); }
  }

  async function deleteJob(jobId: string) {
    setDeleting(jobId);
    try {
      const r = await fetch(`/api/admin/jobs/${jobId}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed");
      setData((prev) => prev ? { ...prev, jobs: prev.jobs.filter((j) => j.id !== jobId), total: prev.total - 1 } : prev);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setDeleting(null); setConfirmDelete(null); }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(245,158,11,0.15)" }}>
          <BriefcaseIcon className="h-5 w-5" style={{ color: "#F59E0B" }} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-white">Ажлын байр</h1>
          <p className="text-xs mt-0.5" style={{ color: "#4B5563" }}>
            {data ? `Нийт ${data.total.toLocaleString()} ажлын байр` : "Платформын бүх ажлын байрууд"}
          </p>
        </div>
      </div>

      {error && <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>{error}</div>}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#374151" }} />
          <input type="text" placeholder="Гарчгаар хайх..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none"
            style={{ background: S, border: `1px solid ${B}`, color: "#E5E7EB" }} />
        </div>
        <select value={activeFilter} onChange={(e) => { setActiveFilter(e.target.value as "" | "true" | "false"); setPage(1); }}
          className="px-4 py-2.5 text-sm rounded-xl outline-none"
          style={{ background: S, border: `1px solid ${B}`, color: "#E5E7EB" }}>
          <option value="">Бүх төлөв</option>
          <option value="true">Идэвхтэй</option>
          <option value="false">Идэвхгүй</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: S, border: `1px solid ${B}` }}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 rounded-full border-2 border-yellow-500/20 border-t-yellow-500 animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${B}` }}>
                    {["Ажлын байр", "Байгууллага", "Өргөдөл", "Төлөв", "Огноо", ""].map((h) => (
                      <th key={h} className="text-left px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#374151" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data?.jobs.map((job) => (
                    <tr key={job.id} className="transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      {/* Job */}
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-white truncate max-w-[200px]">{job.title}</p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: "#374151" }}>{job.location} · {job.jobType}</p>
                      </td>
                      {/* Employer */}
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-medium truncate max-w-[140px]" style={{ color: "#9CA3AF" }}>
                          {job.employer.profile?.companyName ?? job.employer.name ?? "Тодорхойгүй"}
                        </p>
                        <p className="text-[11px] truncate" style={{ color: "#374151" }}>{job.employer.email}</p>
                      </td>
                      {/* Apps count */}
                      <td className="px-5 py-3.5 text-xs font-semibold" style={{ color: "#9CA3AF" }}>
                        {job._count.applications}
                      </td>
                      {/* Status badge */}
                      <td className="px-5 py-3.5">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{
                          background: job.isActive ? "rgba(34,197,94,0.12)" : "rgba(107,114,128,0.12)",
                          color:      job.isActive ? "#22C55E"              : "#6B7280",
                        }}>
                          {job.isActive ? "Идэвхтэй" : "Идэвхгүй"}
                        </span>
                      </td>
                      {/* Date */}
                      <td className="px-5 py-3.5 text-xs" style={{ color: "#374151" }}>
                        {new Date(job.createdAt).toLocaleDateString("mn-MN")}
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => toggleActive(job)} disabled={toggling === job.id}
                            title={job.isActive ? "Идэвхгүй болгох" : "Идэвхжүүлэх"}
                            className="p-1.5 rounded-lg transition-colors disabled:opacity-40"
                            style={{ color: job.isActive ? "#F59E0B" : "#22C55E" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                            {job.isActive ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                          </button>
                          <Link href={`/jobs/${job.id}`} target="_blank"
                            className="p-1.5 rounded-lg transition-colors"
                            style={{ color: "#374151" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                            <ExternalLinkIcon className="h-4 w-4" />
                          </Link>
                          {confirmDelete === job.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => deleteJob(job.id)} disabled={deleting === job.id}
                                className="text-xs px-2.5 py-1.5 rounded-lg font-bold text-white disabled:opacity-50"
                                style={{ background: "#EF4444" }}>
                                {deleting === job.id ? "..." : "Устгах"}
                              </button>
                              <button onClick={() => setConfirmDelete(null)} className="text-xs px-2 py-1.5 rounded-lg" style={{ color: "#4B5563" }}>
                                Цуцлах
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDelete(job.id)}
                              className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10"
                              style={{ color: "#374151" }}>
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data?.jobs.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-16 text-center text-sm" style={{ color: "#374151" }}>Ажлын байр олдсонгүй</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t" style={{ borderColor: B }}>
                <p className="text-xs" style={{ color: "#374151" }}>{data.page} / {data.totalPages} хуудас · {data.total} ажлын байр</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-1.5 rounded-lg disabled:opacity-30 transition-opacity hover:opacity-70"
                    style={{ background: "rgba(255,255,255,0.05)", color: "#E5E7EB" }}>
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <button onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}
                    className="p-1.5 rounded-lg disabled:opacity-30 transition-opacity hover:opacity-70"
                    style={{ background: "rgba(255,255,255,0.05)", color: "#E5E7EB" }}>
                    <ChevronRightIcon className="h-4 w-4" />
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
