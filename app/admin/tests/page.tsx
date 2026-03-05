import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import AdminTestActions from "@/components/admin/AdminTestActions";

export default async function AdminTestsPage({ searchParams }: { searchParams: { q?: string; exam?: string } }) {
  const supabase = await createClient();

  let query = supabase
    .from("tests")
    .select("*, exam:exams(name,icon), category:categories(name,type)")
    .order("created_at", { ascending: false });

  if (searchParams.q) query = query.ilike("title", `%${searchParams.q}%`);
  if (searchParams.exam) query = query.eq("exam_id", parseInt(searchParams.exam));

  const { data: tests } = await query;
  const { data: exams } = await supabase.from("exams").select("id, name, icon").eq("is_active", true).order("name");

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Tests</h1>
          <p className="text-gray-500 text-sm mt-0.5">{tests?.length || 0} tests total</p>
        </div>
        <Link href="/admin/tests/new" className="bg-blue-900 hover:bg-blue-950 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Test
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input name="q" type="text" defaultValue={searchParams.q || ""} placeholder="Search tests..."
            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-blue-900 bg-white" />
        </div>
        <select name="exam" defaultValue={searchParams.exam || ""}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-900 bg-white">
          <option value="">All Exams</option>
          {exams?.map(e => <option key={e.id} value={e.id}>{e.icon} {e.name}</option>)}
        </select>
        <button type="submit" className="bg-blue-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-950">Search</button>
        {(searchParams.q || searchParams.exam) && (
          <Link href="/admin/tests" className="border border-gray-200 text-gray-500 px-4 py-2 rounded-xl text-sm hover:bg-gray-50">Clear</Link>
        )}
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Test</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Exam</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Marking</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Questions</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Attempts</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tests?.map(test => (
                <tr key={test.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 max-w-xs truncate">{test.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{test.timer_minutes} min · {test.is_free ? "Free" : "₹" + test.price} {test.year ? `· ${test.year}` : ""}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-gray-600">{(test.exam as any)?.icon} {(test.exam as any)?.name || "—"}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-xs text-gray-600">
                      <span className="text-green-700 font-semibold">+{test.marks_per_question}</span>
                      {test.negative_marking > 0 && <span className="text-red-500 ml-1">/ -{test.negative_marking}</span>}
                      <span className="text-gray-400 ml-1">= {test.total_marks}M</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-semibold text-gray-800">{test.total_questions}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Link href={`/admin/tests/${test.id}/analytics`} className="text-sm text-blue-700 hover:underline font-medium">
                      {test.attempt_count} →
                    </Link>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${test.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {test.is_active ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <AdminTestActions testId={test.id} isActive={test.is_active} />
                  </td>
                </tr>
              ))}
              {(!tests || tests.length === 0) && (
                <tr><td colSpan={7} className="text-center text-gray-400 text-sm py-12">
                  {searchParams.q ? `No tests matching "${searchParams.q}"` : "No tests yet. "}
                  {!searchParams.q && <Link href="/admin/tests/new" className="text-blue-900 hover:underline">Create one</Link>}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {tests?.map(test => (
            <div key={test.id} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{test.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{(test.exam as any)?.icon} {(test.exam as any)?.name} · {test.timer_minutes}m</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${test.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {test.is_active ? "Active" : "Off"}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-2 text-xs text-gray-500">
                  <span>{test.total_questions} Qs</span>
                  <span>{test.attempt_count} attempts</span>
                  <span className="text-green-700">+{test.marks_per_question}{test.negative_marking > 0 ? `/-${test.negative_marking}` : ""}</span>
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
