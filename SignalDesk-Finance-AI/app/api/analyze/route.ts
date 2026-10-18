import { analyzeLocally, answerLocally } from "../../../lib/analysis";

export async function POST(request: Request) {
  const { text, question } = await request.json() as { text?: string; question?: string };
  if (!text || text.trim().length < 80) return Response.json({ error: "Please enter at least 80 characters of financial text." }, { status: 400 });
  const local = analyzeLocally(text);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return Response.json({ ...local, answer: question ? answerLocally(text, question) : undefined });

  try {
    const prompt = `Analyze only the supplied financial article. Do not provide financial advice. Return strict JSON with keys summary (2 sentences), keyPoints (3 short strings), risks (up to 3 short strings), and answer (a concise answer grounded only in the article, or null).\n\nARTICLE:\n${text.slice(0, 12000)}\n\nQUESTION:\n${question || "None"}`;
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-5-mini", input: prompt, text: { format: { type: "json_object" } } }),
    });
    if (!response.ok) throw new Error(`OpenAI request failed: ${response.status}`);
    const data = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
    const raw = data.output_text ?? data.output?.flatMap((x) => x.content ?? []).map((x) => x.text ?? "").join("") ?? "{}";
    const llm = JSON.parse(raw);
    return Response.json({ ...local, ...llm, model: "OpenAI" });
  } catch {
    return Response.json({ ...local, answer: question ? answerLocally(text, question) : undefined, warning: "Live AI was unavailable, so the local grounded analysis was used." });
  }
}
