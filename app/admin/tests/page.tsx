import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Edit, Eye, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import AdminTestActions from "@/components/admin/AdminTestActions";

export default async function AdminTestsPage() {
  const supabase = await createClient();
  const { data: tests } = await supabase
    .from("tests")
    .select("*, exam:exams(name,icon), category:categories(name,type)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Tests</h1>
          <p className="text-gray-500 text-sm mt-0.5">{tests?.length || 0} tests total</p>
        </div>
        <Link href="/admin/tests/new" className="bg-blue-900 hover:bg-blue-950 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Test
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Test</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Exam</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Questions</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Attempts</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {tests?.map(test => (
              <tr key={test.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 max-w-xs truncate">{test.title}</p>
                    <p className="text-xs text-gray-500">{test.timer_minutes} min · {test.is_free ? "Free" : "Paid"} · {test.negative_marking > 0 ? "-" + test.negative_marking + " neg" : "No neg"}</p>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-sm text-gray-600">{(test.exam as any)?.icon} {(test.exam as any)?.name || "—"}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-sm text-gray-700 font-medium">{test.total_questions}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-sm text-gray-600">{test.attempt_count}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${test.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {test.is_active ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <AdminTestActions testId={test.id} isActive={test.is_active} />
                </td>
              </tr>
            ))}
            {(!tests || tests.length === 0) && (
              <tr><td colSpan={6} className="text-center text-gray-400 text-sm py-10">
                No tests yet. <Link href="/admin/tests/new" className="text-blue-900 hover:underline">Create the first one</Link>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
