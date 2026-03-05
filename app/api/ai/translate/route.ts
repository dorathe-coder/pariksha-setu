import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { questions, targetLanguage } = await req.json();
    // targetLanguage: "en" | "hi" | "gu"
    if (!questions || questions.length === 0 || !targetLanguage) {
      return NextResponse.json({ error: "Missing questions or targetLanguage" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });

    const langNames: Record<string, string> = { en: "English", hi: "Hindi", gu: "Gujarati" };
    const targetLangName = langNames[targetLanguage] || "English";

    const batch = questions.slice(0, 10);

    const prompt = batch.map((q: any, i: number) =>
      `Q${i + 1} [ID:${q.id}]:
question: ${q.question_text}
option_a: ${q.option_a}
option_b: ${q.option_b}
option_c: ${q.option_c}
option_d: ${q.option_d}
explanation: ${q.explanation || ""}`
    ).join("\n\n");

    const systemPrompt = `You are an expert translator specializing in Indian government exam content.
Translate ALL the given MCQ questions to ${targetLangName}.
Keep proper nouns, numbers, and technical terms accurate.
Return ONLY a JSON array with objects:
{"id": <number>, "question_text": "<translated>", "option_a": "<translated>", "option_b": "<translated>", "option_c": "<translated>", "option_d": "<translated>", "explanation": "<translated or empty>"}
No markdown, no extra text.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json({ error: err.error?.message || "OpenAI error" }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "[]";
    const clean = content.replace(/```json|```/g, "").trim();
    let translated;
    try {
      translated = JSON.parse(clean);
    } catch {
      const match = clean.match(/\[[\s\S]*\]/);
      translated = match ? JSON.parse(match[0]) : [];
    }

    return NextResponse.json({ translated, tokens_used: data.usage?.total_tokens || 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
