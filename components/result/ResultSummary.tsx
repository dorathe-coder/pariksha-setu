"use client";
import Link from "next/link";
import { CheckCircle, XCircle, MinusCircle, Clock, Trophy, Share2, RotateCcw } from "lucide-react";
import { formatTime } from "@/lib/utils";
import type { Result } from "@/types/database";

export default function ResultSummary({ result }: { result: Result }) {
  const test = result.test as any;
  const accuracy = Math.round(result.accuracy);
  const scorePercent = Math.round((result.score / result.max_score) * 100);

  const shareResult = () => {
    const text = `I scored ${result.score}/${result.max_score} (${accuracy}% accuracy) on ${test?.title} at ParikshaSetu! 📚`;
    if (navigator.share) {
      navigator.share({ title: "My Result", text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text + " " + window.location.href);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className={`px-6 py-5 ${accuracy >= 70 ? "bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100" : accuracy >= 50 ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100" : "bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-100"}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-500">{test?.exam?.icon} {test?.exam?.name}</span>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-500">{test?.category?.name}</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">{test?.title}</h1>
            <div className="flex items-center gap-2">
              <Trophy className={`w-4 h-4 ${accuracy >= 70 ? "text-green-600" : accuracy >= 50 ? "text-amber-600" : "text-red-500"}`} />
              <span className={`text-sm font-semibold ${accuracy >= 70 ? "text-green-700" : accuracy >= 50 ? "text-amber-700" : "text-red-600"}`}>
                {accuracy >= 80 ? "Excellent!" : accuracy >= 70 ? "Good Job!" : accuracy >= 50 ? "Needs Improvement" : "Keep Practicing"}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className={`text-4xl font-bold ${accuracy >= 70 ? "text-green-700" : accuracy >= 50 ? "text-amber-600" : "text-red-600"}`}>
              {accuracy}%
            </div>
            <div className="text-sm text-gray-500">Accuracy</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-y sm:divide-y-0 divide-gray-100 border-b border-gray-100">
        {[
          { icon: <Trophy className="w-5 h-5 text-blue-600" />, label: "Score", value: `${result.score.toFixed(1)} / ${result.max_score}`, bg: "bg-blue-50" },
          { icon: <CheckCircle className="w-5 h-5 text-green-600" />, label: "Correct", value: result.correct_count, bg: "bg-green-50" },
          { icon: <XCircle className="w-5 h-5 text-red-500" />, label: "Wrong", value: result.wrong_count, bg: "bg-red-50" },
          { icon: <MinusCircle className="w-5 h-5 text-gray-400" />, label: "Skipped", value: result.skipped_count, bg: "bg-gray-50" },
        ].map(({ icon, label, value, bg }) => (
          <div key={label} className="flex flex-col items-center justify-center py-4 px-2">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-2`}>{icon}</div>
            <div className="text-xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-1.5 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Time taken: <strong className="text-gray-900">{formatTime(result.time_taken_seconds)}</strong></span>
          </div>
          {result.rank && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Rank: <strong className="text-amber-700">#{result.rank}</strong></span>
            </div>
          )}
          {result.percentile && (
            <div className="text-gray-600">
              Percentile: <strong className="text-blue-900">{result.percentile}%</strong>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/test/${result.test_id}`}
            className="flex items-center gap-1.5 text-sm font-medium border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> Reattempt
          </Link>
          <button onClick={shareResult}
            className="flex items-center gap-1.5 text-sm font-medium bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-colors">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
          <Link href="/exams"
            className="flex items-center gap-1.5 text-sm font-medium bg-blue-900 hover:bg-blue-950 text-white px-4 py-2 rounded-xl transition-colors">
            More Tests
          </Link>
        </div>
      </div>
    </div>
  );
}
