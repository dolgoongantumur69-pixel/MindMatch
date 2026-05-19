"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary: string | null;
  jobType: string;
  category: string;
  createdAt: string;
  employer: { name: string | null; profile: { companyName: string | null; industry: string | null } | null };
}

export default function JobDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    fetch(`/api/jobs/${id}`).then((r) => r.json()).then(setJob);
  }, [id]);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!session) { router.push("/login"); return; }
    setUploadError("");
    setApplying(true);

    let cvUrl: string | null = null;
    if (cvFile) {
      const fd = new FormData();
      fd.append("cv", cvFile);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      let uploadData: { url?: string; error?: string } = {};
      try { uploadData = await uploadRes.json(); } catch { /* empty body */ }
      if (!uploadRes.ok) {
        setUploadError(uploadData.error ?? "CV байршуулахад алдаа гарлаа");
        setApplying(false);
        return;
      }
      cvUrl = uploadData.url ?? null;
    }

    const res = await fetch(`/api/jobs/${id}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coverLetter, cvUrl }),
    });
    setApplying(false);
    let data: { matchScore?: number; error?: string } = {};
    try { data = await res.json(); } catch { /* empty body */ }
    if (res.ok) { setApplied(true); setMatchScore(data.matchScore ?? null); }
    else alert(data.error ?? "Өргөдөл илгээхэд алдаа гарлаа");
  }

  if (!job) return (
    <div className="flex items-center justify-center py-32" style={{ color: "var(--muted)" }}>
      Уншиж байна...
    </div>
  );

  const company = job.employer.profile?.companyName || job.employer.name || "Компани";

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm hover:underline" style={{ color: "var(--muted)" }}>
        <i className="fa-solid fa-arrow-left text-xs" />
        Буцах
      </Link>

      {/* Header card — dark (30%) */}
      <div className="rounded-2xl p-8" style={{ background: "var(--dark)" }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex gap-2 mb-3">
              <span
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(99,102,241,0.2)", color: "var(--accent)" }}
              >
                {job.category}
              </span>
              <span
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.08)", color: "#94A3B8" }}
              >
                {job.jobType}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-1">{job.title}</h1>
            <p style={{ color: "#64748B" }}>{company}</p>
          </div>
          {job.salary && (
            <div className="text-right shrink-0">
              <p className="text-2xl font-extrabold" style={{ color: "var(--accent)" }}>{job.salary}</p>
              <p className="text-xs" style={{ color: "#64748B" }}>сарын цалин</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-5 mt-6 pt-5" style={{ borderTop: "1px solid #1E293B" }}>
          {[
            { faIcon: "fa-location-dot", text: job.location },
            { faIcon: "fa-briefcase",    text: job.jobType },
            { faIcon: "fa-calendar-days", text: new Date(job.createdAt).toLocaleDateString("mn-MN") },
          ].map(({ faIcon, text }, i) => (
            <span key={i} className="flex items-center gap-1.5 text-sm" style={{ color: "#64748B" }}>
              <i className={`fa-solid ${faIcon} text-sm`} />
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="rounded-2xl p-7 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <h2 className="font-bold text-lg mb-4" style={{ color: "var(--dark)" }}>Ажлын тайлбар</h2>
        <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--muted)" }}>
          {job.description}
        </p>
      </div>

      {/* Requirements */}
      <div className="rounded-2xl p-7 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <h2 className="font-bold text-lg mb-4" style={{ color: "var(--dark)" }}>Шаардлага</h2>
        <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--muted)" }}>
          {job.requirements}
        </p>
      </div>

      {/* Apply section */}
      {applied ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
          <i className="fa-solid fa-circle-check" style={{ color: "#16A34A", fontSize: "3rem", display: "block", marginBottom: "0.75rem" }} />
          <p className="font-bold text-lg mb-2" style={{ color: "#15803D" }}>Өргөдөл амжилттай илгээлээ!</p>
          {matchScore !== null && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: "var(--accent-s)", color: "var(--accent)" }}>
              <i className="fa-solid fa-bullseye text-sm" />
              Таны тохирох хувь: {matchScore}%
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          {!showForm ? (
            <div className="p-7 flex items-center justify-between">
              <div>
                <p className="font-bold" style={{ color: "var(--dark)" }}>Энэ ажилд өргөдөл гаргах</p>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  {session ? "Өргөдөл илгээхэд хэдхэн секунд л орно" : "Нэвтрэх шаардлагатай"}
                </p>
              </div>
              <button
                onClick={() => session ? setShowForm(true) : router.push("/login")}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: "var(--accent)" }}
              >
                Өргөдөл гаргах
              </button>
            </div>
          ) : (
            <form onSubmit={handleApply} className="p-7 space-y-4">
              <h2 className="font-bold text-lg" style={{ color: "var(--dark)" }}>Өргөдөл гаргах</h2>

              {/* CV upload */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--dark)" }}>
                  CV / Анкет (PDF, заавал биш)
                </label>
                {cvFile ? (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2" style={{ borderColor: "#6366F1", background: "#EEF2FF" }}>
                    <i className="fa-solid fa-file-lines text-base shrink-0" style={{ color: "#6366F1" }} />
                    <span className="text-sm font-medium flex-1 truncate" style={{ color: "#4338CA" }}>{cvFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setCvFile(null)}
                      className="p-0.5 rounded-full hover:bg-indigo-200 transition-colors"
                      style={{ color: "#6366F1" }}
                    >
                      <i className="fa-solid fa-xmark text-sm" />
                    </button>
                  </div>
                ) : (
                  <label
                    className="flex flex-col items-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:border-indigo-400 hover:bg-indigo-50"
                    style={{ borderColor: "#C7D2FE", background: "#F5F3FF" }}
                  >
                    <i className="fa-solid fa-upload text-xl" style={{ color: "#6366F1" }} />
                    <span className="text-sm font-semibold" style={{ color: "#4338CA" }}>PDF файл сонгох</span>
                    <span className="text-xs" style={{ color: "#818CF8" }}>Хамгийн ихдээ 5MB</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        setUploadError("");
                        setCvFile(f);
                      }}
                    />
                  </label>
                )}
                {uploadError && (
                  <p className="text-xs mt-1.5 font-medium" style={{ color: "#DC2626" }}>{uploadError}</p>
                )}
              </div>

              {/* Cover letter */}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--dark)" }}>
                  Танилцуулга захидал (заавал биш)
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={4}
                  placeholder="Өөрийгөө товч танилцуулна уу..."
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                  style={{ border: "1px solid var(--border)", background: "var(--bg)", color: "var(--dark)" }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-gray-50"
                  style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                >
                  Буцах
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all hover:opacity-90"
                  style={{ background: "var(--accent)" }}
                >
                  {applying ? "Илгээж байна..." : "Илгээх"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
