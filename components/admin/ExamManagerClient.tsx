"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Loader2, Edit, Trash2, Check, X, ToggleLeft, ToggleRight } from "lucide-react";

type Tab = "exams" | "categories" | "subjects" | "topics";

export default function ExamManagerClient({ exams, categories, subjects, topics }: any) {
  const [tab, setTab] = useState<Tab>("exams");
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const tabs: { id: Tab; label: string; count: number; emoji: string }[] = [
    { id: "exams", label: "Exams", count: exams.length, emoji: "🏛️" },
    { id: "categories", label: "Categories", count: categories.length, emoji: "📂" },
    { id: "subjects", label: "Subjects", count: subjects.length, emoji: "📚" },
    { id: "topics", label: "Topics", count: topics.length, emoji: "🏷️" },
  ];

  const handleAdd = async () => {
    if (!form.name) return;
    setLoading(true);
    let error;
    if (tab === "exams") {
      ({ error } = await supabase.from("exams").insert({ name: form.name, name_gu: form.name_gu, slug: form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""), category: form.category || "gujarat", icon: form.icon || "📋", description: form.description }));
    } else if (tab === "categories") {
      ({ error } = await supabase.from("categories").insert({ name: form.name, slug: form.name.toLowerCase().replace(/\s+/g, "-"), type: form.type || "mock_test", description: form.description }));
    } else if (tab === "subjects") {
      ({ error } = await supabase.from("subjects").insert({ name: form.name, name_gu: form.name_gu }));
    } else if (tab === "topics") {
      ({ error } = await supabase.from("topics").insert({ name: form.name, subject_id: parseInt(form.subject_id) }));
    }
    if (!error) { setAdding(false); setForm({}); router.refresh(); }
    setLoading(false);
  };

  const handleEdit = async (id: number) => {
    setLoading(true);
    let error;
    if (tab === "exams") {
      ({ error } = await supabase.from("exams").update({ name: editForm.name, name_gu: editForm.name_gu, icon: editForm.icon, category: editForm.category, description: editForm.description }).eq("id", id));
    } else if (tab === "categories") {
      ({ error } = await supabase.from("categories").update({ name: editForm.name, type: editForm.type, description: editForm.description }).eq("id", id));
    } else if (tab === "subjects") {
      ({ error } = await supabase.from("subjects").update({ name: editForm.name, name_gu: editForm.name_gu }).eq("id", id));
    } else if (tab === "topics") {
      ({ error } = await supabase.from("topics").update({ name: editForm.name, subject_id: parseInt(editForm.subject_id) }).eq("id", id));
    }
    if (!error) { setEditingId(null); setEditForm({}); router.refresh(); }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this item? Any tests linked to it may be affected.")) return;
    setDeletingId(id);
    await supabase.from(tab).delete().eq("id", id);
    router.refresh();
    setDeletingId(null);
  };

  const toggleActive = async (id: number, current: boolean) => {
    await supabase.from(tab).update({ is_active: !current }).eq("id", id);
    router.refresh();
  };

  const ic = "border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-900 bg-white";
  const items = tab === "exams" ? exams : tab === "categories" ? categories : tab === "subjects" ? subjects : topics;

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setAdding(false); setEditingId(null); }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${tab === t.id ? "bg-white shadow-sm text-blue-900 font-semibold" : "text-gray-500 hover:text-gray-700"}`}>
            {t.emoji} {t.label}
            <span className="ml-1.5 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 capitalize">{tab}</h3>
          <button onClick={() => { setAdding(!adding); setEditingId(null); }}
            className="flex items-center gap-1.5 bg-blue-900 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-950 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add New
          </button>
        </div>

        {/* Add Form */}
        {adding && (
          <div className="border-b border-gray-100 bg-blue-50/50 p-4">
            <p className="text-xs font-semibold text-blue-700 mb-3">Add New {tab.slice(0, -1)}</p>
            <div className="flex flex-wrap gap-3 items-end">
              <input placeholder="Name (English) *" value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} className={ic} />
              {(tab === "exams" || tab === "subjects") && (
                <input placeholder="Name (Gujarati)" value={form.name_gu || ""} onChange={e => setForm({ ...form, name_gu: e.target.value })} className={ic} />
              )}
              {tab === "exams" && (
                <>
                  <input placeholder="Icon (emoji) e.g. 🏛️" value={form.icon || ""} onChange={e => setForm({ ...form, icon: e.target.value })} className={ic + " w-40"} />
                  <select value={form.category || "gujarat"} onChange={e => setForm({ ...form, category: e.target.value })} className={ic}>
                    {["gujarat", "central", "banking", "railway", "other"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </>
              )}
              {tab === "categories" && (
                <select value={form.type || "mock_test"} onChange={e => setForm({ ...form, type: e.target.value })} className={ic}>
                  {["mock_test", "previous_year", "topic_wise", "daily_quiz", "full_test", "mini_test"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              )}
              {tab === "topics" && (
                <select value={form.subject_id || ""} onChange={e => setForm({ ...form, subject_id: e.target.value })} className={ic}>
                  <option value="">Select Subject *</option>
                  {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              )}
              <div className="flex gap-2">
                <button onClick={handleAdd} disabled={loading || !form.name}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-xl text-sm flex items-center gap-1.5">
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
                </button>
                <button onClick={() => { setAdding(false); setForm({}); }} className="border border-gray-200 text-gray-500 px-3 py-2 rounded-xl text-sm hover:bg-gray-50">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="divide-y divide-gray-50">
          {items.map((item: any) => (
            <div key={item.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
              {editingId === item.id ? (
                // Edit Mode
                <div className="flex flex-wrap gap-3 items-center">
                  <input value={editForm.name || ""} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className={ic} placeholder="Name (English)" />
                  {(tab === "exams" || tab === "subjects") && (
                    <input value={editForm.name_gu || ""} onChange={e => setEditForm({ ...editForm, name_gu: e.target.value })} className={ic} placeholder="Gujarati" />
                  )}
                  {tab === "exams" && (
                    <>
                      <input value={editForm.icon || ""} onChange={e => setEditForm({ ...editForm, icon: e.target.value })} className={ic + " w-24"} placeholder="Icon" />
                      <select value={editForm.category || "gujarat"} onChange={e => setEditForm({ ...editForm, category: e.target.value })} className={ic}>
                        {["gujarat", "central", "banking", "railway", "other"].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </>
                  )}
                  {tab === "categories" && (
                    <select value={editForm.type || "mock_test"} onChange={e => setEditForm({ ...editForm, type: e.target.value })} className={ic}>
                      {["mock_test", "previous_year", "topic_wise", "daily_quiz", "full_test", "mini_test"].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  )}
                  {tab === "topics" && (
                    <select value={editForm.subject_id || ""} onChange={e => setEditForm({ ...editForm, subject_id: e.target.value })} className={ic}>
                      {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(item.id)} disabled={loading}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-green-700">
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {item.icon && <span className="text-xl shrink-0">{item.icon}</span>}
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-gray-800">{item.name}</span>
                      {item.name_gu && <span className="text-xs text-gray-400 ml-2">{item.name_gu}</span>}
                      {item.type && <span className="text-xs ml-2 bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">{item.type}</span>}
                      {item.subject && <span className="text-xs text-gray-400 ml-2">({item.subject.name})</span>}
                      {item.category && !item.type && <span className="text-xs ml-2 bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{item.category}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggleActive(item.id, item.is_active)}
                      className={`p-1.5 rounded-lg transition-colors ${item.is_active ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                      title={item.is_active ? "Disable" : "Enable"}>
                      {item.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                    <button onClick={() => { setEditingId(item.id); setEditForm({ ...item }); setAdding(false); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-700 hover:bg-blue-50 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} disabled={deletingId === item.id}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                      {deletingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">Nothing here yet. Add the first one above.</p>
          )}
        </div>
      </div>
    </div>
  );
}
