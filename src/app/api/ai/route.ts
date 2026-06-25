import { askNexus } from "@/lib/gemini/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    const content = await askNexus(messages);
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Nexus error:", error);
    return NextResponse.json({ error: "Erro ao contactar o Nexus." }, { status: 500 });
  }
}