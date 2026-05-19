"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  { icon: "fa-briefcase",    label: "Ажлын байр шалгах",    text: "Энэ ажлын байрны зарыг шалгаад алдаа, дутуу мэдээлэл байвал заана уу: " },
  { icon: "fa-building",     label: "Компани тайлбар",       text: "Энэ компанийн профайлыг сайжруулж бичнэ үү: " },
  { icon: "fa-shield-halved",label: "Спам илрүүлэх",         text: "Энэ зарыг спам эсэхийг шалгана уу: " },
  { icon: "fa-pen-nib",      label: "Нийтлэл бичих",         text: "MindMatch платформын хэрэглэгчдэд зориулсан нийтлэл бичнэ үү. Сэдэв: " },
  { icon: "fa-tags",         label: "SEO таг санал болгох",  text: "Энэ ажлын байрны зарт тохирох SEO таг, түлхүүр үг санал болгоно уу: " },
  { icon: "fa-star",         label: "Чанар үнэлэх",          text: "Энэ ажлын байрны зарын чанарыг үнэлж, сайжруулах зөвлөмж өгнэ үү: " },
];

const S = "#0F1624";
const B = "rgba(255,255,255,0.07)";

export default function AdminAIPage() {
  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState("");
  const [streaming, setStreaming]   = useState(false);
  const [error, setError]           = useState("");
  const bottomRef                   = useRef<HTMLDivElement>(null);
  const textareaRef                 = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

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
    <div className="flex flex-col h-[calc(100vh-6rem)] max-h-[860px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 shrink-0">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(168,85,247,0.15)" }}>
          <i className="fa-solid fa-robot text-base" style={{ color: "#A855F7" }} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-white">AI Туслагч</h1>
          <p className="text-xs mt-0.5" style={{ color: "#4B5563" }}>Ажлын байр, контент, чанар хяналт, SEO</p>
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.15)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Llama 3.3 70B
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto rounded-2xl mb-4" style={{ background: S, border: `1px solid ${B}` }}>
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center p-6 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.2)" }}>
                <i className="fa-solid fa-robot text-2xl" style={{ color: "#A855F7" }} />
              </div>
              <h2 className="text-white font-bold text-base mb-1">MindMatch Admin AI</h2>
              <p className="text-xs" style={{ color: "#4B5563" }}>Ажлын байр, контент, чанар хяналт, SEO-д тусална</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full max-w-xl">
              {QUICK_PROMPTS.map(({ icon, label, text }) => (
                <button key={label} onClick={() => setInput(text)}
                  className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-left transition-all hover:-translate-y-0.5"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <i className={`fa-solid ${icon} text-xs shrink-0`} style={{ color: "#A855F7" }} />
                  <span className="text-xs font-medium text-white">{label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                  style={msg.role === "user"
                    ? { background: "rgba(75,123,245,0.2)", color: "#4B7BF5" }
                    : { background: "rgba(168,85,247,0.15)", color: "#A855F7" }}>
                  <i className={`fa-solid ${msg.role === "user" ? "fa-user" : "fa-robot"} text-xs`} />
                </div>
                {/* Bubble */}
                <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"
                }`}
                  style={msg.role === "user"
                    ? { background: "rgba(75,123,245,0.15)", color: "#E5E7EB", border: "1px solid rgba(75,123,245,0.2)" }
                    : { background: "rgba(255,255,255,0.04)", color: "#D1D5DB", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {msg.role === "assistant" && msg.content === "" && streaming ? (
                    <span className="inline-flex gap-1 items-center" style={{ color: "#A855F7" }}>
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
        <div className="mb-3 rounded-xl px-4 py-3 text-sm shrink-0" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
          {error}
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 rounded-2xl p-3" style={{ background: S, border: `1px solid ${B}` }}>
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => { setInput(e.target.value); autoResize(); }}
            onKeyDown={handleKey}
            placeholder="Асуулт бичнэ үү... (Shift+Enter шинэ мөр)"
            className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
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
        {messages.length > 0 && (
          <div className="flex items-center justify-between mt-2.5 px-1">
            <p className="text-[10px]" style={{ color: "#374151" }}>Enter илгээх · Shift+Enter шинэ мөр</p>
            <button onClick={() => setMessages([])} className="text-[10px] transition-opacity hover:opacity-70" style={{ color: "#374151" }}>
              <i className="fa-solid fa-trash-can mr-1 text-[9px]" />
              Цэвэрлэх
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
