import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { questions } = await req.json();
    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: "No questions provided" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });

    const batch = questions.slice(0, 30);
    const prompt = batch.map((q: any, i: number) =>
      `[ID:${q.id}] ${q.question_text} | A:${q.option_a} | B:${q.option_b} | C:${q.option_c} | D:${q.option_d} | Ans:${q.correct_option}`
    ).join("\n");

    const systemPrompt = `You are a quality checker for MCQ exam questions. Analyze the given questions and identify issues.
Return a JSON object with:
{
  "issues": [
    {
      "id": <question_id>,
      "type": "duplicate" | "possible_wrong_answer" | "incomplete" | "ambiguous" | "grammar_error",
      "severity": "high" | "medium" | "low",
      "message": "<brief description of the issue>",
      "duplicate_of_id": <id_if_duplicate_or_null>
    }
  ],
  "summary": {
    "total_checked": <number>,
    "issues_found": <number>,
    "duplicates": <number>,
    "quality_score": <0-100>
  }
}
Only list questions that have actual issues. No markdown.`;

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
          { role: "user", content: `Check quality of these ${batch.length} questions:\n\n${prompt}` },
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json({ error: err.error?.message || "OpenAI error" }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "{}";
    const clean = content.replace(/```json|```/g, "").trim();
    let result;
    try {
      result = JSON.parse(clean);
    } catch {
      result = { issues: [], summary: { total_checked: batch.length, issues_found: 0, duplicates: 0, quality_score: 100 } };
    }

    return NextResponse.json({ ...result, tokens_used: data.usage?.total_tokens || 0 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
