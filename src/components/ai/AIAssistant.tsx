"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Ola! Sou o Nexus, o teu assistente de IA especializado em MDE. Posso ajudar-te a criar diagramas UML, transformar modelos PIM em PSM, gerar codigo e muito mais. Como posso ajudar-te hoje?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Erro ao contactar o Nexus. Tenta novamente." }]);
    }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center transition-all hover:scale-110 z-50"
        title="Nexus AI"
      >
        {open ? (
          <span className="text-lg font-bold">X</span>
        ) : (
          <span className="text-xs font-bold tracking-tight">NEX</span>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 w-96 h-[520px] bg-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/20 flex flex-col z-50">
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">N</span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Nexus</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-slate-400 text-xs">Powered by Gemini</span>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white transition-colors text-sm">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={"flex " + (msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                    <span className="text-white text-xs font-bold">N</span>
                  </div>
                )}
                <div className={"max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed " + (msg.role === "user" ? "bg-purple-600 text-white rounded-br-sm" : "bg-white/10 text-slate-200 rounded-bl-sm")}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center mr-2 flex-shrink-0">
                  <span className="text-white text-xs font-bold">N</span>
                </div>
                <div className="bg-white/10 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendMessage} className="p-4 border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunta ao Nexus..."
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-all"
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </>
  );
}