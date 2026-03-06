import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Search, X } from "lucide-react";
import AdminTestActions from "@/components/admin/AdminTestActions";

export default async function AdminTestsPage({ searchParams }: { searchParams: { q?: string; exam?: string } }) {
  const supabase = await createClient();
  let query = supabase.from("tests").select("*, exam:exams(name,icon), category:categories(name,type)").order("created_at", { ascending: false });
  if (searchParams.q) query = query.ilike("title", `%${searchParams.q}%`);
  if (searchParams.exam) query = query.eq("exam_id", parseInt(searchParams.exam));
  const { data: tests } = await query;
  const { data: exams } = await supabase.from("exams").select("id,name,icon").eq("is_active", true).order("name");

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">Tests</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{tests?.length || 0} total</p>
        </div>
        <Link href="/admin/tests/new" className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> New Test
        </Link>
      </div>

      <form method="GET" className="flex gap-2 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input name="q" type="text" defaultValue={searchParams.q || ""} placeholder="Search tests..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-green-500 text-gray-900 dark:text-gray-100" />
        </div>
        <select name="exam" defaultValue={searchParams.exam || ""}
          className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-green-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          <option value="">All Exams</option>
          {exams?.map(e => <option key={e.id} value={e.id}>{e.icon} {e.name}</option>)}
        </select>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700">Filter</button>
        {(searchParams.q || searchParams.exam) && (
          <Link href="/admin/tests" className="border border-gray-200 dark:border-gray-700 text-gray-500 px-3 py-2 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1">
            <X className="w-3.5 h-3.5" /> Clear
          </Link>
        )}
      </form>

      <div className="card bg-white dark:bg-gray-900 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                {["Test", "Exam", "Marking", "Questions", "Attempts", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {tests?.map(test => (
                <tr key={test.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white max-w-xs truncate">{test.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{test.timer_minutes}min · {test.is_free ? "Free" : "Paid"}</p>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-400">{(test.exam as any)?.icon} {(test.exam as any)?.name || "—"}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-semibold">
                      <span className="text-green-600 dark:text-green-400">+{test.marks_per_question}</span>
                      {test.negative_marking > 0 && <span className="text-red-500 dark:text-red-400"> /-{test.negative_marking}</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Link href={`/admin/tests/${test.id}/questions`} className="text-sm font-bold text-green-600 dark:text-green-400 hover:underline">{test.total_questions}</Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <Link href={`/admin/tests/${test.id}/analytics`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">{test.attempt_count}</Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`badge text-xs ${test.is_active ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                      {test.is_active ? "Active" : "Off"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <AdminTestActions testId={test.id} isActive={test.is_active} />
                  </td>
                </tr>
              ))}
              {(!tests || tests.length === 0) && (
                <tr><td colSpan={7} className="text-center text-gray-400 dark:text-gray-600 text-sm py-12">
                  No tests yet. <Link href="/admin/tests/new" className="text-green-600 hover:underline">Create one</Link>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
          {tests?.map(test => (
            <div key={test.id} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{test.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{(test.exam as any)?.icon} {(test.exam as any)?.name} · {test.timer_minutes}min</p>
                </div>
                <span className={`badge text-xs shrink-0 ${test.is_active ? "bg-green-100 dark:bg-green-950 text-green-700" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                  {test.is_active ? "Active" : "Off"}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <Link href={`/admin/tests/${test.id}/questions`} className="text-green-600 font-semibold hover:underline">{test.total_questions} Qs</Link>
                  <span>{test.attempt_count} attempts</span>
                  <span className="text-green-600 dark:text-green-400 font-semibold">+{test.marks_per_question}{test.negative_marking > 0 ? `/-${test.negative_marking}` : ""}</span>
                </div>
                <AdminTestActions testId={test.id} isActive={test.is_active} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
