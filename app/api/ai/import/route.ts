import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text, language = "auto" } = await req.json();
    if (!text || text.trim().length < 10) {
      return NextResponse.json({ error: "Text too short" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });

    const systemPrompt = `You are an expert at extracting MCQ (Multiple Choice Questions) from exam papers.
Extract ALL questions from the text and return a JSON array.
Each question must have:
- question_text: the question (clean, no numbering)
- option_a, option_b, option_c, option_d: the four options (text only, no A) B) prefix)
- correct_option: "A", "B", "C", or "D"
- explanation: a brief explanation of why the answer is correct (generate one if not present, in the same language as the question)
- difficulty: "easy", "medium", or "hard" based on question complexity
- language_detected: "en", "hi", or "gu"

Rules:
- Extract EVERY question, even if answer is missing (mark correct_option as "A" and flag it)
- Clean up OCR errors, fix obvious typos
- If options are inline (A) opt1  B) opt2...) split them correctly
- For Hindi/Gujarati text, keep it as-is
- Return ONLY valid JSON array, no markdown, no explanation text

Example output:
[{"question_text":"What is the capital of Gujarat?","option_a":"Mumbai","option_b":"Gandhinagar","option_c":"Surat","option_d":"Ahmedabad","correct_option":"B","explanation":"Gandhinagar is the capital city of Gujarat state in India.","difficulty":"easy","language_detected":"en"}]`;

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
          { role: "user", content: `Extract all MCQ questions from this text:\n\n${text.slice(0, 12000)}` },
        ],
        temperature: 0.1,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json({ error: err.error?.message || "OpenAI error" }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "[]";

    // Parse JSON safely
    const clean = content.replace(/```json|```/g, "").trim();
    let questions;
    try {
      questions = JSON.parse(clean);
    } catch {
      // Try to extract JSON array from response
      const match = clean.match(/\[[\s\S]*\]/);
      questions = match ? JSON.parse(match[0]) : [];
    }

    return NextResponse.json({
      questions,
      count: questions.length,
      tokens_used: data.usage?.total_tokens || 0,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
