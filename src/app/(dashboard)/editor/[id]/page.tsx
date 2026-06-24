"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

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
  const [generatedCode, setGeneratedCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("java");
  const [showTransform, setShowTransform] = useState(false);
  const [transformLoading, setTransformLoading] = useState(false);
  const [psmData, setPsmData] = useState<{ nodes: { id: string; name: string; attributes: string[]; methods: string[] }[]; relationships: { from: string; to: string; type: string }[] } | null>(null);
  const [activeTab, setActiveTab] = useState<"code" | "psm">("code");
  const [copied, setCopied] = useState(false);

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
      position: { x: 100 + Math.random() * 400, y: 100 + Math.random() * 300 },
      data: { label: nodeName },
      style: { ...nodeStyle, borderColor: colors[nodeType] || "#7c3aed" },
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeName("");
    setShowAddNode(false);
  }

  async function generateCode() {
    if (nodes.length === 0) return;
    setCodeLoading(true);
    setShowCode(true);
    setActiveTab("code");
    try {
      const res = await fetch("/api/codegen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes, edges, language: selectedLanguage }),
      });
      const data = await res.json();
      setGeneratedCode(data.code);
    } catch {
      setGeneratedCode("Erro ao gerar codigo.");
    }
    setCodeLoading(false);
  }

  async function transformToPS() {
    if (nodes.length === 0) return;
    setTransformLoading(true);
    setShowCode(true);
    setActiveTab("psm");
    try {
      const res = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelData: { nodes, edges }, targetLanguage: selectedLanguage }),
      });
      const data = await res.json();
      setPsmData(data.psm);
    } catch {
      setPsmData(null);
    }
    setTransformLoading(false);
  }

  async function copyCode() {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function exportDiagram() {
  try {
    const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    // Fundo escuro
    pdf.setFillColor(15, 15, 26);
    pdf.rect(0, 0, pageW, pageH, "F");

    // Título
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.text(model?.name || "Diagrama", 40, 40);

    // Tipo do modelo
    pdf.setFontSize(11);
    pdf.setTextColor(167, 139, 250);
    pdf.text("Tipo: " + (model?.type || ""), 40, 58);

    // Data
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.text("Exportado em: " + new Date().toLocaleDateString("pt-PT"), 40, 72);

    // Linha separadora
    pdf.setDrawColor(124, 58, 237);
    pdf.setLineWidth(0.5);
    pdf.line(40, 80, pageW - 40, 80);

    // Desenhar nós
    let xPos = 40;
    let yPos = 100;
    const nodeW = 160;
    const nodeH = 50;
    const gap = 20;
    const cols = Math.floor((pageW - 80) / (nodeW + gap));

    nodes.forEach((node, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = 40 + col * (nodeW + gap);
      const y = yPos + row * (nodeH + gap);

      // Fundo do nó
      pdf.setFillColor(30, 27, 75);
      pdf.setDrawColor(124, 58, 237);
      pdf.setLineWidth(1);
      pdf.roundedRect(x, y, nodeW, nodeH, 4, 4, "FD");

      // Nome do nó
      pdf.setTextColor(226, 232, 240);
      pdf.setFontSize(11);
      pdf.text(String(node.data?.label || ""), x + nodeW / 2, y + nodeH / 2 + 4, { align: "center" });
    });

    // Relações
    if (edges.length > 0) {
      const relY = yPos + (Math.ceil(nodes.length / cols)) * (nodeH + gap) + 20;
      pdf.setTextColor(167, 139, 250);
      pdf.setFontSize(11);
      pdf.text("Relacoes:", 40, relY);
      edges.forEach((edge, i) => {
        const src = nodes.find((n) => n.id === edge.source)?.data?.label || edge.source;
        const tgt = nodes.find((n) => n.id === edge.target)?.data?.label || edge.target;
        pdf.setTextColor(148, 163, 184);
        pdf.setFontSize(10);
        pdf.text(src + "  →  " + tgt, 40, relY + 16 + i * 14);
      });
    }

    pdf.save((model?.name || "diagrama") + ".pdf");
  } catch (err) {
    console.error("Erro ao exportar PDF:", err);
    alert("Erro ao exportar PDF: " + (err instanceof Error ? err.message : String(err)));
  }
}

  const typeColors: Record<string, string> = {
    PIM: "text-purple-400 bg-purple-500/20 border-purple-500/30",
    PSM: "text-blue-400 bg-blue-500/20 border-blue-500/30",
    metamodel: "text-amber-400 bg-amber-500/20 border-amber-500/30",
  };

  const languages = [
    { value: "java", label: "Java" },
    { value: "python", label: "Python" },
    { value: "typescript", label: "TypeScript" },
    { value: "csharp", label: "C#" },
  ];

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/50 flex-wrap gap-2">
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
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-1.5 bg-white/10 border border-white/20 text-white text-sm rounded-lg focus:outline-none focus:border-purple-500"
          >
            {languages.map((l) => (
              <option key={l.value} value={l.value} style={{ background: "#1e293b" }}>{l.label}</option>
            ))}
          </select>
          <button onClick={() => setShowAddNode(true)} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors">
            + Classe
          </button>
          <button onClick={transformToPS} disabled={nodes.length === 0} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors">
            PIM → PSM
          </button>
          <button onClick={generateCode} disabled={nodes.length === 0} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors">
            Gerar codigo
          </button>
          <button onClick={exportDiagram} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors">
  Exportar PDF
</button>
          <button onClick={saveDiagram} disabled={saving} className={"px-4 py-1.5 text-white text-sm rounded-lg transition-colors font-medium " + (saved ? "bg-green-600" : "bg-purple-600 hover:bg-purple-500")}>
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
                <p>Selecciona linguagem no topo</p>
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
              <div className="flex gap-1">
                <button onClick={() => setActiveTab("code")} className={"px-3 py-1 rounded-lg text-sm transition-colors " + (activeTab === "code" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white")}>
                  Codigo
                </button>
                <button onClick={() => setActiveTab("psm")} className={"px-3 py-1 rounded-lg text-sm transition-colors " + (activeTab === "psm" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white")}>
                  PSM
                </button>
              </div>
              <button onClick={() => setShowCode(false)} className="text-slate-400 hover:text-white text-sm">Fechar</button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {activeTab === "code" && (
                codeLoading ? (
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">A gerar codigo...</span>
                  </div>
                ) : (
                  <pre className="text-green-400 text-xs leading-relaxed whitespace-pre-wrap">{generatedCode}</pre>
                )
              )}

              {activeTab === "psm" && (
                transformLoading ? (
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">A transformar PIM em PSM...</span>
                  </div>
                ) : psmData && psmData.nodes ? (
                  <div className="space-y-4">
                    <p className="text-slate-400 text-xs mb-3">Modelo PSM para {selectedLanguage.toUpperCase()}</p>
                    {psmData.nodes.map((node) => (
                      <div key={node.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <h4 className="text-blue-400 font-semibold mb-2">{node.name}</h4>
                        {node.attributes && node.attributes.length > 0 && (
                          <div className="mb-2">
                            <p className="text-slate-500 text-xs mb-1">Atributos:</p>
                            {node.attributes.map((attr, i) => (
                              <p key={i} className="text-green-400 text-xs">{attr}</p>
                            ))}
                          </div>
                        )}
                        {node.methods && node.methods.length > 0 && (
                          <div>
                            <p className="text-slate-500 text-xs mb-1">Metodos:</p>
                            {node.methods.map((method, i) => (
                              <p key={i} className="text-amber-400 text-xs">{method}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {psmData.relationships && psmData.relationships.length > 0 && (
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-slate-400 text-xs mb-2">Relacoes:</p>
                        {psmData.relationships.map((rel, i) => (
                          <p key={i} className="text-purple-400 text-xs">{rel.from} → {rel.to} ({rel.type})</p>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">Clica "PIM → PSM" para transformar o modelo</p>
                )
              )}
            </div>

            {activeTab === "code" && !codeLoading && generatedCode && (
              <div className="p-4 border-t border-white/10">
                <button onClick={copyCode} className={"w-full py-2 text-white text-sm rounded-lg transition-colors " + (copied ? "bg-green-600" : "bg-white/10 hover:bg-white/20")}>
                  {copied ? "Copiado!" : "Copiar codigo"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}