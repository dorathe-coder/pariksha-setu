"use client";
import { useRouter, usePathname } from "next/navigation";
import type { Exam, Category, Subject } from "@/types/database";

interface Props {
  exams: Exam[];
  categories: Category[];
  subjects: Subject[];
  currentParams: Record<string, string | undefined>;
}

export default function ExamFilters({ exams, categories, subjects, currentParams }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const setFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(currentParams).filter(([, v]) => v !== undefined) as [string, string][])
    );
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(pathname + "?" + params.toString());
  };

  const clearAll = () => router.push(pathname);

  const hasFilters = Object.values(currentParams).some(v => v !== undefined);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-blue-900 hover:underline">Clear all</button>
        )}
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Exam</label>
          <select value={currentParams.exam || ""} onChange={e => setFilter("exam", e.target.value || null)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-900">
            <option value="">All Exams</option>
            {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.icon} {ex.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</label>
          <div className="space-y-1">
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setFilter("cat", currentParams.cat === cat.slug ? null : cat.slug)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${currentParams.cat === cat.slug ? "bg-blue-900 text-white" : "hover:bg-gray-50 text-gray-700"}`}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Subject</label>
          <select value={currentParams.subject || ""} onChange={e => setFilter("subject", e.target.value || null)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-900">
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Price</label>
          <div className="flex gap-2">
            <button onClick={() => setFilter("free", currentParams.free === "true" ? null : "true")}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentParams.free === "true" ? "bg-green-600 text-white" : "border border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
              Free
            </button>
            <button onClick={() => setFilter("free", currentParams.free === "false" ? null : "false")}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentParams.free === "false" ? "bg-amber-500 text-white" : "border border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
              Paid
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
