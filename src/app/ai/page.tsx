"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Ярилцлагад хэрхэн бэлдэх вэ?",
  "CV-гээ яаж сайжруулах вэ?",
  "Big Five тестийн тухай тайлбарлаач",
  "Цалин хэлэлцэх зөвлөгөө өгөөч",
  "Кариераа яаж сонгох вэ?",
  "Ажил хайх стратеги",
];

export default function AIPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages([...next, assistantMsg]);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.body) throw new Error("No stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      let updateTimer: NodeJS.Timeout | null = null;
      
      const updateUI = () => {
        setMessages([...next, { role: "assistant", content: full }]);
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        
        // Batch updates: only update UI every 100ms instead of every chunk
        if (!updateTimer) {
          updateTimer = setTimeout(() => {
            updateUI();
            updateTimer = null;
          }, 100);
        }
      }
      
      // Final update to ensure all content is rendered
      if (updateTimer) clearTimeout(updateTimer);
      updateUI();
    } catch {
      setMessages([...next, { role: "assistant", content: "Алдаа гарлаа. Дахин оролдоно уу." }]);
    }
    setLoading(false);
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col" style={{ height: "calc(100vh - 64px)" }}>

      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 border-b shrink-0"
        style={{ borderColor: "#E2E7EF", background: "#FFFFFF" }}
      >
        <Link
          href="/dashboard"
          className="p-2 rounded-xl transition-all hover:opacity-70"
          style={{ background: "#F0FDFA", color: "#4B7BF5" }}
        >
          <i className="fa-solid fa-arrow-left text-sm" />
        </Link>
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #4B7BF5, #0F766E)" }}
        >
          <i className="fa-solid fa-brain text-base text-white" />
        </div>
        <div>
          <p className="font-extrabold text-sm" style={{ color: "#111827" }}>MindMatch AI</p>
          <p className="text-xs flex items-center gap-1" style={{ color: "#6B7280" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            Карьерын зөвлөх
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4" style={{ background: "#F7F8FA" }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #4B7BF5, #0F766E)" }}
            >
              <i className="fa-solid fa-wand-magic-sparkles text-xl text-white" />
            </div>
            <div>
              <p className="text-lg font-extrabold mb-1" style={{ color: "#111827" }}>
                Сайн уу, {session?.user?.name?.split(" ")[0] ?? "та"}!
              </p>
              <p className="text-sm" style={{ color: "#6B7280" }}>
                Карьерын асуулт, зөвлөгөө — бүгдийг асуугаарай
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left px-4 py-3 rounded-2xl text-sm transition-all hover:opacity-80"
                  style={{
                    background: "#FFFFFF",
                    border: "1.5px solid #E2E7EF",
                    color: "#374151",
                    boxShadow: "0 1px 4px rgba(17,24,39,0.04)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "linear-gradient(135deg, #4B7BF5, #0F766E)" }}
              >
                <i className="fa-solid fa-robot text-sm text-white" />
              </div>
            )}

            <div
              className="max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
              style={
                msg.role === "user"
                  ? {
                      background: "linear-gradient(135deg, #4B7BF5, #3B6AE8)",
                      color: "#FFFFFF",
                      borderBottomRightRadius: 4,
                    }
                  : {
                      background: "#FFFFFF",
                      color: "#111827",
                      border: "1.5px solid #E2E7EF",
                      borderBottomLeftRadius: 4,
                      boxShadow: "0 1px 6px rgba(17,24,39,0.05)",
                    }
              }
            >
              {msg.content || (
                <span className="flex gap-1 items-center" style={{ color: "#9CA3AF" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              )}
            </div>

            {msg.role === "user" && (
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-white"
                style={{ background: "#374151" }}
              >
                {session?.user?.name?.[0]?.toUpperCase() ?? <i className="fa-solid fa-user text-sm" />}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="px-4 py-4 border-t shrink-0"
        style={{ borderColor: "#E2E7EF", background: "#FFFFFF" }}
      >
        <div
          className="flex items-end gap-3 rounded-2xl px-4 py-3"
          style={{ border: "1.5px solid #E2E7EF", background: "#F7F8FA" }}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={handleKey}
            placeholder="Асуулт бичнэ үү... (Enter илгээх)"
            className="flex-1 resize-none bg-transparent text-sm outline-none"
            style={{ color: "#111827", minHeight: "24px", maxHeight: "120px" }}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all hover:opacity-80 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #4B7BF5, #0F766E)" }}
          >
            <i className="fa-solid fa-paper-plane text-sm text-white" />
          </button>
        </div>
        <p className="text-[11px] text-center mt-2" style={{ color: "#9CA3AF" }}>
          MindMatch AI · Llama 3.3 70B powered by Groq
        </p>
      </div>
    </div>
  );
}
