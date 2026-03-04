import Link from "next/link";
import { Clock, Users, BookOpen, Lock } from "lucide-react";
import { getCategoryBadge, getDifficultyBadge } from "@/lib/utils";
import type { Test } from "@/types/database";

export default function TestCard({ test, userId }: { test: Test; userId?: string }) {
  const categoryBadge = getCategoryBadge(test.category?.type || "");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-1.5">
            {test.category && (
              <span className={`badge ${categoryBadge}`}>
                {test.category.name}
              </span>
            )}
            {test.exam && (
              <span className="badge bg-gray-100 text-gray-600">
                {test.exam.icon && <span className="mr-1">{test.exam.icon}</span>}
                {test.exam.name}
              </span>
            )}
          </div>
          {!test.is_free && (
            <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">
              <Lock className="w-3 h-3" /> Paid
            </span>
          )}
        </div>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-3 group-hover:text-blue-900 transition-colors line-clamp-2">
          {test.title}
        </h3>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {test.total_questions} Qs
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {test.timer_minutes} min
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {test.attempt_count} attempts
          </span>
        </div>
        {test.negative_marking > 0 && (
          <p className="text-xs text-red-500 mt-2">Negative marking: -{test.negative_marking}</p>
        )}
      </div>
      <div className="px-5 pb-4">
        {userId ? (
          <Link href={`/test/${test.id}`}
            className="w-full bg-blue-900 hover:bg-blue-950 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors text-center block">
            Start Test
          </Link>
        ) : (
          <Link href="/auth/login"
            className="w-full border border-blue-900 text-blue-900 hover:bg-blue-50 text-sm font-semibold py-2.5 rounded-xl transition-colors text-center block">
            Login to Start
          </Link>
        )}
      </div>
    </div>
  );
}
