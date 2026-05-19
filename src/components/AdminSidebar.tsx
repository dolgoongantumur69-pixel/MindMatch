"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin",              label: "Дашбоард",    faIcon: "fa-gauge-high",      exact: true  },
  { href: "/admin/users",        label: "Хэрэглэгчид", faIcon: "fa-users",           exact: false },
  { href: "/admin/jobs",         label: "Ажлын байр",  faIcon: "fa-briefcase",       exact: false },
  { href: "/admin/applications", label: "Өргөдлүүд",   faIcon: "fa-clipboard-list",  exact: false },
  { href: "/admin/ai",           label: "AI Туслагч",  faIcon: "fa-robot",           exact: false },
];

export default function AdminSidebar({ email, name }: { email: string; name: string }) {
  const pathname = usePathname();
  const active = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div
      className="w-60 flex flex-col h-full"
      style={{
        background: "linear-gradient(180deg,#0A0E1A 0%,#0D1117 100%)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg,#4B7BF5,#7C3AED)" }}
          >
            <i className="fa-solid fa-bolt text-sm text-white" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-white tracking-tight">MindMatch</p>
            <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "#4B7BF5" }}>
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[9px] font-bold tracking-widest uppercase px-3 mb-3" style={{ color: "#1F2937" }}>
          Үндсэн цэс
        </p>
        {NAV.map(({ href, label, faIcon, exact }) => {
          const on = active(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                color:      on ? "#FFFFFF" : "#4B5563",
                background: on ? "rgba(75,123,245,0.15)" : "transparent",
                borderLeft: `2px solid ${on ? "#4B7BF5" : "transparent"}`,
              }}
            >
              <i className={`fa-solid ${faIcon} text-sm shrink-0`} style={{ color: on ? "#4B7BF5" : "#374151" }} />
              {label}
              {on && <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: "#4B7BF5" }} />}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 text-white"
            style={{ background: "linear-gradient(135deg,#4B7BF5,#7C3AED)" }}
          >
            {name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{name || "Admin"}</p>
            <p className="text-[10px] truncate" style={{ color: "#374151" }}>{email}</p>
          </div>
          <i className="fa-solid fa-shield text-xs shrink-0" style={{ color: "#4B7BF5" }} />
        </div>
      </div>
    </div>
  );
}
