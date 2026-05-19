"use client";

import { useState, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("credentials", { ...form, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Имэйл эсвэл нууц үг буруу байна");
    } else {
      const session = await getSession();
      const dest = session?.user?.role === "EMPLOYER" ? "/employer/dashboard" : "/dashboard";
      router.push(dest);
    }
  }

  const inputSty: React.CSSProperties = {
    border: "1.5px solid #E2E7EF",
    background: "#F7F8FA",
    color: "#111827",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 14,
    width: "100%",
    outline: "none",
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10">
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl p-8 sm:p-10 border"
          style={{ background: "#FFFFFF", borderColor: "#E2E7EF", boxShadow: "0 4px 32px rgba(17,24,39,0.06)" }}
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#111827" }}>
              <i className="fa-solid fa-brain text-base text-white" />
            </div>
            <span className="text-xl font-extrabold" style={{ color: "#111827" }}>
              Mind<span style={{ color: "#4B7BF5" }}>Match</span>
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-center mb-1.5" style={{ color: "#111827" }}>
            Сайн уу, буцаж ирлээ 👋
          </h1>
          <p className="text-sm text-center mb-8" style={{ color: "#6B7280" }}>
            Бүртгэлдээ нэвтэрнэ үү
          </p>

          {params.get("registered") && (
            <div className="px-4 py-3 rounded-xl text-sm mb-5" style={{ background: "#EEF2FE", color: "#3B6AE8", border: "1px solid #D5E3FC" }}>
              ✓ Бүртгэл амжилттай үүслээ. Нэвтэрнэ үү.
            </div>
          )}
          {error && (
            <div className="px-4 py-3 rounded-xl text-sm mb-5" style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECDD3" }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Имэйл хаяг</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
                style={inputSty}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Нууц үг</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  style={{ ...inputSty, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#9CA3AF" }}
                >
                  {showPass ? <i className="fa-solid fa-eye-slash text-sm" /> : <i className="fa-solid fa-eye text-sm" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              style={{ background: "#4B7BF5", boxShadow: "0 4px 14px rgba(75,123,245,0.35)" }}
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Нэвтэрж байна...</>
              ) : (
                <>Нэвтрэх <i className="fa-solid fa-arrow-right text-sm" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-7" style={{ color: "#6B7280" }}>
            Бүртгэлгүй юу?{" "}
            <Link href="/register" className="font-bold hover:underline" style={{ color: "#4B7BF5" }}>Бүртгүүлэх</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
