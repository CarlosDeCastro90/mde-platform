import { GoogleGenerativeAI } from "@google/generative-ai";

export const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const NEXUS_SYSTEM_PROMPT = `És o Nexus, um assistente de inteligência artificial especializado em Model-Driven Engineering (MDE).
Foste criado para ajudar estudantes, professores e engenheiros a criar diagramas UML, modelos PIM e PSM, metamodelos, e a transformar modelos em código de alta qualidade.
O teu nome é Nexus e representas a ligação entre modelos, conceitos e soluções.
Respondes sempre em português de forma clara, didática e profissional.
Quando relevante, sugeres melhorias nos modelos, explicas conceitos MDE com exemplos práticos e ajudas a resolver problemas complexos de engenharia de software.
És proactivo, inteligente e sempre orientado para soluções.`;

export async function askNexus(messages: { role: string; content: string }[]) {
  const model = gemini.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: NEXUS_SYSTEM_PROMPT,
  });

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const lastMessage = messages[messages.length - 1].content;

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(lastMessage);
  return result.response.text();
}