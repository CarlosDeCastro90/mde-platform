import { askNexus } from "@/lib/gemini/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { modelData, targetLanguage } = await request.json();
    const nodeList = modelData.nodes.map((n: { data: { label: string } }) => n.data.label).join(", ");

    const prompt = `Tens um modelo PIM com as seguintes classes: ${nodeList}.
Transforma este modelo num PSM para ${targetLanguage}.
Responde APENAS em JSON com este formato:
{
  "nodes": [{"id": "1", "name": "NomeClasse", "attributes": ["tipo atributo"], "methods": ["tipoRetorno nomeMetodo()"]}],
  "relationships": [{"from": "Classe1", "to": "Classe2", "type": "association"}]
}`;

    const content = await askNexus([{ role: "user", content: prompt }]);
    const clean = content.replace(/```json|```/g, "").trim();
    try {
      const parsed = JSON.parse(clean);
      return NextResponse.json({ success: true, psm: parsed });
    } catch {
      return NextResponse.json({ success: true, psm: { raw: content } });
    }
  } catch (error) {
    return NextResponse.json({ error: "Erro na transformacao." }, { status: 500 });
  }
}