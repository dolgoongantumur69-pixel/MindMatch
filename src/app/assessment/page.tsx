"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BIG_FIVE_QUESTIONS, deriveInsights } from "@/lib/psychology";
import Link from "next/link";

const TRAIT_COLORS: Record<string, string> = {
  openness: "#6366F1",
  conscientiousness: "#059669",
  extraversion: "#EA580C",
  agreeableness: "#0284C7",
  neuroticism: "#9333EA",
};

const TRAIT_LABELS: Record<string, string> = {
  openness: "Нээлттэй байдал",
  conscientiousness: "Хариуцлагатай байдал",
  extraversion: "Нийгэмшил",
  agreeableness: "Нийцтэй байдал",
  neuroticism: "Сэтгэл хөдлөл",
};

const ANSWERS = ["Огт үгүй", "Үгүй", "Заримдаа", "Тийм", "Маш тийм"];

export default function AssessmentPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ openness: number; conscientiousness: number; extraversion: number; agreeableness: number; neuroticism: number } | null>(null);
  const [loading, setLoading] = useState(false);

  function calcScores() {
    const totals: Record<string, number[]> = {
      openness: [], conscientiousness: [], extraversion: [], agreeableness: [], neuroticism: [],
    };
    for (const q of BIG_FIVE_QUESTIONS) {
      const ans = answers[q.id];
      if (ans === undefined) continue;
      totals[q.trait].push(q.reverse ? 6 - ans : ans);
    }
    const avg = (arr: number[]) =>
      arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length / 5) * 100) : 50;
    return Object.fromEntries(Object.entries(totals).map(([k, v]) => [k, avg(v)]));
  }

  async function handleSubmit() {
    if (Object.keys(answers).length < BIG_FIVE_QUESTIONS.length) {
      alert("Бүх асуултанд хариулна уу"); return;
    }
    if (!session) { router.push("/login"); return; }
    setLoading(true);
    const raw = calcScores();
    const scores = raw as { openness: number; conscientiousness: number; extraversion: number; agreeableness: number; neuroticism: number };
    const res = await fetch("/api/assessment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scores),
    });
    setLoading(false);
    if (res.ok) { setResult(scores); setSubmitted(true); }
  }

  if (submitted && result) {
    const insights = deriveInsights(result);
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Success banner */}
        <div className="rounded-2xl p-8 text-center" style={{ background: "var(--dark)" }}>
          <i className="fa-solid fa-circle-check" style={{ color: "var(--accent)", fontSize: "3.5rem", display: "block", marginBottom: "1rem" }} />
          <h1 className="text-2xl font-extrabold text-white mb-2">Тест амжилттай дууслаа!</h1>
          <p style={{ color: "#64748B" }}>Таны Big Five сэтгэл зүйн профайл дараах байдалтай байна</p>
        </div>

        {/* Scores */}
        <div className="rounded-2xl p-7 border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <h2 className="font-bold text-lg mb-6" style={{ color: "var(--dark)" }}>OCEAN үр дүн</h2>
          <div className="space-y-5">
            {Object.entries(result).map(([trait, score]) => (
              <div key={trait}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-semibold" style={{ color: "var(--dark)" }}>{TRAIT_LABELS[trait]}</span>
                  <span className="text-sm font-bold" style={{ color: TRAIT_COLORS[trait] }}>{score}%</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "var(--bg)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${score}%`, background: TRAIT_COLORS[trait] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="grid gap-3">
          {[
            { label: "Ажлын хэв маяг", value: insights.workStyle, bg: "var(--accent-s)", color: "var(--accent)" },
            { label: "Давуу талууд", value: insights.strengths, bg: "#F0FDF4", color: "#16A34A" },
            { label: "Тохирох орчин", value: insights.idealEnvironment, bg: "#FFF7ED", color: "#EA580C" },
          ].map(({ label, value, bg, color }) => (
            <div key={label} className="rounded-2xl p-5" style={{ background: bg }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color }}>{label}</p>
              <p className="text-sm font-medium" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        <Link
          href="/jobs"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ background: "var(--accent)" }}
        >
          Тохирох ажлуудыг харах
          <i className="fa-solid fa-arrow-right text-sm" />
        </Link>
      </div>
    );
  }

  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / BIG_FIVE_QUESTIONS.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="rounded-2xl p-6" style={{ background: "var(--dark)" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.2)" }}>
            <i className="fa-solid fa-brain text-base" style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <h1 className="font-extrabold text-white">Big Five Сэтгэл Зүйн Тест</h1>
            <p className="text-xs" style={{ color: "#64748B" }}>15 асуулт · ~5 минут</p>
          </div>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "#1E293B" }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, background: "var(--accent)" }}
          />
        </div>
        <p className="text-xs mt-1.5" style={{ color: "#475569" }}>{answered}/{BIG_FIVE_QUESTIONS.length} асуулт хариулсан</p>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {BIG_FIVE_QUESTIONS.map((q) => (
          <div
            key={q.id}
            className="rounded-2xl p-5 border-2 transition-all"
            style={{
              background: "#FFFFFF",
              borderColor: answers[q.id] ? "#6366F1" : "#E0E7FF",
            }}
          >
            <p className="text-sm font-semibold mb-4" style={{ color: "var(--dark)" }}>
              <span className="mr-2 font-extrabold" style={{ color: "var(--accent)" }}>{q.id}.</span>
              {q.text}
            </p>
            <div className="flex gap-2">
              {ANSWERS.map((label, i) => {
                const selected = answers[q.id] === i + 1;
                return (
                  <button
                    key={i}
                    onClick={() => setAnswers((p) => ({ ...p, [q.id]: i + 1 }))}
                    className="flex-1 py-2 rounded-xl text-[11px] font-semibold border-2 transition-all"
                    style={{
                      borderColor: selected ? "#6366F1" : "#C7D2FE",
                      background: selected ? "#6366F1" : "#F5F3FF",
                      color: selected ? "#FFFFFF" : "#4338CA",
                      boxShadow: selected ? "0 2px 8px rgba(99,102,241,0.35)" : "none",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || answered < BIG_FIVE_QUESTIONS.length}
        className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-40"
        style={{ background: "var(--accent)" }}
      >
        {loading ? "Боловсруулж байна..." : `Тест дуусгах (${answered}/${BIG_FIVE_QUESTIONS.length})`}
      </button>
    </div>
  );
}
