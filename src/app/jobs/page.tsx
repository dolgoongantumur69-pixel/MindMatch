"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Job {
  id: string; title: string; location: string; salary: string | null;
  jobType: string; category: string; createdAt: string;
  employer: { name: string | null; profile: { companyName: string | null } | null };
  _count: { applications: number };
}

const CATS = ["Бүгд", "IT & Технологи", "Санхүү", "Маркетинг", "Боловсрол", "Эрүүл мэнд", "Инженерчлэл", "Бусад"];

const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  "Бүтэн цагийн": { bg: "#FBE0C3", color: "#344648" },
  "Хагас цагийн": { bg: "#FFF3EC", color: "#E8A07A" },
  "Зайнаас":      { bg: "#F0EBE4", color: "#4A6163" },
  "Гэрээт":       { bg: "#EAF0F1", color: "#7D8E95" },
  "Дадлагажигч":  { bg: "#FBE0C3", color: "#344648" },
};

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#0D9488,#14B8A6)",
  "linear-gradient(135deg,#059669,#34D399)",
  "linear-gradient(135deg,#F97316,#FB923C)",
  "linear-gradient(135deg,#2563EB,#60A5FA)",
  "linear-gradient(135deg,#A855F7,#C084FC)",
  "linear-gradient(135deg,#E11D48,#FB7185)",
];

function avatarGradient(name: string) {
  return AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length];
}

export default function JobsPage() {
  const [jobs, setJobs]     = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cat, setCat]       = useState("Бүгд");

  useEffect(() => {
    const ac = new AbortController();
    const p = new URLSearchParams();
    if (cat !== "Бүгд") p.set("category", cat);
    setLoading(true);
    fetch(`/api/jobs?${p}`, { signal: ac.signal })
      .then((r) => r.json())
      .then((data) => { setJobs(Array.isArray(data) ? data : []); setLoading(false); })
      .catch((err) => { if (err.name !== "AbortError") setLoading(false); });
    return () => ac.abort();
  }, [cat]);

  function fetchJobs() {
    const p = new URLSearchParams();
    if (cat !== "Бүгд") p.set("category", cat);
    if (search) p.set("search", search);
    setLoading(true);
    fetch(`/api/jobs?${p}`)
      .then((r) => r.json())
      .then((data) => { setJobs(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }

  return (
    <div>
      {/* Photo header */}
      <div className="rounded-2xl mb-6 relative overflow-hidden" style={{ minHeight: 220 }}>
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1400&q=80')" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(52,70,72,0.55) 0%, rgba(52,70,72,0.82) 100%)" }}
        />
        <div className="relative p-8">
          <div className="flex items-center gap-2 mb-1">
            <i className="fa-solid fa-briefcase text-sm" style={{ color: "#FBE0C3" }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#FBE0C3" }}>Ажлын байрууд</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1">Тохирох ажлаа олоорой</h1>
          <p className="text-xs mb-6" style={{ color: "#FBE0C3" }}>
            {loading ? "..." : `${jobs.length} ажлын байр байна`}
          </p>
          <form onSubmit={(e) => { e.preventDefault(); fetchJobs(); }} className="flex gap-2">
            <div className="relative flex-1">
              <i className="fa-solid fa-magnifying-glass text-sm absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#FBE0C3" }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Ажлын нэрийг хайх..."
                className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm text-white transition-all"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,187,152,0.30)" }}
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:opacity-90"
              style={{ background: "#FFBB98", color: "#344648", boxShadow: "0 2px 10px rgba(255,187,152,0.40)" }}
            >
              <i className="fa-solid fa-sliders text-sm" /> Хайх
            </button>
          </form>
        </div>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap mb-7">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold border transition-all hover:scale-[1.02]"
            style={{
              background:  cat === c ? "#344648" : "#FFFFFF",
              color:       cat === c ? "#FFFFFF" : "#7D8E95",
              borderColor: cat === c ? "#344648" : "#ECD4BA",
              boxShadow:   cat === c ? "0 2px 10px rgba(52,70,72,0.25)" : "none",
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-28" style={{ color: "#607D7B" }}>
          <div className="w-8 h-8 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-3" />
          Уншиж байна...
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-28" style={{ color: "#607D7B" }}>
          <i className="fa-solid fa-briefcase" style={{ fontSize: "3rem", display: "block", marginBottom: "1rem", opacity: 0.2 }} />
          <p className="text-sm">Ажлын байр олдсонгүй</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {jobs.map((job) => {
            const ts      = TYPE_STYLE[job.jobType] ?? { bg: "#F0FDFA", color: "#0D9488" };
            const company = job.employer.profile?.companyName || job.employer.name || "?";
            const grad    = avatarGradient(company);
            return (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="group flex items-center justify-between rounded-2xl p-5 border transition-all hover:border-amber-300 hover:shadow-lg hover:-translate-y-0.5"
                style={{ background: "#FFFFFF", borderColor: "#ECD4BA" }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base shrink-0"
                    style={{ background: grad }}
                  >
                    {company[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={ts}>{job.jobType}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#F0EBE4", color: "#7D8E95" }}>{job.category}</span>
                    </div>
                    <p className="font-bold text-sm transition-colors group-hover:text-amber-700" style={{ color: "#344648" }}>
                      {job.title}
                    </p>
                    <p className="text-xs mt-0.5 font-medium" style={{ color: "#7D8E95" }}>{company}</p>
                    <div className="flex items-center gap-4 mt-1.5 text-xs" style={{ color: "#7D8E95" }}>
                      <span className="flex items-center gap-1"><i className="fa-solid fa-location-dot text-xs" />{job.location}</span>
                      <span className="flex items-center gap-1"><i className="fa-solid fa-users text-xs" />{job._count.applications} өргөдөл</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5 shrink-0">
                  {job.salary && (
                    <div className="text-right hidden sm:block">
                      <p className="font-bold text-sm" style={{ color: "#344648" }}>{job.salary}</p>
                      <p className="text-[10px]" style={{ color: "#7D8E95" }}>сарын цалин</p>
                    </div>
                  )}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    style={{ background: "#FBE0C3" }}
                  >
                    <i className="fa-solid fa-arrow-right text-sm" style={{ color: "#344648" }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
