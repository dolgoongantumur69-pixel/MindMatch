import Link from "next/link";
import { CATEGORIES, PROFESSIONS, type CategoryKey } from "@/data/professions";
import HomeSearchBar from "@/components/HomeSearchBar";

const FEATURED_SLUGS = [
  "software-engineer",
  "doctor",
  "teacher",
  "marketing-manager",
  "graphic-designer",
  "lawyer",
  "data-scientist",
  "civil-engineer",
];

const OCEAN_PREVIEW = [
  { label: "Нээлттэй байдал",      score: 78, color: "#4B7BF5" },
  { label: "Хариуцлагатай байдал", score: 85, color: "#111827" },
  { label: "Нийгэмшил",            score: 62, color: "#6B7280" },
  { label: "Нийцтэй байдал",       score: 71, color: "#374151" },
  { label: "Сэтгэл хөдлөл",        score: 45, color: "#3B6AE8" },
];

export default function HomePage() {
  const featured = FEATURED_SLUGS
    .map((s) => PROFESSIONS.find((p) => p.slug === s))
    .filter(Boolean) as typeof PROFESSIONS;

  const categoryKeys = Object.keys(CATEGORIES) as CategoryKey[];

  return (
    <div>

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden mb-12 sm:mb-20"
        style={{ height: "100vh", minHeight: 560, marginTop: "-4rem", marginLeft: "calc(50% - 50vw)", width: "100vw" }}
      >
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80')" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(10,15,30,0.40) 0%, rgba(10,15,30,0.65) 55%, rgba(10,15,30,0.92) 100%)" }}
        />

        <div className="relative h-full flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto">
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-7 border"
            style={{ background: "rgba(75,123,245,0.18)", color: "#93B8FC", borderColor: "rgba(75,123,245,0.35)" }}
          >
            <i className="fa-solid fa-wand-magic-sparkles text-xs" />
            100+ мэргэжил · MBTI · IQ · EQ тест
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold leading-[1.08] tracking-tight text-white mb-4 sm:mb-6 drop-shadow-sm">
            Өөртөө тохирох<br />
            <span style={{ color: "#93B8FC" }}>мэргэжлээ олоорой</span>
          </h1>

          <p className="text-sm sm:text-lg leading-relaxed mb-7 sm:mb-10 max-w-2xl" style={{ color: "#C4D3F8" }}>
            100 гаруй мэргэжлийн мэдээлэл, MBTI · IQ · EQ тест, хувийн зөвлөмж —
            бүгд Монгол хэлээр.
          </p>

          {/* Search bar */}
          <div className="w-full max-w-xl mb-8">
            <HomeSearchBar />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-8 sm:mb-12 w-full sm:w-auto">
            <Link
              href="/professions"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold transition-all hover:opacity-90 hover:scale-[1.02]"
              style={{ background: "#4B7BF5", color: "#FFFFFF", boxShadow: "0 8px 30px rgba(75,123,245,0.45)" }}
            >
              Мэргэжлүүд үзэх <i className="fa-solid fa-arrow-right text-sm" />
            </Link>
            <Link
              href="/test"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-semibold transition-all hover:bg-white/20"
              style={{ background: "rgba(255,255,255,0.12)", color: "white", border: "1px solid rgba(255,255,255,0.30)" }}
            >
              <i className="fa-solid fa-wand-magic-sparkles text-sm" /> Тест өгөх
            </Link>
          </div>

          <div
            className="flex items-center gap-5 sm:gap-8 px-5 sm:px-8 py-3 sm:py-4 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}
          >
            {[
              { val: "100+", label: "Мэргэжил" },
              { val: "8",    label: "Салбар" },
              { val: "3-in-1", label: "MBTI·IQ·EQ" },
            ].map(({ val, label }, i) => (
              <div key={i} className="text-center">
                <p className="text-base sm:text-xl font-extrabold" style={{ color: "#93B8FC" }}>{val}</p>
                <p className="text-[10px] sm:text-xs mt-0.5 text-white/60">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50">
          <div className="w-px h-10 bg-white/40" />
          <p className="text-white text-[10px] tracking-widest uppercase">Доош гүйлгэх</p>
        </div>
      </section>

      {/* ── CATEGORY GRID ── */}
      <section className="mb-14 sm:mb-24">
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#4B7BF5" }}>Салбараар хайх</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3" style={{ color: "#111827" }}>8 Салбарын мэргэжлүүд</h2>
          <p className="text-base max-w-lg mx-auto" style={{ color: "#6B7280" }}>
            Таны сонирхол, чадварт тохирох салбараа сонгоорой
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categoryKeys.map((key) => {
            const cat   = CATEGORIES[key];
            const count = PROFESSIONS.filter((p) => p.category === key).length;
            return (
              <Link
                key={key}
                href={`/professions?category=${key}`}
                className="group rounded-2xl p-4 sm:p-6 flex flex-col items-center text-center gap-2 sm:gap-3 transition-all hover:-translate-y-1 hover:shadow-lg border"
                style={{
                  background: "#FFFFFF",
                  borderColor: "#E2E7EF",
                  boxShadow: "0 2px 8px rgba(17,24,39,0.04)",
                }}
              >
                <div
                  className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xl sm:text-2xl transition-transform group-hover:scale-110"
                  style={{ background: cat.bg }}
                >
                  {cat.emoji}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: "#111827" }}>{cat.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{count} мэргэжил</p>
                </div>
                <span
                  className="text-[10px] font-semibold px-3 py-1 rounded-full"
                  style={{ background: cat.bg, color: cat.color }}
                >
                  Харах →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── FEATURED PROFESSIONS ── */}
      <section className="mb-14 sm:mb-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#4B7BF5" }}>Онцлох мэргэжлүүд</p>
            <h2 className="text-2xl font-extrabold" style={{ color: "#111827" }}>Өнөөдөр эрэлт ихтэй</h2>
          </div>
          <Link
            href="/professions"
            className="text-sm font-semibold flex items-center gap-1 transition-colors hover:opacity-80"
            style={{ color: "#4B7BF5" }}
          >
            Бүгдийг харах <i className="fa-solid fa-arrow-right text-sm" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {featured.map((p) => {
            const cat = CATEGORIES[p.category];
            return (
              <Link
                key={p.slug}
                href={`/professions/${p.slug}`}
                className="group rounded-2xl p-5 border flex flex-col gap-3 transition-all hover:-translate-y-1 hover:shadow-md"
                style={{ background: "#FFFFFF", borderColor: "#E2E7EF" }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: cat.bg }}
                >
                  {p.emoji}
                </div>
                <div>
                  <p className="font-semibold text-sm group-hover:text-blue-600 transition-colors" style={{ color: "#111827" }}>
                    {p.titleMn}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "#9CA3AF" }}>{p.titleEn}</p>
                </div>
                <span
                  className="text-[10px] font-medium px-2.5 py-0.5 rounded-full w-fit"
                  style={{ background: cat.bg, color: cat.color }}
                >
                  {cat.emoji} {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── TEST CTA ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 items-center mb-14 sm:mb-28">
        {/* OCEAN preview card */}
        <div
          className="rounded-2xl p-7 border"
          style={{ background: "#FFFFFF", borderColor: "#E2E7EF", boxShadow: "0 4px 24px rgba(17,24,39,0.06)" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#4B7BF5" }}>
              <i className="fa-solid fa-brain text-base text-white" />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "#111827" }}>OCEAN Профайл</p>
              <p className="text-xs" style={{ color: "#6B7280" }}>Таны зан чанарын тайлан</p>
            </div>
            <span className="ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "#EEF2FE", color: "#4B7BF5" }}>
              Жишээ
            </span>
          </div>
          <div className="space-y-4">
            {OCEAN_PREVIEW.map(({ label, score, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: "#6B7280" }}>{label}</span>
                  <span className="font-bold" style={{ color }}>{score}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "#E2E7EF" }}>
                  <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-xl" style={{ background: "#EEF2FE" }}>
            <p className="text-xs font-semibold" style={{ color: "#374151" }}>
              ✨ MBTI: INTJ · IQ: Өндөр · EQ: Дунд
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 p-3 rounded-xl" style={{ background: "#D5E3FC" }}>
            <i className="fa-solid fa-bullseye text-sm" style={{ color: "#4B7BF5" }} />
            <p className="text-xs font-bold" style={{ color: "#111827" }}>Зөвлөмж: Програм хангамжийн инженер, Өгөгдлийн эрдэмтэн</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#4B7BF5" }}>Хувийн тест</p>
          <h2 className="text-2xl sm:text-4xl font-extrabold leading-tight mb-4 sm:mb-5" style={{ color: "#111827" }}>
            MBTI · IQ · EQ тест<br />өгч, мэргэжлээ<br />олоорой
          </h2>
          <p className="text-base leading-relaxed mb-8" style={{ color: "#6B7280" }}>
            14 асуулт — зан чанар, оюун ухаан, сэтгэл хөдлөлийн оюун ухааныг
            хэмжиж, таны онцлогт хамгийн тохирох 5 мэргэжлийг санал болгоно.
          </p>
          <div className="space-y-4 mb-8">
            {[
              { n: "01", t: "4 MBTI асуулт",  d: "Зан чанарын 16 төрлийн аль нь болохыг тодорхойлно" },
              { n: "02", t: "5 IQ асуулт",    d: "Логик, дүн шинжилгээ, тооны сэтгэлгээг хэмжинэ" },
              { n: "03", t: "5 EQ асуулт",    d: "Сэтгэл хөдлөлийн оюун ухаан, нийгэмшлийг үнэлнэ" },
              { n: "04", t: "Мэргэжлийн зөвлөмж", d: "Таны үр дүнд суурилсан TOP 5 мэргэжил" },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0"
                  style={{ background: "#EEF2FE", color: "#4B7BF5" }}
                >
                  {s.n}
                </div>
                <div className="pt-0.5">
                  <p className="font-bold text-sm" style={{ color: "#111827" }}>{s.t}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/test"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ background: "#4B7BF5", color: "#FFFFFF", boxShadow: "0 8px 30px rgba(75,123,245,0.40)" }}
          >
            Тест эхлэх <i className="fa-solid fa-arrow-right text-base" />
          </Link>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative -mx-4 sm:-mx-6 mb-14 sm:mb-24 overflow-hidden rounded-none sm:rounded-3xl" style={{ minHeight: 320 }}>
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1600&q=80')" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,15,30,0.82) 0%, rgba(30,45,80,0.68) 100%)" }} />
        <div className="relative flex flex-col items-center justify-center text-center px-6 py-12 sm:py-16">
          <p className="text-xs font-bold uppercase tracking-widest mb-3 text-white/60">Хэрхэн ажилладаг вэ</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-7 sm:mb-10">Дөрвөн алхам</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-3xl mx-auto">
            {[
              { n: "01", t: "Бүртгүүлэх",      e: "📝" },
              { n: "02", t: "Тест өгөх",        e: "🧠" },
              { n: "03", t: "Мэргэжил олох",    e: "🔍" },
              { n: "04", t: "Ажил хайх",        e: "🚀" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div
                  className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xl sm:text-2xl mx-auto mb-2 sm:mb-3"
                  style={{ background: "rgba(75,123,245,0.25)", border: "1px solid rgba(75,123,245,0.40)" }}
                >
                  {s.e}
                </div>
                <p className="text-[10px] font-bold text-white/40 mb-1">{s.n}</p>
                <p className="text-sm font-bold text-white">{s.t}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="mb-14 sm:mb-24">
        <div className="text-center mb-8 sm:mb-14">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#4B7BF5" }}>Давуу тал</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-4" style={{ color: "#111827" }}>Яагаад MindMatch вэ?</h2>
          <p className="text-base max-w-xl mx-auto leading-relaxed" style={{ color: "#6B7280" }}>
            Мэргэжил сонгох, ажил хайх — бүхэл бүтэн карьерын платформ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
          {[
            {
              faIcon: "fa-brain",
              iconBg: "#111827", iconColor: "#FFFFFF",
              title: "MBTI · IQ · EQ Тест",
              desc: "14 асуулт — зан чанар, оюун ухаан, сэтгэл хөдлөлийн оюун ухааныг хамтад нь хэмждэг Монгол хэл дээрх анхны тест.",
              tag: "Монгол хэл дээр", tagBg: "#EEF2FE", tagColor: "#4B7BF5",
            },
            {
              faIcon: "fa-bullseye",
              iconBg: "#4B7BF5", iconColor: "#FFFFFF",
              title: "Хувийн мэргэжлийн зөвлөмж",
              desc: "Таны MBTI, IQ, EQ үр дүнтэй харьцуулж, хамгийн тохирох 5 мэргэжлийг оноор эрэмбэлж гаргана.",
              tag: "Оноо тооцоолол", tagBg: "#D5E3FC", tagColor: "#3B6AE8",
            },
            {
              faIcon: "fa-chart-line",
              iconBg: "#F3F4F6", iconColor: "#374151",
              title: "100+ Мэргэжлийн мэдээлэл",
              desc: "Цалин, шаардлагатай ур чадвар, боловсрол, хэрэгслүүд — бүгд Монгол хэлээр 8 салбарт хамрагдсан.",
              tag: "Монгол мэдээлэл", tagBg: "#F3F4F6", tagColor: "#374151",
            },
          ].map(({ faIcon, iconBg, iconColor, title, desc, tag, tagBg, tagColor }, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 sm:p-8 border transition-all hover:-translate-y-1 hover:shadow-lg cursor-default"
              style={{ background: "#FFFFFF", borderColor: "#E2E7EF" }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: iconBg }}>
                <i className={`fa-solid ${faIcon} text-lg`} style={{ color: iconColor }} />
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: "#111827" }}>{title}</h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "#6B7280" }}>{desc}</p>
              <span className="inline-block text-[11px] font-bold px-3 py-1.5 rounded-full" style={{ background: tagBg, color: tagColor }}>
                {tag}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section
        className="rounded-3xl p-7 sm:p-12 lg:p-16 text-center relative overflow-hidden mb-4"
        style={{ background: "#111827" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(75,123,245,0.22) 0%, transparent 60%)" }}
        />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#93B8FC" }}>Эхлэцгээе</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">Өнөөдөр эхлэх үү?</h2>
          <p className="text-base mb-10 max-w-md mx-auto" style={{ color: "#6B7280" }}>
            Тест өгч, мэргэжлээ олж, зорилгодоо хүрэх замаа тодруул.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/test"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold transition-all hover:opacity-90"
              style={{ background: "#4B7BF5", color: "#FFFFFF", boxShadow: "0 4px 20px rgba(75,123,245,0.40)" }}
            >
              <i className="fa-solid fa-wand-magic-sparkles text-sm" /> Тест өгөх
            </Link>
            <Link
              href="/professions"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-semibold"
              style={{ background: "rgba(255,255,255,0.08)", color: "#C4D3F8", border: "1px solid rgba(75,123,245,0.30)" }}
            >
              <i className="fa-solid fa-briefcase text-sm" /> Мэргэжлүүд харах
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
