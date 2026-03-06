import { createClient } from "@/lib/supabase/server";
import { Users, BookOpen, FileText, TrendingUp, Plus, Sparkles, Settings } from "lucide-react";
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
    .select("id, score, max_score, submitted_at, user:users(name), test:tests(title)")
    .eq("is_completed", true)
    .order("submitted_at", { ascending: false })
    .limit(5);

  const stats = [
    { label: "Students", value: studentCount || 0, icon: Users, bg: "bg-blue-50 dark:bg-blue-950/50", ic: "text-blue-600 dark:text-blue-400", href: "/admin/students" },
    { label: "Tests", value: testCount || 0, icon: FileText, bg: "bg-green-50 dark:bg-green-950/50", ic: "text-green-600 dark:text-green-400", href: "/admin/tests" },
    { label: "Questions", value: questionCount || 0, icon: BookOpen, bg: "bg-amber-50 dark:bg-amber-950/50", ic: "text-amber-600 dark:text-amber-400", href: "/admin/questions" },
    { label: "Attempts", value: resultCount || 0, icon: TrendingUp, bg: "bg-purple-50 dark:bg-purple-950/50", ic: "text-purple-600 dark:text-purple-400", href: "/admin/tests" },
  ];

  const quickActions = [
    { label: "New Test", desc: "Create a test", icon: Plus, href: "/admin/tests/new", cls: "bg-green-600 hover:bg-green-700 text-white" },
    { label: "AI Import", desc: "Upload with GPT", icon: Sparkles, href: "/admin/upload", cls: "bg-purple-600 hover:bg-purple-700 text-white" },
    { label: "Question Bank", desc: "View all questions", icon: BookOpen, href: "/admin/questions", cls: "card hover:shadow-md dark:hover:bg-gray-800" },
    { label: "Exams & Categories", desc: "Manage structure", icon: Settings, href: "/admin/exams", cls: "card hover:shadow-md dark:hover:bg-gray-800" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black" style={{color:'var(--text)'}}>Admin Dashboard</h1>
          <p className="text-sm mt-0.5" style={{color:'var(--text3)'}}>Manage your exam platform</p>
        </div>
        <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900 px-3 py-1.5 rounded-xl">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-xs font-bold text-purple-700 dark:text-purple-400">AI Features Active</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className="card card-hover p-5">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.ic}`} />
            </div>
            <div className="text-2xl font-black" style={{color:'var(--text)'}}>{s.value.toLocaleString()}</div>
            <div className="text-sm mt-0.5" style={{color:'var(--text3)'}}>{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest section-label mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map(a => (
            <Link key={a.label} href={a.href} className={`${a.cls} rounded-2xl p-4 transition-all`}>
              <a.icon className="w-5 h-5 mb-2" />
              <div className="font-bold text-sm">{a.label}</div>
              <div className="text-xs opacity-60 mt-0.5">{a.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Tests */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b" style={{borderColor:'var(--border)'}}>
            <h2 className="font-bold text-sm" style={{color:'var(--text)'}}>Recent Tests</h2>
            <Link href="/admin/tests" className="text-xs text-green-600 hover:underline font-semibold">View all →</Link>
          </div>
          <div className="divide-y" style={{borderColor:'var(--border)'}}>
            {recentTests?.map(test => (
              <div key={test.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <span className="text-xl shrink-0">{(test.exam as any)?.icon || "📝"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{color:'var(--text)'}}>{test.title}</p>
                  <p className="text-xs mt-0.5" style={{color:'var(--text3)'}}>{test.total_questions} Q · {test.attempt_count} attempts</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`badge text-xs ${test.is_active ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                    {test.is_active ? "Active" : "Off"}
                  </span>
                  <Link href={`/admin/tests/${test.id}/edit`} className="text-xs text-green-600 hover:underline">Edit</Link>
                </div>
              </div>
            ))}
            {(!recentTests || recentTests.length === 0) && (
              <p className="text-center text-sm py-8" style={{color:'var(--text3)'}}>
                No tests yet. <Link href="/admin/tests/new" className="text-green-600 hover:underline">Create one</Link>
              </p>
            )}
          </div>
        </div>

        {/* Recent Attempts */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b" style={{borderColor:'var(--border)'}}>
            <h2 className="font-bold text-sm" style={{color:'var(--text)'}}>Recent Attempts</h2>
            <span className="text-xs" style={{color:'var(--text3)'}}>Live</span>
          </div>
          <div className="divide-y" style={{borderColor:'var(--border)'}}>
            {recentResults?.map(result => {
              const pct = Math.round(((result.score || 0) / (result.max_score || 1)) * 100);
              return (
                <div key={result.id} className="flex items-center gap-3 px-5 py-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${pct >= 70 ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400" : pct >= 50 ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400" : "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400"}`}>
                    {pct}%
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{color:'var(--text)'}}>{(result.user as any)?.name || "Student"}</p>
                    <p className="text-xs truncate" style={{color:'var(--text3)'}}>{(result.test as any)?.title}</p>
                  </div>
                  <span className="text-xs shrink-0" style={{color:'var(--text3)'}}>
                    {new Date(result.submitted_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </div>
              );
            })}
            {(!recentResults || recentResults.length === 0) && (
              <p className="text-center text-sm py-8" style={{color:'var(--text3)'}}>No attempts yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
