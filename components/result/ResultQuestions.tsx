"use client";
import { useState } from "react";
import { CheckCircle, XCircle, MinusCircle, BookmarkPlus, ChevronDown, ChevronUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ResultDetail } from "@/types/database";

interface Props {
  details: ResultDetail[];
  testId: number;
  userId: string;
}

export default function ResultQuestions({ details, testId, userId }: Props) {
  const [filter, setFilter] = useState<"all" | "correct" | "wrong" | "skipped">("all");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set());
  const supabase = createClient();

  const filtered = details.filter(d => {
    if (filter === "correct") return d.is_correct;
    if (filter === "wrong") return !d.is_correct && !d.is_skipped;
    if (filter === "skipped") return d.is_skipped;
    return true;
  });

  const bookmarkQuestion = async (questionId: number) => {
    if (bookmarked.has(questionId)) return;
    await supabase.from("bookmarks").upsert({ user_id: userId, question_id: questionId });
    setBookmarked(prev => new Set(prev).add(questionId));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-gray-900">Questions Review</h3>
        <div className="flex gap-2">
          {(["all", "correct", "wrong", "skipped"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors capitalize ${filter === f ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {filtered.map((detail, idx) => {
          const q = detail.question as any;
          if (!q) return null;
          const isExpanded = expanded === detail.id;
          const statusIcon = detail.is_correct
            ? <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            : detail.is_skipped
            ? <MinusCircle className="w-5 h-5 text-gray-400 shrink-0" />
            : <XCircle className="w-5 h-5 text-red-500 shrink-0" />;

          return (
            <div key={detail.id} className={`border rounded-xl overflow-hidden ${detail.is_correct ? "border-green-100" : detail.is_skipped ? "border-gray-100" : "border-red-100"}`}>
              <div className="flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpanded(isExpanded ? null : detail.id)}>
                {statusIcon}
                <p className="text-sm text-gray-800 flex-1 leading-relaxed">{q.question_text}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={e => { e.stopPropagation(); bookmarkQuestion(q.id); }}
                    className={`p-1 rounded-lg transition-colors ${bookmarked.has(q.id) ? "text-blue-900 bg-blue-50" : "text-gray-400 hover:text-gray-600"}`}>
                    <BookmarkPlus className="w-4 h-4" />
                  </button>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-2">
                  {(["a","b","c","d"] as const).map(opt => {
                    const optUpper = opt.toUpperCase();
                    const isCorrect = optUpper === q.correct_option;
                    const isSelected = optUpper === detail.selected_option;
                    return (
                      <div key={opt} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${isCorrect ? "bg-green-50 text-green-800 border border-green-200" : isSelected && !isCorrect ? "bg-red-50 text-red-800 border border-red-200" : "text-gray-700"}`}>
                        <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${isCorrect ? "bg-green-600 text-white" : isSelected && !isCorrect ? "bg-red-500 text-white" : "bg-gray-100 text-gray-600"}`}>{optUpper}</span>
                        {q[`option_${opt}`]}
                        {isCorrect && <span className="ml-auto text-xs text-green-700 font-medium">Correct</span>}
                        {isSelected && !isCorrect && <span className="ml-auto text-xs text-red-600 font-medium">Your Answer</span>}
                      </div>
                    );
                  })}
                  {q.explanation && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mt-2">
                      <p className="text-xs font-semibold text-blue-700 mb-0.5">Explanation</p>
                      <p className="text-sm text-blue-800 leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-6">No questions in this category</p>
        )}
      </div>
    </div>
  );
}
