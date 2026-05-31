"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Project {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadProjects(); }, []);

  async function loadProjects() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from("projects").select("*").eq("owner_id", user!.id).order("created_at", { ascending: false });
    setProjects(data || []);
    setLoading(false);
  }

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("projects").insert({ name, description, is_public: isPublic, owner_id: user!.id });
    setName(""); setDescription(""); setIsPublic(false); setShowForm(false);
    loadProjects();
    setSaving(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Projectos</h1>
          <p className="text-slate-400">Gere os teus modelos MDE</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors">
          Novo projecto
        </button>
      </div>

      {showForm && (
        <div className="bg-white/5 border border-purple-500/30 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Criar novo projecto</h2>
          <form onSubmit={createProject} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Nome do projecto</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Sistema de Gestao Escolar" required className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Descricao</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreve o teu projecto MDE..." rows={3} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none" />
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setIsPublic(!isPublic)} className={"w-12 h-6 rounded-full transition-colors " + (isPublic ? "bg-purple-600" : "bg-white/20")}>
                <span className={"block w-5 h-5 bg-white rounded-full transition-transform mx-0.5 " + (isPublic ? "translate-x-6" : "translate-x-0")} />
              </button>
              <span className="text-slate-300 text-sm">Projecto publico</span>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors">
                {saving ? "A criar..." : "Criar projecto"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-400">A carregar projectos...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl mb-4 block">📐</span>
          <p className="text-slate-400 mb-2">Ainda nao tens projectos</p>
          <button onClick={() => setShowForm(true)} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors">
            Criar primeiro projecto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            return (
              <a key={project.id} href={"/projects/" + project.id} className="block bg-white/5 border border-white/10 hover:border-purple-500/50 rounded-2xl p-6 transition-all hover:bg-white/10 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center">
                    <span className="text-2xl">📐</span>
                  </div>
                  {project.is_public && (
                    <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">Publico</span>
                  )}
                </div>
                <h3 className="text-white font-semibold mb-2">{project.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{project.description || "Sem descricao"}</p>
                <p className="text-slate-500 text-xs">{new Date(project.created_at).toLocaleDateString("pt-PT")}</p>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}