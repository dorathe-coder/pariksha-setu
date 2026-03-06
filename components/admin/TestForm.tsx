"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Calculator, AlertCircle, CheckCircle } from "lucide-react";

interface Props {
  exams: any[];
  categories: any[];
  subjects: any[];
  topics: any[];
  languages: any[];
  testId?: number;
  defaultValues?: any;
}

const NEG_PRESETS = [
  { label: "None", value: 0 },
  { label: "-¼", value: 0.25 },
  { label: "-⅓", value: 0.33 },
  { label: "-½", value: 0.5 },
  { label: "-1", value: 1 },
];

export default function TestForm({ exams, categories, subjects, topics, languages, testId, defaultValues }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(defaultValues?.subject_id || "");
  const [totalQuestions, setTotalQuestions] = useState(defaultValues?.total_questions || 0);
  const [marksPerQ, setMarksPerQ] = useState<number>(defaultValues?.marks_per_question || 1);
  const [negMarking, setNegMarking] = useState<number>(defaultValues?.negative_marking || 0);
  const [totalMarks, setTotalMarks] = useState<number>(defaultValues?.total_marks || 100);
  const [autoCalc, setAutoCalc] = useState(true);

  useEffect(() => {
    if (autoCalc && totalQuestions > 0 && marksPerQ > 0) {
      setTotalMarks(totalQuestions * marksPerQ);
    }
  }, [totalQuestions, marksPerQ, autoCalc]);

  const filteredTopics = topics.filter(t => !selectedSubject || t.subject_id === parseInt(selectedSubject));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      title: formData.get("title") as string,
      title_gu: (formData.get("title_gu") as string) || null,
      description: (formData.get("description") as string) || null,
      exam_id: formData.get("exam_id") ? parseInt(formData.get("exam_id") as string) : null,
      category_id: formData.get("category_id") ? parseInt(formData.get("category_id") as string) : null,
      subject_id: formData.get("subject_id") ? parseInt(formData.get("subject_id") as string) : null,
      topic_id: formData.get("topic_id") ? parseInt(formData.get("topic_id") as string) : null,
      language_id: formData.get("language_id") ? parseInt(formData.get("language_id") as string) : null,
      timer_minutes: parseInt(formData.get("timer_minutes") as string) || 60,
      total_marks: totalMarks,
      marks_per_question: marksPerQ,
      negative_marking: negMarking,
      passing_marks: formData.get("passing_marks") ? parseFloat(formData.get("passing_marks") as string) : null,
      is_free: formData.get("is_free") === "true",
      price: parseFloat(formData.get("price") as string) || 0,
      is_active: formData.get("is_active") === "true",
      year: formData.get("year") ? parseInt(formData.get("year") as string) : null,
    };

    let dbError;
    if (testId) {
      ({ error: dbError } = await supabase.from("tests").update(payload).eq("id", testId));
    } else {
      ({ error: dbError } = await supabase.from("tests").insert(payload));
    }

    if (dbError) { setError(dbError.message); setLoading(false); return; }
    setSuccess(true);
    setTimeout(() => { router.push("/admin/tests"); router.refresh(); }, 800);
  };

  const ic = "w-full rounded-xl px-4 py-2.5 text-sm transition-all border input";
  const lc = "block text-xs font-semibold mb-1.5 uppercase tracking-wide section-label";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" /> Test saved! Redirecting...
        </div>
      )}

      {/* Basic Info */}
      <div className="card p-5">
        <h3 className="text-xs font-bold uppercase tracking-widest section-label mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={lc}>Test Title (English) *</label>
            <input name="title" required defaultValue={defaultValues?.title || ""} className={ic} placeholder="e.g. TET-1 Mock Test 2025" />
          </div>
          <div className="md:col-span-2">
            <label className={lc}>Test Title (Gujarati) <span className="normal-case font-normal opacity-50">optional</span></label>
            <input name="title_gu" defaultValue={defaultValues?.title_gu || ""} className={ic} placeholder="ગુજરાતીમાં ટેસ્ટ નામ" />
          </div>
          <div className="md:col-span-2">
            <label className={lc}>Description</label>
            <textarea name="description" defaultValue={defaultValues?.description || ""} className={ic + " resize-none"} rows={2} placeholder="Short description for students" />
          </div>
          <div>
            <label className={lc}>Exam</label>
            <select name="exam_id" defaultValue={defaultValues?.exam_id || ""} className={ic}>
              <option value="">Select Exam</option>
              {exams.map(e => <option key={e.id} value={e.id}>{e.icon} {e.name}</option>)}
            </select>
          </div>
          <div>
            <label className={lc}>Category</label>
            <select name="category_id" defaultValue={defaultValues?.category_id || ""} className={ic}>
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={lc}>Subject</label>
            <select name="subject_id" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className={ic}>
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className={lc}>Topic</label>
            <select name="topic_id" defaultValue={defaultValues?.topic_id || ""} className={ic}>
              <option value="">Select Topic</option>
              {filteredTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className={lc}>Language</label>
            <select name="language_id" defaultValue={defaultValues?.language_id || 1} className={ic}>
              {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className={lc}>Year <span className="normal-case font-normal opacity-50">(Previous Year)</span></label>
            <input name="year" type="number" defaultValue={defaultValues?.year || ""} className={ic} placeholder="e.g. 2025" min="2000" max="2030" />
          </div>
        </div>
      </div>

      {/* Marks & Timing */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-widest section-label flex items-center gap-2">
            <Calculator className="w-4 h-4" /> Marks & Timing
          </h3>
          <label className="flex items-center gap-2 text-xs cursor-pointer select-none" style={{color: 'var(--text2)'}}>
            <div onClick={() => setAutoCalc(!autoCalc)}
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${autoCalc ? "bg-green-600" : "bg-gray-300 dark:bg-gray-600"}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoCalc ? "translate-x-4" : "translate-x-0.5"}`}></div>
            </div>
            Auto total marks
          </label>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          <div>
            <label className={lc}>Timer (min)</label>
            <input name="timer_minutes" type="number" defaultValue={defaultValues?.timer_minutes || 60} required className={ic} min="5" max="300" />
          </div>
          <div>
            <label className={lc}>Total Questions</label>
            <input type="number" value={totalQuestions || ""} onChange={e => setTotalQuestions(parseInt(e.target.value) || 0)} className={ic} placeholder="100" min="1" />
          </div>
          <div>
            <label className={lc}>Marks per Q</label>
            <input type="number" step="0.25" value={marksPerQ} onChange={e => setMarksPerQ(parseFloat(e.target.value) || 1)} className={ic} min="0.25" />
            <div className="flex gap-1 mt-1.5">
              {[1, 2, 4].map(v => (
                <button key={v} type="button" onClick={() => setMarksPerQ(v)}
                  className={`text-xs px-2 py-0.5 rounded-lg border transition-colors ${marksPerQ === v ? "bg-green-600 text-white border-green-600" : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-green-400"}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={lc}>Total Marks</label>
            <input type="number" value={totalMarks} onChange={e => { setTotalMarks(parseInt(e.target.value) || 0); setAutoCalc(false); }}
              className={ic + (autoCalc ? " opacity-70" : "")} min="1" readOnly={autoCalc} />
            {autoCalc && totalQuestions > 0 && <p className="text-xs text-green-600 mt-1">= {totalQuestions} × {marksPerQ}</p>}
          </div>
        </div>

        <div className="mb-4">
          <label className={lc}>Negative Marking</label>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {NEG_PRESETS.map(p => (
              <button key={p.value} type="button" onClick={() => setNegMarking(p.value)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${negMarking === p.value
                  ? p.value === 0 ? "bg-green-600 text-white border-green-600" : "bg-red-600 text-white border-red-600"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"}`}>
                {p.label}
              </button>
            ))}
            <input type="number" step="0.01" value={negMarking} onChange={e => setNegMarking(parseFloat(e.target.value) || 0)}
              className="border rounded-xl px-3 py-2 text-sm w-24 focus:outline-none input" min="0" max="10" placeholder="Custom" />
          </div>
          {negMarking > 0 && (
            <p className="text-xs text-red-500 mt-2">⚠️ Wrong answer = -{negMarking} mark{negMarking !== 1 ? "s" : ""}</p>
          )}
        </div>

        {totalQuestions > 0 && (
          <div className="bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900 rounded-xl p-4">
            <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-3">📊 Marking Summary</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[
                { label: "Questions", value: totalQuestions },
                { label: "Per Correct", value: `+${marksPerQ}` },
                { label: "Per Wrong", value: negMarking > 0 ? `-${negMarking}` : "0" },
                { label: "Max Score", value: totalMarks },
              ].map(s => (
                <div key={s.label} className="bg-white dark:bg-gray-800 rounded-lg py-2.5 px-2">
                  <div className="text-xl font-black text-gray-900 dark:text-white">{s.value}</div>
                  <div className="text-xs mt-0.5 section-label normal-case">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Other Settings */}
      <div className="card p-5">
        <h3 className="text-xs font-bold uppercase tracking-widest section-label mb-4">Other Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={lc}>Passing Marks</label>
            <input name="passing_marks" type="number" step="0.5" defaultValue={defaultValues?.passing_marks || ""} className={ic} placeholder="e.g. 40" />
          </div>
          <div>
            <label className={lc}>Pricing</label>
            <select name="is_free" defaultValue={defaultValues?.is_free === false ? "false" : "true"} className={ic}>
              <option value="true">🆓 Free</option>
              <option value="false">💰 Paid</option>
            </select>
          </div>
          <div>
            <label className={lc}>Price (if paid)</label>
            <input name="price" type="number" step="1" defaultValue={defaultValues?.price || 0} className={ic} placeholder="₹0" />
          </div>
          <div>
            <label className={lc}>Status</label>
            <select name="is_active" defaultValue={defaultValues?.is_active === false ? "false" : "true"} className={ic}>
              <option value="true">✅ Active</option>
              <option value="false">🔒 Disabled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <button type="button" onClick={() => router.back()}
          className="border border-gray-200 dark:border-gray-700 font-medium px-6 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
          style={{color: 'var(--text2)'}}>
          Cancel
        </button>
        <button type="submit" disabled={loading || success}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold px-8 py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 shadow-sm">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {success ? "✅ Saved!" : testId ? "Update Test" : "Create Test"}
        </button>
      </div>
    </form>
  );
}
