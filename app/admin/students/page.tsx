import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Users, Trophy, Clock, Search } from "lucide-react";

export default async function StudentsPage({ searchParams }: { searchParams: { q?: string; page?: string } }) {
  const supabase = await createClient();
  const page = parseInt(searchParams.page || "1");
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("users")
    .select("id, name, email, city, created_at", { count: "exact" })
    .eq("role", "student")
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (searchParams.q) {
    query = query.or(`name.ilike.%${searchParams.q}%,email.ilike.%${searchParams.q}%`);
  }

  const { data: students, count } = await query;
  const totalPages = Math.ceil((count || 0) / pageSize);

  // Get result stats per student
  const studentIds = students?.map(s => s.id) || [];
  const { data: resultStats } = studentIds.length > 0
    ? await supabase.from("results")
        .select("user_id, score, max_score, is_completed")
        .in("user_id", studentIds)
        .eq("is_completed", true)
    : { data: [] };

  const statsMap = new Map<string, { attempts: number; totalScore: number; totalMax: number }>();
  resultStats?.forEach(r => {
    const s = statsMap.get(r.user_id) || { attempts: 0, totalScore: 0, totalMax: 0 };
    s.attempts++;
    s.totalScore += r.score || 0;
    s.totalMax += r.max_score || 0;
    statsMap.set(r.user_id, s);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 text-sm mt-0.5">{count?.toLocaleString() || 0} total students</p>
        </div>
      </div>

      {/* Search */}
      <form method="GET" className="mb-5">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input name="q" type="text" defaultValue={searchParams.q || ""}
            placeholder="Search by name or email..."
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-900 bg-white" />
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">#</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Student</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">City</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Tests Taken</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Avg Score</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students?.map((s, idx) => {
                const st = statsMap.get(s.id);
                const avgPct = st && st.totalMax > 0 ? Math.round((st.totalScore / st.totalMax) * 100) : null;
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-400">{offset + idx + 1}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.city || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-gray-900">{st?.attempts || 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      {avgPct !== null ? (
                        <span className={`text-sm font-semibold ${avgPct >= 70 ? "text-green-700" : avgPct >= 50 ? "text-amber-600" : "text-red-600"}`}>
                          {avgPct}%
                        </span>
                      ) : <span className="text-xs text-gray-400">No tests</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(s.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                );
              })}
              {(!students || students.length === 0) && (
                <tr><td colSpan={6} className="text-center text-gray-400 text-sm py-10">No students found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {students?.map(s => {
            const st = statsMap.get(s.id);
            const avgPct = st && st.totalMax > 0 ? Math.round((st.totalScore / st.totalMax) * 100) : null;
            return (
              <div key={s.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.email}</p>
                    {s.city && <p className="text-xs text-gray-400 mt-0.5">{s.city}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{st?.attempts || 0} tests</p>
                    {avgPct !== null && (
                      <p className={`text-sm font-bold ${avgPct >= 70 ? "text-green-700" : avgPct >= 50 ? "text-amber-600" : "text-red-600"}`}>{avgPct}%</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-5">
          {page > 1 && (
            <Link href={`?${searchParams.q ? `q=${searchParams.q}&` : ""}page=${page - 1}`}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">← Prev</Link>
          )}
          <span className="text-sm text-gray-600 font-medium">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={`?${searchParams.q ? `q=${searchParams.q}&` : ""}page=${page + 1}`}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50">Next →</Link>
          )}
        </div>
      )}
    </div>
  );
}
