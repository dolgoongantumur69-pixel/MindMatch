"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  messages: Message[];
}

const STORAGE_KEY = "admin_ai_history";
const MAX_STORED = 30;

const QUICK_PROMPTS = [
  { icon: "fa-briefcase",     label: "Ажлын байр шалгах",   text: "Энэ ажлын байрны зарыг шалгаад алдаа, дутуу мэдээлэл байвал заана уу:\n" },
  { icon: "fa-building",      label: "Компани тайлбар",      text: "Энэ компанийн профайлыг сайжруулж бичнэ үү:\n" },
  { icon: "fa-shield-halved", label: "Спам илрүүлэх",        text: "Энэ зарыг спам эсэхийг шалгана уу:\n" },
  { icon: "fa-pen-nib",       label: "Нийтлэл бичих",        text: "MindMatch платформын хэрэглэгчдэд зориулсан нийтлэл бичнэ үү. Сэдэв:\n" },
  { icon: "fa-tags",          label: "SEO таг санал болгох",  text: "Энэ ажлын байрны зарт тохирох SEO таг, түлхүүр үг санал болгоно уу:\n" },
  { icon: "fa-star",          label: "Чанар үнэлэх",          text: "Энэ ажлын байрны зарын чанарыг үнэлж, сайжруулах зөвлөмж өгнэ үү:\n" },
];

const S = "#0F1624";
const B = "rgba(255,255,255,0.07)";

function loadHistory(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Conversation[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: Conversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_STORED)));
  } catch {
    // ignore storage errors
  }
}

function newConvId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Өнөөдөр";
  if (diffDays === 1) return "Өчигдөр";
  if (diffDays < 7) return `${diffDays} хоногийн өмнө`;
  return d.toLocaleDateString("mn-MN");
}

export default function AdminAIPage() {
  const [history, setHistory]       = useState<Conversation[]>([]);
  const [activeId, setActiveId]     = useState<string | null>(null);
  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState("");
  const [streaming, setStreaming]   = useState(false);
  const [error, setError]           = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef                   = useRef<HTMLDivElement>(null);
  const textareaRef                 = useRef<HTMLTextAreaElement>(null);

  // Load history on mount
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startNew = useCallback(() => {
    setActiveId(null);
    setMessages([]);
    setInput("");
    setError("");
  }, []);

  const loadConversation = useCallback((conv: Conversation) => {
    setActiveId(conv.id);
    setMessages(conv.messages);
    setError("");
  }, []);

  const deleteConversation = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveHistory(next);
      return next;
    });
    if (activeId === id) startNew();
  }, [activeId, startNew]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || streaming) return;

    const userMsg: Message = { role: "user", content };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setStreaming(true);
    setError("");

    const assistantMsg: Message = { role: "assistant", content: "" };
    setMessages([...next, assistantMsg]);

    try {
      const res = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok) {
        const e = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(e.error ?? "Алдаа гарлаа");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: accumulated };
          return updated;
        });
      }

      // Save to history after complete response
      const finalMessages: Message[] = [...next, { role: "assistant", content: accumulated }];
      const title = content.slice(0, 60) + (content.length > 60 ? "…" : "");

      setHistory((prev) => {
        let updated: Conversation[];
        if (activeId) {
          updated = prev.map((c) => c.id === activeId ? { ...c, messages: finalMessages } : c);
        } else {
          const newConv: Conversation = { id: newConvId(), title, createdAt: new Date().toISOString(), messages: finalMessages };
          setActiveId(newConv.id);
          updated = [newConv, ...prev];
        }
        saveHistory(updated);
        return updated;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Алдаа гарлаа");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setStreaming(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-full -mx-7 -my-7">
      {/* History sidebar */}
      <div
        className="flex flex-col shrink-0 h-full border-r transition-all"
        style={{ width: sidebarOpen ? "260px" : "0px", borderColor: B, background: "#080D18", overflow: "hidden" }}
      >
        <div className="flex items-center justify-between px-4 py-4 shrink-0 border-b" style={{ borderColor: B }}>
          <p className="text-xs font-bold text-white uppercase tracking-widest">Түүх</p>
          <button onClick={startNew}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ background: "rgba(168,85,247,0.15)", color: "#A855F7", border: "1px solid rgba(168,85,247,0.2)" }}>
            <i className="fa-solid fa-plus text-[10px]" />
            Шинэ
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {history.length === 0 ? (
            <p className="text-[11px] text-center px-4 py-8" style={{ color: "#374151" }}>Яриа байхгүй байна</p>
          ) : (
            history.map((conv) => (
              <button key={conv.id} onClick={() => loadConversation(conv)}
                className="w-full text-left px-3 py-2.5 mx-1 rounded-xl transition-all group relative hover:bg-white/[0.03]"
                style={{ background: activeId === conv.id ? "rgba(168,85,247,0.1)" : "transparent", width: "calc(100% - 8px)" }}>
                <p className="text-xs font-medium truncate pr-5" style={{ color: activeId === conv.id ? "#E5E7EB" : "#9CA3AF" }}>
                  {conv.title}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: "#374151" }}>{formatDate(conv.createdAt)}</p>
                {activeId === conv.id && (
                  <span className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full" style={{ background: "#A855F7" }} />
                )}
                <button onClick={(e) => deleteConversation(conv.id, e)}
                  className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:text-red-400"
                  style={{ color: "#4B5563" }}>
                  <i className="fa-solid fa-trash text-[9px]" />
                </button>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top bar */}
        <div className="shrink-0 flex items-center gap-3 px-5 py-3.5 border-b" style={{ borderColor: B }}>
          <button onClick={() => setSidebarOpen((v) => !v)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/[0.05]"
            style={{ color: "#4B5563" }}>
            <i className={`fa-solid ${sidebarOpen ? "fa-sidebar" : "fa-bars"} text-sm`} />
          </button>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.15)" }}>
            <i className="fa-solid fa-robot text-xs" style={{ color: "#A855F7" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">
              {activeId ? (history.find((c) => c.id === activeId)?.title ?? "AI Туслагч") : "AI Туслагч"}
            </p>
            <p className="text-[10px]" style={{ color: "#4B5563" }}>Ажлын байр · Контент · Чанар · SEO</p>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-semibold shrink-0"
            style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.15)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Llama 3.3 70B
          </div>
          {messages.length > 0 && (
            <button onClick={startNew}
              className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.04)", color: "#6B7280", border: "1px solid rgba(255,255,255,0.06)" }}>
              <i className="fa-solid fa-plus mr-1 text-[9px]" />
              Шинэ
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {isEmpty ? (
            <div className="h-full flex flex-col items-center justify-center p-8 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.2)" }}>
                  <i className="fa-solid fa-robot text-2xl" style={{ color: "#A855F7" }} />
                </div>
                <h2 className="text-white font-bold text-base mb-1">MindMatch Admin AI</h2>
                <p className="text-xs" style={{ color: "#4B5563" }}>Ажлын байр, контент, чанар хяналт, SEO-д тусална</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full max-w-xl">
                {QUICK_PROMPTS.map(({ icon, label, text }) => (
                  <button key={label} onClick={() => { setInput(text); textareaRef.current?.focus(); }}
                    className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-left transition-all hover:-translate-y-0.5"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <i className={`fa-solid ${icon} text-xs shrink-0`} style={{ color: "#A855F7" }} />
                    <span className="text-xs font-medium text-white">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-6 py-5 space-y-5 max-w-4xl mx-auto">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                    style={msg.role === "user"
                      ? { background: "rgba(75,123,245,0.2)", color: "#4B7BF5" }
                      : { background: "rgba(168,85,247,0.15)", color: "#A855F7" }}>
                    <i className={`fa-solid ${msg.role === "user" ? "fa-user" : "fa-robot"} text-xs`} />
                  </div>
                  <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                    style={msg.role === "user"
                      ? { background: "rgba(75,123,245,0.15)", color: "#E5E7EB", border: "1px solid rgba(75,123,245,0.2)" }
                      : { background: S, color: "#D1D5DB", border: `1px solid ${B}` }}>
                    {msg.role === "assistant" && msg.content === "" && streaming ? (
                      <span className="inline-flex gap-1.5 items-center" style={{ color: "#A855F7" }}>
                        <i className="fa-solid fa-circle-notch fa-spin text-xs" />
                        <span className="text-xs">Боловсруулж байна...</span>
                      </span>
                    ) : (
                      <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {error && (
          <div className="mx-5 mb-3 rounded-xl px-4 py-3 text-sm shrink-0"
            style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </div>
        )}

        {/* Input */}
        <div className="shrink-0 p-4 border-t" style={{ borderColor: B }}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3 rounded-2xl p-3" style={{ background: S, border: `1px solid ${B}` }}>
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => { setInput(e.target.value); autoResize(); }}
                onKeyDown={handleKey}
                placeholder="Асуулт бичнэ үү... (Shift+Enter шинэ мөр)"
                className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#E5E7EB", minHeight: "42px", maxHeight: "160px" }}
              />
              <button
                onClick={() => void send()}
                disabled={!input.trim() || streaming}
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30 hover:opacity-80 active:scale-95"
                style={{ background: "linear-gradient(135deg,#A855F7,#7C3AED)" }}>
                {streaming
                  ? <i className="fa-solid fa-circle-notch fa-spin text-sm text-white" />
                  : <i className="fa-solid fa-paper-plane text-sm text-white" />}
              </button>
            </div>
            <p className="text-[10px] mt-2 text-center" style={{ color: "#1F2937" }}>
              Enter илгээх · Shift+Enter шинэ мөр · Яриа автоматаар хадгалагдана
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
