"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const CATEGORIES = ["IT & Технологи", "Санхүү", "Маркетинг", "Боловсрол", "Эрүүл мэнд", "Инженерчлэл", "Бусад"];
const JOB_TYPES = ["Бүтэн цагийн", "Хагас цагийн", "Зайнаас", "Гэрээт", "Дадлагажигч"];

const TRAITS = [
  { key: "openness",         label: "Нээлттэй байдал",          desc: "Шинийг эрэлхийлэх, бүтээлч байдал" },
  { key: "conscientiousness",label: "Хариуцлагатай байдал",     desc: "Зохион байгуулалт, найдвартай байдал" },
  { key: "extraversion",     label: "Нийгэмшил",                desc: "Харилцааны идэвхи, манлайлах чадвар" },
  { key: "agreeableness",    label: "Нийцтэй байдал",           desc: "Хамтын ажиллагаа, эелдэг байдал" },
  { key: "neuroticism",      label: "Сэтгэл хөдлөлийн тогтвортой байдал", desc: "Дарамтанд тэвчээртэй байдал" },
];

export default function PostJobPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", requirements: "",
    location: "", salary: "",
    jobType: "Бүтэн цагийн", category: "IT & Технологи",
    openness: 50, conscientiousness: 70, extraversion: 50, agreeableness: 60, neuroticism: 40,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) { router.push("/login"); return; }
    setLoading(true);
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) router.push("/employer/dashboard");
    else alert((await res.json()).error);
  }

  const field = (key: string, label: string, type = "text", placeholder = "") => (
    <div key={key}>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--dark-2)" }}>{label}</label>
      <input
        type={type}
        required={key !== "salary"}
        value={form[key as keyof typeof form] as string}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
        style={{ border: "1px solid var(--border)", background: "var(--bg)", color: "var(--dark)" }}
      />
    </div>
  );

  const textarea = (key: string, label: string, placeholder = "") => (
    <div key={key}>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--dark-2)" }}>{label}</label>
      <textarea
        required
        rows={4}
        value={form[key as keyof typeof form] as string}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
        style={{ border: "1px solid var(--border)", background: "var(--bg)", color: "var(--dark)" }}
      />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div style={{ color: "var(--dark)" }}>
        <h1 className="text-2xl font-extrabold mb-1">Ажлын байр нийтлэх</h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>Ажлын мэдээлэл болон сэтгэл зүйн шаардлагаа тохируулна уу</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic info */}
        <div className="rounded-2xl p-7 border space-y-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <h2 className="font-bold" style={{ color: "var(--dark)" }}>Үндсэн мэдээлэл</h2>
          {field("title", "Ажлын нэр", "text", "Senior Frontend Developer")}
          {field("location", "Байршил", "text", "Улаанбаатар / Зайнаас")}
          {field("salary", "Цалин (заавал биш)", "text", "2,000,000₮")}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--dark-2)" }}>Ажлын төрөл</label>
              <select
                value={form.jobType}
                onChange={(e) => setForm({ ...form, jobType: e.target.value })}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{ border: "1px solid var(--border)", background: "var(--bg)", color: "var(--dark)" }}
              >
                {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--dark-2)" }}>Салбар</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{ border: "1px solid var(--border)", background: "var(--bg)", color: "var(--dark)" }}
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {textarea("description", "Ажлын тайлбар", "Ажлын үндсэн үүрэг, хариуцлагыг тайлбарлана уу...")}
          {textarea("requirements", "Шаардлага", "Туршлага, ур чадвар, боловсролын шаардлагыг бичнэ үү...")}
        </div>

        {/* Psychology profile */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="p-5 border-b" style={{ background: "var(--dark)", borderColor: "#1E293B" }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.2)" }}>
                <i className="fa-solid fa-brain text-sm" style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <h2 className="font-bold text-white text-sm">Сэтгэл зүйн шаардлага</h2>
                <p className="text-xs" style={{ color: "#475569" }}>Тохирох ажилтны зан чанарын түвшинг тохируулна уу</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {TRAITS.map(({ key, label, desc }) => {
              const val = form[key as keyof typeof form] as number;
              return (
                <div key={key}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--dark)" }}>{label}</p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>{desc}</p>
                    </div>
                    <span
                      className="text-sm font-extrabold px-3 py-0.5 rounded-full"
                      style={{ background: "var(--accent-s)", color: "var(--accent)" }}
                    >
                      {val}%
                    </span>
                  </div>
                  <input
                    type="range" min={0} max={100} value={val}
                    onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) })}
                    className="w-full h-2 rounded-full outline-none cursor-pointer"
                    style={{ accentColor: "var(--accent)" }}
                  />
                  <div className="flex justify-between text-[10px] mt-0.5" style={{ color: "var(--muted)" }}>
                    <span>Бага</span><span>Дунд</span><span>Өндөр</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: "var(--accent)" }}
        >
          {loading ? "Нийтэлж байна..." : "Ажлын байр нийтлэх"}
        </button>
      </form>
    </div>
  );
}
