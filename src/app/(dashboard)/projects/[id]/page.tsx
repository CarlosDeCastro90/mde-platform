"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Model {
  id: string;
  name: string;
  type: string;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
}

export default function ProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [modelName, setModelName] = useState("");
  const [modelType, setModelType] = useState("PIM");
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, [id]);

  async function loadData() {
    const supabase = createClient();
    const { data: proj } = await supabase.from("projects").select("*").eq("id", id).single();
    const { data: mods } = await supabase.from("models").select("*").eq("project_id", id).order("created_at", { ascending: false });
    setProject(proj);
    setModels(mods || []);
  }

  async function createModel(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    await supabase.from("models").insert({
      name: modelName,
      type: modelType,
      project_id: id,
      diagram_data: { nodes: [], edges: [] },
    });
    setModelName("");
    setModelType("PIM");
    setShowForm(false);
    loadData();
    setSaving(false);
  }

  const typeColors: Record<string, string> = {
    PIM: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    PSM: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    metamodel: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  };

  const typeIcons: Record<string, string> = {
    PIM: "🔷",
    PSM: "🔵",
    metamodel: "🟡",
  };

  return (
    <div>
      <div className="mb-8">
        <a href="/projects" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
          Projectos
        </a>
        <span className="text-slate-600 mx-2">/</span>
        <span className="text-slate-300 text-sm">{project?.name}</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{project?.name}</h1>
          <p className="text-slate-400">{project?.description || "Sem descricao"}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors"
        >
          Novo modelo
        </button>
      </div>

      {showForm && (
        <div className="bg-white/5 border border-purple-500/30 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Criar novo modelo</h2>
          <form onSubmit={createModel} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Nome do modelo</label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="Ex: Diagrama de Classes"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">Tipo de modelo</label>
              <div className="grid grid-cols-3 gap-3">
                {["PIM", "PSM", "metamodel"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setModelType(t)}
                    className={"py-3 rounded-xl border text-sm font-medium transition-all " + (modelType === t ? "bg-purple-600 border-purple-500 text-white" : "bg-white/5 border-white/20 text-slate-300 hover:bg-white/10")}
                  >
                    <span className="block text-xl mb-1">{typeIcons[t]}</span>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors">
                {saving ? "A criar..." : "Criar modelo"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {models.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl mb-4 block">🎨</span>
          <p className="text-slate-400 mb-2">Ainda nao tens modelos neste projecto</p>
          <p className="text-slate-500 text-sm mb-6">Cria um modelo PIM, PSM ou Metamodelo</p>
          <button onClick={() => setShowForm(true)} className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors">
            Criar primeiro modelo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((model) => (
            <a key={model.id} href={"/editor/" + model.id}
              className="block bg-white/5 border border-white/10 hover:border-purple-500/50 rounded-2xl p-6 transition-all hover:bg-white/10 group">
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{typeIcons[model.type] || "📄"}</span>
                <span className={"text-xs border px-2 py-0.5 rounded-full " + (typeColors[model.type] || "")}>
                  {model.type}
                </span>
              </div>
              <h3 className="text-white font-semibold mb-1 group-hover:text-purple-300 transition-colors">
                {model.name}
              </h3>
              <p className="text-slate-500 text-xs mt-3">
                {new Date(model.created_at).toLocaleDateString("pt-PT")}
              </p>
              <div className="mt-4 pt-4 border-t border-white/10">
                <span className="text-purple-400 text-sm font-medium">Abrir editor</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}