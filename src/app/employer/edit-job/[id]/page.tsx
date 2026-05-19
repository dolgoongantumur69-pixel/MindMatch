"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const CATEGORIES = ["IT & Технологи", "Санхүү", "Маркетинг", "Боловсрол", "Эрүүл мэнд", "Инженерчлэл", "Бусад"];
const JOB_TYPES  = ["Бүтэн цагийн", "Хагас цагийн", "Зайнаас", "Гэрээт", "Дадлагажигч"];

const TRAITS = [
  { key: "openness",          label: "Нээлттэй байдал",                      desc: "Шинийг эрэлхийлэх, бүтээлч байдал" },
  { key: "conscientiousness", label: "Хариуцлагатай байдал",                 desc: "Зохион байгуулалт, найдвартай байдал" },
  { key: "extraversion",      label: "Нийгэмшил",                            desc: "Харилцааны идэвхи, манлайлах чадвар" },
  { key: "agreeableness",     label: "Нийцтэй байдал",                       desc: "Хамтын ажиллагаа, эелдэг байдал" },
  { key: "neuroticism",       label: "Сэтгэл хөдлөлийн тогтвортой байдал",  desc: "Дарамтанд тэвчээртэй байдал" },
];

type FormState = {
  title: string; description: string; requirements: string;
  location: string; salary: string; jobType: string; category: string;
  openness: number; conscientiousness: number; extraversion: number;
  agreeableness: number; neuroticism: number;
};

const EMPTY: FormState = {
  title: "", description: "", requirements: "",
  location: "", salary: "", jobType: "Бүтэн цагийн", category: "IT & Технологи",
  openness: 50, conscientiousness: 70, extraversion: 50, agreeableness: 60, neuroticism: 40,
};

export default function EditJobPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [form, setForm]       = useState<FormState>(EMPTY);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (status === "authenticated" && session?.user.role !== "EMPLOYER") router.push("/dashboard");
  }, [status, session, router]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/jobs/${id}`)
      .then((r) => r.json())
      .then((job) => {
        setForm({
          title:             job.title ?? "",
          description:       job.description ?? "",
          requirements:      job.requirements ?? "",
          location:          job.location ?? "",
          salary:            job.salary ?? "",
          jobType:           job.jobType ?? "Бүтэн цагийн",
          category:          job.category ?? "IT & Технологи",
          openness:          job.openness ?? 50,
          conscientiousness: job.conscientiousness ?? 50,
          extraversion:      job.extraversion ?? 50,
          agreeableness:     job.agreeableness ?? 50,
          neuroticism:       job.neuroticism ?? 50,
        });
        setFetching(false);
      });
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true); setError("");
    const res = await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) router.push("/employer/dashboard");
    else setError((await res.json()).error ?? "Алдаа гарлаа");
  }

  const inputCls = "w-full rounded-xl px-4 py-2.5 text-sm outline-none";
  const inputSty = { border: "1px solid var(--border)", background: "var(--bg)", color: "var(--dark)" };

  if (fetching) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-8 h-8 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/employer/dashboard"
          className="p-2 rounded-xl transition-all hover:opacity-70"
          style={{ background: "#F0EBE4", color: "var(--dark)" }}
        >
          <i className="fa-solid fa-arrow-left text-sm" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--dark)" }}>Ажлын байр засах</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>Мэдээллээ өөрчилж хадгална уу</p>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "#FFF1F2", color: "#E11D48", border: "1px solid #FECDD3" }}>
          ⚠ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic info */}
        <div className="rounded-2xl p-7 border space-y-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <h2 className="font-bold" style={{ color: "var(--dark)" }}>Үндсэн мэдээлэл</h2>

          {(["title", "location", "salary"] as const).map((k) => (
            <div key={k}>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--dark-2)" }}>
                {k === "title" ? "Ажлын нэр" : k === "location" ? "Байршил" : "Цалин (заавал биш)"}
              </label>
              <input
                type="text"
                required={k !== "salary"}
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                placeholder={k === "title" ? "Senior Frontend Developer" : k === "location" ? "Улаанбаатар / Зайнаас" : "2,000,000₮"}
                className={inputCls}
                style={inputSty}
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            {([["jobType", "Ажлын төрөл", JOB_TYPES], ["category", "Салбар", CATEGORIES]] as const).map(([k, label, opts]) => (
              <div key={k}>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--dark-2)" }}>{label}</label>
                <select
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className={inputCls}
                  style={inputSty}
                >
                  {opts.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>

          {(["description", "requirements"] as const).map((k) => (
            <div key={k}>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--dark-2)" }}>
                {k === "description" ? "Ажлын тайлбар" : "Шаардлага"}
              </label>
              <textarea
                required
                rows={4}
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                style={inputSty}
              />
            </div>
          ))}
        </div>

        {/* Psychology sliders */}
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
              const val = form[key as keyof FormState] as number;
              return (
                <div key={key}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--dark)" }}>{label}</p>
                      <p className="text-xs" style={{ color: "var(--muted)" }}>{desc}</p>
                    </div>
                    <span className="text-sm font-extrabold px-3 py-0.5 rounded-full" style={{ background: "var(--accent-s)", color: "var(--accent)" }}>
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
          disabled={saving}
          className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: "var(--accent)" }}
        >
          {saving
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Хадгалж байна...</>
            : <><i className="fa-solid fa-floppy-disk text-sm" /> Хадгалах</>}
        </button>
      </form>
    </div>
  );
}
