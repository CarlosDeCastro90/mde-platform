import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-3xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-purple-300 text-sm font-medium">Powered by Groq AI</span>
        </div>

        {/* Título */}
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Engenharia de Software
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Dirigida por Modelo
          </span>
        </h1>

        <p className="text-slate-300 text-lg md:text-xl mb-10 leading-relaxed">
          Cria modelos UML, transforma PIM em PSM, gera código automaticamente
          e conta com um assistente IA sempre disponível.
        </p>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/register"
            className="px-8 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg shadow-purple-500/25"
          >
            Começar gratuitamente
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-200"
          >
            Já tenho conta
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          {[
            {
              icon: "🎨",
              title: "Editor UML Visual",
              desc: "Cria diagramas PIM, PSM e metamodelos com interface drag-and-drop",
            },
            {
              icon: "⚡",
              title: "Geração de Código",
              desc: "Transforma modelos em código Java, Python ou TypeScript automaticamente",
            },
            {
              icon: "🤖",
              title: "Assistente IA",
              desc: "Groq AI integrado para ajudar em qualquer dúvida sobre MDE",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors"
            >
              <span className="text-3xl mb-3 block">{f.icon}</span>
              <h3 className="text-white font-semibold mb-1">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}