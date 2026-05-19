import { notFound } from "next/navigation";
import Link from "next/link";
import {
  PROFESSIONS,
  CATEGORIES,
  getProfessionBySlug,
} from "@/data/professions";

export async function generateStaticParams() {
  return PROFESSIONS.map((p) => ({ slug: p.slug }));
}

const DEMAND_LABELS = {
  high:   { label: "Эрэлт өндөр",  color: "#059669", bg: "rgba(5,150,105,0.12)" },
  medium: { label: "Дунд зэрэг",   color: "#D97706", bg: "rgba(217,119,6,0.12)" },
  low:    { label: "Эрэлт бага",   color: "#6B7280", bg: "rgba(107,114,128,0.12)" },
};

const EQ_IQ_LABELS = {
  high:   "Өндөр",
  medium: "Дунд",
  low:    "Бага",
};

export default async function ProfessionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const prof = getProfessionBySlug(slug);
  if (!prof) notFound();

  const cat    = CATEGORIES[prof.category];
  const dem    = DEMAND_LABELS[prof.demandLevel];
  const related = prof.relatedSlugs
    .map((s) => getProfessionBySlug(s))
    .filter(Boolean) as typeof PROFESSIONS;

  return (
    <div style={{ color: "#E5E7EB" }}>
      {/* ── Back ── */}
      <Link
        href="/professions"
        className="inline-flex items-center gap-2 text-sm mb-6 hover:text-white transition-colors"
        style={{ color: "#6B7280" }}
      >
        <i className="fa-solid fa-arrow-left text-sm" />
        Мэргэжлүүд рүү буцах
      </Link>

      {/* ── Hero card ── */}
      <div
        className="rounded-2xl p-8 mb-6"
        style={{
          background: "linear-gradient(135deg, #111827 0%, #1A2440 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          {/* Emoji badge */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shrink-0"
            style={{ background: cat.color + "22" }}
          >
            {prof.emoji}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: cat.color + "22", color: cat.color }}
              >
                {cat.emoji} {cat.name}
              </span>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: dem.bg, color: dem.color }}
              >
                {dem.label}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {prof.titleMn}
            </h1>
            <p className="text-sm mb-4" style={{ color: "#6B7280" }}>
              {prof.titleEn}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "#9CA3AF" }}>
              {prof.description}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { faIcon: "fa-briefcase",      label: "Цалин",        value: prof.salaryRange },
          { faIcon: "fa-graduation-cap", label: "Боловсрол",   value: prof.education },
          { faIcon: "fa-chart-line",     label: "IQ шаардлага", value: EQ_IQ_LABELS[prof.iqRequirement] },
          { faIcon: "fa-users",          label: "EQ шаардлага", value: EQ_IQ_LABELS[prof.eqRequirement] },
        ].map(({ faIcon, label, value }) => (
          <div
            key={label}
            className="rounded-xl p-4"
            style={{
              background: "#111827",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <i className={`fa-solid ${faIcon} text-sm`} style={{ color: "#4B7BF5" }} />
              <span className="text-xs" style={{ color: "#6B7280" }}>
                {label}
              </span>
            </div>
            <p className="text-sm font-semibold text-white leading-snug">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Skills + Tools ── */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {/* Skills */}
        <div
          className="rounded-xl p-5"
          style={{
            background: "#111827",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <i className="fa-solid fa-wand-magic-sparkles text-sm" style={{ color: "#4B7BF5" }} />
            <h2 className="text-sm font-semibold text-white">Шаардлагатай ур чадварууд</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {prof.skills.map((s) => (
              <span
                key={s}
                className="text-xs px-3 py-1.5 rounded-full font-medium"
                style={{ background: "rgba(75,123,245,0.15)", color: "#93B8FC" }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div
          className="rounded-xl p-5"
          style={{
            background: "#111827",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <i className="fa-solid fa-wrench text-sm" style={{ color: "#D97706" }} />
            <h2 className="text-sm font-semibold text-white">Хэрэглэдэг хэрэгслүүд</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {prof.tools.map((t) => (
              <span
                key={t}
                className="text-xs px-3 py-1.5 rounded-full font-medium"
                style={{ background: "rgba(217,119,6,0.15)", color: "#FCD34D" }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── MBTI compatibility ── */}
      <div
        className="rounded-xl p-5 mb-6"
        style={{
          background: "#111827",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <h2 className="text-sm font-semibold text-white mb-4">
          Тохирох зан чанарын төрлүүд (MBTI)
        </h2>
        <div className="flex flex-wrap gap-2">
          {prof.mbtiTypes.map((t) => (
            <span
              key={t}
              className="text-sm font-bold px-4 py-2 rounded-xl"
              style={{
                background: "rgba(147,184,252,0.1)",
                color: "#93B8FC",
                border: "1px solid rgba(147,184,252,0.2)",
              }}
            >
              {t}
            </span>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: "#6B7280" }}>
          Эдгээр MBTI төрлүүд нь энэ мэргэжилд хамгийн тохирдог гэж судалгаагаар тогтоогдсон.
        </p>
      </div>

      {/* ── Related professions ── */}
      {related.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-white mb-4">
            Холбоотой мэргэжлүүд
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {related.map((r) => {
              const rcat = CATEGORIES[r.category];
              return (
                <Link
                  key={r.slug}
                  href={`/professions/${r.slug}`}
                  className="rounded-xl p-4 flex flex-col gap-2 hover:-translate-y-0.5 transition-all"
                  style={{
                    background: "#111827",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span className="text-2xl">{r.emoji}</span>
                  <p className="text-xs font-semibold text-white leading-snug">
                    {r.titleMn}
                  </p>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full w-fit"
                    style={{ background: rcat.color + "22", color: rcat.color }}
                  >
                    {rcat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      <div
        className="mt-8 rounded-2xl p-6 text-center"
        style={{
          background: "linear-gradient(135deg, rgba(75,123,245,0.15) 0%, rgba(147,184,252,0.08) 100%)",
          border: "1px solid rgba(75,123,245,0.2)",
        }}
      >
        <p className="text-sm font-semibold text-white mb-1">
          Энэ мэргэжил таны зан чанарт тохирох уу?
        </p>
        <p className="text-xs mb-4" style={{ color: "#9CA3AF" }}>
          MBTI, IQ, EQ тестийг өгөөд хувийн зөвлөмж авааарай
        </p>
        <Link
          href="/test"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #4B7BF5, #6366F1)" }}
        >
          Тест өгөх
        </Link>
      </div>
    </div>
  );
}
