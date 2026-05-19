"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const GOOGLE_ICON = (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]         = useState({ name: "", email: "", password: "", role: "JOBSEEKER" });
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) setError(data.error ?? "Алдаа гарлаа");
      else router.push("/login?registered=1");
    } catch {
      setLoading(false);
      setError("Серверт холбогдоход алдаа гарлаа");
    }
  }

  async function handleOAuth(provider: string) {
    setOauthLoading(provider);
    await signIn(provider, { callbackUrl: "/dashboard" });
  }

  const inputSty: React.CSSProperties = {
    border: "1.5px solid #E2E7EF", background: "#F7F8FA", color: "#111827",
    borderRadius: 10, padding: "10px 14px", fontSize: 14, width: "100%", outline: "none",
    transition: "border-color 0.15s",
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10">
      <div className="w-full max-w-md">
        <div className="rounded-2xl p-8 sm:p-10 border"
          style={{ background: "#FFFFFF", borderColor: "#E2E7EF", boxShadow: "0 4px 32px rgba(17,24,39,0.06)" }}>

          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#111827" }}>
              <i className="fa-solid fa-brain text-base text-white" />
            </div>
            <span className="text-xl font-extrabold" style={{ color: "#111827" }}>
              Mind<span style={{ color: "#4B7BF5" }}>Match</span>
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-center mb-1.5" style={{ color: "#111827" }}>Бүртгэл үүсгэх</h1>
          <p className="text-sm text-center mb-7" style={{ color: "#6B7280" }}>Үнэгүй бүртгүүлж тохирох ажлаа олоорой</p>

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm mb-5" style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECDD3" }}>
              ⚠ {error}
            </div>
          )}

          {/* Google button */}
          <button onClick={() => void handleOAuth("google")}
            disabled={!!oauthLoading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:shadow-md disabled:opacity-60 mb-6"
            style={{ background: "#FFFFFF", border: "1.5px solid #E2E7EF", color: "#374151", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            {oauthLoading === "google"
              ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              : GOOGLE_ICON}
            Google-ээр бүртгүүлэх
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: "#E2E7EF" }} />
            <span className="text-xs font-medium" style={{ color: "#9CA3AF" }}>эсвэл имэйлээр</span>
            <div className="flex-1 h-px" style={{ background: "#E2E7EF" }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {([
              { k: "name",  label: "Нэр",   type: "text",  ph: "Таны бүтэн нэр" },
              { k: "email", label: "Имэйл", type: "email", ph: "email@example.com" },
            ] as const).map(({ k, label, type, ph }) => (
              <div key={k}>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>{label}</label>
                <input type={type} required value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  placeholder={ph} style={inputSty} />
              </div>
            ))}

            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: "#374151" }}>Нууц үг</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} required minLength={6} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Дор хаяж 6 тэмдэгт" style={{ ...inputSty, paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }}>
                  {showPass ? <i className="fa-solid fa-eye-slash text-sm" /> : <i className="fa-solid fa-eye text-sm" />}
                </button>
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: "#374151" }}>Би...</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "JOBSEEKER", label: "Ажил хайж байна", icon: "fa-user-tie" },
                  { value: "EMPLOYER",  label: "Ажилтан авна",    icon: "fa-building" },
                ].map(({ value, label, icon }) => (
                  <button key={value} type="button" onClick={() => setForm({ ...form, role: value })}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border"
                    style={{
                      background:   form.role === value ? "#EEF2FE"   : "#F7F8FA",
                      borderColor:  form.role === value ? "#4B7BF5"   : "#E2E7EF",
                      color:        form.role === value ? "#4B7BF5"   : "#6B7280",
                      fontWeight:   form.role === value ? 600         : 400,
                    }}>
                    <i className={`fa-solid ${icon} text-sm`} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
              style={{ background: "#4B7BF5", boxShadow: "0 4px 14px rgba(75,123,245,0.35)" }}>
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Бүртгэж байна...</>
                : <>Бүртгүүлэх <i className="fa-solid fa-arrow-right text-sm" /></>}
            </button>
          </form>

          <p className="text-center text-sm mt-7" style={{ color: "#6B7280" }}>
            Бүртгэлтэй юу?{" "}
            <Link href="/login" className="font-bold hover:underline" style={{ color: "#4B7BF5" }}>Нэвтрэх</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
