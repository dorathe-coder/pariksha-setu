"use client";
import Link from "next/link";
import { CheckCircle, XCircle, MinusCircle, Clock, Trophy, Share2, RotateCcw, TrendingUp, Target } from "lucide-react";
import { formatTime } from "@/lib/utils";
import type { Result } from "@/types/database";

export default function ResultSummary({ result }: { result: Result }) {
  const test = result.test as any;
  const accuracy = Math.round(result.accuracy);
  const scorePercent = result.max_score > 0 ? Math.round((result.score / result.max_score) * 100) : 0;
  const passed = test?.passing_marks ? result.score >= test.passing_marks : accuracy >= 40;

  const getGrade = () => {
    if (accuracy >= 90) return { label: "Outstanding! 🏆", color: "text-green-700" };
    if (accuracy >= 75) return { label: "Excellent! 🎉", color: "text-green-600" };
    if (accuracy >= 60) return { label: "Good Job! 👍", color: "text-blue-700" };
    if (accuracy >= 40) return { label: "Keep Practicing 📚", color: "text-amber-600" };
    return { label: "Needs More Practice 💪", color: "text-red-600" };
  };
  const grade = getGrade();

  const shareResult = () => {
    const text = `I scored ${result.score}/${result.max_score} (${accuracy}% accuracy) on ${test?.title} at ParikshaSetu! 📚 Try it: `;
    if (navigator.share) navigator.share({ title: "My Result - ParikshaSetu", text, url: window.location.href });
    else { navigator.clipboard.writeText(text + window.location.href); alert("Result link copied!"); }
  };

  const ringColor = accuracy >= 70 ? "#16a34a" : accuracy >= 50 ? "#d97706" : "#dc2626";
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (accuracy / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Banner */}
      <div className={`px-5 sm:px-8 py-6 ${accuracy >= 70 ? "bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50" : accuracy >= 50 ? "bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50" : "bg-gradient-to-r from-red-50 via-rose-50 to-pink-50"}`}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Circular Score */}
          <div className="relative shrink-0">
            <svg width="100" height="100" className="-rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle cx="50" cy="50" r="40" fill="none" stroke={ringColor} strokeWidth="8"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black" style={{ color: ringColor }}>{accuracy}%</span>
              <span className="text-xs text-gray-500 font-medium">Accuracy</span>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
              {test?.exam?.icon && <span className="text-lg">{test.exam.icon}</span>}
              <span className="text-sm text-gray-500">{test?.exam?.name} · {test?.category?.name}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-tight">{test?.title}</h1>
            <p className={`text-lg font-bold ${grade.color}`}>{grade.label}</p>
            {test?.passing_marks && (
              <div className={`inline-flex items-center gap-1.5 mt-2 text-xs font-semibold px-3 py-1 rounded-full ${passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                {passed ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                {passed ? "PASSED" : "FAILED"} · Passing: {test.passing_marks}
              </div>
            )}
          </div>

          <div className="text-center shrink-0">
            <div className="text-4xl sm:text-5xl font-black text-gray-900">{result.score.toFixed(result.score % 1 === 0 ? 0 : 1)}</div>
            <div className="text-sm text-gray-500 mt-0.5">out of {result.max_score}</div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100 border-y border-gray-100">
        {[
          { icon: <CheckCircle className="w-5 h-5 text-green-600" />, label: "Correct", value: result.correct_count, sub: `${Math.round((result.correct_count / result.total_questions) * 100)}% of total`, bg: "bg-green-50" },
          { icon: <XCircle className="w-5 h-5 text-red-500" />, label: "Wrong", value: result.wrong_count, sub: "marks deducted", bg: "bg-red-50" },
          { icon: <MinusCircle className="w-5 h-5 text-gray-400" />, label: "Skipped", value: result.skipped_count, sub: "no penalty", bg: "bg-gray-50" },
          { icon: <Clock className="w-5 h-5 text-blue-600" />, label: "Time Taken", value: formatTime(result.time_taken_seconds), sub: `of ${test?.timer_minutes}m allowed`, bg: "bg-blue-50" },
        ].map(({ icon, label, value, sub, bg }) => (
          <div key={label} className="flex flex-col items-center justify-center py-5 px-3 text-center">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-2`}>{icon}</div>
            <div className="text-2xl font-black text-gray-900">{value}</div>
            <div className="text-xs font-semibold text-gray-600 mt-0.5">{label}</div>
            <div className="text-xs text-gray-400 mt-0.5 hidden sm:block">{sub}</div>
          </div>
        ))}
      </div>

      {/* Rank + Actions */}
      <div className="px-5 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-5 text-sm flex-wrap justify-center sm:justify-start">
          {result.rank && (
            <div className="flex items-center gap-1.5 text-gray-700">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Rank <strong className="text-amber-700">#{result.rank}</strong></span>
            </div>
          )}
          {result.percentile && (
            <div className="flex items-center gap-1.5 text-gray-700">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span>Top <strong className="text-blue-700">{100 - result.percentile}%</strong></span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-gray-700">
            <Target className="w-4 h-4 text-purple-500" />
            <span>Score: <strong className="text-purple-700">{scorePercent}%</strong></span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <Link href={`/test/${result.test_id}`}
            className="flex items-center gap-1.5 text-sm font-semibold border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors text-gray-700">
            <RotateCcw className="w-3.5 h-3.5" /> Reattempt
          </Link>
          <button onClick={shareResult}
            className="flex items-center gap-1.5 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-colors">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
          <Link href="/exams"
            className="flex items-center gap-1.5 text-sm font-bold bg-blue-900 hover:bg-blue-950 text-white px-4 py-2 rounded-xl transition-colors">
            More Tests →
          </Link>
        </div>
      </div>
    </div>
  );
}
