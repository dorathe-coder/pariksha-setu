"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus, Loader2 } from "lucide-react";

type Tab = "exams" | "categories" | "subjects" | "topics";

export default function ExamManagerClient({ exams, categories, subjects, topics }: any) {
  const [tab, setTab] = useState<Tab>("exams");
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>({});
  const router = useRouter();
  const supabase = createClient();

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "exams", label: "Exams", count: exams.length },
    { id: "categories", label: "Categories", count: categories.length },
    { id: "subjects", label: "Subjects", count: subjects.length },
    { id: "topics", label: "Topics", count: topics.length },
  ];

  const handleAdd = async () => {
    setLoading(true);
    let error;
    if (tab === "exams") {
      ({ error } = await supabase.from("exams").insert({ name: form.name, name_gu: form.name_gu, slug: form.name.toLowerCase().replace(/\s+/g, "-"), category: form.category || "gujarat", icon: form.icon || "📋" }));
    } else if (tab === "categories") {
      ({ error } = await supabase.from("categories").insert({ name: form.name, slug: form.name.toLowerCase().replace(/\s+/g, "-"), type: form.type || "mock_test" }));
    } else if (tab === "subjects") {
      ({ error } = await supabase.from("subjects").insert({ name: form.name, name_gu: form.name_gu }));
    } else if (tab === "topics") {
      ({ error } = await supabase.from("topics").insert({ name: form.name, subject_id: parseInt(form.subject_id) }));
    }
    if (!error) { setAdding(false); setForm({}); router.refresh(); }
    setLoading(false);
  };

  const inputClass = "border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-900 bg-white";

  const items = tab === "exams" ? exams : tab === "categories" ? categories : tab === "subjects" ? subjects : topics;

  return (
    <div>
      <div className="flex gap-2 mb-5 border-b border-gray-100">
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setAdding(false); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? "border-blue-900 text-blue-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {t.label} <span className="ml-1 text-xs text-gray-400">({t.count})</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 capitalize">{tab}</h3>
          <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 bg-blue-900 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-950 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add New
          </button>
        </div>

        {adding && (
          <div className="bg-gray-50 rounded-xl p-4 mb-4 flex flex-wrap gap-3 items-end">
            <input placeholder="Name (English)" value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} />
            {(tab === "exams" || tab === "subjects") && (
              <input placeholder="Name (Gujarati)" value={form.name_gu || ""} onChange={e => setForm({ ...form, name_gu: e.target.value })} className={inputClass} />
            )}
            {tab === "exams" && (
              <>
                <input placeholder="Icon (emoji)" value={form.icon || ""} onChange={e => setForm({ ...form, icon: e.target.value })} className={inputClass + " w-24"} />
                <select value={form.category || "gujarat"} onChange={e => setForm({ ...form, category: e.target.value })} className={inputClass}>
                  {["gujarat","central","banking","railway","other"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </>
            )}
            {tab === "categories" && (
              <select value={form.type || "mock_test"} onChange={e => setForm({ ...form, type: e.target.value })} className={inputClass}>
                {["mock_test","previous_year","topic_wise","daily_quiz","full_test","mini_test"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            )}
            {tab === "topics" && (
              <select value={form.subject_id || ""} onChange={e => setForm({ ...form, subject_id: e.target.value })} className={inputClass}>
                <option value="">Select Subject</option>
                {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            )}
            <button onClick={handleAdd} disabled={loading || !form.name}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-xl text-sm flex items-center gap-1.5 transition-colors">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Save
            </button>
            <button onClick={() => { setAdding(false); setForm({}); }} className="text-sm text-gray-500 hover:text-gray-700 px-2">Cancel</button>
          </div>
        )}

        <div className="space-y-1">
          {items.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between py-2.5 px-3 hover:bg-gray-50 rounded-xl transition-colors">
              <div className="flex items-center gap-2">
                {item.icon && <span className="text-lg">{item.icon}</span>}
                <div>
                  <span className="text-sm font-medium text-gray-800">{item.name}</span>
                  {item.name_gu && <span className="text-xs text-gray-400 ml-2">{item.name_gu}</span>}
                  {item.type && <span className="text-xs text-gray-400 ml-2 badge bg-gray-100 text-gray-500">{item.type}</span>}
                  {item.subject && <span className="text-xs text-gray-400 ml-2">({item.subject.name})</span>}
                  {item.category && !item.type && <span className="text-xs text-gray-400 ml-2 badge bg-blue-50 text-blue-600">{item.category}</span>}
                </div>
              </div>
              <span className={`text-xs badge ${item.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {item.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-6">Nothing here yet. Add the first one above.</p>
          )}
        </div>
      </div>
    </div>
  );
}
