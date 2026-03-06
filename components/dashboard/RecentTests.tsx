import Link from "next/link";
import { formatTime } from "@/lib/utils";
import type { Result } from "@/types/database";

export default function RecentTests({ results }: { results: Result[] }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Recent Tests</h3>
        <Link href="/dashboard/history" className="text-xs text-blue-900 dark:text-blue-400 hover:underline">View all</Link>
      </div>
      <div className="space-y-3">
        {results.slice(0, 6).map((result) => (
          <Link key={result.id} href={`/result/${result.id}`}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-base shrink-0">
              {(result.test as any)?.exam?.icon || "📝"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-900 dark:group-hover:text-blue-400">
                {(result.test as any)?.title || "Test"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(result.time_taken_seconds)} taken
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-sm font-semibold ${result.accuracy >= 70 ? "text-green-600 dark:text-green-400" : result.accuracy >= 50 ? "text-yellow-600 dark:text-yellow-400" : "text-red-500 dark:text-red-400"}`}>
                {Math.round(result.accuracy)}%
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{result.score}/{result.max_score}</p>
            </div>
          </Link>
        ))}
        {results.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">No tests attempted yet</p>
            <Link href="/exams" className="text-sm text-blue-900 dark:text-blue-400 font-medium hover:underline mt-1 block">Browse tests</Link>
          </div>
        )}
      </div>
    </div>
  );
}
