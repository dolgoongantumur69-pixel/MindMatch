"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getRecommendedProfessions, CATEGORIES, type RequirementLevel } from "@/data/professions";

/* ─────────────────────────── types ─────────────────────────── */
type Section = "MBTI" | "IQ" | "EQ";

interface Q {
  id: number;
  section: Section;
  label: string;
  text: string;
  options: { text: string; value: string }[];
  dimension?: "EI" | "SN" | "TF" | "JP";
  correct?: string;
  eq?: Record<string, number>;
}

/* ─────────────────────────── questions (30) ─────────────────────────── */
const QUESTIONS: Q[] = [
  /* ── MBTI — 8 questions (2 per dimension) ── */
  {
    id: 1, section: "MBTI", label: "Зан чанар", dimension: "EI",
    text: "Та ихэнхдээ яаж эрч хүч авдаг вэ?",
    options: [
      { text: "Хүмүүстэй цугларч, нийгэмшихэд", value: "E" },
      { text: "Ганцаараа байж, тайван орчинд", value: "I" },
    ],
  },
  {
    id: 2, section: "MBTI", label: "Зан чанар", dimension: "EI",
    text: "Шинэ хүмүүстэй уулзахад та яаж мэдрдэг вэ?",
    options: [
      { text: "Таатай, тэдэнтэй ярилцах дуртай", value: "E" },
      { text: "Тодорхой нөхцөлд л тав тухтай байдаг", value: "I" },
    ],
  },
  {
    id: 3, section: "MBTI", label: "Зан чанар", dimension: "SN",
    text: "Шинэ мэдээлэл хүлээн авахдаа та юунд анхаарах дуртай вэ?",
    options: [
      { text: "Тодорхой баримт, нарийн дэлгэрэнгүйд", value: "S" },
      { text: "Ерөнхий утга учир, ирээдүйн боломжид", value: "N" },
    ],
  },
  {
    id: 4, section: "MBTI", label: "Зан чанар", dimension: "SN",
    text: "Асуудал шийдвэрлэхдээ та юунд тулгуурладаг вэ?",
    options: [
      { text: "Туршлага болон батлагдсан аргуудад", value: "S" },
      { text: "Шинэлэг, бүтээлч шийдлүүдэд", value: "N" },
    ],
  },
  {
    id: 5, section: "MBTI", label: "Зан чанар", dimension: "TF",
    text: "Шийдвэр гаргахдаа та юунд тулгуурладаг вэ?",
    options: [
      { text: "Логик дүн шинжилгээ, шалтгаан үндэслэл", value: "T" },
      { text: "Хүмүүсийн мэдрэмж, өөрийн үнэт зүйлс", value: "F" },
    ],
  },
  {
    id: 6, section: "MBTI", label: "Зан чанар", dimension: "TF",
    text: "Маргааны үед та юуг илүү чухалчилдаг вэ?",
    options: [
      { text: "Логик нотолгоо, баримт мэдээлэл", value: "T" },
      { text: "Хамтын ойлголцол, харилцааны ач холбогдол", value: "F" },
    ],
  },
  {
    id: 7, section: "MBTI", label: "Зан чанар", dimension: "JP",
    text: "Таны өдөр тутмын амьдрал ихэнхдээ ямар байдаг вэ?",
    options: [
      { text: "Төлөвлөгөөтэй, бүтэцтэй, зохион байгуулалттай", value: "J" },
      { text: "Уян хатан, аяндаа явдаг, дасан зохицогч", value: "P" },
    ],
  },
  {
    id: 8, section: "MBTI", label: "Зан чанар", dimension: "JP",
    text: "Та ажлаа хэрхэн хийдэг вэ?",
    options: [
      { text: "Урьдаас төлөвлөж, хугацаагаа чандлан баридаг", value: "J" },
      { text: "Нөхцөл байдлаас хамааран дасан зохицдог", value: "P" },
    ],
  },

  /* ── IQ — 12 questions ── */
  {
    id: 9, section: "IQ", label: "Оюун ухаан", correct: "B",
    text: "2 → 6 → 18 → 54 → __",
    options: [
      { text: "108", value: "A" },
      { text: "162", value: "B" },
      { text: "120", value: "C" },
      { text: "144", value: "D" },
    ],
  },
  {
    id: 10, section: "IQ", label: "Оюун ухаан", correct: "C",
    text: "Дөрвөлжингийн нэг тал 5 бол периметр нь хэд вэ?",
    options: [
      { text: "10", value: "A" },
      { text: "25", value: "B" },
      { text: "20", value: "C" },
      { text: "15", value: "D" },
    ],
  },
  {
    id: 11, section: "IQ", label: "Оюун ухаан", correct: "B",
    text: "○  □  △  ○  □  △  ○  __",
    options: [
      { text: "○", value: "A" },
      { text: "□", value: "B" },
      { text: "△", value: "C" },
      { text: "◇", value: "D" },
    ],
  },
  {
    id: 12, section: "IQ", label: "Оюун ухаан", correct: "B",
    text: "Хэрэв A > B ба B > C бол...",
    options: [
      { text: "C > A", value: "A" },
      { text: "A > C", value: "B" },
      { text: "A = C", value: "C" },
      { text: "Тодорхойгүй", value: "D" },
    ],
  },
  {
    id: 13, section: "IQ", label: "Оюун ухаан", correct: "B",
    text: "3 + 3 × 3 = ?",
    options: [
      { text: "9",  value: "A" },
      { text: "12", value: "B" },
      { text: "18", value: "C" },
      { text: "6",  value: "D" },
    ],
  },
  {
    id: 14, section: "IQ", label: "Оюун ухаан", correct: "C",
    text: "1, 4, 9, 16, 25, __",
    options: [
      { text: "30", value: "A" },
      { text: "35", value: "B" },
      { text: "36", value: "C" },
      { text: "49", value: "D" },
    ],
  },
  {
    id: 15, section: "IQ", label: "Оюун ухаан", correct: "B",
    text: "Гурвалжны дотоод өнцгүүдийн нийлбэр хэд вэ?",
    options: [
      { text: "90°",  value: "A" },
      { text: "180°", value: "B" },
      { text: "270°", value: "C" },
      { text: "360°", value: "D" },
    ],
  },
  {
    id: 16, section: "IQ", label: "Оюун ухаан", correct: "C",
    text: "10 хоног = хэдэн цаг вэ?",
    options: [
      { text: "120", value: "A" },
      { text: "200", value: "B" },
      { text: "240", value: "C" },
      { text: "260", value: "D" },
    ],
  },
  {
    id: 17, section: "IQ", label: "Оюун ухаан", correct: "C",
    text: "3, 6, 12, 24, __ — дараагийн тоо?",
    options: [
      { text: "36", value: "A" },
      { text: "42", value: "B" },
      { text: "48", value: "C" },
      { text: "30", value: "D" },
    ],
  },
  {
    id: 18, section: "IQ", label: "Оюун ухаан", correct: "B",
    text: "6 хоног = 144 цаг бол, 4 хоног = хэдэн цаг вэ?",
    options: [
      { text: "80",  value: "A" },
      { text: "96",  value: "B" },
      { text: "100", value: "C" },
      { text: "112", value: "D" },
    ],
  },
  {
    id: 19, section: "IQ", label: "Оюун ухаан", correct: "B",
    text: "Ном = 200₮, дэвтэр = 50₮. 3 ном + 4 дэвтэр = ?",
    options: [
      { text: "750₮", value: "A" },
      { text: "800₮", value: "B" },
      { text: "850₮", value: "C" },
      { text: "700₮", value: "D" },
    ],
  },
  {
    id: 20, section: "IQ", label: "Оюун ухаан", correct: "A",
    text: "100 -аас 1-ээс 100 хүртэлх бүх тоог нэмвэл хэд болох вэ?",
    options: [
      { text: "5050", value: "A" },
      { text: "5000", value: "B" },
      { text: "4950", value: "C" },
      { text: "5100", value: "D" },
    ],
  },

  /* ── EQ — 10 questions ── */
  {
    id: 21, section: "EQ", label: "Сэтгэл оюун",
    eq: { A: 3, B: 1, C: 0, D: 2 },
    text: "Найз чинь маш уурласан байна. Та юу хийх вэ?",
    options: [
      { text: "Уурын шалтгааныг нь сонирхож асуух", value: "A" },
      { text: "\"Уурлах хэрэггүй\" гэж хэлэх", value: "B" },
      { text: "Ганцаараа орхих", value: "C" },
      { text: "Анхаарлыг нь өөр зүйлд хандуулах", value: "D" },
    ],
  },
  {
    id: 22, section: "EQ", label: "Сэтгэл оюун",
    eq: { A: 3, B: 1, C: 0, D: 0 },
    text: "Та ноцтой алдаа гаргалаа. Та яаж хандах вэ?",
    options: [
      { text: "Алдаанаасаа суралцаж урагшлах", value: "A" },
      { text: "Өөрийгөө маш их буруутгах", value: "B" },
      { text: "Анхаарал хандуулахгүй байх", value: "C" },
      { text: "Бусдыг буруутгах", value: "D" },
    ],
  },
  {
    id: 23, section: "EQ", label: "Сэтгэл оюун",
    eq: { A: 3, B: 1, C: 0, D: 1 },
    text: "Хэн нэгэн таны санааг олон нийтэд шүүмжилнэ. Та...",
    options: [
      { text: "Шүүмжлэлийг сонсож, хэрэгтэй зүйлийг авна", value: "A" },
      { text: "Хамгаалах хандлага гаргана", value: "B" },
      { text: "Уурлана", value: "C" },
      { text: "Гомдоно", value: "D" },
    ],
  },
  {
    id: 24, section: "EQ", label: "Сэтгэл оюун",
    eq: { A: 3, B: 2, C: 0, D: 2 },
    text: "Хамт ажиллагч чинь хүнд стрессд байна. Та...",
    options: [
      { text: "Туслах санал тавих", value: "A" },
      { text: "Нөхцөл байдлыг тайвшруулахыг оролдох", value: "B" },
      { text: "Зөвхөн ажлаа хийх", value: "C" },
      { text: "Хүсвэл нь туслах гэж хянаж байх", value: "D" },
    ],
  },
  {
    id: 25, section: "EQ", label: "Сэтгэл оюун",
    eq: { A: 3, B: 1, C: 2, D: 0 },
    text: "Та урам хугарсан үед яаж сэргэдэг вэ?",
    options: [
      { text: "Шалтгааныг олж, шийдэл хайна", value: "A" },
      { text: "Хэсэг хугацааны дараа аяндаа сэргэнэ", value: "B" },
      { text: "Дотны хүмүүсээсээ дэмжлэг хүсэнэ", value: "C" },
      { text: "Уйтгараа гаднаа гаргана", value: "D" },
    ],
  },
  {
    id: 26, section: "EQ", label: "Сэтгэл оюун",
    eq: { A: 3, B: 0, C: 2, D: 1 },
    text: "Чухал хурлын өмнө та маш их санаа зовж байна. Та юу хийх вэ?",
    options: [
      { text: "Амьсгалаа тэгшлэж, тайвшрах арга хэрэглэнэ", value: "A" },
      { text: "Хурлаас зайлсхийхийг оролддог", value: "B" },
      { text: "Зовоосон зүйлийнхээ талаар найздаа хэлнэ", value: "C" },
      { text: "Санаа зовохгүй байхыг хичээнэ", value: "D" },
    ],
  },
  {
    id: 27, section: "EQ", label: "Сэтгэл оюун",
    eq: { A: 3, B: 0, C: 2, D: 1 },
    text: "Найз нөхдийн бүлэгт нэг хүн ганцаарчилж байгааг анзаарав. Та...",
    options: [
      { text: "Тэр хүнд хандан, байдлыг нь сонирхоно", value: "A" },
      { text: "Бусадтай ярилцсаар байна", value: "B" },
      { text: "Тэр хүнийг бусадтай нийлүүлэхийг хичээнэ", value: "C" },
      { text: "Анзаарсан ч хамаагүй гэж үзнэ", value: "D" },
    ],
  },
  {
    id: 28, section: "EQ", label: "Сэтгэл оюун",
    eq: { A: 3, B: 1, C: 2, D: 1 },
    text: "Та маш их ажил дарамттай. Та яаж зохицуулдаг вэ?",
    options: [
      { text: "Тэргүүлэх ажлаа тогтоож, алхам алхмаар шийднэ", value: "A" },
      { text: "Бүх зүйлийг нэгэн зэрэг хийхийг оролддог", value: "B" },
      { text: "Хэн нэгнээс тусламж хүснэ", value: "C" },
      { text: "Эхлээд хамгийн хялбараас эхэлнэ", value: "D" },
    ],
  },
  {
    id: 29, section: "EQ", label: "Сэтгэл оюун",
    eq: { A: 3, B: 0, C: 1, D: 2 },
    text: "Ажил дээр буруу мэдээлэл тарааж орхив. Та...",
    options: [
      { text: "Даруй алдаагаа хүлээн зөвшөөрч, засна", value: "A" },
      { text: "Хэн анзаарсан бол гэж найдана", value: "B" },
      { text: "Аажим засахыг оролддог", value: "C" },
      { text: "Бусад сайн ажлаар нөхөхийг хичээнэ", value: "D" },
    ],
  },
  {
    id: 30, section: "EQ", label: "Сэтгэл оюун",
    eq: { A: 3, B: 1, C: 0, D: 2 },
    text: "Хэн нэгэн таны хүчин чармайлтыг үл тооно. Та...",
    options: [
      { text: "Яагаад тэгсэнийг тайван ойлгохыг хичээнэ", value: "A" },
      { text: "Гомдоно, харуусна", value: "B" },
      { text: "Ойлгомжгүй байна гэж бодно", value: "C" },
      { text: "Хамт олондоо хандаж, тусламж хүснэ", value: "D" },
    ],
  },
];

/* ─────────────────────────── MBTI lookup ─────────────────────────── */
const MBTI: Record<string, { name: string; desc: string }> = {
  INTJ: { name: "Стратегист",        desc: "Бие даасан, дорвитой, урт хугацааны бодолтой" },
  INTP: { name: "Логикч",            desc: "Шинийг эрэлхийлэгч, аналитик, онолыг хайрладаг" },
  ENTJ: { name: "Командлагч",        desc: "Байгалийн удирдагч, шийдэмгий, зорилготой" },
  ENTP: { name: "Маргаанч",          desc: "Бүтээлч, зоригтой, шинэлэг санааг дэмждэг" },
  INFJ: { name: "Зөгч",              desc: "Тусч, гүн ухаантай, утга учрыг хайрладаг" },
  INFP: { name: "Зуучлагч",          desc: "Идеалист, тусч, өөрийн үнэт зүйлсдээ итгэмжит" },
  ENFJ: { name: "Протагонист",       desc: "Харизматик удирдагч, урам өгнө, хүмүүст анхаардаг" },
  ENFP: { name: "Хөтлөгч",           desc: "Чин сэтгэлийн, бүтээлч, эрч хүчтэй" },
  ISTJ: { name: "Зохион байгуулагч", desc: "Найдвартай, хариуцлагатай, практик" },
  ISFJ: { name: "Хамгаалагч",        desc: "Дулаан зүрхтэй, итгэмжит, бусдыг хамгаалдаг" },
  ESTJ: { name: "Захирагч",          desc: "Зохицуулагч, бодит хандлагатай, хэв журамд итгэдэг" },
  ESFJ: { name: "Консул",            desc: "Анхааралтай, нийгэмч, хамт олонд туслахыг хүсдэг" },
  ISTP: { name: "Виртуоз",           desc: "Дадлагажсан, шинжилгээч, уян хатан" },
  ISFP: { name: "Уран бүтээлч",      desc: "Уян хатан, нийгэмч, урлагийг хайрладаг" },
  ESTP: { name: "Санаачлагч",        desc: "Зоригтой, дадлагажсан, эрч хүчтэй" },
  ESFP: { name: "Тоглогч",           desc: "Аяндаа явдаг, эрч хүчтэй, урам өгнө" },
};

/* ─────────────────────────── scoring ─────────────────────────── */
function calcResults(answers: Record<number, string>) {
  const dim = (q1: number, q2: number, a: string, b: string) => {
    const v1 = answers[q1];
    const v2 = answers[q2];
    const countA = [v1, v2].filter((v) => v === a).length;
    const countB = [v1, v2].filter((v) => v === b).length;
    return countA >= countB ? a : b;
  };
  const mbtiType =
    dim(1, 2, "E", "I") +
    dim(3, 4, "S", "N") +
    dim(5, 6, "T", "F") +
    dim(7, 8, "J", "P");

  const iqQs = QUESTIONS.filter((q) => q.section === "IQ");
  const iqScore = iqQs.filter((q) => answers[q.id] === q.correct).length;

  const eqQs = QUESTIONS.filter((q) => q.section === "EQ");
  const eqScore = eqQs.reduce((sum, q) => sum + (q.eq?.[answers[q.id]] ?? 0), 0);
  const eqMax = eqQs.length * 3;

  return { mbtiType, iqScore, iqTotal: iqQs.length, eqScore, eqMax };
}

/* ─────────────────────────── section meta ─────────────────────────── */
const SECTION_STYLE: Record<Section, { bg: string; text: string; border: string; dot: string; gradFrom: string; gradTo: string }> = {
  MBTI: { bg: "#EEF2FE", text: "#4B7BF5", border: "#4B7BF5", dot: "#4B7BF5", gradFrom: "#4B7BF5", gradTo: "#6366F1" },
  IQ:   { bg: "#FEF9C3", text: "#854D0E", border: "#F59E0B", dot: "#F59E0B", gradFrom: "#F59E0B", gradTo: "#EF4444" },
  EQ:   { bg: "#ECFDF3", text: "#16A34A", border: "#22C55E", dot: "#22C55E", gradFrom: "#22C55E", gradTo: "#059669" },
};

const SECTION_ORDER: Section[] = ["MBTI", "IQ", "EQ"];

/* ─────────────────────────── component ─────────────────────────── */
export default function TestPage() {
  const [phase, setPhase]       = useState<"intro" | "test" | "results">("intro");
  const [index, setIndex]       = useState(0);
  const [answers, setAnswers]   = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [slideState, setSlideState] = useState<"idle" | "exit" | "enter">("idle");
  const [slideDir, setSlideDir] = useState<"left" | "right">("left");

  const q        = QUESTIONS[index];
  const progress = (index / QUESTIONS.length) * 100;

  function animateAndGo(dir: "left" | "right", cb: () => void) {
    setSlideDir(dir);
    setSlideState("exit");
    setTimeout(() => {
      cb();
      setSlideState("enter");
      setTimeout(() => setSlideState("idle"), 30);
    }, 220);
  }

  function choose(value: string) {
    if (slideState !== "idle" || selected) return;
    setSelected(value);
    setAnswers((prev) => ({ ...prev, [q.id]: value }));
    setTimeout(() => {
      animateAndGo("left", () => {
        if (index + 1 >= QUESTIONS.length) {
          setPhase("results");
        } else {
          setIndex((i) => i + 1);
          setSelected(null);
        }
      });
    }, 340);
  }

  function goBack() {
    if (index === 0 || slideState !== "idle") return;
    animateAndGo("right", () => {
      setIndex((i) => i - 1);
      setSelected(null);
    });
  }

  useEffect(() => {
    if (slideState === "enter") {
      const t = setTimeout(() => setSlideState("idle"), 280);
      return () => clearTimeout(t);
    }
  }, [slideState]);

  const cardStyle: React.CSSProperties = {
    transition: "opacity 220ms ease, transform 220ms ease",
    opacity:    slideState === "exit" ? 0 : 1,
    transform:
      slideState === "exit"
        ? `translateX(${slideDir === "left" ? "-32px" : "32px"})`
        : slideState === "enter"
        ? `translateX(${slideDir === "left" ? "32px" : "-32px"})`
        : "translateX(0)",
  };

  /* ── Intro ── */
  if (phase === "intro") {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="rounded-3xl overflow-hidden border" style={{ borderColor: "#E2E7EF", background: "#FFFFFF" }}>
          <div className="p-8" style={{ background: "linear-gradient(135deg, #0D1117 0%, #1A2440 100%)" }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: "rgba(75,123,245,0.25)" }}>
              <i className="fa-solid fa-brain text-lg" style={{ color: "#93B8FC" }} />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Хувийн тест</h1>
            <p className="text-sm mt-2" style={{ color: "#9CA3AF" }}>
              MBTI · IQ · EQ — 3 секцид 30 асуулт
            </p>
          </div>
          <div className="p-6 space-y-3">
            {[
              { icon: "🧠", title: "MBTI — Зан чанар",  desc: "8 асуулт · ~2 минут",  from: "#4B7BF5", to: "#6366F1" },
              { icon: "💡", title: "IQ — Оюун ухаан",   desc: "12 асуулт · ~3 минут", from: "#F59E0B", to: "#EF4444" },
              { icon: "💚", title: "EQ — Сэтгэл оюун",  desc: "10 асуулт · ~2 минут", from: "#22C55E", to: "#059669" },
            ].map((s) => (
              <div key={s.title} className="flex items-center gap-3 rounded-2xl p-3.5" style={{ background: "#F9FAFB" }}>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}
                >
                  {s.icon}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "#111827" }}>{s.title}</p>
                  <p className="text-xs" style={{ color: "#9CA3AF" }}>{s.desc}</p>
                </div>
              </div>
            ))}
            <button
              onClick={() => setPhase("test")}
              className="w-full py-3.5 rounded-2xl text-sm font-extrabold text-white mt-2 transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #4B7BF5, #7C3AED)" }}
            >
              Тестийг эхлүүлэх →
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Results ── */
  if (phase === "results") {
    const { mbtiType, iqScore, iqTotal, eqScore, eqMax } = calcResults(answers);
    const mbti     = MBTI[mbtiType] ?? { name: mbtiType, desc: "" };
    const iqLabel  = iqScore <= 4 ? "Бага" : iqScore <= 8 ? "Дунд" : "Өндөр";
    const iqColor  = iqScore <= 4 ? "#EF4444" : iqScore <= 8 ? "#F59E0B" : "#16A34A";
    const eqPct    = Math.round((eqScore / eqMax) * 100);
    const eqLabel  = eqPct < 40 ? "Бага" : eqPct < 70 ? "Дунд" : "Өндөр";
    const eqColor  = eqPct < 40 ? "#EF4444" : eqPct < 70 ? "#F59E0B" : "#16A34A";

    const iqLevel: RequirementLevel = iqScore <= 4 ? "low" : iqScore <= 8 ? "medium" : "high";
    const eqLevel: RequirementLevel = eqPct < 40 ? "low" : eqPct < 70 ? "medium" : "high";
    const recommended = getRecommendedProfessions(mbtiType, iqLevel, eqLevel, 5);

    return (
      <div className="max-w-lg mx-auto py-10 space-y-4">
        <div className="text-center mb-2">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "#ECFDF3" }}>
            <i className="fa-solid fa-check text-xl" style={{ color: "#16A34A" }} />
          </div>
          <h1 className="text-xl font-extrabold" style={{ color: "#111827" }}>Таны үр дүн</h1>
          <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>30 асуултад хариулсан</p>
        </div>

        <ResultCard color="#4B7BF5" bg="#EEF2FE" emoji="🧠"
          title="MBTI — Зан чанар" badge={mbtiType}
          lines={[mbti.name, mbti.desc]} />

        <ResultCard color={iqColor} bg="#FEF9C3" emoji="💡"
          title="IQ — Оюун ухаан" badge={iqLabel}
          lines={[
            `${iqScore} / ${iqTotal} зөв хариулт`,
            iqScore <= 4 ? "Логик сэтгэлгээгээ илүү хөгжүүлэх боломжтой"
            : iqScore <= 8 ? "Дундаж дээш түвшний логик сэтгэлгээ"
            : "Маш хурц логик сэтгэлгээ",
          ]} />

        <ResultCard color={eqColor} bg="#ECFDF3" emoji="💚"
          title="EQ — Сэтгэл оюун" badge={eqLabel}
          lines={[
            `${eqScore} / ${eqMax} оноо (${eqPct}%)`,
            eqPct < 40 ? "Мэдрэмжийн ухамсраа хөгжүүлэх хэрэгтэй"
            : eqPct < 70 ? "Сайн сэтгэл оюун, илүү нарийн болгох боломжтой"
            : "Өндөр сэтгэлийн оюун — хүмүүстэй харилцахдаа давуу тал",
          ]} />

        {/* Career recommendations */}
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(75,123,245,0.25)" }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ background: "linear-gradient(135deg, #0D1117 0%, #1A2440 100%)" }}>
            <i className="fa-solid fa-wand-magic-sparkles text-sm" style={{ color: "#93B8FC" }} />
            <span className="text-sm font-bold text-white">Таны мэргэжлийн зөвлөмж</span>
            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(75,123,245,0.30)", color: "#93B8FC" }}>
              {mbtiType} · IQ {iqLabel} · EQ {eqLabel}
            </span>
          </div>
          <div className="divide-y" style={{ background: "#FFFFFF" }}>
            {recommended.map((p, i) => {
              const cat = CATEGORIES[p.category];
              const rankColors = ["#F59E0B", "#9CA3AF", "#CD7F32", "#6B7280", "#6B7280"];
              return (
                <Link key={p.slug} href={`/professions/${p.slug}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0"
                    style={{ background: rankColors[i] + "22", color: rankColors[i] }}>{i + 1}</span>
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ background: cat.bg }}>{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#111827" }}>{p.titleMn}</p>
                    <p className="text-[11px] truncate" style={{ color: "#9CA3AF" }}>{p.titleEn} · {cat.name}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{
                      background: p.demandLevel === "high" ? "#DCFCE7" : p.demandLevel === "medium" ? "#FEF3C7" : "#F3F4F6",
                      color:      p.demandLevel === "high" ? "#059669" : p.demandLevel === "medium" ? "#D97706" : "#6B7280",
                    }}>
                      {p.demandLevel === "high" ? "Эрэлт өндөр" : p.demandLevel === "medium" ? "Дунд" : "Бага"}
                    </span>
                    <i className="fa-solid fa-arrow-right text-xs" style={{ color: "#D1D5DB" }} />
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="px-4 py-3" style={{ background: "#F9FAFB", borderTop: "1px solid #F3F4F6" }}>
            <Link href="/professions" className="flex items-center justify-center gap-1.5 text-xs font-semibold hover:opacity-80" style={{ color: "#4B7BF5" }}>
              Бүх мэргэжлийг үзэх <i className="fa-solid fa-arrow-right text-xs" />
            </Link>
          </div>
        </div>

        <button
          onClick={() => { setPhase("intro"); setIndex(0); setAnswers({}); setSelected(null); setSlideState("idle"); }}
          className="w-full py-3 rounded-2xl text-sm font-bold border transition-colors hover:bg-gray-50"
          style={{ borderColor: "#E2E7EF", color: "#6B7280" }}
        >
          Дахин эхлэх
        </button>
      </div>
    );
  }

  /* ── Question ── */
  const ss           = SECTION_STYLE[q.section];
  const sectionQs    = QUESTIONS.filter((x) => x.section === q.section);
  const sectionIdx   = sectionQs.findIndex((x) => x.id === q.id) + 1;
  const currentSecIdx = SECTION_ORDER.indexOf(q.section);

  return (
    <div className="max-w-md mx-auto py-10">

      {/* Section stepper */}
      <div className="flex items-center justify-center gap-3 mb-6">
        {SECTION_ORDER.map((sec, i) => {
          const active  = sec === q.section;
          const done    = i < currentSecIdx;
          const st      = SECTION_STYLE[sec];
          return (
            <div key={sec} className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: done ? st.dot : active ? `linear-gradient(135deg, ${st.gradFrom}, ${st.gradTo})` : "#F3F4F6",
                    color: done || active ? "#FFFFFF" : "#9CA3AF",
                  }}
                >
                  {done ? <i className="fa-solid fa-check text-xs" /> : i + 1}
                </div>
                <span className="text-xs font-semibold hidden sm:inline" style={{ color: active ? st.text : "#9CA3AF" }}>
                  {sec}
                </span>
              </div>
              {i < 2 && <div className="w-8 h-px" style={{ background: done ? st.dot : "#E5E7EB" }} />}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: ss.bg, color: ss.text }}>
            {q.label} · {sectionIdx}/{sectionQs.length}
          </span>
          <span className="text-xs" style={{ color: "#9CA3AF" }}>{index + 1} / {QUESTIONS.length}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#F3F4F6" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${ss.gradFrom}, ${ss.gradTo})` }}
          />
        </div>
      </div>

      {/* Slide card */}
      <div style={cardStyle}>
        <div
          className="rounded-3xl border p-6"
          style={{ borderColor: "#E2E7EF", background: "#FFFFFF" }}
        >
          {q.section === "IQ" && (
            <div className="flex items-center gap-1.5 mb-4">
              <i className="fa-solid fa-wand-magic-sparkles text-xs" style={{ color: "#F59E0B" }} />
              <span className="text-[11px] font-semibold" style={{ color: "#F59E0B" }}>Нэг зөв хариулт байна</span>
            </div>
          )}

          <h2 className="text-lg font-bold leading-snug mb-6" style={{ color: "#111827" }}>
            {q.text}
          </h2>

          <div className="space-y-2.5">
            {q.options.map((opt, i) => {
              const isSelected = selected === opt.value;
              const letters    = ["A", "B", "C", "D"];
              return (
                <button
                  key={opt.value}
                  onClick={() => choose(opt.value)}
                  disabled={!!selected}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all duration-150 disabled:cursor-default hover:border-gray-300"
                  style={{
                    borderColor: isSelected ? ss.border : "#E2E7EF",
                    background:  isSelected ? ss.bg : "#FAFAFA",
                    transform:   isSelected ? "scale(0.985)" : "scale(1)",
                  }}
                >
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all"
                    style={{
                      background: isSelected ? ss.dot : "#F3F4F6",
                      color:      isSelected ? "#FFFFFF" : "#9CA3AF",
                    }}
                  >
                    {isSelected ? <i className="fa-solid fa-check text-sm" /> : letters[i]}
                  </span>
                  <span className="text-sm font-medium" style={{ color: isSelected ? ss.text : "#374151" }}>
                    {opt.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Back button */}
      {index > 0 && (
        <button
          onClick={goBack}
          disabled={slideState !== "idle" || !!selected}
          className="mt-4 flex items-center gap-1.5 text-xs font-semibold mx-auto transition-opacity hover:opacity-70 disabled:opacity-30"
          style={{ color: "#9CA3AF" }}
        >
          <i className="fa-solid fa-arrow-left text-xs" /> Өмнөх асуулт
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────── result card ─────────────────────────── */
function ResultCard({ color, bg, emoji, title, badge, lines }: {
  color: string; bg: string; emoji: string;
  title: string; badge: string; lines: string[];
}) {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "#E2E7EF" }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: bg }}>
        <div className="flex items-center gap-2">
          <span>{emoji}</span>
          <span className="text-xs font-bold" style={{ color }}>{title}</span>
        </div>
        <span className="text-sm font-extrabold px-3 py-1 rounded-full text-white" style={{ background: color }}>
          {badge}
        </span>
      </div>
      <div className="px-4 py-3 space-y-0.5" style={{ background: "#FFFFFF" }}>
        <p className="text-sm font-bold" style={{ color: "#111827" }}>{lines[0]}</p>
        {lines[1] && <p className="text-xs" style={{ color: "#6B7280" }}>{lines[1]}</p>}
      </div>
    </div>
  );
}
