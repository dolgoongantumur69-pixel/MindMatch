"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useAIDrawer } from "@/context/AIDrawerContext";

interface Message {
  role: "user" | "assistant";
  content: string;
  id: number;
}

const SUGGESTIONS = [
  "Ярилцлагад хэрхэн бэлдэх вэ?",
  "CV-гээ яаж сайжруулах вэ?",
  "Big Five тестийн тухай тайлбарлаач",
  "Цалин хэлэлцэх зөвлөгөө",
];

let idCounter = 0;
const mkId = () => ++idCounter;

export default function AIChatDrawer() {
  const { open, close } = useAIDrawer();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => textareaRef.current?.focus(), 300);
    return () => clearTimeout(id);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (replyTo) { setReplyTo(null); return; }
        readerRef.current?.cancel();
        close();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [close, replyTo]);

  // Cancel any in-flight stream when drawer closes
  useEffect(() => {
    if (!open) readerRef.current?.cancel();
  }, [open]);

  function clearChat() {
    setMessages([]);
    setReplyTo(null);
    setConfirmClear(false);
  }

  async function copy(msg: Message) {
    await navigator.clipboard.writeText(msg.content);
    setCopiedId(msg.id);
    setTimeout(() => setCopiedId(null), 1800);
  }

  async function send(text: string) {
    if (!text.trim() || loading) return;

    const content = replyTo
      ? `[Хариу: "${replyTo.content.slice(0, 80)}${replyTo.content.length > 80 ? "…" : ""}"]\n${text.trim()}`
      : text.trim();

    const userMsg: Message = { role: "user", content, id: mkId() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setReplyTo(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(true);

    const assistantMsg: Message = { role: "assistant", content: "", id: mkId() };
    setMessages([...next, assistantMsg]);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map(({ role, content }) => ({ role, content })),
        }),
      });
      if (!res.body) throw new Error();
      const reader = res.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let full = "";
      let updateTimer: NodeJS.Timeout | null = null;

      const updateUI = () => {
        setMessages([...next, { ...assistantMsg, content: full }]);
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
      setMessages([...next, { ...assistantMsg, content: "Алдаа гарлаа. Дахин оролдоно уу." }]);
    } finally {
      readerRef.current = null;
    }
    setLoading(false);
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(17,24,39,0.25)", backdropFilter: "blur(2px)" }}
          onClick={close}
        />
      )}

      <div
        className="fixed top-0 right-0 z-50 h-full flex flex-col"
        style={{
          width: "min(420px, 100vw)",
          background: "#F7F8FA",
          boxShadow: open ? "-8px 0 40px rgba(17,24,39,0.15)" : "none",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3.5 border-b shrink-0"
          style={{ borderColor: "#E2E7EF", background: "#FFFFFF" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #4B7BF5, #0F766E)" }}
          >
            <i className="fa-solid fa-brain text-sm text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-sm" style={{ color: "#111827" }}>MindMatch AI</p>
            <p className="text-[11px] flex items-center gap-1" style={{ color: "#6B7280" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Карьерын зөвлөх · Llama 3.3 70B
            </p>
          </div>

          {messages.length > 0 && (
            confirmClear ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={clearChat}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all hover:opacity-80"
                  style={{ background: "#FEE2E2", color: "#DC2626" }}
                >
                  Устгах
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all hover:opacity-80"
                  style={{ background: "#F3F4F6", color: "#6B7280" }}
                >
                  Болих
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="p-2 rounded-xl transition-all hover:opacity-70"
                style={{ background: "#FEF2F2", color: "#EF4444" }}
                title="Чат цэвэрлэх"
              >
                <i className="fa-solid fa-trash text-xs" />
              </button>
            )
          )}

          <button
            onClick={close}
            className="p-2 rounded-xl transition-all hover:opacity-70"
            style={{ background: "#F0F0F5", color: "#6B7280" }}
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-2">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #4B7BF5, #0F766E)" }}
              >
                <i className="fa-solid fa-wand-magic-sparkles text-xl text-white" />
              </div>
              <div>
                <p className="font-extrabold mb-1" style={{ color: "#111827" }}>
                  Сайн уу, {session?.user?.name?.split(" ")[0] ?? "та"}!
                </p>
                <p className="text-xs" style={{ color: "#6B7280" }}>
                  Карьерын асуулт, зөвлөгөө — бүгдийг асуугаарай
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2 w-full">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left px-3 py-2.5 rounded-xl text-xs transition-all hover:opacity-80"
                    style={{ background: "#FFFFFF", border: "1.5px solid #E2E7EF", color: "#374151" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 group ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              onMouseEnter={() => setHoveredId(msg.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {msg.role === "assistant" && (
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "linear-gradient(135deg, #4B7BF5, #0F766E)" }}
                >
                  <i className="fa-solid fa-robot text-xs text-white" />
                </div>
              )}

              <div className="flex flex-col gap-1 max-w-[80%]">
                {/* Reply quote if this message starts with a reply marker */}
                {msg.role === "user" && msg.content.startsWith("[Хариу:") && (
                  <div
                    className="text-[10px] px-2 py-1 rounded-lg italic truncate"
                    style={{ background: "rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.75)", borderLeft: "2px solid rgba(255,255,255,0.5)" }}
                  >
                    {msg.content.split("\n")[0].replace("[Хариу: ", "").replace(/"\]$/, "")}
                  </div>
                )}

                <div
                  className="px-3 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap"
                  style={
                    msg.role === "user"
                      ? { background: "linear-gradient(135deg,#4B7BF5,#3B6AE8)", color: "#FFF", borderBottomRightRadius: 4 }
                      : { background: "#FFF", color: "#111827", border: "1.5px solid #E2E7EF", borderBottomLeftRadius: 4, boxShadow: "0 1px 4px rgba(17,24,39,0.05)" }
                  }
                >
                  {msg.content
                    ? (msg.role === "user" && msg.content.startsWith("[Хариу:")
                        ? msg.content.split("\n").slice(1).join("\n")
                        : msg.content)
                    : (
                      <span className="flex gap-1 items-center" style={{ color: "#9CA3AF" }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
                      </span>
                    )
                  }
                </div>

                {/* Action buttons */}
                {msg.content && hoveredId === msg.id && (
                  <div className={`flex gap-1 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <button
                      onClick={() => setReplyTo(msg)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] transition-all hover:opacity-80"
                      style={{ background: "#EEF2FE", color: "#4B7BF5" }}
                    >
                      <i className="fa-solid fa-reply" style={{ fontSize: "10px" }} />Хариулах
                    </button>
                    <button
                      onClick={() => copy(msg)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] transition-all hover:opacity-80"
                      style={{ background: "#F3F4F6", color: "#6B7280" }}
                    >
                      {copiedId === msg.id
                        ? <><i className="fa-solid fa-check" style={{ fontSize: "10px" }} />Хуулагдлаа</>
                        : <><i className="fa-solid fa-copy" style={{ fontSize: "10px" }} />Хуулах</>
                      }
                    </button>
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold text-white"
                  style={{ background: "#374151" }}
                >
                  {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div
          className="px-4 py-3 border-t shrink-0"
          style={{ borderColor: "#E2E7EF", background: "#FFFFFF" }}
        >
          {/* Reply preview */}
          {replyTo && (
            <div
              className="flex items-start gap-2 mb-2 px-3 py-2 rounded-xl"
              style={{ background: "#EEF2FE", borderLeft: "3px solid #4B7BF5" }}
            >
              <i className="fa-solid fa-reply mt-0.5 shrink-0" style={{ color: "#4B7BF5", fontSize: "10px" }} />
              <p className="text-[11px] flex-1 truncate" style={{ color: "#374151" }}>
                {replyTo.content.slice(0, 100)}{replyTo.content.length > 100 ? "…" : ""}
              </p>
              <button onClick={() => setReplyTo(null)} style={{ color: "#9CA3AF" }}>
                <i className="fa-solid fa-xmark" style={{ fontSize: "10px" }} />
              </button>
            </div>
          )}

          <div
            className="flex items-end gap-2 rounded-xl px-3 py-2"
            style={{ border: "1.5px solid #E2E7EF", background: "#F7F8FA" }}
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
              }}
              onKeyDown={handleKey}
              placeholder={replyTo ? "Хариулт бичнэ үү..." : "Асуулт бичнэ үү..."}
              className="flex-1 resize-none bg-transparent text-xs outline-none"
              style={{ color: "#111827", minHeight: "22px", maxHeight: "100px" }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all hover:opacity-80 disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #4B7BF5, #0F766E)" }}
            >
              <i className="fa-solid fa-paper-plane text-xs text-white" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
