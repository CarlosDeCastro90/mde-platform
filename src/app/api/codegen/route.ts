import { groq } from "@/lib/groq/client";
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

    const langInstructions: Record<string, string> = {
      java: "Java com getters, setters e construtores",
      python: "Python com __init__, properties e type hints",
      typescript: "TypeScript com interfaces, tipos e decorators",
      csharp: "C# com properties, construtores e namespaces",
    };

    const prompt = `Gera codigo ${langInstructions[language] || language} para um diagrama UML com as seguintes classes: ${nodeList}. Relacoes: ${edgeList || "nenhuma"}. Inclui atributos basicos, metodos e comentarios. Responde apenas com o codigo.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content || "";
    return NextResponse.json({ code: content });
  } catch {
    return NextResponse.json({ error: "Erro ao gerar codigo." }, { status: 500 });
  }
}