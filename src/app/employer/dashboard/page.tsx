"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Job {
  id: string; title: string; location: string;
  isActive: boolean; createdAt: string;
  _count: { applications: number };
}
interface Application {
  id: string; status: string; matchScore: number | null; createdAt: string;
  cvUrl: string | null;
  user: { name: string | null; email: string };
  job: { title: string };
}

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:  { label: "Хүлээгдэж байна", bg: "#FFFBEB", color: "#B45309" },
  REVIEWED: { label: "Хянагдаж байна",  bg: "#EFF6FF", color: "#1D4ED8" },
  ACCEPTED: { label: "Хүлээн авсан",    bg: "#F0FDF4", color: "#15803D" },
  REJECTED: { label: "Татгалзсан",      bg: "#FEF2F2", color: "#DC2626" },
};

export default function EmployerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (status === "authenticated" && session?.user.role === "ADMIN") router.push("/admin");
    else if (status === "authenticated" && session?.user.role !== "EMPLOYER") router.push("/dashboard");
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user.role === "EMPLOYER") {
      Promise.all([
        fetch("/api/employer/jobs").then((r) => r.json()),
        fetch("/api/employer/applications").then((r) => r.json()),
      ]).then(([j, a]) => { setJobs(j); setApplications(a); setLoading(false); });
    }
  }, [session]);

  async function deleteJob(jobId: string) {
    await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
    const [updatedJobs, updatedApps] = await Promise.all([
      fetch("/api/employer/jobs").then((r) => r.json()),
      fetch("/api/employer/applications").then((r) => r.json()),
    ]);
    setJobs(updatedJobs);
    setApplications(updatedApps);
    setConfirmDeleteId(null);
  }

  async function updateStatus(appId: string, newStatus: string) {
    await fetch(`/api/employer/applications/${appId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setApplications((prev) => prev.map((a) => a.id === appId ? { ...a, status: newStatus } : a));
  }

  if (loading) return <div className="text-center py-32" style={{ color: "var(--muted)" }}>Уншиж байна...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl p-6 flex items-center justify-between" style={{ background: "var(--dark)" }}>
        <div>
          <p className="text-xs mb-0.5" style={{ color: "#475569" }}>Ажил олгогчийн самбар</p>
          <h1 className="text-xl font-extrabold text-white">{session?.user.name}</h1>
        </div>
        <Link
          href="/employer/post-job"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ background: "var(--accent)" }}
        >
          <i className="fa-solid fa-plus text-sm" />
          Ажил нийтлэх
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Нийт ажил", value: jobs.length, faIcon: "fa-briefcase", color: "var(--accent)" },
          { label: "Нийт өргөдөл", value: applications.length, faIcon: "fa-users", color: "#059669" },
          { label: "Хүлээн авсан", value: applications.filter(a => a.status === "ACCEPTED").length, faIcon: "fa-bullseye", color: "#EA580C" },
        ].map(({ label, value, faIcon, color }, i) => (
          <div key={i} className="rounded-2xl p-5 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <i className={`fa-solid ${faIcon} text-base mb-3`} style={{ color, display: "block" }} />
            <p className="text-2xl font-extrabold mb-0.5" style={{ color }}>{value}</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Jobs */}
      <div className="rounded-2xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--border)" }}>
          <span className="font-bold text-sm" style={{ color: "var(--dark)" }}>Миний ажлын байрууд</span>
          <Link href="/jobs" className="text-xs font-semibold flex items-center gap-1 hover:underline" style={{ color: "var(--accent)" }}>
            Бүгдийг харах <i className="fa-solid fa-arrow-right text-xs" />
          </Link>
        </div>
        <div className="p-5">
          {jobs.length === 0 ? (
            <div className="text-center py-10" style={{ color: "var(--muted)" }}>
              <p className="text-sm mb-4">Ажлын байр нийтлээгүй байна</p>
              <Link href="/employer/post-job" className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: "var(--accent)" }}>
                Нийтлэх
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {jobs.map((job) => (
                <div key={job.id} className="p-4 rounded-xl border" style={{ borderColor: "var(--bg)" }}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <Link href={`/jobs/${job.id}`} className="text-sm font-semibold hover:underline" style={{ color: "var(--dark)" }}>
                        {job.title}
                      </Link>
                      <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{job.location} · {job._count.applications} өргөдөл</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={{
                          background: job.isActive ? "#F0FDF4" : "var(--bg)",
                          color: job.isActive ? "#15803D" : "var(--muted)",
                        }}
                      >
                        {job.isActive ? "Идэвхтэй" : "Хаасан"}
                      </span>
                      <Link
                        href={`/employer/edit-job/${job.id}`}
                        className="p-1.5 rounded-lg transition-all hover:opacity-80"
                        style={{ background: "#EFF6FF", color: "#2563EB" }}
                        title="Засах"
                      >
                        <i className="fa-solid fa-pencil text-xs" />
                      </Link>
                      <button
                        onClick={() => setConfirmDeleteId(job.id)}
                        className="p-1.5 rounded-lg transition-all hover:opacity-80"
                        style={{ background: "#FEF2F2", color: "#DC2626" }}
                        title="Устгах"
                      >
                        <i className="fa-solid fa-trash text-xs" />
                      </button>
                    </div>
                  </div>

                  {/* Inline delete confirmation */}
                  {confirmDeleteId === job.id && (
                    <div className="mt-3 p-3 rounded-xl flex items-center justify-between gap-3" style={{ background: "#FFF1F2", border: "1px solid #FECDD3" }}>
                      <p className="text-xs font-semibold" style={{ color: "#E11D48" }}>
                        &ldquo;{job.title}&rdquo;-г устгах уу? Бүх өргөдөл устана.
                      </p>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-[11px] font-semibold px-3 py-1.5 rounded-lg"
                          style={{ background: "#F1F5F9", color: "#64748B" }}
                        >
                          Болих
                        </button>
                        <button
                          onClick={() => deleteJob(job.id)}
                          className="text-[11px] font-bold px-3 py-1.5 rounded-lg text-white"
                          style={{ background: "#DC2626" }}
                        >
                          Устгах
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Applications */}
      <div className="rounded-2xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
          <span className="font-bold text-sm" style={{ color: "var(--dark)" }}>Ирсэн өргөдлүүд</span>
        </div>
        <div className="p-5">
          {applications.length === 0 ? (
            <div className="text-center py-10 text-sm" style={{ color: "var(--muted)" }}>Өргөдөл ирээгүй байна</div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => {
                const s = STATUS_MAP[app.status] ?? STATUS_MAP.PENDING;
                return (
                  <div key={app.id} className="p-4 rounded-xl border" style={{ borderColor: "var(--bg)" }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "var(--dark)" }}>
                          {app.user.name || app.user.email}
                        </p>
                        <p className="text-xs" style={{ color: "var(--muted)" }}>{app.job.title}</p>
                        {app.matchScore !== null && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1"
                            style={{ background: "var(--accent-s)", color: "var(--accent)" }}
                          >
                            <i className="fa-solid fa-bullseye text-xs" />
                            {app.matchScore}% тохирно
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>
                        {s.label}
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {app.cvUrl && (
                        <a
                          href={app.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                          style={{ background: "#F5F3FF", color: "#4338CA" }}
                        >
                          <i className="fa-solid fa-file-lines text-xs" /> CV харах
                        </a>
                      )}
                      <button
                        onClick={() => updateStatus(app.id, "REVIEWED")}
                        disabled={app.status === "REVIEWED"}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-40"
                        style={{ background: "#EFF6FF", color: "#1D4ED8" }}
                      >
                        <i className="fa-solid fa-eye text-xs" /> Хянах
                      </button>
                      <button
                        onClick={() => updateStatus(app.id, "ACCEPTED")}
                        disabled={app.status === "ACCEPTED"}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-40"
                        style={{ background: "#F0FDF4", color: "#15803D" }}
                      >
                        <i className="fa-solid fa-circle-check text-xs" /> Хүлээн авах
                      </button>
                      <button
                        onClick={() => updateStatus(app.id, "REJECTED")}
                        disabled={app.status === "REJECTED"}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-40"
                        style={{ background: "#FEF2F2", color: "#DC2626" }}
                      >
                        <i className="fa-solid fa-circle-xmark text-xs" /> Татгалзах
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
