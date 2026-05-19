"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { calculateMatchScore } from "@/lib/psychology";

const TRAIT_LABELS: Record<string, string> = {
  openness: "Нээлттэй байдал",
  conscientiousness: "Хариуцлагатай байдал",
  extraversion: "Нийгэмшил",
  agreeableness: "Нийцтэй байдал",
  neuroticism: "Сэтгэл хөдлөл",
};

const TRAIT_COLORS: Record<string, string> = {
  openness: "#4B7BF5",
  conscientiousness: "#059669",
  extraversion: "#F97316",
  agreeableness: "#374151",
  neuroticism: "#A855F7",
};

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:  { label: "Хүлээгдэж байна", bg: "#FFF7ED",  color: "#EA580C" },
  REVIEWED: { label: "Хянагдаж байна",  bg: "#EEF2FE",  color: "#374151" },
  ACCEPTED: { label: "Хүлээн авсан",    bg: "#F0FDF4",  color: "#16A34A" },
  REJECTED: { label: "Татгалзсан",      bg: "#FFF1F2",  color: "#E11D48" },
};

interface Assessment {
  openness: number; conscientiousness: number; extraversion: number;
  agreeableness: number; neuroticism: number;
  workStyle: string | null; completedAt: string;
}
interface Application {
  id: string; status: string; matchScore: number | null; createdAt: string;
  job: { id: string; title: string; location: string; employer: { profile: { companyName: string | null } | null } };
}
interface Job {
  id: string; title: string; location: string; jobType: string; category: string;
  salary: string | null;
  openness: number; conscientiousness: number; extraversion: number;
  agreeableness: number; neuroticism: number;
  employer: { profile: { companyName: string | null } | null };
  _count: { applications: number };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (status === "authenticated" && session?.user.role === "EMPLOYER") router.push("/employer/dashboard");
  }, [status, session, router]);

  useEffect(() => {
    if (!session) return;
    const ac = new AbortController();
    const { signal } = ac;
    fetch("/api/assessment",   { signal }).then((r) => r.json()).then(setAssessment).catch(() => {});
    fetch("/api/applications", { signal }).then((r) => r.json()).then(setApplications).catch(() => {});
    fetch("/api/jobs",         { signal }).then((r) => r.json()).then((data) => setJobs(Array.isArray(data) ? data.slice(0, 6) : [])).catch(() => {});
    return () => ac.abort();
  }, [session]);

  if (status === "loading") return (
    <div className="flex items-center justify-center py-32">
      <div className="w-8 h-8 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
    </div>
  );

  const scoreFields = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"] as const;
  const accepted  = applications.filter(a => a.status === "ACCEPTED").length;
  const reviewed  = applications.filter(a => a.status === "REVIEWED").length;
  const initials  = session?.user.name?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="space-y-8">

      {/* Welcome hero */}
      <div
        className="rounded-2xl p-5 sm:p-8 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0D1117 0%, #1A2440 100%)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 90% 50%, rgba(13,148,136,0.30) 0%, transparent 60%)" }}
        />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-xs mb-1" style={{ color: "#93B8FC" }}>Сайн байна уу,</p>
            <h1 className="text-2xl font-extrabold text-white mb-1">{session?.user.name}</h1>
            <p className="text-sm" style={{ color: "#C4D8FD" }}>
              {assessment ? "Таны профайл бэлэн байна ✓" : "Тест өгч профайлаа бэлдэцгээе"}
            </p>
          </div>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-extrabold text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #4B7BF5, #6B94F8)" }}
          >
            {initials}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-5">
        {[
          { label: "Нийт өргөдөл", value: applications.length, faIcon: "fa-briefcase",  color: "#4B7BF5", bg: "#EEF2FE" },
          { label: "Хүлээн авсан", value: accepted,             faIcon: "fa-bullseye",   color: "#059669", bg: "#F0FDF4" },
          { label: "Хянагдаж байна", value: reviewed,           faIcon: "fa-chart-line", color: "#374151", bg: "#EEF2FE" },
        ].map(({ label, value, faIcon, color, bg }, i) => (
          <div
            key={i}
            className="rounded-2xl p-3 sm:p-6 border flex flex-col gap-2 sm:gap-4"
            style={{ background: "#FFFFFF", borderColor: "#E2E7EF" }}
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
              <i className={`fa-solid ${faIcon} text-xs sm:text-sm`} style={{ color }} />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-extrabold" style={{ color }}>{value}</p>
              <p className="text-[10px] sm:text-xs mt-0.5" style={{ color: "#6B7280" }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Assessment card */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "#FFFFFF", borderColor: "#E2E7EF" }}>
          <div
            className="flex items-center justify-between p-5 border-b"
            style={{ borderColor: "#E2E7EF" }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#EEF2FE" }}>
                <i className="fa-solid fa-brain text-sm" style={{ color: "#4B7BF5" }} />
              </div>
              <span className="font-bold text-sm" style={{ color: "#111827" }}>Сэтгэл зүйн профайл</span>
            </div>
            <Link
              href="/assessment"
              className="text-xs font-semibold flex items-center gap-1 hover:underline"
              style={{ color: "#4B7BF5" }}
            >
              {assessment ? "Дахин өгөх" : "Тест өгөх"}
              <i className="fa-solid fa-arrow-right text-xs" />
            </Link>
          </div>

          <div className="p-5">
            {assessment ? (
              <div className="space-y-4">
                {scoreFields.map((trait) => (
                  <div key={trait}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span style={{ color: "#6B7280" }}>{TRAIT_LABELS[trait]}</span>
                      <span className="font-bold" style={{ color: TRAIT_COLORS[trait] }}>{assessment[trait]}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "#EEF2FE" }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${assessment[trait]}%`, background: TRAIT_COLORS[trait] }}
                      />
                    </div>
                  </div>
                ))}
                {assessment.workStyle && (
                  <div className="mt-3 p-3.5 rounded-xl" style={{ background: "#EEF2FE" }}>
                    <p className="text-xs font-semibold" style={{ color: "#4B7BF5" }}>
                      ✨ Ажлын хэв маяг: {assessment.workStyle}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center py-10 text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "#EEF2FE" }}
                >
                  <i className="fa-solid fa-wand-magic-sparkles text-2xl" style={{ color: "#4B7BF5" }} />
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: "#111827" }}>Тест өгөөгүй байна</p>
                <p className="text-xs mb-5" style={{ color: "#6B7280" }}>15 асуулт, ~5 минут</p>
                <Link
                  href="/assessment"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #4B7BF5, #3B6AE8)", boxShadow: "0 4px 14px rgba(13,148,136,0.30)" }}
                >
                  Big Five тест өгөх
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Applications */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "#FFFFFF", borderColor: "#E2E7EF" }}>
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "#E2E7EF" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#EEF2FE" }}>
                <i className="fa-solid fa-briefcase text-sm" style={{ color: "#374151" }} />
              </div>
              <span className="font-bold text-sm" style={{ color: "#111827" }}>Миний өргөдлүүд</span>
            </div>
            <Link href="/jobs" className="text-xs font-semibold flex items-center gap-1 hover:underline" style={{ color: "#4B7BF5" }}>
              Ажил хайх <i className="fa-solid fa-arrow-right text-xs" />
            </Link>
          </div>

          <div className="p-5">
            {applications.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#EEF2FE" }}>
                  <i className="fa-solid fa-briefcase text-2xl" style={{ color: "#374151" }} />
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: "#111827" }}>Өргөдөл гаргаагүй байна</p>
                <p className="text-xs" style={{ color: "#6B7280" }}>Тохирох ажлаа хайж өргөдлөө илгээгээрэй</p>
              </div>
            ) : (
              <div className="space-y-2">
                {applications.map((app) => {
                  const s = STATUS_MAP[app.status] ?? STATUS_MAP.PENDING;
                  return (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border transition-all hover:border-teal-200"
                      style={{ borderColor: "#EEF2FE" }}
                    >
                      <div>
                        <Link
                          href={`/jobs/${app.job.id}`}
                          className="text-sm font-semibold hover:underline"
                          style={{ color: "#111827" }}
                        >
                          {app.job.title}
                        </Link>
                        <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                          {app.job.employer.profile?.companyName} · {app.job.location}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>
                          {s.label}
                        </span>
                        {app.matchScore !== null && (
                          <span className="text-[10px] flex items-center gap-0.5" style={{ color: "#6B7280" }}>
                            <i className="fa-solid fa-bullseye" style={{ fontSize: "10px" }} /> {app.matchScore}% тохирно
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tests section ── */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: "#FFFFFF", borderColor: "#E2E7EF" }}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "#E2E7EF" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#FFF7ED" }}>
              <i className="fa-solid fa-wand-magic-sparkles text-sm" style={{ color: "#EA580C" }} />
            </div>
            <span className="font-bold text-sm" style={{ color: "#111827" }}>Боломжит тестүүд</span>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Big Five */}
          <div
            className="rounded-xl border p-4 flex items-start gap-4"
            style={{ borderColor: "#E2E7EF", background: "#F7F8FA" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#EEF2FE" }}>
              <i className="fa-solid fa-brain text-base" style={{ color: "#4B7BF5" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm mb-0.5" style={{ color: "#111827" }}>Big Five (OCEAN) тест</p>
              <p className="text-xs mb-3" style={{ color: "#6B7280" }}>
                Зан чанарын 5 шинж чанарыг тодорхойлох 15 асуулт
              </p>
              {assessment ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "#F0FDF4", color: "#16A34A" }}>
                  <i className="fa-solid fa-circle-check text-xs" /> Дууссан
                </span>
              ) : (
                <Link
                  href="/assessment"
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg text-white transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #4B7BF5, #3B6AE8)" }}
                >
                  Тест өгөх <i className="fa-solid fa-arrow-right text-xs" />
                </Link>
              )}
            </div>
          </div>

          {/* Placeholder test */}
          <div
            className="rounded-xl border p-4 flex items-start gap-4 opacity-50"
            style={{ borderColor: "#E2E7EF", background: "#F7F8FA" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#FFF7ED" }}>
              <i className="fa-solid fa-chart-line text-base" style={{ color: "#EA580C" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm mb-0.5" style={{ color: "#111827" }}>Стресс тэсвэрлэх тест</p>
              <p className="text-xs mb-3" style={{ color: "#6B7280" }}>
                Дарамтыг даван туулах чадварыг үнэлэх тест
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "#F1F5F9", color: "#94A3B8" }}>
                <i className="fa-solid fa-clock text-xs" /> Удахгүй
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recommended jobs section ── */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: "#FFFFFF", borderColor: "#E2E7EF" }}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "#E2E7EF" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#EEF2FE" }}>
              <i className="fa-solid fa-briefcase text-sm" style={{ color: "#374151" }} />
            </div>
            <span className="font-bold text-sm" style={{ color: "#111827" }}>Санал болгох ажлууд</span>
          </div>
          <Link href="/jobs" className="text-xs font-semibold flex items-center gap-1 hover:underline" style={{ color: "#4B7BF5" }}>
            Бүгдийг харах <i className="fa-solid fa-arrow-right text-xs" />
          </Link>
        </div>
        <div className="p-5">
          {jobs.length === 0 ? (
            <div className="text-center py-10 text-sm" style={{ color: "#6B7280" }}>Ажлын байр олдсонгүй</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {jobs.map((job) => {
                const score = assessment
                  ? calculateMatchScore(
                      { openness: assessment.openness, conscientiousness: assessment.conscientiousness, extraversion: assessment.extraversion, agreeableness: assessment.agreeableness, neuroticism: assessment.neuroticism },
                      { openness: job.openness, conscientiousness: job.conscientiousness, extraversion: job.extraversion, agreeableness: job.agreeableness, neuroticism: job.neuroticism }
                    )
                  : null;
                const companyName = job.employer?.profile?.companyName;
                return (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="rounded-xl border p-4 flex flex-col gap-2 transition-all hover:border-teal-300 hover:shadow-sm"
                    style={{ borderColor: "#E2E7EF", background: "#F7F8FA" }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-sm leading-tight" style={{ color: "#111827" }}>{job.title}</p>
                      {score !== null && (
                        <span
                          className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: score >= 75 ? "#F0FDF4" : score >= 55 ? "#FFF7ED" : "#FEF2F2",
                            color:      score >= 75 ? "#16A34A" : score >= 55 ? "#EA580C" : "#DC2626",
                          }}
                        >
                          {score}%
                        </span>
                      )}
                    </div>
                    {companyName && (
                      <p className="text-xs font-semibold" style={{ color: "#4B7BF5" }}>{companyName}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs" style={{ color: "#6B7280" }}>
                      <span className="flex items-center gap-1"><i className="fa-solid fa-location-dot text-xs" />{job.location}</span>
                      <span className="flex items-center gap-1"><i className="fa-solid fa-briefcase text-xs" />{job.jobType}</span>
                    </div>
                    {job.salary && (
                      <p className="text-xs font-semibold" style={{ color: "#374151" }}>{job.salary}</p>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
