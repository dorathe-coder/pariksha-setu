"use client";
import { useState } from "react";
import { CheckCircle, XCircle, MinusCircle, BookmarkPlus, ChevronDown, ChevronUp, Sparkles, Loader2, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ResultDetail } from "@/types/database";

interface Props { details: ResultDetail[]; testId: number; userId: string; }

export default function ResultQuestions({ details, testId, userId }: Props) {
  const [filter, setFilter] = useState<"all" | "correct" | "wrong" | "skipped">("all");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set());
  const [aiExplaining, setAiExplaining] = useState<number | null>(null);
  const [aiExplanations, setAiExplanations] = useState<Record<number, string>>({});
  const supabase = createClient();

  const filtered = details.filter(d => {
    if (filter === "correct") return d.is_correct;
    if (filter === "wrong") return !d.is_correct && !d.is_skipped;
    if (filter === "skipped") return d.is_skipped;
    return true;
  });

  const counts = {
    all: details.length,
    correct: details.filter(d => d.is_correct).length,
    wrong: details.filter(d => !d.is_correct && !d.is_skipped).length,
    skipped: details.filter(d => d.is_skipped).length,
  };

  const bookmarkQuestion = async (questionId: number) => {
    if (bookmarked.has(questionId)) return;
    await supabase.from("bookmarks").upsert({ user_id: userId, question_id: questionId });
    setBookmarked(prev => new Set(prev).add(questionId));
  };

  const generateAIExplanation = async (detail: ResultDetail) => {
    const q = detail.question as any;
    if (!q) return;
    setAiExplaining(detail.id);
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: [{ id: q.id, question_text: q.question_text, option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d, correct_option: q.correct_option }] }),
      });
      const data = await res.json();
      const exp = data.explanations?.[0]?.explanation;
      if (exp) setAiExplanations(prev => ({ ...prev, [detail.id]: exp }));
    } catch (e) { console.error(e); }
    setAiExplaining(null);
  };

  const filterBtns = [
    { key: "all", label: "All", count: counts.all, color: "bg-gray-100 text-gray-700", active: "bg-gray-800 text-white" },
    { key: "correct", label: "Correct", count: counts.correct, color: "bg-green-50 text-green-700", active: "bg-green-600 text-white" },
    { key: "wrong", label: "Wrong", count: counts.wrong, color: "bg-red-50 text-red-600", active: "bg-red-600 text-white" },
    { key: "skipped", label: "Skipped", count: counts.skipped, color: "bg-gray-50 text-gray-500", active: "bg-gray-500 text-white" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">Questions Review</h3>
        <div className="flex gap-1.5 flex-wrap">
          {filterBtns.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key as any)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${filter === f.key ? f.active : f.color}`}>
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-gray-50">
        {filtered.map((detail, idx) => {
          const q = detail.question as any;
          if (!q) return null;
          const isExpanded = expanded === detail.id;
          const explanation = q.explanation || aiExplanations[detail.id];

          return (
            <div key={detail.id} className={`${detail.is_correct ? "" : detail.is_skipped ? "" : "bg-red-50/30"}`}>
              {/* Question Row */}
              <div className="flex items-start gap-3 p-4 sm:p-5 cursor-pointer hover:bg-gray-50/80 transition-colors"
                onClick={() => setExpanded(isExpanded ? null : detail.id)}>
                <div className="shrink-0 mt-0.5">
                  {detail.is_correct
                    ? <CheckCircle className="w-5 h-5 text-green-600" />
                    : detail.is_skipped
                    ? <MinusCircle className="w-5 h-5 text-gray-400" />
                    : <XCircle className="w-5 h-5 text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-gray-400 mr-2">Q{idx + 1}</span>
                  <span className="text-sm text-gray-800 leading-relaxed">{q.question_text}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {!detail.is_skipped && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${detail.is_correct ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {detail.is_correct ? `+${detail.marks_earned}` : `${detail.marks_earned}`}
                    </span>
                  )}
                  <button onClick={e => { e.stopPropagation(); bookmarkQuestion(q.id); }}
                    className={`p-1 rounded-lg transition-colors ${bookmarked.has(q.id) ? "text-blue-700 bg-blue-50" : "text-gray-300 hover:text-gray-500"}`}>
                    <BookmarkPlus className="w-4 h-4" />
                  </button>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div className="px-4 sm:px-5 pb-5 pt-1 space-y-2.5">
                  {(["a","b","c","d"] as const).map(opt => {
                    const optUpper = opt.toUpperCase();
                    const isCorrect = optUpper === q.correct_option;
                    const isSelected = optUpper === detail.selected_option;
                    return (
                      <div key={opt} className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl text-sm border ${
                        isCorrect ? "bg-green-50 border-green-200 text-green-900" :
                        isSelected && !isCorrect ? "bg-red-50 border-red-200 text-red-900" :
                        "border-transparent text-gray-600 bg-gray-50/50"}`}>
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                          isCorrect ? "bg-green-600 text-white" :
                          isSelected && !isCorrect ? "bg-red-500 text-white" :
                          "bg-gray-200 text-gray-600"}`}>
                          {optUpper}
                        </span>
                        <span className="flex-1 leading-relaxed">{q[`option_${opt}`]}</span>
                        <div className="shrink-0 flex gap-1">
                          {isCorrect && <span className="text-xs text-green-700 font-semibold bg-green-100 px-2 py-0.5 rounded-full">✓ Correct</span>}
                          {isSelected && !isCorrect && <span className="text-xs text-red-600 font-semibold bg-red-100 px-2 py-0.5 rounded-full">Your Answer</span>}
                        </div>
                      </div>
                    );
                  })}

                  {/* Explanation */}
                  {explanation ? (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mt-1">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                        <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Explanation</p>
                      </div>
                      <p className="text-sm text-blue-900 leading-relaxed">{explanation}</p>
                    </div>
                  ) : (
                    <button onClick={() => generateAIExplanation(detail)} disabled={aiExplaining === detail.id}
                      className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-colors border border-purple-100 disabled:opacity-50">
                      {aiExplaining === detail.id
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                        : <><Sparkles className="w-3.5 h-3.5" /> AI: Generate Explanation</>}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">No questions in this category</p>
        )}
      </div>
    </div>
  );
}
