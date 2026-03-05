"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

interface Props {
  exams: any[];
  categories: any[];
  subjects: any[];
  topics: any[];
  languages: any[];
  testId?: number;
  defaultValues?: any;
}

export default function TestForm({ exams, categories, subjects, topics, languages, testId, defaultValues }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(defaultValues?.subject_id || "");

  const filteredTopics = topics.filter(t => !selectedSubject || t.subject_id === parseInt(selectedSubject));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      title: formData.get("title") as string,
      title_gu: formData.get("title_gu") as string || null,
      description: formData.get("description") as string || null,
      exam_id: formData.get("exam_id") ? parseInt(formData.get("exam_id") as string) : null,
      category_id: formData.get("category_id") ? parseInt(formData.get("category_id") as string) : null,
      subject_id: formData.get("subject_id") ? parseInt(formData.get("subject_id") as string) : null,
      topic_id: formData.get("topic_id") ? parseInt(formData.get("topic_id") as string) : null,
      language_id: formData.get("language_id") ? parseInt(formData.get("language_id") as string) : null,
      timer_minutes: parseInt(formData.get("timer_minutes") as string) || 60,
      total_marks: parseInt(formData.get("total_marks") as string) || 100,
      marks_per_question: parseFloat(formData.get("marks_per_question") as string) || 1,
      negative_marking: parseFloat(formData.get("negative_marking") as string) || 0,
      is_free: formData.get("is_free") === "true",
      price: parseFloat(formData.get("price") as string) || 0,
      is_active: formData.get("is_active") === "true",
      year: formData.get("year") ? parseInt(formData.get("year") as string) : null,
    };

    let error;
    if (testId) {
      ({ error } = await supabase.from("tests").update(payload).eq("id", testId));
    } else {
      ({ error } = await supabase.from("tests").insert(payload));
    }

    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/admin/tests");
    router.refresh();
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div className="md:col-span-2">
          <label className={labelClass}>Test Title (English) *</label>
          <input name="title" required defaultValue={defaultValues?.title || ""} className={inputClass} placeholder="e.g. GPSC Class 1-2 Mock Test 1" />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Test Title (Gujarati)</label>
          <input name="title_gu" defaultValue={defaultValues?.title_gu || ""} className={inputClass} placeholder="ગુજરાતીમાં ટેસ્ટ નામ (optional)" />
        </div>
        <div>
          <label className={labelClass}>Exam</label>
          <select name="exam_id" defaultValue={defaultValues?.exam_id || ""} className={inputClass}>
            <option value="">Select Exam</option>
            {exams.map(e => <option key={e.id} value={e.id}>{e.icon} {e.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <select name="category_id" defaultValue={defaultValues?.category_id || ""} className={inputClass}>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Subject</label>
          <select name="subject_id" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className={inputClass}>
            <option value="">Select Subject</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Topic</label>
          <select name="topic_id" defaultValue={defaultValues?.topic_id || ""} className={inputClass}>
            <option value="">Select Topic</option>
            {filteredTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Language</label>
          <select name="language_id" defaultValue={defaultValues?.language_id || 1} className={inputClass}>
            {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Year (for Previous Year papers)</label>
          <input name="year" type="number" defaultValue={defaultValues?.year || ""} className={inputClass} placeholder="e.g. 2023" min="2000" max="2030" />
        </div>
      </div>

      <hr className="border-gray-100 my-5" />
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Test Settings</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div>
          <label className={labelClass}>Timer (minutes)</label>
          <input name="timer_minutes" type="number" defaultValue={defaultValues?.timer_minutes || 60} required className={inputClass} min="5" max="300" />
        </div>
        <div>
          <label className={labelClass}>Total Marks</label>
          <input name="total_marks" type="number" defaultValue={defaultValues?.total_marks || 100} required className={inputClass} min="1" />
        </div>
        <div>
          <label className={labelClass}>Marks per Question</label>
          <input name="marks_per_question" type="number" step="0.25" defaultValue={defaultValues?.marks_per_question || 1} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Negative Marking</label>
          <select name="negative_marking" defaultValue={defaultValues?.negative_marking || 0} className={inputClass}>
            <option value="0">None</option>
            <option value="0.25">-0.25</option>
            <option value="0.33">-0.33</option>
            <option value="0.5">-0.5</option>
            <option value="1">-1</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className={labelClass}>Price</label>
          <select name="is_free" defaultValue={defaultValues?.is_free === false ? "false" : "true"} className={inputClass}>
            <option value="true">Free</option>
            <option value="false">Paid</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Price Amount (if paid)</label>
          <input name="price" type="number" step="1" defaultValue={defaultValues?.price || 0} className={inputClass} placeholder="0" />
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select name="is_active" defaultValue={defaultValues?.is_active === false ? "false" : "true"} className={inputClass}>
            <option value="true">Active (visible to students)</option>
            <option value="false">Disabled</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="border border-gray-200 text-gray-700 font-medium px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="bg-blue-900 hover:bg-blue-950 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {testId ? "Update Test" : "Create Test"}
        </button>
      </div>
    </form>
  );
}
