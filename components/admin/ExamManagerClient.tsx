"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Loader2, Edit2, Trash2, Check, X, ToggleLeft, ToggleRight, AlertTriangle } from "lucide-react";

type Tab = "exams" | "categories" | "subjects" | "topics";

export default function ExamManagerClient({ exams, categories, subjects, topics }: any) {
  const [tab, setTab] = useState<Tab>("exams");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<any>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const supabase = createClient();

  const tabs = [
    { id: "exams" as Tab, label: "Exams", count: exams.length, emoji: "🏛️" },
    { id: "categories" as Tab, label: "Categories", count: categories.length, emoji: "📂" },
    { id: "subjects" as Tab, label: "Subjects", count: subjects.length, emoji: "📚" },
    { id: "topics" as Tab, label: "Topics", count: topics.length, emoji: "🏷️" },
  ];

  const items = tab === "exams" ? exams : tab === "categories" ? categories : tab === "subjects" ? subjects : topics;

  const refresh = () => startTransition(() => { router.refresh(); });

  const handleAdd = async () => {
    if (!form.name?.trim()) return;
    setSaving(true); setError("");
    let result;
    if (tab === "exams") {
      result = await supabase.from("exams").insert({
        name: form.name, name_gu: form.name_gu || null,
        slug: form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        category: form.category || "gujarat", icon: form.icon || "📋",
        description: form.description || null, is_active: true,
      });
    } else if (tab === "categories") {
      result = await supabase.from("categories").insert({
        name: form.name,
        slug: form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        type: form.type || "mock_test", description: form.description || null, is_active: true,
      });
    } else if (tab === "subjects") {
      result = await supabase.from("subjects").insert({
        name: form.name, name_gu: form.name_gu || null, is_active: true,
      });
    } else {
      result = await supabase.from("topics").insert({
        name: form.name, subject_id: parseInt(form.subject_id), is_active: true,
      });
    }
    if (result?.error) { setError(result.error.message); } 
    else { setAdding(false); setForm({}); refresh(); }
    setSaving(false);
  };

  const handleEdit = async (id: number) => {
    setSaving(true); setError("");
    let result;
    if (tab === "exams") {
      result = await supabase.from("exams").update({
        name: editForm.name, name_gu: editForm.name_gu || null,
        icon: editForm.icon, category: editForm.category,
      }).eq("id", id);
    } else if (tab === "categories") {
      result = await supabase.from("categories").update({
        name: editForm.name, type: editForm.type,
      }).eq("id", id);
    } else if (tab === "subjects") {
      result = await supabase.from("subjects").update({
        name: editForm.name, name_gu: editForm.name_gu || null,
      }).eq("id", id);
    } else {
      result = await supabase.from("topics").update({
        name: editForm.name, subject_id: parseInt(editForm.subject_id),
      }).eq("id", id);
    }
    if (result?.error) { setError(result.error.message); }
    else { setEditingId(null); setEditForm({}); refresh(); }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    setSaving(true);
    await supabase.from(tab).delete().eq("id", id);
    setConfirmDelete(null);
    refresh();
    setSaving(false);
  };

  const toggleActive = async (id: number, current: boolean) => {
    await supabase.from(tab).update({ is_active: !current }).eq("id", id);
    refresh();
  };

  const ic = "input w-full";

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{backgroundColor:'var(--bg3)'}}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setAdding(false); setEditingId(null); setError(""); }}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${tab === t.id ? "bg-white dark:bg-gray-800 shadow-sm text-green-700 dark:text-green-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"}`}>
            {t.emoji} {t.label}
            <span className="ml-1.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded-full">{t.count}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
          <button onClick={() => setError("")} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b" style={{borderColor:'var(--border)'}}>
          <h3 className="font-bold capitalize" style={{color:'var(--text)'}}>{tab}</h3>
          <button onClick={() => { setAdding(!adding); setEditingId(null); }}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add New
          </button>
        </div>

        {/* Add Form */}
        {adding && (
          <div className="border-b p-4" style={{borderColor:'var(--border)', backgroundColor:'var(--bg2)'}}>
            <p className="text-xs font-bold mb-3 text-green-700 dark:text-green-400 uppercase tracking-wide">Add New {tab.slice(0, -1)}</p>
            <div className="flex flex-wrap gap-3 items-end">
              <input placeholder="Name (English) *" value={form.name || ""} onChange={e => setForm({...form, name: e.target.value})} className={ic} style={{width:'180px'}} />
              {(tab === "exams" || tab === "subjects") && (
                <input placeholder="Name (Gujarati)" value={form.name_gu || ""} onChange={e => setForm({...form, name_gu: e.target.value})} className={ic} style={{width:'180px'}} />
              )}
              {tab === "exams" && (
                <>
                  <input placeholder="Icon emoji e.g. 🏛️" value={form.icon || ""} onChange={e => setForm({...form, icon: e.target.value})} className={ic} style={{width:'140px'}} />
                  <select value={form.category || "gujarat"} onChange={e => setForm({...form, category: e.target.value})} className={ic} style={{width:'140px'}}>
                    {["gujarat","central","banking","railway","other"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </>
              )}
              {tab === "categories" && (
                <select value={form.type || "mock_test"} onChange={e => setForm({...form, type: e.target.value})} className={ic} style={{width:'180px'}}>
                  {["mock_test","previous_year","topic_wise","daily_quiz","full_test","mini_test"].map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
                </select>
              )}
              {tab === "topics" && (
                <select value={form.subject_id || ""} onChange={e => setForm({...form, subject_id: e.target.value})} className={ic} style={{width:'180px'}}>
                  <option value="">Select Subject *</option>
                  {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              )}
              <div className="flex gap-2">
                <button onClick={handleAdd} disabled={saving || !form.name?.trim()}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1.5 transition-colors">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
                </button>
                <button onClick={() => { setAdding(false); setForm({}); }}
                  className="border text-sm px-3 py-2 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  style={{borderColor:'var(--border)', color:'var(--text3)'}}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="divide-y" style={{borderColor:'var(--border)'}}>
          {items.map((item: any) => (
            <div key={item.id} className="px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              {editingId === item.id ? (
                <div className="flex flex-wrap gap-3 items-center">
                  <input value={editForm.name || ""} onChange={e => setEditForm({...editForm, name: e.target.value})} className={ic} placeholder="Name" style={{width:'180px'}} />
                  {(tab === "exams" || tab === "subjects") && (
                    <input value={editForm.name_gu || ""} onChange={e => setEditForm({...editForm, name_gu: e.target.value})} className={ic} placeholder="Gujarati" style={{width:'160px'}} />
                  )}
                  {tab === "exams" && (
                    <>
                      <input value={editForm.icon || ""} onChange={e => setEditForm({...editForm, icon: e.target.value})} className={ic} placeholder="Icon" style={{width:'100px'}} />
                      <select value={editForm.category || "gujarat"} onChange={e => setEditForm({...editForm, category: e.target.value})} className={ic} style={{width:'140px'}}>
                        {["gujarat","central","banking","railway","other"].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </>
                  )}
                  {tab === "categories" && (
                    <select value={editForm.type || "mock_test"} onChange={e => setEditForm({...editForm, type: e.target.value})} className={ic} style={{width:'180px'}}>
                      {["mock_test","previous_year","topic_wise","daily_quiz","full_test","mini_test"].map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
                    </select>
                  )}
                  {tab === "topics" && (
                    <select value={editForm.subject_id || ""} onChange={e => setEditForm({...editForm, subject_id: e.target.value})} className={ic} style={{width:'180px'}}>
                      {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(item.id)} disabled={saving}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-green-700 transition-colors">
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
                    </button>
                    <button onClick={() => { setEditingId(null); setEditForm({}); }}
                      className="border px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                      style={{borderColor:'var(--border)', color:'var(--text3)'}}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : confirmDelete === item.id ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="text-sm text-red-600 dark:text-red-400 font-semibold">Delete "{item.name}"?</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleDelete(item.id)} disabled={saving}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                      {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />} Delete
                    </button>
                    <button onClick={() => setConfirmDelete(null)}
                      className="border text-xs px-3 py-1.5 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                      style={{borderColor:'var(--border)', color:'var(--text3)'}}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {item.icon && <span className="text-xl shrink-0">{item.icon}</span>}
                    <div className="min-w-0">
                      <span className="text-sm font-semibold" style={{color:'var(--text)'}}>{item.name}</span>
                      {item.name_gu && <span className="text-xs ml-2" style={{color:'var(--text3)'}}>{item.name_gu}</span>}
                      {item.type && (
                        <span className="text-xs ml-2 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full">
                          {item.type.replace(/_/g,' ')}
                        </span>
                      )}
                      {item.category && !item.type && (
                        <span className="text-xs ml-2 px-1.5 py-0.5 rounded-full" style={{backgroundColor:'var(--bg3)', color:'var(--text3)'}}>
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggleActive(item.id, item.is_active)}
                      className={`p-1.5 rounded-lg transition-colors ${item.is_active ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-950" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                      title={item.is_active ? "Disable" : "Enable"}>
                      {item.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>
                    <button onClick={() => { setEditingId(item.id); setEditForm({...item}); setAdding(false); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setConfirmDelete(item.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-center text-sm py-10" style={{color:'var(--text3)'}}>
              Nothing here yet. Click "Add New" to create one.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
