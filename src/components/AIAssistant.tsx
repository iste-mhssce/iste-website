"use client";
import { useState } from "react";
import { Bot, Send, X, Sparkles } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: { id: string; type: string }[];
}

let sessionId: string | undefined;

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message: text }),
      });

      if (!res.ok) {
        throw new Error(`chat failed (${res.status})`);
      }

      const data = (await res.json()) as {
        sessionId: string;
        reply: string;
        sources?: { id: string; type: string }[];
      };
      sessionId = data.sessionId;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, sources: data.sources },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble reaching the assistant right now. Please try again in a moment — the rest of the site is fully functional.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white w-14 h-14 rounded-full shadow-xl transition-colors"
        aria-label="Open ISTE assistant"
      >
        {open ? <X size={24} /> : <Sparkles size={24} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-sm bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] flex flex-col overflow-hidden">
          <div className="px-5 py-4 bg-[#0F172A] text-white flex items-center gap-2">
            <Bot size={18} className="text-[#06B6D4]" />
            <div>
              <p className="text-sm font-bold">ISTE Nexus Assistant</p>
              <p className="text-[11px] text-white/60">
                Ask about events, council &amp; certificates
              </p>
            </div>
          </div>

          <div className="flex-1 min-h-[260px] max-h-[320px] overflow-y-auto px-4 py-3 flex flex-col gap-3 bg-[#F8FAFC]">
            {messages.length === 0 && (
              <p className="text-xs text-[#64748B] text-center py-8">
                Hi! Ask me about upcoming workshops, hackathons, the student
                council, or how to verify a certificate.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                  m.role === "user"
                    ? "self-end bg-[#2563EB] text-white"
                    : "self-start bg-white border border-[#E2E8F0] text-[#334155]"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-[#E2E8F0]">
                    <p className="text-[10px] uppercase tracking-wide text-[#94A3B8] mb-1">
                      Sources
                    </p>
                    {m.sources.map((s) => (
                      <span
                        key={s.id}
                        className="inline-block mr-1 mb-1 bg-[#DBEAFE] text-[#1D4ED8] text-[10px] font-semibold px-2 py-0.5 rounded"
                      >
                        {s.type}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="self-start bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#64748B]">
                Thinking...
              </div>
            )}
          </div>

          <div className="p-3 border-t border-[#E2E8F0] bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-lg border border-[#E2E8F0] text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className="inline-flex items-center justify-center bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white w-10 h-10 rounded-lg transition-colors shrink-0"
                aria-label="Send"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
