"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Edit, ChevronLeft, ChevronRight, Check, X, Loader2, Search, Sparkles, BookOpen } from "lucide-react";

export default function QuestionBankClient({ questions, tests, subjects, currentTest, page, totalPages }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [aiLoading, setAiLoading] = useState<number | null>(null);

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams();
    if (key !== "test" && currentTest) params.set("test", currentTest);
    if (key !== "page") params.set("page", "1");
    if (value) params.set(key, value);
    router.push(pathname + "?" + params.toString());
  };

  const deleteQ = async (id: number) => {
    if (!confirm("Delete this question? This cannot be undone.")) return;
    setDeletingId(id);
    await supabase.from("questions").delete().eq("id", id);
    router.refresh();
    setDeletingId(null);
  };

  const startEdit = (q: any) => {
    setEditingId(q.id);
    setEditForm({ ...q });
  };

  const saveEdit = async () => {
    setSaving(true);
    const { error } = await supabase.from("questions").update({
      question_text: editForm.question_text,
      option_a: editForm.option_a,
      option_b: editForm.option_b,
      option_c: editForm.option_c,
      option_d: editForm.option_d,
      correct_option: editForm.correct_option,
      difficulty: editForm.difficulty,
      explanation: editForm.explanation,
      marks: parseFloat(editForm.marks) || 1,
    }).eq("id", editingId!);
    setSaving(false);
    if (!error) { setEditingId(null); setEditForm({}); router.refresh(); }
  };

  // Generate AI explanation for single question
  const generateExplanation = async (q: any) => {
    setAiLoading(q.id);
    try {
      const res = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: [{ id: q.id, question_text: q.question_text, option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d, correct_option: q.correct_option }] }),
      });
      const data = await res.json();
      const exp = data.explanations?.[0]?.explanation;
      if (exp) {
        await supabase.from("questions").update({ explanation: exp }).eq("id", q.id);
        router.refresh();
      }
    } catch (e) { console.error(e); }
    setAiLoading(null);
  };

  const ic = "border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-900 bg-white";
  const filteredQ = search ? questions.filter((q: any) => q.question_text?.toLowerCase().includes(search.toLowerCase())) : questions;

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <select value={currentTest || ""} onChange={e => setFilter("test", e.target.value)} className={ic}>
          <option value="">All Tests</option>
          {tests.map((t: any) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-blue-900 bg-white" />
        </div>
        {search && <button onClick={() => setSearch("")} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"><X className="w-3.5 h-3.5" /> Clear</button>}
      </div>

      {search && <p className="text-xs text-gray-500 mb-3">{filteredQ.length} result{filteredQ.length !== 1 ? "s" : ""} for "{search}"</p>}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Mobile List / Desktop Table */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 w-8">#</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Question</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Test</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Diff</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Marks</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Ans</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredQ.map((q: any, idx: number) => (
                <tr key={q.id} className={`hover:bg-gray-50 transition-colors ${editingId === q.id ? "bg-blue-50" : ""}`}>
                  {editingId === q.id ? (
                    <td colSpan={7} className="px-4 py-4">
                      <div className="space-y-3">
                        <textarea value={editForm.question_text} onChange={e => setEditForm({ ...editForm, question_text: e.target.value })}
                          className="w-full border border-blue-300 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none" rows={2} />
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                          {["a","b","c","d"].map(opt => (
                            <div key={opt}>
                              <label className={`text-xs font-medium mb-1 block ${editForm.correct_option === opt.toUpperCase() ? "text-green-700" : "text-gray-500"}`}>
                                Option {opt.toUpperCase()} {editForm.correct_option === opt.toUpperCase() ? "✓" : ""}
                              </label>
                              <input value={editForm[`option_${opt}`] || ""} onChange={e => setEditForm({ ...editForm, [`option_${opt}`]: e.target.value })}
                                className={`w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none ${editForm.correct_option === opt.toUpperCase() ? "border-green-300 bg-green-50" : "border-gray-200"}`} />
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-3 items-end">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Correct Answer</label>
                            <select value={editForm.correct_option} onChange={e => setEditForm({ ...editForm, correct_option: e.target.value })} className={ic}>
                              {["A","B","C","D"].map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Difficulty</label>
                            <select value={editForm.difficulty} onChange={e => setEditForm({ ...editForm, difficulty: e.target.value })} className={ic}>
                              {["easy","medium","hard"].map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Marks</label>
                            <input type="number" step="0.25" value={editForm.marks || 1} onChange={e => setEditForm({ ...editForm, marks: e.target.value })} className={ic + " w-20"} min="0.25" />
                          </div>
                          <div className="flex-1 min-w-40">
                            <label className="text-xs text-gray-500 mb-1 block">Explanation</label>
                            <input value={editForm.explanation || ""} onChange={e => setEditForm({ ...editForm, explanation: e.target.value })}
                              className={ic + " w-full"} placeholder="Explanation (optional)" />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={saveEdit} disabled={saving}
                              className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-1.5 hover:bg-green-700">
                              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
                            </button>
                            <button onClick={() => setEditingId(null)} className="border border-gray-200 px-3 py-2 rounded-xl text-sm hover:bg-gray-50">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-xs text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-sm text-gray-800 line-clamp-2">{q.question_text}</p>
                        {q.explanation && <p className="text-xs text-purple-500 mt-0.5 flex items-center gap-1"><BookOpen className="w-3 h-3" /> has explanation</p>}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{q.test?.title}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${q.difficulty === "easy" ? "bg-green-100 text-green-700" : q.difficulty === "hard" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-600 font-medium">{q.marks || 1}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{q.correct_option}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          {!q.explanation && (
                            <button onClick={() => generateExplanation(q)} disabled={aiLoading === q.id}
                              className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="AI: Generate Explanation">
                              {aiLoading === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            </button>
                          )}
                          <button onClick={() => startEdit(q)}
                            className="p-1.5 text-gray-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteQ(q.id)} disabled={deletingId === q.id}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            {deletingId === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {filteredQ.length === 0 && (
                <tr><td colSpan={7} className="text-center text-gray-400 text-sm py-10">
                  {search ? `No questions matching "${search}"` : "No questions found"}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredQ.map((q: any, idx: number) => (
            <div key={q.id} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="w-6 h-6 bg-blue-100 rounded text-xs font-bold text-blue-900 flex items-center justify-center shrink-0">{idx+1}</span>
                <p className="text-sm text-gray-800 flex-1 leading-relaxed">{q.question_text}</p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${q.difficulty === "easy" ? "bg-green-100 text-green-700" : q.difficulty === "hard" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{q.difficulty}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Ans: {q.correct_option}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{q.marks||1}mk</span>
                </div>
                <div className="flex gap-1">
                  {!q.explanation && (
                    <button onClick={() => generateExplanation(q)} disabled={aiLoading === q.id}
                      className="p-1.5 text-gray-400 hover:text-purple-600 rounded-lg">
                      {aiLoading === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    </button>
                  )}
                  <button onClick={() => startEdit(q)} className="p-1.5 text-gray-400 hover:text-blue-700 rounded-lg"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => deleteQ(q.id)} disabled={deletingId === q.id} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg">
                    {deletingId === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-5">
          <button onClick={() => setFilter("page", String(page - 1))} disabled={page <= 1}
            className="p-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600 font-medium">Page {page} of {totalPages}</span>
          <button onClick={() => setFilter("page", String(page + 1))} disabled={page >= totalPages}
            className="p-2 rounded-xl border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
