"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ReactFlow, {
  Node, Edge, addEdge, Connection,
  useNodesState, useEdgesState,
  Controls, MiniMap, Background, BackgroundVariant, Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { jsPDF } from "jspdf";
import { templates } from "@/lib/templates";

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
  const [transformLoading, setTransformLoading] = useState(false);
  const [psmData, setPsmData] = useState<{ nodes: { id: string; name: string; attributes: string[]; methods: string[] }[]; relationships: { from: string; to: string; type: string }[] } | null>(null);
  const [activeTab, setActiveTab] = useState<"code" | "psm" | "history">("code");
  const [copied, setCopied] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showGenerateAI, setShowGenerateAI] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [history, setHistory] = useState<{ nodes: Node[]; edges: Edge[]; timestamp: string }[]>([]);

  useEffect(() => { loadModel(); }, [id]);

  async function loadModel() {
    const supabase = createClient();
    const { data } = await supabase.from("models").select("*").eq("id", id).single();
    if (data) {
      setModel(data);
      const savedNodes = data.diagram_data?.nodes || [];
      const savedEdges = data.diagram_data?.edges || [];
      setNodes(savedNodes);
      setEdges(savedEdges);
      if (data.diagram_data?.history) {
        setHistory(data.diagram_data.history);
      }
    }
  }

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge({ ...connection, animated: true, style: { stroke: "#7c3aed" } }, eds));
  }, [setEdges]);

  async function saveDiagram() {
    setSaving(true);
    const supabase = createClient();
    const newHistory = [...history, {
      nodes,
      edges,
      timestamp: new Date().toISOString(),
    }].slice(-10);
    setHistory(newHistory);
    await supabase.from("models").update({
      diagram_data: { nodes, edges, history: newHistory },
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function addNode() {
    if (!nodeName.trim()) return;
    const colors: Record<string, string> = {
      class: "#7c3aed", interface: "#0891b2", enum: "#d97706", abstract: "#059669",
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

  function loadTemplate(templateId: string) {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return;
    const newNodes: Node[] = template.nodes.map((n) => ({
      id: n.id,
      type: "default",
      position: { x: n.x, y: n.y },
      data: { label: n.label },
      style: nodeStyle,
    }));
    const newEdges: Edge[] = template.edges.map((e, i) => ({
      id: "edge-" + i,
      source: e.source,
      target: e.target,
      label: e.label,
      animated: true,
      style: { stroke: "#7c3aed" },
    }));
    setNodes(newNodes);
    setEdges(newEdges);
    setShowTemplates(false);
  }

  async function generateFromAI() {
    if (!aiDescription.trim()) return;
    setAiGenerating(true);
    try {
      const res = await fetch("/api/generate-diagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: aiDescription }),
      });
      const data = await res.json();
      if (data.diagram) {
        const newNodes: Node[] = data.diagram.nodes.map((n: { id: string; label: string; x: number; y: number }) => ({
          id: n.id,
          type: "default",
          position: { x: n.x, y: n.y },
          data: { label: n.label },
          style: nodeStyle,
        }));
        const newEdges: Edge[] = data.diagram.edges.map((e: { source: string; target: string; label: string }, i: number) => ({
          id: "edge-" + i,
          source: e.source,
          target: e.target,
          label: e.label,
          animated: true,
          style: { stroke: "#7c3aed" },
        }));
        setNodes(newNodes);
        setEdges(newEdges);
      }
    } catch {
      alert("Erro ao gerar diagrama com IA.");
    }
    setAiGenerating(false);
    setShowGenerateAI(false);
    setAiDescription("");
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

  async function transformToPSM() {
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

  function restoreHistory(index: number) {
    const entry = history[index];
    if (entry) {
      setNodes(entry.nodes);
      setEdges(entry.edges);
    }
  }

  async function copyCode() {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function exportPDF() {
    try {
      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      pdf.setFillColor(15, 15, 26);
      pdf.rect(0, 0, pageW, pageH, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.text(model?.name || "Diagrama", 40, 40);
      pdf.setFontSize(11);
      pdf.setTextColor(167, 139, 250);
      pdf.text("Tipo: " + (model?.type || ""), 40, 58);
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.text("Exportado em: " + new Date().toLocaleDateString("pt-PT"), 40, 72);
      pdf.setDrawColor(124, 58, 237);
      pdf.setLineWidth(0.5);
      pdf.line(40, 80, pageW - 40, 80);
      const nodeW = 160;
      const nodeH = 50;
      const gap = 20;
      const cols = Math.floor((pageW - 80) / (nodeW + gap));
      const yPos = 100;
      nodes.forEach((node, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = 40 + col * (nodeW + gap);
        const y = yPos + row * (nodeH + gap);
        pdf.setFillColor(30, 27, 75);
        pdf.setDrawColor(124, 58, 237);
        pdf.setLineWidth(1);
        pdf.roundedRect(x, y, nodeW, nodeH, 4, 4, "FD");
        pdf.setTextColor(226, 232, 240);
        pdf.setFontSize(11);
        pdf.text(String(node.data?.label || ""), x + nodeW / 2, y + nodeH / 2 + 4, { align: "center" });
      });
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
      alert("Erro ao exportar PDF: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  const typeColors: Record<string, string> = {
    PIM: "text-purple-400 bg-purple-500/20 border-purple-500/30",
    PSM: "text-blue-400 bg-blue-500/20 border-blue-500/30",
    metamodel: "text-amber-400 bg-amber-500/20 border-amber-500/30",
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-900/50 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <a href="javascript:history.back()" className="text-slate-400 hover:text-white transition-colors text-sm">Voltar</a>
          <span className="text-slate-600">/</span>
          <span className="text-white font-medium">{model?.name}</span>
          {model && (
            <span className={"text-xs border px-2 py-0.5 rounded-full " + (typeColors[model.type] || "")}>
              {model.type}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-1.5 bg-white/10 border border-white/20 text-white text-sm rounded-lg focus:outline-none">
            {[["java","Java"],["python","Python"],["typescript","TypeScript"],["csharp","C#"]].map(([v,l]) => (
              <option key={v} value={v} style={{ background: "#1e293b" }}>{l}</option>
            ))}
          </select>
          <button onClick={() => setShowTemplates(true)} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors">Templates</button>
          <button onClick={() => setShowGenerateAI(true)} className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white text-sm rounded-lg transition-colors">Gerar com IA</button>
          <button onClick={() => setShowAddNode(true)} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors">+ Classe</button>
          <button onClick={transformToPSM} disabled={nodes.length === 0} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors">PIM → PSM</button>
          <button onClick={generateCode} disabled={nodes.length === 0} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm rounded-lg transition-colors">Gerar codigo</button>
          <button onClick={exportPDF} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors">Exportar PDF</button>
          <button onClick={saveDiagram} disabled={saving} className={"px-4 py-1.5 text-white text-sm rounded-lg transition-colors font-medium " + (saved ? "bg-green-600" : "bg-purple-600 hover:bg-purple-500")}>
            {saved ? "Guardado!" : saving ? "A guardar..." : "Guardar"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} fitView style={{ background: "#0f0f1a" }}>
            <Controls />
            <MiniMap style={{ background: "#1a1a2e" }} nodeColor="#7c3aed" />
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
            <Panel position="top-left">
              <div className="bg-slate-800/90 border border-white/10 rounded-xl p-3 text-xs text-slate-400 max-w-48">
                <p className="font-medium text-white mb-1">Como usar</p>
                <p>Clica "Templates" para modelos prontos</p>
                <p>Clica "Gerar com IA" para criar por texto</p>
                <p>Arrasta nos para mover</p>
                <p>Liga nos arrastando das bordas</p>
              </div>
            </Panel>
          </ReactFlow>

          {showAddNode && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <div className="bg-slate-900 border border-white/20 rounded-2xl p-6 w-80">
                <h3 className="text-white font-semibold mb-4">Adicionar elemento</h3>
                <input type="text" value={nodeName} onChange={(e) => setNodeName(e.target.value)}
                  placeholder="Nome da classe..." onKeyDown={(e) => e.key === "Enter" && addNode()} autoFocus
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 mb-4" />
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {["class", "interface", "enum", "abstract"].map((t) => (
                    <button key={t} type="button" onClick={() => setNodeType(t)}
                      className={"py-2 rounded-lg text-sm transition-colors " + (nodeType === t ? "bg-purple-600 text-white" : "bg-white/10 text-slate-300 hover:bg-white/20")}>
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={addNode} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-colors">Adicionar</button>
                  <button onClick={() => setShowAddNode(false)} className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm transition-colors">Cancelar</button>
                </div>
              </div>
            </div>
          )}

          {showTemplates && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 p-4">
              <div className="bg-slate-900 border border-white/20 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-semibold text-lg">Templates de diagramas</h3>
                  <button onClick={() => setShowTemplates(false)} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {templates.map((t) => (
                    <button key={t.id} onClick={() => loadTemplate(t.id)}
                      className="text-left bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-xl p-4 transition-all">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{t.icon}</span>
                        <div>
                          <p className="text-white font-medium">{t.name}</p>
                          <p className="text-slate-400 text-xs mt-0.5">{t.description}</p>
                          <span className="inline-block mt-2 text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">{t.category}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {showGenerateAI && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 p-4">
              <div className="bg-slate-900 border border-white/20 rounded-2xl p-6 w-full max-w-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold text-lg">Gerar diagrama com Nexus</h3>
                    <p className="text-slate-400 text-sm">Descreve o sistema e o Nexus cria o diagrama</p>
                  </div>
                  <button onClick={() => setShowGenerateAI(false)} className="text-slate-400 hover:text-white">✕</button>
                </div>
                <textarea value={aiDescription} onChange={(e) => setAiDescription(e.target.value)}
                  placeholder="Ex: Sistema de gestao de uma clinica medica com medicos, pacientes, consultas e prescricoes..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none mb-4" />
                <div className="flex gap-3">
                  <button onClick={generateFromAI} disabled={aiGenerating || !aiDescription.trim()}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-50 text-white font-medium rounded-xl transition-all">
                    {aiGenerating ? "A gerar..." : "Gerar diagrama"}
                  </button>
                  <button onClick={() => setShowGenerateAI(false)} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">
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
                {[["code","Codigo"],["psm","PSM"],["history","Historico"]].map(([tab, label]) => (
                  <button key={tab} onClick={() => setActiveTab(tab as "code" | "psm" | "history")}
                    className={"px-3 py-1 rounded-lg text-sm transition-colors " + (activeTab === tab ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white")}>
                    {label}
                  </button>
                ))}
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
                    <span className="text-sm">A transformar...</span>
                  </div>
                ) : psmData && psmData.nodes ? (
                  <div className="space-y-3">
                    <p className="text-slate-400 text-xs mb-3">PSM para {selectedLanguage.toUpperCase()}</p>
                    {psmData.nodes.map((node) => (
                      <div key={node.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <h4 className="text-blue-400 font-semibold mb-2">{node.name}</h4>
                        {node.attributes?.map((attr, i) => <p key={i} className="text-green-400 text-xs">{attr}</p>)}
                        {node.methods?.map((method, i) => <p key={i} className="text-amber-400 text-xs">{method}</p>)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">Clica "PIM → PSM" para transformar</p>
                )
              )}

              {activeTab === "history" && (
                <div className="space-y-2">
                  <p className="text-slate-400 text-xs mb-3">Ultimas versoes guardadas</p>
                  {history.length === 0 ? (
                    <p className="text-slate-500 text-sm">Ainda nao tens versoes guardadas. Clica "Guardar" para criar uma versao.</p>
                  ) : (
                    [...history].reverse().map((entry, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">{entry.nodes.length} classes · {entry.edges.length} relacoes</p>
                            <p className="text-slate-500 text-xs">{new Date(entry.timestamp).toLocaleString("pt-PT")}</p>
                          </div>
                          <button onClick={() => restoreHistory(history.length - 1 - i)}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-lg transition-colors">
                            Restaurar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
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