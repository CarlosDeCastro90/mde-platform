import { askNexus } from "@/lib/gemini/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { nodes, edges, language } = await request.json();
    const nodeList = nodes.map((n: { data: { label: string } }) => n.data.label).join(", ");
    const edgeList = edges.map((e: { source: string; target: string }) => {
      const src = nodes.find((n: { id: string }) => n.id === e.source)?.data.label;
      const tgt = nodes.find((n: { id: string }) => n.id === e.target)?.data.label;
      return src + " -> " + tgt;
    }).join(", ");

    const langMap: Record<string, string> = {
      java: "Java com getters, setters e construtores",
      python: "Python com __init__, properties e type hints",
      typescript: "TypeScript com interfaces e tipos",
      csharp: "C# com properties e construtores",
    };

    const prompt = `Gera codigo ${langMap[language] || language} para um diagrama UML com as seguintes classes: ${nodeList}. Relacoes: ${edgeList || "nenhuma"}. Inclui atributos, metodos e comentarios. Responde apenas com o codigo.`;

    const code = await askNexus([{ role: "user", content: prompt }]);
    return NextResponse.json({ code });
  } catch {
    return NextResponse.json({ error: "Erro ao gerar codigo." }, { status: 500 });
  }
}