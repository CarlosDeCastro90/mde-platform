"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Profile {
  full_name: string;
  role: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      const { data: projs } = await supabase.from("projects").select("*").eq("owner_id", user.id).order("created_at", { ascending: false });
      setProfile(prof);
      setProjects(projs || []);
      setLoading(false);
    }
    load();
  }, [router]);

  const roleLabel: Record<string, string> = { student: "Estudante", teacher: "Professor", engineer: "Engenheiro" };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const stats = [
    { label: "Projectos", value: projects.length, icon: "📁", color: "from-purple-500/20 to-purple-600/10" },
    { label: "Modelos criados", value: 0, icon: "🎨", color: "from-blue-500/20 to-blue-600/10" },
    { label: "Transformacoes", value: 0, icon: "⚡", color: "from-cyan-500/20 to-cyan-600/10" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">
          {"Ola, " + (profile?.full_name?.split(" ")[0] || "utilizador") + "!"}
        </h1>
        <p className="text-slate-400">{roleLabel[profile?.role ?? ""] ?? "Utilizador"} · MDE Platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className={"bg-gradient-to-br " + stat.color + " border border-white/10 rounded-2xl p-6"}>
            <span className="text-3xl mb-3 block">{stat.icon}</span>
            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-slate-400 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Os meus projectos</h2>
          <a href="/projects" className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-colors">Novo projecto</a>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-5xl mb-4 block">📐</span>
            <p className="text-slate-400 mb-4">Ainda nao tens projectos MDE</p>
            <a href="/projects" className="inline-block px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors">Criar primeiro projecto</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <a key={project.id} href={"/projects/" + project.id} className="block bg-white/5 border border-white/10 hover:border-purple-500/50 rounded-xl p-5 transition-all hover:bg-white/10">
                <div className="w-10 h-10 rounded-lg bg-purple-600/30 border border-purple-500/30 flex items-center justify-center mb-3">
                  <span className="text-purple-400 text-lg">📐</span>
                </div>
                <h3 className="text-white font-semibold mb-1">{project.name}</h3>
                <p className="text-slate-400 text-sm">{project.description || "Sem descricao"}</p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}