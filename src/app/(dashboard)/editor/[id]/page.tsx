"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ReactFlow, {
  Node, Edge, addEdge, Connection,
  useNodesState, useEdgesState,
  Controls, MiniMap, Background, BackgroundVariant,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";

interface Model {
  id: string;
  name: string;
  type: string;
  project_id: string;
  diagram_data: { nodes: Node[]; edges: Edge[] };
}

const nodeStyle = {
  background: "#1e1b4b",
  border: "1px solid #7c3aed",
  borderRadius: "8px",
  padding: "10px 16px",
  color: "#e2e8f0",
  fontSize: "13px",
  minWidth: "160px",
};

export default function EditorPage() {
  const { id } = useParams();
  const [model, setModel] = useState<Model | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAddNode, setShowAddNode] = useState(false);
  const [nodeName, setNodeName] = useState("");
  const [nodeType, setNodeType] = useState("class");
  const [generateLoading, setGenerateLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [showCode, setShowCode] = useState(false);

  useEffect(() => { loadModel(); }, [id]);

  async function loadModel() {
    const supabase = createClient();
    const { data } = await supabase.from("models").select("*").eq("id", id).single();
    if (data) {
      setModel(data);
      setNodes(data.diagram_data?.nodes || []);
      setEdges(data.diagram_data?.edges || []);
    }
  }

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge({ ...connection, animated: true, style: { stroke: "#7c3aed" } }, eds));
  }, [setEdges]);

  async function saveDiagram() {
    setSaving(true);
    const supabase = createClient();
    await supabase.from("models").update({
      diagram_data: { nodes, edges },
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function addNode() {
    if (!nodeName.trim()) return;
    const colors: Record<string, string> = {
      class: "#7c3aed",
      interface: "#0891b2",
      enum: "#d97706",
      abstract: "#059669",
    };
    const newNode: Node = {
      id: "node-" + Date.now(),
      type: "default",
      position: { x: 100 + Math.random() * 300, y: 100 + Math.random() * 200 },
      data: { label: nodeName },
      style: { ...nodeStyle, borderColor: colors[nodeType] || "#7c3aed" },
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeName("");
    setShowAddNode(false);
  }

  async function generateCode() {
    setGenerateLoading(true);
    setShowCode(true);
    const nodeList = nodes.map((n) => n.data.label).join(", ");
    const edgeList = edges.map((e) => {
      const src = nodes.find((n) => n.id === e.source)?.data.label;
      const tgt = nodes.find((n) => n.id === e.target)?.data.label;
      return src + " -> " + tgt;
    }).join(", ");

    const prompt = "Gera codigo Java para um diagrama UML com as seguintes classes: " + nodeList + ". Relacoes: " + edgeList + ". Inclui atributos basicos e metodos. Responde apenas com o codigo.";

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      setGeneratedCode(data.content);
    } catch {
      setGeneratedCode("Erro ao gerar codigo.");
    }
    setGenerateLoading(false);
  }

  const typeColors: Record<string, string> = {
    PIM: "text-purple-400 bg-purple-500/20 border-purple-500/30",
    PSM: "text-blue-400 bg-blue-500/20 border-blue-500/30",
    metamodel: "text-amber-400 bg-amber-500/20 border-amber-500/30",
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <a href="javascript:history.back()" className="text-slate-400 hover:text-white transition-colors text-sm">
            Voltar
          </a>
          <span className="text-slate-600">/</span>
          <span className="text-white font-medium">{model?.name}</span>
          {model && (
            <span className={"text-xs border px-2 py-0.5 rounded-full " + (typeColors[model.type] || "")}>
              {model.type}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddNode(true)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
          >
            + Classe
          </button>
          <button
            onClick={generateCode}
            disabled={nodes.length === 0}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
          >
            Gerar codigo
          </button>
          <button
            onClick={saveDiagram}
            disabled={saving}
            className={"px-4 py-1.5 text-white text-sm rounded-lg transition-colors font-medium " + (saved ? "bg-green-600" : "bg-purple-600 hover:bg-purple-500")}
          >
            {saved ? "Guardado!" : saving ? "A guardar..." : "Guardar"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            style={{ background: "#0f0f1a" }}
          >
            <Controls />
            <MiniMap style={{ background: "#1a1a2e" }} nodeColor="#7c3aed" />
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
            <Panel position="top-left">
              <div className="bg-slate-800/90 border border-white/10 rounded-xl p-3 text-xs text-slate-400 max-w-48">
                <p className="font-medium text-white mb-1">Como usar</p>
                <p>Clica "+ Classe" para adicionar</p>
                <p>Arrasta os nos para mover</p>
                <p>Liga nos arrastando das bordas</p>
              </div>
            </Panel>
          </ReactFlow>

          {showAddNode && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <div className="bg-slate-900 border border-white/20 rounded-2xl p-6 w-80">
                <h3 className="text-white font-semibold mb-4">Adicionar elemento</h3>
                <input
                  type="text"
                  value={nodeName}
                  onChange={(e) => setNodeName(e.target.value)}
                  placeholder="Nome da classe..."
                  onKeyDown={(e) => e.key === "Enter" && addNode()}
                  autoFocus
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 mb-4"
                />
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {["class", "interface", "enum", "abstract"].map((t) => (
                    <button key={t} type="button" onClick={() => setNodeType(t)}
                      className={"py-2 rounded-lg text-sm transition-colors " + (nodeType === t ? "bg-purple-600 text-white" : "bg-white/10 text-slate-300 hover:bg-white/20")}>
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={addNode} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-colors">
                    Adicionar
                  </button>
                  <button onClick={() => setShowAddNode(false)} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-colors">
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {showCode && (
          <div className="w-96 border-l border-white/10 bg-slate-900 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <span className="text-white font-medium text-sm">Codigo gerado</span>
              <button onClick={() => setShowCode(false)} className="text-slate-400 hover:text-white text-sm">Fechar</button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {generateLoading ? (
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">A gerar codigo...</span>
                </div>
              ) : (
                <pre className="text-green-400 text-xs leading-relaxed whitespace-pre-wrap">{generatedCode}</pre>
              )}
            </div>
            {!generateLoading && generatedCode && (
              <div className="p-4 border-t border-white/10">
                <button
                  onClick={() => navigator.clipboard.writeText(generatedCode)}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                >
                  Copiar codigo
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}