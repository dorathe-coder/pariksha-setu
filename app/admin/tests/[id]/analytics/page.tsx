import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Users, Trophy, Clock, TrendingUp, Target, BarChart2 } from "lucide-react";

export default async function TestAnalyticsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const testId = parseInt(params.id);

  const { data: test } = await supabase.from("tests").select("*, exam:exams(name,icon)").eq("id", testId).single();
  if (!test) notFound();

  const { data: results } = await supabase
    .from("results")
    .select("score, max_score, accuracy, correct_count, wrong_count, skipped_count, time_taken_seconds, submitted_at")
    .eq("test_id", testId)
    .eq("is_completed", true)
    .order("submitted_at", { ascending: false });

  const { data: questionStats } = await supabase
    .from("result_details")
    .select("question_id, is_correct, is_skipped, question:questions(question_text, difficulty)")
    .eq("result_details.result_id", supabase.from("results").select("id").eq("test_id", testId) as any);

  // Calculate stats
  const totalAttempts = results?.length || 0;
  const avgScore = totalAttempts > 0 ? results!.reduce((s, r) => s + (r.score / r.max_score) * 100, 0) / totalAttempts : 0;
  const avgAccuracy = totalAttempts > 0 ? results!.reduce((s, r) => s + r.accuracy, 0) / totalAttempts : 0;
  const avgTime = totalAttempts > 0 ? results!.reduce((s, r) => s + r.time_taken_seconds, 0) / totalAttempts : 0;
  const highScore = totalAttempts > 0 ? Math.max(...results!.map(r => (r.score / r.max_score) * 100)) : 0;

  // Score distribution
  const scoreBuckets = [
    { label: "0-25%", min: 0, max: 25, count: 0, color: "bg-red-400" },
    { label: "26-50%", min: 26, max: 50, count: 0, color: "bg-orange-400" },
    { label: "51-75%", min: 51, max: 75, count: 0, color: "bg-amber-400" },
    { label: "76-100%", min: 76, max: 100, count: 0, color: "bg-green-500" },
  ];
  results?.forEach(r => {
    const pct = (r.score / r.max_score) * 100;
    const bucket = scoreBuckets.find(b => pct >= b.min && pct <= b.max);
    if (bucket) bucket.count++;
  });
  const maxBucket = Math.max(...scoreBuckets.map(b => b.count), 1);

  // Recent attempts
  const recentResults = results?.slice(0, 10) || [];

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}m ${sec}s`;
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/tests" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ChevronLeft className="w-4 h-4" /> Tests
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{(test.exam as any)?.icon || "📝"}</span>
          <div>
            <h2 className="font-bold text-gray-900">{test.title}</h2>
            <p className="text-sm text-gray-500">{(test.exam as any)?.name} · {test.total_questions} questions · {test.timer_minutes} minutes</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { icon: Users, label: "Total Attempts", value: totalAttempts, color: "bg-blue-50 text-blue-700", border: "border-blue-100" },
          { icon: Target, label: "Avg Score", value: `${Math.round(avgScore)}%`, color: "bg-green-50 text-green-700", border: "border-green-100" },
          { icon: TrendingUp, label: "Avg Accuracy", value: `${Math.round(avgAccuracy)}%`, color: "bg-purple-50 text-purple-700", border: "border-purple-100" },
          { icon: Clock, label: "Avg Time", value: totalAttempts > 0 ? formatTime(avgTime) : "—", color: "bg-amber-50 text-amber-700", border: "border-amber-100" },
          { icon: Trophy, label: "High Score", value: `${Math.round(highScore)}%`, color: "bg-rose-50 text-rose-700", border: "border-rose-100" },
        ].map(s => (
          <div key={s.label} className={`bg-white rounded-2xl border ${s.border} p-4 shadow-sm`}>
            <div className={`w-9 h-9 ${s.color.split(" ")[0]} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-4.5 h-4.5 ${s.color.split(" ")[1]}`} style={{ width: 18, height: 18 }} />
            </div>
            <div className="text-xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Score Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-600" /> Score Distribution
          </h3>
          {totalAttempts === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No attempts yet</p>
          ) : (
            <div className="space-y-3">
              {scoreBuckets.map(b => (
                <div key={b.label} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-16 shrink-0">{b.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div className={`h-6 ${b.color} rounded-full flex items-center px-2 transition-all`}
                      style={{ width: `${(b.count / maxBucket) * 100}%`, minWidth: b.count > 0 ? "2rem" : "0" }}>
                      {b.count > 0 && <span className="text-white text-xs font-bold">{b.count}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{b.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Attempts */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Attempts</h3>
          {recentResults.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No attempts yet</p>
          ) : (
            <div className="space-y-2">
              {recentResults.map((r, i) => {
                const pct = Math.round((r.score / r.max_score) * 100);
                return (
                  <div key={i} className="flex items-center gap-3 py-1.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${pct >= 70 ? "bg-green-100 text-green-700" : pct >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>
                      {pct}%
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${pct >= 70 ? "bg-green-500" : pct >= 50 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">Score: {r.score.toFixed(1)}/{r.max_score}</span>
                        <span className="text-xs text-gray-400">{new Date(r.submitted_at).toLocaleDateString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link href={`/admin/tests/${testId}/edit`} className="text-sm font-semibold border border-gray-200 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
          Edit Test
        </Link>
        <Link href={`/admin/upload?test=${testId}`} className="text-sm font-bold bg-blue-900 text-white px-5 py-2.5 rounded-xl hover:bg-blue-950 transition-colors">
          + Add Questions
        </Link>
      </div>
    </div>
  );
}
