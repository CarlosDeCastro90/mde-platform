"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { UserRole } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  const roles = [
    { value: "student", label: "Estudante", icon: "🎓" },
    { value: "teacher", label: "Professor", icon: "📚" },
    { value: "engineer", label: "Engenheiro", icon: "⚙️" },
  ] as const;

  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
      <h1 className="text-2xl font-bold text-white mb-1">Criar conta</h1>
      <p className="text-slate-400 text-sm mb-6">Junta-te à plataforma MDE</p>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1.5">Nome completo</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="O teu nome"
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
          />
        </div>

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
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1.5">Perfil</label>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  role === r.value
                    ? "bg-purple-600 border-purple-500 text-white"
                    : "bg-white/5 border-white/20 text-slate-300 hover:bg-white/10"
                }`}
              >
                <span className="block text-lg mb-0.5">{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? "A criar conta..." : "Criar conta"}
        </button>
      </form>

      <p className="text-center text-slate-400 text-sm mt-6">
        Já tens conta?{" "}
        <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
          Entra aqui
        </Link>
      </p>
    </div>
  );
}