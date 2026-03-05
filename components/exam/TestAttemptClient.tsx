"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Flag, ChevronLeft, ChevronRight, Clock, CheckCircle, AlertCircle, BookmarkCheck, Send } from "lucide-react";
import { formatTime } from "@/lib/utils";
import type { CorrectOption, AnswerState } from "@/types/database";

interface Question {
  correct_option?: string;
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  difficulty: string;
  marks: number;
  question_order?: number;
}

interface Test {
  id: number;
  title: string;
  timer_minutes: number;
  total_marks: number;
  marks_per_question: number;
  negative_marking: number;
  total_questions: number;
  exam?: { name: string; icon?: string };
  category?: { name: string; type: string };
}

interface Props {
  test: Test;
  questions: Question[];
  userId: string;
}

export default function TestAttemptClient({ test, questions, userId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [timeLeft, setTimeLeft] = useState(test.timer_minutes * 60);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const questionStartTime = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout>();

  const currentQ = questions[currentIdx];

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const getQuestionStatus = (idx: number) => {
    const q = questions[idx];
    const ans = answers[q.id];
    if (!ans) return "unanswered";
    if (ans.markedReview && ans.selected) return "answered-review";
    if (ans.markedReview) return "review";
    if (ans.selected) return "answered";
    return "unanswered";
  };

  const selectAnswer = (option: CorrectOption) => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        selected: option,
        markedReview: prev[currentQ.id]?.markedReview || false,
        timeSpent: (prev[currentQ.id]?.timeSpent || 0),
      },
    }));
  };

  const toggleMarkReview = () => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        markedReview: !prev[currentQ.id]?.markedReview,
        timeSpent: prev[currentQ.id]?.timeSpent || 0,
      },
    }));
  };

  const navigateTo = (idx: number) => {
    const timeSpent = Math.floor((Date.now() - questionStartTime.current) / 1000);
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        timeSpent: (prev[currentQ.id]?.timeSpent || 0) + timeSpent,
        markedReview: prev[currentQ.id]?.markedReview || false,
      },
    }));
    questionStartTime.current = Date.now();
    setCurrentIdx(idx);
  };

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);

    const timeTaken = test.timer_minutes * 60 - timeLeft;

    // Calculate score
    let score = 0;
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    const details = questions.map(q => {
      const ans = answers[q.id];
      const selected = ans?.selected;
      if (!selected) {
        skipped++;
        return { question_id: q.id, selected_option: null, is_correct: false, is_skipped: true, is_marked_review: ans?.markedReview || false, time_spent_seconds: ans?.timeSpent || 0, marks_earned: 0 };
      }
      const isCorrect = selected === q.correct_option;
      if (isCorrect) {
        correct++;
        score += q.marks || test.marks_per_question;
        return { question_id: q.id, selected_option: selected, is_correct: true, is_skipped: false, is_marked_review: ans?.markedReview || false, time_spent_seconds: ans?.timeSpent || 0, marks_earned: q.marks || test.marks_per_question };
      } else {
        wrong++;
        const deduction = test.negative_marking || 0;
        score -= deduction;
        return { question_id: q.id, selected_option: selected, is_correct: false, is_skipped: false, is_marked_review: ans?.markedReview || false, time_spent_seconds: ans?.timeSpent || 0, marks_earned: -deduction };
      }
    });

    const maxScore = test.total_marks;
    const accuracy = correct > 0 ? Math.round((correct / questions.length) * 100) : 0;

    // Insert result
    const { data: result, error: resultError } = await supabase
      .from("results")
      .insert({
        user_id: userId,
        test_id: test.id,
        score: Math.max(0, score),
        max_score: maxScore,
        accuracy,
        correct_count: correct,
        wrong_count: wrong,
        skipped_count: skipped,
        total_questions: questions.length,
        time_taken_seconds: timeTaken,
        is_completed: true,
      })
      .select("id")
      .single();

    if (resultError || !result) { setSubmitting(false); return; }

    // Insert result details
    const detailsWithResultId = details.map(d => ({ ...d, result_id: result.id }));
    await supabase.from("result_details").insert(detailsWithResultId);

    // Update attempt count
    await supabase.rpc("calculate_rank", { p_result_id: result.id }).maybeSingle();
    await supabase.from("tests").update({ attempt_count: test.attempt_count + 1 }).eq("id", test.id);

    router.push(`/result/${result.id}`);
  }, [submitting, answers, questions, test, userId, timeLeft, supabase, router]);

  const answeredCount = Object.values(answers).filter(a => a.selected).length;
  const markedCount = Object.values(answers).filter(a => a.markedReview).length;

  const statusColors: Record<string, string> = {
    answered: "bg-green-500 text-white",
    "answered-review": "bg-amber-500 text-white",
    review: "bg-purple-500 text-white",
    unanswered: "bg-gray-100 text-gray-600 border border-gray-200",
  };

  const currentStatus = getQuestionStatus(currentIdx);
  const isMarked = answers[currentQ.id]?.markedReview || false;
  const selectedAnswer = answers[currentQ.id]?.selected;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500">{test.exam?.icon} {test.exam?.name}</span>
            <span className="text-gray-300">|</span>
            <h1 className="text-sm font-semibold text-gray-900 max-w-xs truncate">{test.title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-mono font-semibold text-sm ${timeLeft <= 300 ? "bg-red-100 text-red-700" : "bg-blue-50 text-blue-900"}`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
            <button onClick={() => setShowSubmitModal(true)}
              className="bg-blue-900 hover:bg-blue-950 text-white text-sm font-semibold px-5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" /> Submit
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Question Panel */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Q {currentIdx + 1} of {questions.length}</span>
                <span className={`badge ${currentQ.difficulty === 'easy' ? 'bg-green-100 text-green-700' : currentQ.difficulty === 'hard' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {currentQ.difficulty}
                </span>
                <span className="badge bg-blue-50 text-blue-700">{currentQ.marks} marks</span>
              </div>
              <button onClick={toggleMarkReview}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${isMarked ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                <Flag className="w-3.5 h-3.5" />
                {isMarked ? "Marked" : "Mark for Review"}
              </button>
            </div>
            <p className="text-gray-900 font-medium leading-relaxed mb-6 text-base">{currentQ.question_text}</p>
            <div className="space-y-3">
              {(["A", "B", "C", "D"] as CorrectOption[]).map((opt) => {
                const text = currentQ[`option_${opt.toLowerCase()}` as keyof Question] as string;
                const isSelected = selectedAnswer === opt;
                return (
                  <button key={opt} onClick={() => selectAnswer(opt)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3.5 rounded-xl border-2 transition-all ${isSelected ? "border-blue-900 bg-blue-50 text-blue-900" : "border-gray-100 hover:border-blue-200 hover:bg-gray-50 text-gray-800"}`}>
                    <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${isSelected ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-600"}`}>{opt}</span>
                    <span className="text-sm leading-relaxed mt-0.5">{text}</span>
                  </button>
                );
              })}
            </div>
            {selectedAnswer && (
              <button onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: { ...prev[currentQ.id], selected: undefined, markedReview: prev[currentQ.id]?.markedReview || false, timeSpent: prev[currentQ.id]?.timeSpent || 0 } }))}
                className="mt-4 text-xs text-red-500 hover:text-red-700 hover:underline">
                Clear response
              </button>
            )}
          </div>
          <div className="flex items-center justify-between">
            <button onClick={() => navigateTo(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-40 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button onClick={() => navigateTo(Math.min(questions.length - 1, currentIdx + 1))} disabled={currentIdx === questions.length - 1}
              className="flex items-center gap-1.5 text-sm font-medium text-blue-900 hover:text-blue-950 disabled:opacity-40 px-4 py-2 rounded-xl border border-blue-200 hover:bg-blue-50 transition-colors">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </main>

        {/* Navigation Sidebar */}
        <aside className="lg:w-72 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
            <div className="grid grid-cols-3 gap-2 mb-5 text-center">
              <div className="bg-green-50 rounded-xl p-2">
                <div className="text-lg font-bold text-green-700">{answeredCount}</div>
                <div className="text-xs text-green-600">Answered</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-2">
                <div className="text-lg font-bold text-gray-700">{questions.length - answeredCount - markedCount}</div>
                <div className="text-xs text-gray-500">Not Visited</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-2">
                <div className="text-lg font-bold text-amber-700">{markedCount}</div>
                <div className="text-xs text-amber-600">Marked</div>
              </div>
            </div>
            <div className="grid grid-cols-6 gap-1.5 mb-5">
              {questions.map((q, idx) => {
                const status = getQuestionStatus(idx);
                return (
                  <button key={q.id} onClick={() => navigateTo(idx)}
                    className={`w-full aspect-square rounded-lg text-xs font-semibold transition-all ${idx === currentIdx ? "ring-2 ring-blue-900 ring-offset-1" : ""} ${statusColors[status]}`}>
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <div className="space-y-1.5 text-xs mb-5">
              {[
                { color: "bg-green-500", label: "Answered" },
                { color: "bg-amber-500", label: "Marked for Review" },
                { color: "bg-purple-500", label: "Marked (Unanswered)" },
                { color: "bg-gray-100 border border-gray-200", label: "Not Answered" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${color}`} />
                  <span className="text-gray-600">{label}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowSubmitModal(true)}
              className="w-full bg-blue-900 hover:bg-blue-950 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> Submit Test
            </button>
          </div>
        </aside>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Send className="w-6 h-6 text-blue-900" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Submit Test?</h3>
            <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Answered</span>
                <span className="font-semibold text-green-700">{answeredCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Not Answered</span>
                <span className="font-semibold text-red-500">{questions.length - answeredCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Marked for Review</span>
                <span className="font-semibold text-amber-600">{markedCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Time Remaining</span>
                <span className="font-semibold text-blue-900">{formatTime(timeLeft)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowSubmitModal(false)}
                className="flex-1 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                Continue
              </button>
              <button onClick={() => handleSubmit(false)} disabled={submitting}
                className="flex-1 bg-blue-900 hover:bg-blue-950 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                {submitting ? "Submitting..." : "Yes, Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
