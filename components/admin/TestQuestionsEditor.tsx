"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Edit2, Trash2, Save, X, ChevronDown, ChevronUp, CheckCircle, GripVertical, Search } from "lucide-react";

interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation?: string;
  difficulty: string;
  marks: number;
  question_order?: number;
}

export default function TestQuestionsEditor({
  testId, initialQuestions, marksPerQuestion
}: { testId: number; initialQuestions: Question[]; marksPerQuestion: number }) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Question>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const supabase = createClient();

  const filtered = questions.filter(q =>
    q.question_text.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (q: Question) => {
    setEditingId(q.id);
    setEditData({ ...q });
    setExpandedId(q.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async () => {
    if (!editingId || !editData.question_text) return;
    setSaving(true);
    const { error } = await supabase.from("questions").update({
      question_text: editData.question_text,
      option_a: editData.option_a,
      option_b: editData.option_b,
      option_c: editData.option_c,
      option_d: editData.option_d,
      correct_option: editData.correct_option,
      explanation: editData.explanation,
      difficulty: editData.difficulty,
      marks: editData.marks,
    }).eq("id", editingId);

    if (!error) {
      setQuestions(prev => prev.map(q => q.id === editingId ? { ...q, ...editData } as Question : q));
      setEditingId(null);
    }
    setSaving(false);
  };

  const deleteQuestion = async (id: number) => {
    if (!confirm("Delete this question?")) return;
    setDeleting(id);
    await supabase.from("questions").delete().eq("id", id);
    setQuestions(prev => {
      const updated = prev.filter(q => q.id !== id);
      // Update total_questions with actual count
      supabase.from("tests").update({ total_questions: updated.length }).eq("id", testId);
      return updated;
    });
    setDeleting(null);
  };

  const diffColors: Record<string, string> = {
    easy: "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400",
    medium: "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400",
    hard: "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400",
  };

  return (
    <div>
      {/* Search + Stats */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:border-green-500 text-gray-900 dark:text-gray-100" />
        </div>
        <div className="flex gap-3 text-sm text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span> questions shown
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-2">
        {filtered.map((q, idx) => {
          const isEditing = editingId === q.id;
          const isExpanded = expandedId === q.id;

          return (
            <div key={q.id} className={`card bg-white dark:bg-gray-900 overflow-hidden transition-all ${isEditing ? "ring-2 ring-green-500" : ""}`}>
              {/* Question Header — always visible */}
              <div className="flex items-start gap-3 p-4 cursor-pointer" onClick={() => !isEditing && setExpandedId(isExpanded ? null : q.id)}>
                <div className="flex items-center gap-2 shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-600 w-6 text-right">{idx + 1}</span>
                  <span className={`badge text-xs ${diffColors[q.difficulty] || diffColors.medium}`}>{q.difficulty}</span>
                </div>
                <p className="flex-1 text-sm text-gray-800 dark:text-gray-200 leading-relaxed font-medium line-clamp-2">{q.question_text}</p>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="text-xs text-green-600 dark:text-green-400 font-bold">+{q.marks || marksPerQuestion}</span>
                  {!isEditing && (
                    <button onClick={e => { e.stopPropagation(); startEdit(q); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={e => { e.stopPropagation(); deleteQuestion(q.id); }} disabled={deleting === q.id}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {!isEditing && (isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />)}
                </div>
              </div>

              {/* View Mode — expanded */}
              {isExpanded && !isEditing && (
                <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3 space-y-1.5">
                  {(["a","b","c","d"] as const).map(opt => {
                    const isCorrect = opt.toUpperCase() === q.correct_option;
                    return (
                      <div key={opt} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ${isCorrect ? "bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-300 font-semibold" : "text-gray-600 dark:text-gray-400"}`}>
                        <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${isCorrect ? "bg-green-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>{opt.toUpperCase()}</span>
                        {q[`option_${opt}` as keyof Question]}
                        {isCorrect && <CheckCircle className="w-3.5 h-3.5 text-green-600 ml-auto" />}
                      </div>
                    );
                  })}
                  {q.explanation && (
                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-lg px-3 py-2 mt-2">
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-0.5">Explanation</p>
                      <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Edit Mode */}
              {isEditing && (
                <div className="px-4 pb-4 border-t border-green-100 dark:border-green-900 pt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">Question Text</label>
                    <textarea value={editData.question_text || ""} onChange={e => setEditData(p => ({ ...p, question_text: e.target.value }))}
                      rows={3} className="input text-sm resize-none" placeholder="Question text..." />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(["a","b","c","d"] as const).map(opt => (
                      <div key={opt}>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                          Option {opt.toUpperCase()}
                          {editData.correct_option === opt.toUpperCase() && <span className="ml-1.5 text-green-600">✓ Correct</span>}
                        </label>
                        <div className="flex gap-1.5">
                          <input value={editData[`option_${opt}` as keyof Question] as string || ""} onChange={e => setEditData(p => ({ ...p, [`option_${opt}`]: e.target.value }))}
                            className="input text-sm flex-1" placeholder={`Option ${opt.toUpperCase()}`} />
                          <button type="button" onClick={() => setEditData(p => ({ ...p, correct_option: opt.toUpperCase() }))}
                            className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-colors ${editData.correct_option === opt.toUpperCase() ? "bg-green-600 text-white" : "border border-gray-200 dark:border-gray-700 text-gray-500 hover:border-green-500 hover:text-green-600"}`}>
                            ✓
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">Difficulty</label>
                      <select value={editData.difficulty || "medium"} onChange={e => setEditData(p => ({ ...p, difficulty: e.target.value }))}
                        className="input text-sm">
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">Marks</label>
                      <input type="number" value={editData.marks || marksPerQuestion} onChange={e => setEditData(p => ({ ...p, marks: parseInt(e.target.value) }))}
                        className="input text-sm" min="1" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5">Explanation (optional)</label>
                    <textarea value={editData.explanation || ""} onChange={e => setEditData(p => ({ ...p, explanation: e.target.value }))}
                      rows={2} className="input text-sm resize-none" placeholder="Explain why this answer is correct..." />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button onClick={saveEdit} disabled={saving}
                      className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-5 py-2 rounded-xl transition-colors disabled:opacity-50">
                      <Save className="w-3.5 h-3.5" />
                      {saving ? "Saving..." : "Save Question"}
                    </button>
                    <button onClick={cancelEdit}
                      className="flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="card bg-white dark:bg-gray-900 text-center py-12">
            <p className="text-gray-400 dark:text-gray-600 text-sm">
              {search ? `No questions matching "${search}"` : "No questions yet. Add some above."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
