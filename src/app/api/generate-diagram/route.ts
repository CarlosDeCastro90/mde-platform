import { askNexus } from "@/lib/gemini/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    const prompt = `Analisa esta descricao de sistema e gera um diagrama UML em JSON:
"${description}"

Responde APENAS com JSON neste formato exacto:
{
  "nodes": [
    {"id": "1", "label": "NomeClasse", "type": "class", "x": 100, "y": 100},
    {"id": "2", "label": "NomeClasse2", "type": "class", "x": 350, "y": 100}
  ],
  "edges": [
    {"source": "1", "target": "2", "label": "associacao"}
  ]
}

Gera entre 3 a 6 classes relevantes com posicoes x/y bem distribuidas (x entre 50-700, y entre 50-400).`;

    const content = await askNexus([{ role: "user", content: prompt }]);
    const clean = content.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json({ success: true, diagram: parsed });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao gerar diagrama." }, { status: 500 });
  }
}