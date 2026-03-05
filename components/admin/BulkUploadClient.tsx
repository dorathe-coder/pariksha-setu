"use client";
import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Upload, FileText, ClipboardPaste, Plus, CheckCircle, AlertCircle, X, Loader2, ChevronDown, ChevronUp, Edit3 } from "lucide-react";
import type { ParsedQuestion, CorrectOption, Difficulty } from "@/types/database";

interface Props {
  tests: { id: number; title: string }[];
  subjects: { id: number; name: string }[];
  topics: { id: number; name: string; subject_id: number }[];
  languages: { id: number; name: string; code: string }[];
  defaultTestId?: number;
}

type UploadMode = "paste" | "csv" | "manual";

interface ParsedRow extends ParsedQuestion {
  _id: number;
  _error?: string;
}

function parseSmartText(text: string): { parsed: ParsedRow[]; errors: string[] } {
  const parsed: ParsedRow[] = [];
  const errors: string[] = [];

  // Split by question patterns: number followed by . or ) or space
  const blocks = text.split(/\n(?=\s*\d+[.)\s])/g).filter(b => b.trim());

  blocks.forEach((block, idx) => {
    try {
      const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
      if (lines.length < 6) return;

      // Extract question text (first line, remove leading number)
      const qText = lines[0].replace(/^\d+[.)\s]+/, "").trim();
      if (!qText) return;

      let optA = "", optB = "", optC = "", optD = "", answer = "", explanation = "";

      lines.slice(1).forEach(line => {
        const aMatch = line.match(/^[Aa][.)\s]+(.+)/);
        const bMatch = line.match(/^[Bb][.)\s]+(.+)/);
        const cMatch = line.match(/^[Cc][.)\s]+(.+)/);
        const dMatch = line.match(/^[Dd][.)\s]+(.+)/);
        // Inline options: A) x B) y C) z D) w
        const inlineMatch = line.match(/[Aa][.)\s]+(.+?)\s+[Bb][.)\s]+(.+?)\s+[Cc][.)\s]+(.+?)\s+[Dd][.)\s]+(.+)/);
        const ansMatch = line.match(/^(?:Answer|Ans|Correct)[:\s]+([A-Da-d])/i);
        const expMatch = line.match(/^(?:Explanation|Exp)[:\s]+(.+)/i);

        if (inlineMatch) {
          optA = inlineMatch[1].trim();
          optB = inlineMatch[2].trim();
          optC = inlineMatch[3].trim();
          optD = inlineMatch[4].trim();
        } else if (aMatch) optA = aMatch[1].trim();
        else if (bMatch) optB = bMatch[1].trim();
        else if (cMatch) optC = cMatch[1].trim();
        else if (dMatch) optD = dMatch[1].trim();
        else if (ansMatch) answer = ansMatch[1].toUpperCase();
        else if (expMatch) explanation = expMatch[1].trim();
      });

      if (!optA || !optB || !optC || !optD) {
        errors.push(`Q${idx + 1}: Options not detected`);
        return;
      }
      if (!answer) {
        errors.push(`Q${idx + 1}: Answer not detected`);
        return;
      }

      parsed.push({
        _id: idx,
        question_text: qText,
        option_a: optA,
        option_b: optB,
        option_c: optC,
        option_d: optD,
        correct_option: answer as CorrectOption,
        explanation: explanation || undefined,
        difficulty: "medium",
      });
    } catch {
      errors.push(`Q${idx + 1}: Parse error`);
    }
  });

  return { parsed, errors };
}

function parseCSVText(text: string): { parsed: ParsedRow[]; errors: string[] } {
  const parsed: ParsedRow[] = [];
  const errors: string[] = [];
  const lines = text.split("\n").filter(Boolean);
  const dataLines = lines[0]?.toLowerCase().includes("question") ? lines.slice(1) : lines;

  dataLines.forEach((line, idx) => {
    // Handle quoted CSV
    const cols: string[] = [];
    let current = "";
    let inQuote = false;
    for (const char of line) {
      if (char === '"') inQuote = !inQuote;
      else if (char === "," && !inQuote) { cols.push(current.trim()); current = ""; }
      else current += char;
    }
    cols.push(current.trim());

    if (cols.length < 6) { errors.push(`Row ${idx + 2}: Not enough columns`); return; }

    const [question_text, option_a, option_b, option_c, option_d, correct, subject, topic, language, difficulty, explanation] = cols;
    const answer = correct?.trim().toUpperCase();

    if (!question_text || !option_a || !option_b || !option_c || !option_d) {
      errors.push(`Row ${idx + 2}: Missing required fields`);
      return;
    }
    if (!["A","B","C","D"].includes(answer)) {
      errors.push(`Row ${idx + 2}: Invalid answer "${answer}"`);
      return;
    }

    parsed.push({
      _id: idx,
      question_text: question_text.trim(),
      option_a: option_a.trim(),
      option_b: option_b.trim(),
      option_c: option_c.trim(),
      option_d: option_d.trim(),
      correct_option: answer as CorrectOption,
      difficulty: (["easy","medium","hard"].includes(difficulty?.toLowerCase()) ? difficulty.toLowerCase() : "medium") as Difficulty,
      explanation: explanation?.trim() || undefined,
    });
  });

  return { parsed, errors };
}

export default function BulkUploadClient({ tests, subjects, topics, languages, defaultTestId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<UploadMode>("paste");
  const [testId, setTestId] = useState<number>(defaultTestId || (tests[0]?.id ?? 0));
  const [subjectId, setSubjectId] = useState<number>(0);
  const [languageId, setLanguageId] = useState<number>(languages[0]?.id || 1);
  const [pasteText, setPasteText] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState<ParsedRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(0);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const filteredTopics = topics.filter(t => !subjectId || t.subject_id === subjectId);

  const handleParse = () => {
    if (!pasteText.trim()) return;
    const { parsed, errors } = parseSmartText(pasteText);
    setParsedQuestions(parsed);
    setParseErrors(errors);
  };

  const handleCSVFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const { parsed, errors } = parseCSVText(text);
    setParsedQuestions(parsed);
    setParseErrors(errors);
  };

  const updateQuestion = (id: number, field: string, value: string) => {
    setParsedQuestions(prev => prev.map(q => q._id === id ? { ...q, [field]: value } : q));
  };

  const removeQuestion = (id: number) => {
    setParsedQuestions(prev => prev.filter(q => q._id !== id));
  };

  const handleSaveAll = async () => {
    if (!testId || parsedQuestions.length === 0) return;
    setSaving(true);
    setSaved(0);

    const BATCH_SIZE = 50;
    let totalSaved = 0;

    for (let i = 0; i < parsedQuestions.length; i += BATCH_SIZE) {
      const batch = parsedQuestions.slice(i, i + BATCH_SIZE).map((q, batchIdx) => ({
        test_id: testId,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_option: q.correct_option,
        explanation: q.explanation || null,
        difficulty: q.difficulty || "medium",
        subject_id: subjectId || null,
        language_id: languageId,
        question_order: i + batchIdx + 1,
        marks: 1,
      }));

      const { error } = await supabase.from("questions").insert(batch);
      if (!error) totalSaved += batch.length;
      setSaved(totalSaved);
    }

    setSaving(false);
    setParsedQuestions([]);
    setPasteText("");
    router.push(`/admin/tests`);
    router.refresh();
  };

  const inputClass = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 bg-white";

  return (
    <div className="space-y-5">
      {/* Settings */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Step 1: Select Test & Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Test *</label>
            <select value={testId} onChange={e => setTestId(parseInt(e.target.value))} className={inputClass}>
              <option value="">Select test...</option>
              {tests.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
            <a href="/admin/tests/new" className="text-xs text-blue-900 hover:underline mt-1 block">+ Create new test first</a>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject (optional)</label>
            <select value={subjectId} onChange={e => setSubjectId(parseInt(e.target.value))} className={inputClass}>
              <option value="0">No specific subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Language</label>
            <select value={languageId} onChange={e => setLanguageId(parseInt(e.target.value))} className={inputClass}>
              {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Upload Mode Selector */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Step 2: Choose Upload Method</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          {([
            { id: "paste" as const, icon: <ClipboardPaste className="w-5 h-5" />, title: "Copy-Paste Questions", desc: "Paste questions copied from PDF or text", highlight: true },
            { id: "csv" as const, icon: <FileText className="w-5 h-5" />, title: "Upload CSV/Excel", desc: "Upload .csv or .xlsx file with question data", highlight: false },
            { id: "manual" as const, icon: <Plus className="w-5 h-5" />, title: "Add Manually", desc: "Add one question at a time with full form", highlight: false },
          ]).map(opt => (
            <button key={opt.id} onClick={() => setMode(opt.id)}
              className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left ${mode === opt.id ? "border-blue-900 bg-blue-50" : "border-gray-100 hover:border-gray-200"}`}>
              <div className={`${mode === opt.id ? "text-blue-900" : "text-gray-500"}`}>{opt.icon}</div>
              <div>
                <div className={`text-sm font-semibold ${mode === opt.id ? "text-blue-900" : "text-gray-800"}`}>{opt.title}</div>
                <div className="text-xs text-gray-500">{opt.desc}</div>
              </div>
              {opt.highlight && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Fastest</span>}
            </button>
          ))}
        </div>

        {/* PASTE MODE */}
        {mode === "paste" && (
          <div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4 text-sm text-amber-800">
              <strong>Format Guide:</strong> Paste questions from any PDF. System auto-detects question numbers, A/B/C/D options, and "Answer: X" lines.
              <br />
              <span className="font-mono text-xs block mt-1.5 text-amber-700">1. Question text here{"
"}A) Option A  B) Option B  C) Option C  D) Option D{"
"}Answer: B{"
"}Explanation: Optional explanation here</span>
            </div>
            <textarea
              value={pasteText}
              onChange={e => setPasteText(e.target.value)}
              rows={12}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 resize-y"
              placeholder={"Paste your questions here...\n\n1. What is the capital of Gujarat?\nA) Surat  B) Ahmedabad  C) Gandhinagar  D) Rajkot\nAnswer: C\nExplanation: Gandhinagar is the capital city of Gujarat.\n\n2. Next question..."}
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-500">
                {pasteText.split(/
(?=s*d+[.)s])/).filter(b => b.trim()).length} questions detected
              </span>
              <button onClick={handleParse}
                className="bg-blue-900 hover:bg-blue-950 text-white font-semibold px-6 py-2 rounded-xl text-sm transition-colors">
                Parse Questions
              </button>
            </div>
          </div>
        )}

        {/* CSV MODE */}
        {mode === "csv" && (
          <div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
              <p className="text-sm font-semibold text-blue-800 mb-1">CSV Column Format (in order):</p>
              <p className="text-xs text-blue-700 font-mono bg-blue-100 px-3 py-2 rounded-lg">Question | Option A | Option B | Option C | Option D | Correct (A/B/C/D) | Subject | Topic | Language | Difficulty | Explanation</p>
              <a href="/sample-questions.csv" className="text-xs text-blue-900 hover:underline mt-2 block">Download sample CSV template</a>
            </div>
            <div onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-blue-300 rounded-xl p-10 text-center cursor-pointer transition-colors group">
              <Upload className="w-8 h-8 text-gray-300 group-hover:text-blue-400 mx-auto mb-2 transition-colors" />
              <p className="text-sm font-medium text-gray-700">Click to upload CSV or Excel file</p>
              <p className="text-xs text-gray-400 mt-1">Supports .csv and .xlsx formats</p>
            </div>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleCSVFile} />
          </div>
        )}

        {/* MANUAL MODE */}
        {mode === "manual" && (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500 mb-4">Add one question at a time with full control over all fields</p>
            <button onClick={() => setParsedQuestions(prev => [...prev, {
              _id: Date.now(),
              question_text: "",
              option_a: "",
              option_b: "",
              option_c: "",
              option_d: "",
              correct_option: "A",
              difficulty: "medium",
            }])}
              className="bg-blue-900 text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-blue-950 transition-colors inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add New Question
            </button>
          </div>
        )}
      </div>

      {/* Parse Errors */}
      {parseErrors.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
          <p className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> {parseErrors.length} parsing errors (these questions were skipped)
          </p>
          <div className="space-y-1">
            {parseErrors.map((err, i) => <p key={i} className="text-xs text-red-600">{err}</p>)}
          </div>
        </div>
      )}

      {/* Parsed Questions Preview */}
      {parsedQuestions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{parsedQuestions.length} Questions Parsed</h3>
                <p className="text-xs text-gray-500">Review and edit before saving. Click any question to expand.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Target: <strong>{tests.find(t => t.id === testId)?.title || "Not selected"}</strong></span>
              <button onClick={handleSaveAll} disabled={saving || !testId}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold px-6 py-2 rounded-xl text-sm flex items-center gap-2 transition-colors">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving ({saved}/{parsedQuestions.length})...</> : `Save All ${parsedQuestions.length} Questions`}
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {parsedQuestions.map((q, idx) => (
              <div key={q._id} className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="flex items-start gap-3 p-3.5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}>
                  <span className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-xs font-bold text-blue-900 shrink-0">{idx + 1}</span>
                  <p className="text-sm text-gray-800 flex-1 line-clamp-1">{q.question_text || <span className="text-gray-400 italic">Empty question</span>}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`badge ${q.difficulty === "easy" ? "bg-green-100 text-green-700" : q.difficulty === "hard" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {q.difficulty}
                    </span>
                    <span className="badge bg-gray-100 text-gray-700">Ans: {q.correct_option}</span>
                    <button onClick={e => { e.stopPropagation(); removeQuestion(q._id); }}
                      className="text-gray-300 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                    {expandedIdx === idx ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>
                {expandedIdx === idx && (
                  <div className="px-3.5 pb-3.5 border-t border-gray-50 pt-3 space-y-2.5">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Question</label>
                      <textarea value={q.question_text} onChange={e => updateQuestion(q._id, "question_text", e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-900 resize-none" rows={2} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(["A","B","C","D"] as const).map(opt => (
                        <div key={opt}>
                          <label className={`text-xs font-medium mb-1 block ${q.correct_option === opt ? "text-green-700" : "text-gray-500"}`}>
                            Option {opt} {q.correct_option === opt && "(Correct)"}
                          </label>
                          <input value={q[`option_${opt.toLowerCase()}` as keyof ParsedQuestion] as string || ""}
                            onChange={e => updateQuestion(q._id, `option_${opt.toLowerCase()}`, e.target.value)}
                            className={`w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-900 ${q.correct_option === opt ? "border-green-300 bg-green-50" : "border-gray-200"}`} />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Correct Answer</label>
                        <select value={q.correct_option} onChange={e => updateQuestion(q._id, "correct_option", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-900">
                          {["A","B","C","D"].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Difficulty</label>
                        <select value={q.difficulty} onChange={e => updateQuestion(q._id, "difficulty", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-900">
                          {["easy","medium","hard"].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Explanation (optional)</label>
                      <textarea value={q.explanation || ""} onChange={e => updateQuestion(q._id, "explanation", e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-900 resize-none" rows={2}
                        placeholder="Add explanation for this answer..." />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
            <button onClick={handleSaveAll} disabled={saving || !testId}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold px-8 py-3 rounded-xl text-sm flex items-center gap-2 transition-colors">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving {saved}/{parsedQuestions.length}...</> : `Save All ${parsedQuestions.length} Questions to Database`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
