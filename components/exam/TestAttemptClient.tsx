"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Flag, ChevronLeft, ChevronRight, Clock, Send, Menu, X, CheckCircle, AlertTriangle } from "lucide-react";
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
  id: number; title: string; timer_minutes: number; total_marks: number;
  marks_per_question: number; negative_marking: number; total_questions: number;
  exam?: { name: string; icon?: string }; category?: { name: string; type: string };
}
interface Props { test: Test; questions: Question[]; userId: string; }

export default function TestAttemptClient({ test, questions, userId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [timeLeft, setTimeLeft] = useState(test.timer_minutes * 60);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const questionStartTime = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout>();

  const currentQ = questions[currentIdx];

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
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
      [currentQ.id]: { ...prev[currentQ.id], selected: option, markedReview: prev[currentQ.id]?.markedReview || false, timeSpent: prev[currentQ.id]?.timeSpent || 0 },
    }));
  };

  const toggleMarkReview = () => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: { ...prev[currentQ.id], markedReview: !prev[currentQ.id]?.markedReview, timeSpent: prev[currentQ.id]?.timeSpent || 0 },
    }));
  };

  const navigateTo = (idx: number) => {
    const timeSpent = Math.floor((Date.now() - questionStartTime.current) / 1000);
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: { ...prev[currentQ.id], timeSpent: (prev[currentQ.id]?.timeSpent || 0) + timeSpent, markedReview: prev[currentQ.id]?.markedReview || false },
    }));
    questionStartTime.current = Date.now();
    setCurrentIdx(idx);
    setShowNav(false);
  };

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (submitting) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    const timeTaken = test.timer_minutes * 60 - timeLeft;
    let score = 0, correct = 0, wrong = 0, skipped = 0;

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
        score += q.marks || test.marks_per_question || 1;
        return { question_id: q.id, selected_option: selected, is_correct: true, is_skipped: false, is_marked_review: ans?.markedReview || false, time_spent_seconds: ans?.timeSpent || 0, marks_earned: q.marks || test.marks_per_question || 1 };
      } else {
        wrong++;
        const deduction = test.negative_marking || 0;
        score -= deduction;
        return { question_id: q.id, selected_option: selected, is_correct: false, is_skipped: false, is_marked_review: ans?.markedReview || false, time_spent_seconds: ans?.timeSpent || 0, marks_earned: -deduction };
      }
    });

    const accuracy = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;

    const { data: result, error: resultError } = await supabase.from("results").insert({
      user_id: userId, test_id: test.id, score: Math.max(0, score),
      max_score: test.total_marks, accuracy, correct_count: correct,
      wrong_count: wrong, skipped_count: skipped, total_questions: questions.length,
      time_taken_seconds: timeTaken, is_completed: true,
    }).select("id").single();

    if (resultError || !result) { setSubmitting(false); return; }
    await supabase.from("result_details").insert(details.map(d => ({ ...d, result_id: result.id })));
    await supabase.from("tests").update({ attempt_count: ((test as any).attempt_count || 0) + 1 }).eq("id", test.id);
    router.push(`/result/${result.id}`);
  }, [submitting, answers, questions, test, userId, timeLeft, supabase, router]);

  const answeredCount = Object.values(answers).filter(a => a.selected).length;
  const markedCount = Object.values(answers).filter(a => a.markedReview).length;
  const isMarked = answers[currentQ?.id]?.markedReview || false;
  const selectedAnswer = answers[currentQ?.id]?.selected;
  const urgent = timeLeft <= 300;

  const statusColors: Record<string, string> = {
    answered: "bg-green-500 text-white border-green-500",
    "answered-review": "bg-amber-400 text-white border-amber-400",
    review: "bg-purple-500 text-white border-purple-500",
    unanswered: "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700",
  };

  const NavPanel = () => (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        {[
          { label: "Answered", value: answeredCount, color: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400" },
          { label: "Skipped", value: questions.length - answeredCount, color: "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400" },
          { label: "Flagged", value: markedCount, color: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400" },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-xl p-2.5 text-center`}>
            <div className="text-xl font-bold">{s.value}</div>
            <div className="text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-6 gap-1.5 mb-4 flex-1 content-start">
        {questions.map((q, idx) => {
          const status = getQuestionStatus(idx);
          return (
            <button key={q.id} onClick={() => navigateTo(idx)}
              className={`aspect-square rounded-lg text-xs font-bold border transition-all ${idx === currentIdx ? "ring-2 ring-blue-900 ring-offset-1 scale-105" : ""} ${statusColors[status]}`}>
              {idx + 1}
            </button>
          );
        })}
      </div>
      <div className="space-y-1 text-xs mb-4">
        {[
          { color: "bg-green-500", label: "Answered" },
          { color: "bg-amber-400", label: "Marked for Review" },
          { color: "bg-purple-500", label: "Marked (No Answer)" },
          { color: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700", label: "Not Visited" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${l.color} shrink-0`} />
            <span className="text-gray-500 dark:text-gray-400">{l.label}</span>
          </div>
        ))}
      </div>
      <button onClick={() => setShowSubmitModal(true)}
        className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
        <Send className="w-4 h-4" /> Submit Test
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b transition-colors ${urgent ? "bg-red-900 border-red-800" : "bg-blue-900 border-blue-800"}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button className="lg:hidden p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10" onClick={() => setShowNav(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">{test.title}</p>
              <p className="text-white/60 text-xs hidden sm:block">{test.exam?.icon} {test.exam?.name} · Q {currentIdx + 1}/{questions.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {test.negative_marking > 0 && (
              <div className="hidden sm:flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-xs text-amber-200 font-medium">-{test.negative_marking}</span>
              </div>
            )}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-sm ${urgent ? "bg-white text-red-700 animate-pulse" : "bg-white/15 text-white"}`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
            <button onClick={() => setShowSubmitModal(true)}
              className="bg-amber-500 hover:bg-amber-400 text-white text-sm font-bold px-4 py-1.5 rounded-xl transition-colors flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Submit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1 bg-white/20 sticky top-14 z-40">
        <div className="h-1 bg-amber-400 transition-all duration-300" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-4 py-4 sm:py-6 flex gap-5">
        {/* Question Area */}
        <main className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Question Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            {/* Q Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Q {currentIdx + 1} / {questions.length}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${currentQ?.difficulty === "easy" ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400" : currentQ?.difficulty === "hard" ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400" : "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400"}`}>
                  {currentQ?.difficulty}
                </span>
                <span className="text-xs bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
                  +{currentQ?.marks || test.marks_per_question || 1} marks
                </span>
                {test.negative_marking > 0 && (
                  <span className="text-xs bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                    -{test.negative_marking} wrong
                  </span>
                )}
              </div>
              <button onClick={toggleMarkReview}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${isMarked ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                <Flag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isMarked ? "Flagged" : "Flag"}</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="px-5 py-5">
              <p className="text-gray-900 dark:text-white font-medium leading-relaxed text-base sm:text-lg">{currentQ?.question_text}</p>
            </div>

            {/* Options */}
            <div className="px-5 pb-5 space-y-2.5">
              {(["A", "B", "C", "D"] as CorrectOption[]).map((opt) => {
                const text = currentQ?.[`option_${opt.toLowerCase()}` as keyof Question] as string;
                const isSelected = selectedAnswer === opt;
                return (
                  <button key={opt} onClick={() => selectAnswer(opt)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-150 active:scale-[0.99] ${
                      isSelected
                        ? "border-blue-900 bg-blue-50 dark:bg-blue-950 shadow-sm"
                        : "border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-gray-50/80 dark:hover:bg-gray-800/80"
                    }`}>
                    <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${isSelected ? "bg-blue-900 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
                      {opt}
                    </span>
                    <span className={`text-sm leading-relaxed mt-0.5 flex-1 ${isSelected ? "text-blue-900 dark:text-blue-300 font-medium" : "text-gray-800 dark:text-gray-200"}`}>{text}</span>
                    {isSelected && <CheckCircle className="w-4 h-4 text-blue-900 dark:text-blue-400 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>

            {/* Clear + Nav */}
            <div className="px-5 pb-4 flex items-center justify-between">
              {selectedAnswer ? (
                <button onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]: { ...prev[currentQ.id], selected: undefined, markedReview: prev[currentQ.id]?.markedReview || false, timeSpent: prev[currentQ.id]?.timeSpent || 0 } }))}
                  className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline">
                  Clear Response
                </button>
              ) : <div />}
              <div className="flex gap-2">
                <button onClick={() => navigateTo(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0}
                  className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button onClick={() => navigateTo(Math.min(questions.length - 1, currentIdx + 1))} disabled={currentIdx === questions.length - 1}
                  className="flex items-center gap-1 text-sm font-bold text-white bg-blue-900 hover:bg-blue-950 disabled:opacity-30 px-4 py-2 rounded-xl transition-colors">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Quick Nav */}
          <div className="lg:hidden bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{answeredCount}/{questions.length} answered</span>
              <div className="w-full mx-3 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
              </div>
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1">
              {questions.map((q, idx) => {
                const status = getQuestionStatus(idx);
                return (
                  <button key={q.id} onClick={() => navigateTo(idx)}
                    className={`shrink-0 w-7 h-7 rounded-md text-xs font-bold border transition-all ${idx === currentIdx ? "ring-2 ring-blue-900 ring-offset-1" : ""} ${statusColors[status]}`}>
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </main>

        {/* Desktop Sidebar Nav */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-4 sticky top-24">
            <NavPanel />
          </div>
        </aside>
      </div>

      {/* Mobile Nav Drawer */}
      {showNav && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowNav(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 shadow-xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Question Navigator</h3>
              <button onClick={() => setShowNav(false)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            <NavPanel />
          </div>
        </div>
      )}

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Send className="w-7 h-7 text-blue-900 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-1">Submit Test?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-5">Once submitted, you cannot change your answers.</p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-5 space-y-2">
              {[
                { label: "Answered", value: answeredCount, color: "text-green-700 dark:text-green-400" },
                { label: "Not Answered", value: questions.length - answeredCount, color: "text-red-600 dark:text-red-400" },
                { label: "Marked for Review", value: markedCount, color: "text-amber-600 dark:text-amber-400" },
                { label: "Time Left", value: formatTime(timeLeft), color: "text-blue-700 dark:text-blue-400" },
              ].map(s => (
                <div key={s.label} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{s.label}</span>
                  <span className={`font-bold ${s.color}`}>{s.value}</span>
                </div>
              ))}
            </div>
            {test.negative_marking > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900 rounded-xl p-3 mb-4 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">This test has negative marking (-{test.negative_marking} per wrong answer).</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowSubmitModal(false)}
                className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm">
                Continue
              </button>
              <button onClick={() => handleSubmit(false)} disabled={submitting}
                className="flex-1 bg-blue-900 hover:bg-blue-950 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</> : "Yes, Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
