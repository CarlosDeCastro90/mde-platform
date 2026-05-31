"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError("Erro: " + error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError("Erro inesperado. Verifica a consola.");
      setLoading(false);
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
      <h1 className="text-2xl font-bold text-white mb-1">Bem-vindo de volta</h1>
      <p className="text-slate-400 text-sm mb-6">Entra na tua conta MDE Platform</p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="o.teu@email.com"
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1.5">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
          />
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all"
        >
          {loading ? "A entrar..." : "Entrar"}
        </button>
      </form>

      <p className="text-center text-slate-400 text-sm mt-6">
        Nao tens conta?{" "}
        <Link href="/register" className="text-purple-400 hover:text-purple-300 font-medium">
          Regista-te gratuitamente
        </Link>
      </p>
    </div>
  );
}
