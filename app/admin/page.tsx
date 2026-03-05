import { createClient } from "@/lib/supabase/server";
import { Users, BookOpen, FileText, TrendingUp, Plus, Upload, Eye, Sparkles, BarChart2, Settings } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: studentCount },
    { count: testCount },
    { count: questionCount },
    { count: resultCount },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("tests").select("*", { count: "exact", head: true }),
    supabase.from("questions").select("*", { count: "exact", head: true }),
    supabase.from("results").select("*", { count: "exact", head: true }).eq("is_completed", true),
  ]);

  const { data: recentTests } = await supabase
    .from("tests")
    .select("id, title, total_questions, attempt_count, is_active, created_at, exam:exams(name,icon)")
    .order("created_at", { ascending: false })
    .limit(6);

  const { data: recentResults } = await supabase
    .from("results")
    .select("id, score, max_score, correct_count, submitted_at, user:users(name), test:tests(title)")
    .eq("is_completed", true)
    .order("submitted_at", { ascending: false })
    .limit(5);

  const stats = [
    { label: "Students", value: studentCount || 0, icon: Users, color: "bg-blue-50 text-blue-700", border: "border-blue-100", href: "/admin/students" },
    { label: "Tests", value: testCount || 0, icon: FileText, color: "bg-green-50 text-green-700", border: "border-green-100", href: "/admin/tests" },
    { label: "Questions", value: questionCount || 0, icon: BookOpen, color: "bg-amber-50 text-amber-700", border: "border-amber-100", href: "/admin/questions" },
    { label: "Attempts", value: resultCount || 0, icon: TrendingUp, color: "bg-purple-50 text-purple-700", border: "border-purple-100", href: "/admin/tests" },
  ];

  const quickActions = [
    { label: "New Test", desc: "Create a test", icon: Plus, href: "/admin/tests/new", color: "bg-blue-900 text-white hover:bg-blue-950" },
    { label: "AI Import", desc: "Upload questions with GPT", icon: Sparkles, href: "/admin/upload", color: "bg-purple-700 text-white hover:bg-purple-800" },
    { label: "Question Bank", desc: "View all questions", icon: BookOpen, href: "/admin/questions", color: "bg-white text-gray-800 hover:bg-gray-50 border border-gray-200" },
    { label: "Exams & Categories", desc: "Manage structure", icon: Settings, href: "/admin/exams", color: "bg-white text-gray-800 hover:bg-gray-50 border border-gray-200" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your exam platform</p>
        </div>
        <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 px-3 py-1.5 rounded-xl">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-semibold text-purple-700">AI Features Active</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className={`bg-white rounded-2xl border ${s.border} p-5 hover:shadow-md transition-shadow`}>
            <div className={`w-10 h-10 ${s.color.split(" ")[0]} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color.split(" ")[1]}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value.toLocaleString()}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(a => (
            <Link key={a.label} href={a.href}
              className={`${a.color} rounded-2xl p-4 transition-all hover:shadow-sm`}>
              <a.icon className="w-5 h-5 mb-2" />
              <div className="font-semibold text-sm">{a.label}</div>
              <div className="text-xs opacity-70 mt-0.5">{a.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Tests */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Recent Tests</h2>
            <Link href="/admin/tests" className="text-xs text-blue-900 hover:underline font-medium">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTests?.map(test => (
              <div key={test.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <span className="text-xl shrink-0">{(test.exam as any)?.icon || "📝"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{test.title}</p>
                  <p className="text-xs text-gray-500">{test.total_questions} Q · {test.attempt_count} attempts</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${test.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {test.is_active ? "Active" : "Off"}
                  </span>
                  <Link href={`/admin/tests/${test.id}/edit`} className="text-xs text-blue-700 hover:underline">Edit</Link>
                </div>
              </div>
            ))}
            {(!recentTests || recentTests.length === 0) && (
              <p className="text-center text-gray-400 text-sm py-8">
                No tests yet. <Link href="/admin/tests/new" className="text-blue-900 hover:underline">Create one</Link>
              </p>
            )}
          </div>
        </div>

        {/* Recent Attempts */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900">Recent Attempts</h2>
            <span className="text-xs text-gray-400">Live</span>
          </div>
          <div className="divide-y divide-gray-50">
            {recentResults?.map(result => {
              const pct = Math.round(((result.score || 0) / (result.max_score || 1)) * 100);
              return (
                <div key={result.id} className="flex items-center gap-3 px-5 py-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${pct >= 70 ? "bg-green-100 text-green-700" : pct >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>
                    {pct}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{(result.user as any)?.name || "Student"}</p>
                    <p className="text-xs text-gray-500 truncate">{(result.test as any)?.title}</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {new Date(result.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </div>
              );
            })}
            {(!recentResults || recentResults.length === 0) && (
              <p className="text-center text-gray-400 text-sm py-8">No attempts yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
