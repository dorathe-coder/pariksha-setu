import Link from "next/link";
import { Clock, Users, BookOpen, Lock, CheckCircle } from "lucide-react";
import type { Test } from "@/types/database";

export default function TestCard({ test, userId }: { test: Test; userId?: string }) {
  const catColors: Record<string, string> = {
    mock_test: "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400",
    previous_year: "bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-400",
    topic_wise: "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400",
    daily_quiz: "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400",
    full_test: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400",
    mini_test: "bg-pink-50 dark:bg-pink-950 text-pink-700 dark:text-pink-400",
  };
  const catColor = catColors[test.category?.type || ""] || "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";

  return (
    <div className="card card-hover bg-white dark:bg-gray-900 overflow-hidden group flex flex-col">
      <div className="p-5 flex-1">
        {/* Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {test.category && (
              <span className={`badge ${catColor} text-xs`}>{test.category.name}</span>
            )}
            {test.is_free ? (
              <span className="badge bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 text-xs">Free</span>
            ) : (
              <span className="badge bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-0.5"><Lock className="w-3 h-3" />Paid</span>
            )}
          </div>
          {test.exam && (
            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{test.exam.icon}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2">
          {test.title}
        </h3>

        {/* Exam name */}
        {test.exam && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{test.exam.name}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
          <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{test.total_questions} Qs</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{test.timer_minutes}m</span>
          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{test.attempt_count || 0}</span>
        </div>

        {/* Marking */}
        <div className="flex items-center gap-2 mt-2.5 text-xs">
          <span className="text-green-600 dark:text-green-400 font-semibold">+{test.marks_per_question || 1}</span>
          {test.negative_marking > 0 && <span className="text-red-500 dark:text-red-400 font-semibold">/ -{test.negative_marking}</span>}
          <span className="text-gray-400">per question</span>
        </div>
      </div>

      {/* Action */}
      <div className="px-5 pb-4">
        {userId ? (
          <Link href={`/test/${test.id}`}
            className="block w-full bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2.5 rounded-xl text-center transition-all hover:shadow-lg hover:shadow-green-500/20 active:scale-95">
            Start Test →
          </Link>
        ) : (
          <Link href="/auth/login"
            className="block w-full border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 text-sm font-bold py-2.5 rounded-xl text-center transition-colors">
            Login to Start
          </Link>
        )}
      </div>
    </div>
  );
}
