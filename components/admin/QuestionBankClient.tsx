"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react";

export default function QuestionBankClient({ questions, tests, subjects, currentTest, page, totalPages }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams();
    if (key !== "test" && currentTest) params.set("test", currentTest);
    if (value) params.set(key, value);
    router.push(pathname + "?" + params.toString());
  };

  const deleteQ = async (id: number) => {
    if (!confirm("Delete this question?")) return;
    setDeletingId(id);
    await supabase.from("questions").delete().eq("id", id);
    router.refresh();
    setDeletingId(null);
  };

  const inputClass = "border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-900 bg-white";

  return (
    <div>
      <div className="flex gap-3 mb-5 flex-wrap">
        <select value={currentTest || ""} onChange={e => setFilter("test", e.target.value)} className={inputClass}>
          <option value="">All Tests</option>
          {tests.map((t: any) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">#</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Question</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Test</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Diff</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Ans</th>
              <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {questions.map((q: any, idx: number) => (
              <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-xs text-gray-400">{idx + 1}</td>
                <td className="px-4 py-3 max-w-xs">
                  <p className="text-sm text-gray-800 line-clamp-2">{q.question_text}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <p className="text-xs text-gray-500 truncate max-w-[150px]">{q.test?.title}</p>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={`badge text-xs ${q.difficulty === "easy" ? "bg-green-100 text-green-700" : q.difficulty === "hard" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {q.difficulty}
                  </span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="badge bg-blue-100 text-blue-700">{q.correct_option}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 justify-end">
                    <button onClick={() => deleteQ(q.id)} disabled={deletingId === q.id}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {questions.length === 0 && (
              <tr><td colSpan={6} className="text-center text-gray-400 text-sm py-10">No questions found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-5">
          <button onClick={() => setFilter("page", String(page - 1))} disabled={page <= 1}
            className="p-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <button onClick={() => setFilter("page", String(page + 1))} disabled={page >= totalPages}
            className="p-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
