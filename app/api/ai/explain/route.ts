import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { questions } = await req.json();
    // questions: [{id, question_text, option_a, option_b, option_c, option_d, correct_option}]
    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: "No questions provided" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });

    const batch = questions.slice(0, 20); // max 20 at a time

    const prompt = batch.map((q: any, i: number) =>
      `Q${i + 1} [ID:${q.id}]: ${q.question_text}\nA) ${q.option_a}  B) ${q.option_b}  C) ${q.option_c}  D) ${q.option_d}\nCorrect: ${q.correct_option}`
    ).join("\n\n");

    const systemPrompt = `You are an expert exam coach. For each MCQ question given, write a clear, concise explanation (2-3 sentences) of why the correct answer is right.
Return ONLY a JSON array with objects: {"id": <question_id_as_number>, "explanation": "<explanation text>"}
Use the same language as the question (English/Hindi/Gujarati).
No markdown, no preamble, just the JSON array.`;

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
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json({ error: err.error?.message || "OpenAI error" }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "[]";
    const clean = content.replace(/```json|```/g, "").trim();
    let explanations;
    try {
      explanations = JSON.parse(clean);
    } catch {
      const match = clean.match(/\[[\s\S]*\]/);
      explanations = match ? JSON.parse(match[0]) : [];
    }

    return NextResponse.json({ explanations, tokens_used: data.usage?.total_tokens || 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
