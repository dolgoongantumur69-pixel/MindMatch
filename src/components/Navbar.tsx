"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useAIDrawer } from "@/context/AIDrawerContext";

export default function Navbar() {
  const { data: session } = useSession();
  const { toggle: toggleAI } = useAIDrawer();
  const pathname   = usePathname();
  const isHome     = pathname === "/";
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    if (!isHome) { setScrolled(true); return; }
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const glass    = isHome && !scrolled;
  const isActive = (href: string) => pathname.startsWith(href) && href !== "/";

  const NavLink = ({ href, label, icon, mobile = false }: { href: string; label: string; icon: React.ReactNode; mobile?: boolean }) => {
    const active = isActive(href);
    if (mobile) {
      return (
        <Link href={href} onClick={() => setMenuOpen(false)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
          style={{
            color:      active ? "#4B7BF5" : "#374151",
            background: active ? "#EEF2FE" : "transparent",
            fontWeight: active ? 600 : 400,
          }}>
          {icon}{label}
        </Link>
      );
    }
    return (
      <Link href={href}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all"
        style={{
          color:      active ? (glass ? "#93B8FC" : "#4B7BF5") : (glass ? "rgba(255,255,255,0.80)" : "#6B7280"),
          background: active ? (glass ? "rgba(75,123,245,0.15)" : "#EEF2FE") : "transparent",
          fontWeight: active ? 600 : 400,
        }}>
        {icon}{label}
      </Link>
    );
  };

  return (
    <>
      <header
        className="fixed top-0 z-50 w-full transition-all duration-300"
        style={{
          background:           glass ? "transparent" : "rgba(247,248,250,0.95)",
          backdropFilter:       glass ? "none" : "blur(14px)",
          WebkitBackdropFilter: glass ? "none" : "blur(14px)",
          borderBottom:         glass ? "1px solid transparent" : "1px solid #E2E7EF",
          boxShadow:            glass ? "none" : "0 1px 16px rgba(17,24,39,0.05)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex h-14 sm:h-16 items-center justify-between">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold text-base shrink-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: glass ? "rgba(255,255,255,0.15)" : "#111827", border: glass ? "1px solid rgba(255,255,255,0.25)" : "none" }}>
                <i className="fa-solid fa-brain text-sm text-white" />
              </div>
              <span style={{ color: glass ? "#FFFFFF" : "#111827" }}>
                Mind<span style={{ color: "#4B7BF5" }}>Match</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink href="/professions" label="Мэргэжлүүд" icon={<i className="fa-solid fa-book-open text-sm" />} />
              <NavLink href="/jobs"        label="Ажлын байр" icon={<i className="fa-solid fa-briefcase text-sm" />} />

              {session ? (
                <>
                  {session.user.role === "JOBSEEKER" && (
                    <>
                      <NavLink href="/assessment" label="Тест"    icon={<i className="fa-solid fa-wand-magic-sparkles text-sm" />} />
                      <button onClick={toggleAI}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:opacity-80"
                        style={{ color: glass ? "#93B8FC" : "#4B7BF5", background: glass ? "rgba(75,123,245,0.15)" : "#EEF2FE" }}>
                        <i className="fa-solid fa-robot text-sm" />AI
                      </button>
                      <NavLink href="/dashboard" label="Самбар"  icon={<i className="fa-solid fa-gauge-high text-sm" />} />
                      <NavLink href="/profile"   label="Профайл" icon={<i className="fa-solid fa-gear text-sm" />} />
                    </>
                  )}
                  {session.user.role === "EMPLOYER" && (
                    <>
                      <Link href="/employer/post-job"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                        style={{ color: glass ? "#93B8FC" : "#4B7BF5", background: glass ? "rgba(75,123,245,0.15)" : "#EEF2FE" }}>
                        <i className="fa-solid fa-plus text-sm" />Ажил нийтлэх
                      </Link>
                      <button onClick={toggleAI}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:opacity-80"
                        style={{ color: glass ? "#93B8FC" : "#4B7BF5", background: glass ? "rgba(75,123,245,0.15)" : "#EEF2FE" }}>
                        <i className="fa-solid fa-robot text-sm" />AI
                      </button>
                      <NavLink href="/employer/dashboard" label="Самбар"  icon={<i className="fa-solid fa-gauge-high text-sm" />} />
                      <NavLink href="/profile"            label="Профайл" icon={<i className="fa-solid fa-gear text-sm" />} />
                    </>
                  )}

                  <div className="w-px h-5 mx-1" style={{ background: glass ? "rgba(255,255,255,0.20)" : "#E2E7EF" }} />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: "#4B7BF5", color: "#FFFFFF" }}>
                      {session.user.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <button onClick={() => signOut({ callbackUrl: "/" })}
                      className="p-1.5 rounded-lg transition-all hover:bg-gray-100"
                      style={{ color: glass ? "rgba(255,255,255,0.70)" : "#9CA3AF" }} title="Гарах">
                      <i className="fa-solid fa-right-from-bracket text-xs" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-3 py-1.5 rounded-lg text-sm transition-all"
                    style={{ color: glass ? "rgba(255,255,255,0.80)" : "#6B7280" }}>
                    Нэвтрэх
                  </Link>
                  <Link href="/register"
                    className="px-5 py-2 rounded-lg text-sm font-bold transition-all hover:opacity-90"
                    style={{ background: "#4B7BF5", color: "#FFFFFF", boxShadow: "0 2px 8px rgba(75,123,245,0.35)" }}>
                    Бүртгүүлэх
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile right side */}
            <div className="flex md:hidden items-center gap-2">
              {session && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "#4B7BF5", color: "#FFFFFF" }}>
                  {session.user.name?.[0]?.toUpperCase() ?? "U"}
                </div>
              )}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="p-2 rounded-xl transition-all"
                style={{ color: glass ? "#FFFFFF" : "#374151", background: glass ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.04)" }}
              >
                {menuOpen ? <i className="fa-solid fa-xmark text-base" /> : <i className="fa-solid fa-bars text-base" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(0,0,0,0.25)" }}
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile menu drawer */}
      <div
        className="fixed top-14 left-0 right-0 z-40 md:hidden transition-all duration-200"
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #E2E7EF",
          boxShadow: "0 8px 32px rgba(17,24,39,0.12)",
          transform: menuOpen ? "translateY(0)" : "translateY(-110%)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
        }}
      >
        <div className="px-4 py-4 space-y-1">
          <NavLink mobile href="/professions" label="Мэргэжлүүд" icon={<i className="fa-solid fa-book-open text-sm" />} />
          <NavLink mobile href="/jobs"        label="Ажлын байр" icon={<i className="fa-solid fa-briefcase text-sm" />} />

          {session ? (
            <>
              {session.user.role === "JOBSEEKER" && (
                <>
                  <NavLink mobile href="/assessment" label="Тест"    icon={<i className="fa-solid fa-wand-magic-sparkles text-sm" />} />
                  <NavLink mobile href="/dashboard"  label="Самбар"  icon={<i className="fa-solid fa-gauge-high text-sm" />} />
                  <NavLink mobile href="/profile"    label="Профайл" icon={<i className="fa-solid fa-gear text-sm" />} />
                  <button onClick={() => { toggleAI(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                    style={{ color: "#4B7BF5", background: "#EEF2FE" }}>
                    <i className="fa-solid fa-robot text-sm" />AI Туслагч
                  </button>
                </>
              )}
              {session.user.role === "EMPLOYER" && (
                <>
                  <NavLink mobile href="/employer/post-job"   label="Ажил нийтлэх" icon={<i className="fa-solid fa-plus text-sm" />} />
                  <NavLink mobile href="/employer/dashboard"  label="Самбар"        icon={<i className="fa-solid fa-gauge-high text-sm" />} />
                  <NavLink mobile href="/profile"             label="Профайл"       icon={<i className="fa-solid fa-gear text-sm" />} />
                </>
              )}
              <div className="pt-2 mt-2 border-t" style={{ borderColor: "#F3F4F6" }}>
                <button onClick={() => { signOut({ callbackUrl: "/" }); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                  style={{ color: "#EF4444" }}>
                  <i className="fa-solid fa-right-from-bracket text-sm" />Гарах
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/login" onClick={() => setMenuOpen(false)}
                className="w-full text-center px-4 py-3 rounded-xl text-sm font-medium border transition-all"
                style={{ color: "#374151", borderColor: "#E2E7EF" }}>
                Нэвтрэх
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)}
                className="w-full text-center px-4 py-3 rounded-xl text-sm font-bold transition-all"
                style={{ background: "#4B7BF5", color: "#FFFFFF" }}>
                Бүртгүүлэх
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
