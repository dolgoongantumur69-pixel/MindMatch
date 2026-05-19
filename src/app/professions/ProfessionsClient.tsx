"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CATEGORIES, PROFESSIONS, type CategoryKey, type DemandLevel } from "@/data/professions";

const DEMAND_LABELS: Record<DemandLevel, { label: string; color: string; bg: string }> = {
  high:   { label: "Эрэлт өндөр", color: "#059669", bg: "rgba(5,150,105,0.12)"   },
  medium: { label: "Дунд зэрэг",  color: "#D97706", bg: "rgba(217,119,6,0.12)"   },
  low:    { label: "Эрэлт бага",  color: "#6B7280", bg: "rgba(107,114,128,0.12)" },
};

export default function ProfessionsClient() {
  const searchParams = useSearchParams();
  const [query,    setQuery]    = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState<CategoryKey | "all">((searchParams.get("category") as CategoryKey) ?? "all");
  const [demand,   setDemand]   = useState<DemandLevel | "all">("all");

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setCategory((searchParams.get("category") as CategoryKey) ?? "all");
  }, [searchParams]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: PROFESSIONS.length };
    for (const p of PROFESSIONS) map[p.category] = (map[p.category] ?? 0) + 1;
    return map;
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return PROFESSIONS.filter((p) => {
      const matchSearch   = !q || p.titleMn.toLowerCase().includes(q) || p.titleEn.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.skills.some((s) => s.toLowerCase().includes(q));
      const matchCategory = category === "all" || p.category === category;
      const matchDemand   = demand === "all" || p.demandLevel === demand;
      return matchSearch && matchCategory && matchDemand;
    });
  }, [query, category, demand]);

  return (
    <div style={{ color: "#E5E7EB" }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Мэргэжлүүд</h1>
        <p style={{ color: "#9CA3AF" }}>100+ мэргэжлийг судлаад өөртөө тохирохыг олоорой</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <i className="fa-solid fa-magnifying-glass text-sm absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#6B7280" }} />
        <input
          type="text"
          placeholder="Мэргэжил, ур чадвар хайх..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none"
          style={{ background: "#1A2440", border: "1px solid rgba(255,255,255,0.08)", color: "#E5E7EB" }}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("all")}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: category === "all" ? "#4B7BF5" : "rgba(255,255,255,0.05)",
              color: category === "all" ? "#fff" : "#9CA3AF",
              border: "1px solid " + (category === "all" ? "#4B7BF5" : "rgba(255,255,255,0.08)"),
            }}
          >
            Бүгд ({counts.all})
          </button>
          {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => {
            const cat = CATEGORIES[key];
            const active = category === key;
            return (
              <button key={key} onClick={() => setCategory(key)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: active ? cat.color : "rgba(255,255,255,0.05)",
                  color: active ? "#fff" : "#9CA3AF",
                  border: "1px solid " + (active ? cat.color : "rgba(255,255,255,0.08)"),
                }}
              >
                {cat.emoji} {cat.name} ({counts[key] ?? 0})
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <i className="fa-solid fa-filter text-sm" style={{ color: "#6B7280" }} />
          <select value={demand} onChange={(e) => setDemand(e.target.value as DemandLevel | "all")}
            className="text-xs rounded-lg px-3 py-1.5 outline-none"
            style={{ background: "#1A2440", border: "1px solid rgba(255,255,255,0.08)", color: "#E5E7EB" }}>
            <option value="all">Бүх эрэлт</option>
            <option value="high">Эрэлт өндөр</option>
            <option value="medium">Дунд зэрэг</option>
            <option value="low">Эрэлт бага</option>
          </select>
        </div>
      </div>

      <p className="text-sm mb-4" style={{ color: "#6B7280" }}>{filtered.length} мэргэжил олдлоо</p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20" style={{ color: "#6B7280" }}>
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-lg font-medium">Тохирох мэргэжил олдсонгүй</p>
          <p className="text-sm mt-1">Хайлтын үгийг өөрчлөөд дахин оролдоорой</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => {
            const cat = CATEGORIES[p.category];
            const dem = DEMAND_LABELS[p.demandLevel];
            return (
              <Link key={p.slug} href={`/professions/${p.slug}`}
                className="group rounded-2xl p-5 flex flex-col gap-3 transition-all hover:-translate-y-1"
                style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: cat.bg + "22" }}>
                    {p.emoji}
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 mt-1"
                    style={{ background: dem.bg, color: dem.color }}>
                    {dem.label}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white leading-snug group-hover:text-blue-400 transition-colors">{p.titleMn}</h3>
                  <p className="text-[11px] mt-0.5" style={{ color: "#6B7280" }}>{p.titleEn}</p>
                </div>
                <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#9CA3AF" }}>{p.description}</p>
                <div className="flex flex-wrap gap-1 mt-auto">
                  {p.skills.slice(0, 3).map((s) => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(75,123,245,0.12)", color: "#93B8FC" }}>{s}</span>
                  ))}
                  {p.skills.length > 3 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(255,255,255,0.05)", color: "#6B7280" }}>+{p.skills.length - 3}</span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: cat.color + "22", color: cat.color }}>{cat.emoji} {cat.name}</span>
                  <span className="text-[10px]" style={{ color: "#6B7280" }}>{p.salaryRange.split("–")[0].trim()}~</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
