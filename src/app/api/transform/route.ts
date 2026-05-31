import { groq } from "@/lib/groq/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { modelData, targetLanguage } = await request.json();

    const nodeList = modelData.nodes.map((n: { data: { label: string } }) => n.data.label).join(", ");

    const prompt = `Tens um modelo PIM (Platform Independent Model) com as seguintes classes: ${nodeList}.
    
Transforma este modelo num PSM (Platform Specific Model) para ${targetLanguage}.
Responde APENAS em JSON com este formato exacto:
{
  "nodes": [
    {"id": "1", "name": "NomeClasse", "attributes": ["tipo atributo"], "methods": ["tipoRetorno nomeMetodo()"]}
  ],
  "relationships": [
    {"from": "Classe1", "to": "Classe2", "type": "association"}
  ]
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content || "{}";
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