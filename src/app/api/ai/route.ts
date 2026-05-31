import { groq, MDE_SYSTEM_PROMPT } from "@/lib/groq/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: MDE_SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content || "Sem resposta.";
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Groq error:", error);
    return NextResponse.json({ error: "Erro ao contactar a IA." }, { status: 500 });
  }
}