"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeSearchBar() {
  const [q, setQ] = useState("");
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();
    router.push(trimmed ? `/professions?q=${encodeURIComponent(trimmed)}` : "/professions");
  };

  return (
    <form onSubmit={submit} className="relative w-full max-w-xl mx-auto">
      <i
        className="fa-solid fa-magnifying-glass text-base absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "#9CA3AF" }}
      />
      <input
        type="text"
        placeholder="Мэргэжил хайх... (жишээ: программист, эмч)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full pl-12 pr-36 py-4 rounded-2xl text-sm outline-none"
        style={{
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.25)",
          color: "#FFFFFF",
          backdropFilter: "blur(10px)",
        }}
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
        style={{ background: "#4B7BF5", color: "#FFFFFF" }}
      >
        Хайх
      </button>
    </form>
  );
}
