import { createClient } from "@/lib/supabase/server";
import { Users, BookOpen, FileText, TrendingUp } from "lucide-react";
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
    .limit(5);

  const stats = [
    { label: "Total Students", value: studentCount || 0, icon: Users, color: "bg-blue-50 text-blue-700", border: "border-blue-100" },
    { label: "Total Tests", value: testCount || 0, icon: FileText, color: "bg-green-50 text-green-700", border: "border-green-100" },
    { label: "Questions", value: questionCount || 0, icon: BookOpen, color: "bg-amber-50 text-amber-700", border: "border-amber-100" },
    { label: "Attempts", value: resultCount || 0, icon: TrendingUp, color: "bg-purple-50 text-purple-700", border: "border-purple-100" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Overview of your platform</p>
        </div>
        <Link href="/admin/upload" className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Upload Questions
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className={`bg-white rounded-2xl border ${s.border} p-5`}>
            <div className={`w-10 h-10 ${s.color.split(" ")[0]} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color.split(" ")[1]}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value.toLocaleString()}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Tests</h2>
          <Link href="/admin/tests" className="text-xs text-blue-900 hover:underline">View all</Link>
        </div>
        <div className="space-y-2">
          {recentTests?.map(test => (
            <div key={test.id} className="flex items-center gap-4 py-2.5 border-b border-gray-50 last:border-0">
              <span className="text-xl">{(test.exam as any)?.icon || "📝"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{test.title}</p>
                <p className="text-xs text-gray-500">{test.total_questions} questions · {test.attempt_count} attempts</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${test.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {test.is_active ? "Active" : "Disabled"}
              </span>
              <Link href={`/admin/tests/${test.id}/edit`} className="text-xs text-blue-900 hover:underline">Edit</Link>
            </div>
          ))}
          {(!recentTests || recentTests.length === 0) && (
            <p className="text-center text-gray-400 text-sm py-6">No tests yet. <Link href="/admin/tests/new" className="text-blue-900 hover:underline">Create your first test</Link></p>
          )}
        </div>
      </div>
    </div>
  );
}
