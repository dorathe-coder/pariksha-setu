"use client";
import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Upload, FileText, ClipboardPaste, Plus, CheckCircle, AlertCircle,
  X, Loader2, ChevronDown, ChevronUp, Sparkles, Languages, ShieldCheck,
  BookOpen, Wand2, AlertTriangle, RefreshCw, Copy, Trash2
} from "lucide-react";

interface Props {
  tests: { id: number; title: string }[];
  subjects: { id: number; name: string }[];
  topics: { id: number; name: string; subject_id: number }[];
  languages: { id: number; name: string; code: string }[];
  defaultTestId?: number;
}

type UploadMode = "ai" | "paste" | "csv" | "manual";

interface ParsedRow {
  _id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  difficulty: string;
  explanation?: string;
  _aiGenerated?: boolean;
  _hasIssue?: boolean;
  _issueMsg?: string;
}

function parseManualText(text: string): { parsed: ParsedRow[]; errors: string[] } {
  const parsed: ParsedRow[] = [];
  const errors: string[] = [];
  const blocks = text.split(/\n(?=\s*\d+[.)\s])/g).filter(b => b.trim());

  blocks.forEach((block, idx) => {
    try {
      const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
      if (lines.length < 3) return;
      const qText = lines[0].replace(/^\d+[.)\s]+/, "").trim();
      if (!qText) return;

      let optA = "", optB = "", optC = "", optD = "", answer = "", explanation = "";
      lines.slice(1).forEach(line => {
        const aM = line.match(/^[Aa][.)\s]+(.+)/); const bM = line.match(/^[Bb][.)\s]+(.+)/);
        const cM = line.match(/^[Cc][.)\s]+(.+)/); const dM = line.match(/^[Dd][.)\s]+(.+)/);
        const ansM = line.match(/^(?:Answer|Ans|Correct)[:\s]+([A-Da-d])/i);
        const expM = line.match(/^(?:Explanation|Exp)[:\s]+(.+)/i);
        const inline = line.match(/[Aa][.)\s]+(.+?)\s+[Bb][.)\s]+(.+?)\s+[Cc][.)\s]+(.+?)\s+[Dd][.)\s]+(.+)/);
        if (inline) { optA = inline[1].trim(); optB = inline[2].trim(); optC = inline[3].trim(); optD = inline[4].trim(); }
        else if (aM) optA = aM[1].trim(); else if (bM) optB = bM[1].trim();
        else if (cM) optC = cM[1].trim(); else if (dM) optD = dM[1].trim();
        else if (ansM) answer = ansM[1].toUpperCase();
        else if (expM) explanation = expM[1].trim();
      });

      if (!optA || !optB || !optC || !optD) { errors.push(`Q${idx + 1}: Options not detected`); return; }
      if (!answer) { errors.push(`Q${idx + 1}: Answer not detected`); return; }
      parsed.push({ _id: idx, question_text: qText, option_a: optA, option_b: optB, option_c: optC, option_d: optD, correct_option: answer, difficulty: "medium", explanation: explanation || undefined });
    } catch { errors.push(`Q${idx + 1}: Parse error`); }
  });
  return { parsed, errors };
}

function parseCSVText(text: string): { parsed: ParsedRow[]; errors: string[] } {
  const parsed: ParsedRow[] = [];
  const errors: string[] = [];
  const lines = text.split("\n").filter(Boolean);
  const dataLines = lines[0]?.toLowerCase().includes("question") ? lines.slice(1) : lines;

  dataLines.forEach((line, idx) => {
    const cols: string[] = [];
    let current = ""; let inQuote = false;
    for (const char of line) {
      if (char === '"') inQuote = !inQuote;
      else if (char === "," && !inQuote) { cols.push(current.trim()); current = ""; }
      else current += char;
    }
    cols.push(current.trim());
    if (cols.length < 6) { errors.push(`Row ${idx + 2}: Not enough columns`); return; }
    const [question_text, option_a, option_b, option_c, option_d, correct, , , , difficulty, explanation] = cols;
    const answer = correct?.trim().toUpperCase();
    if (!question_text || !option_a || !option_b || !option_c || !option_d) { errors.push(`Row ${idx + 2}: Missing fields`); return; }
    if (!["A", "B", "C", "D"].includes(answer)) { errors.push(`Row ${idx + 2}: Invalid answer`); return; }
    parsed.push({ _id: idx, question_text: question_text.trim(), option_a: option_a.trim(), option_b: option_b.trim(), option_c: option_c.trim(), option_d: option_d.trim(), correct_option: answer, difficulty: ["easy", "medium", "hard"].includes(difficulty?.toLowerCase()) ? difficulty.toLowerCase() : "medium", explanation: explanation?.trim() || undefined });
  });
  return { parsed, errors };
}

export default function AIImportClient({ tests, subjects, topics, languages, defaultTestId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<UploadMode>("ai");
  const [testId, setTestId] = useState<number>(defaultTestId || (tests[0]?.id ?? 0));
  const [subjectId, setSubjectId] = useState<number>(0);
  const [languageId, setLanguageId] = useState<number>(languages[0]?.id || 1);
  const [pasteText, setPasteText] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState<ParsedRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(0);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState("");
  const [qualityReport, setQualityReport] = useState<any>(null);
  const [selectedForAction, setSelectedForAction] = useState<Set<number>>(new Set());
  const [showQuality, setShowQuality] = useState(false);

  const filteredTopics = topics.filter(t => !subjectId || t.subject_id === subjectId);

  // AI Smart Import
  const handleAIImport = async () => {
    if (!pasteText.trim()) return;
    setAiLoading(true);
    setAiStatus("🤖 GPT is reading your question paper...");
    setParseErrors([]);
    try {
      const res = await fetch("/api/ai/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: pasteText }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const mapped: ParsedRow[] = data.questions.map((q: any, i: number) => ({
        _id: i + Date.now(),
        question_text: q.question_text || "",
        option_a: q.option_a || "",
        option_b: q.option_b || "",
        option_c: q.option_c || "",
        option_d: q.option_d || "",
        correct_option: q.correct_option || "A",
        difficulty: q.difficulty || "medium",
        explanation: q.explanation || "",
        _aiGenerated: true,
      }));
      setParsedQuestions(mapped);
      setAiStatus(`✅ ${mapped.length} questions extracted! (${data.tokens_used} tokens used)`);
    } catch (e: any) {
      setAiStatus("");
      setParseErrors([`AI Error: ${e.message}`]);
    } finally {
      setAiLoading(false);
    }
  };

  // Generate Explanations for selected or all missing
  const handleGenerateExplanations = async () => {
    const toExplain = parsedQuestions.filter(q =>
      (!q.explanation || q.explanation.trim() === "") &&
      (selectedForAction.size === 0 || selectedForAction.has(q._id))
    );
    if (toExplain.length === 0) { setAiStatus("✅ All selected questions already have explanations!"); return; }

    setAiLoading(true);
    setAiStatus(`🤖 Generating explanations for ${toExplain.length} questions...`);
    try {
      // Process in batches of 20
      let allExplanations: any[] = [];
      for (let i = 0; i < toExplain.length; i += 20) {
        const batch = toExplain.slice(i, i + 20).map(q => ({
          id: q._id, question_text: q.question_text,
          option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d,
          correct_option: q.correct_option,
        }));
        const res = await fetch("/api/ai/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questions: batch }),
        });
        const data = await res.json();
        if (data.explanations) allExplanations = [...allExplanations, ...data.explanations];
        setAiStatus(`🤖 Generated ${Math.min(i + 20, toExplain.length)}/${toExplain.length}...`);
      }

      const explanationMap = new Map(allExplanations.map((e: any) => [e.id, e.explanation]));
      setParsedQuestions(prev => prev.map(q => ({
        ...q,
        explanation: explanationMap.get(q._id) || q.explanation || "",
      })));
      setAiStatus(`✅ Explanations generated for ${allExplanations.length} questions!`);
    } catch (e: any) {
      setAiStatus(`❌ Error: ${e.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Translate questions
  const handleTranslate = async (targetLang: string) => {
    const toTranslate = parsedQuestions.filter(q =>
      selectedForAction.size === 0 || selectedForAction.has(q._id)
    );
    if (toTranslate.length === 0) return;
    setAiLoading(true);
    setAiStatus(`🌐 Translating ${toTranslate.length} questions...`);
    try {
      let allTranslated: any[] = [];
      for (let i = 0; i < toTranslate.length; i += 10) {
        const batch = toTranslate.slice(i, i + 10).map(q => ({
          id: q._id, question_text: q.question_text, option_a: q.option_a, option_b: q.option_b,
          option_c: q.option_c, option_d: q.option_d, explanation: q.explanation,
        }));
        const res = await fetch("/api/ai/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questions: batch, targetLanguage: targetLang }),
        });
        const data = await res.json();
        if (data.translated) allTranslated = [...allTranslated, ...data.translated];
      }
      const map = new Map(allTranslated.map((t: any) => [t.id, t]));
      setParsedQuestions(prev => prev.map(q => {
        const t = map.get(q._id);
        return t ? { ...q, question_text: t.question_text, option_a: t.option_a, option_b: t.option_b, option_c: t.option_c, option_d: t.option_d, explanation: t.explanation || q.explanation } : q;
      }));
      setAiStatus(`✅ Translation complete for ${allTranslated.length} questions!`);
    } catch (e: any) {
      setAiStatus(`❌ Error: ${e.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Quality Check
  const handleQualityCheck = async () => {
    if (parsedQuestions.length === 0) return;
    setAiLoading(true);
    setAiStatus("🔍 Running quality check...");
    setShowQuality(false);
    try {
      const questionsToCheck = parsedQuestions.map(q => ({
        id: q._id, question_text: q.question_text, option_a: q.option_a, option_b: q.option_b,
        option_c: q.option_c, option_d: q.option_d, correct_option: q.correct_option,
      }));
      const res = await fetch("/api/ai/quality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: questionsToCheck }),
      });
      const data = await res.json();
      setQualityReport(data);
      setShowQuality(true);

      // Mark questions with issues
      if (data.issues?.length > 0) {
        const issueMap = new Map(data.issues.map((i: any) => [i.id, i]));
        setParsedQuestions(prev => prev.map(q => {
          const issue = issueMap.get(q._id);
          return issue ? { ...q, _hasIssue: true, _issueMsg: (issue as any).message } : { ...q, _hasIssue: false, _issueMsg: undefined };
          return issue ? { ...q, _hasIssue: true, _issueMsg: (issue as any).message } : { ...q, _hasIssue: false, _issueMsg: undefined };
        }));
      }
      setAiStatus(`✅ Quality check complete! Score: ${data.summary?.quality_score || 0}/100`);
    } catch (e: any) {
      setAiStatus(`❌ Error: ${e.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const updateQuestion = (id: number, field: string, value: string) => {
    setParsedQuestions(prev => prev.map(q => q._id === id ? { ...q, [field]: value } : q));
  };
  const removeQuestion = (id: number) => setParsedQuestions(prev => prev.filter(q => q._id !== id));
  const toggleSelect = (id: number) => {
    setSelectedForAction(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const selectAll = () => {
    if (selectedForAction.size === parsedQuestions.length) setSelectedForAction(new Set());
    else setSelectedForAction(new Set(parsedQuestions.map(q => q._id)));
  };

  const handleSaveAll = async () => {
    if (!testId || parsedQuestions.length === 0) return;
    setSaving(true); setSaved(0);
    const BATCH_SIZE = 50;
    let totalSaved = 0;
    for (let i = 0; i < parsedQuestions.length; i += BATCH_SIZE) {
      const batch = parsedQuestions.slice(i, i + BATCH_SIZE).map((q, batchIdx) => ({
        test_id: testId, question_text: q.question_text, option_a: q.option_a, option_b: q.option_b,
        option_c: q.option_c, option_d: q.option_d, correct_option: q.correct_option,
        explanation: q.explanation || null, difficulty: q.difficulty || "medium",
        subject_id: subjectId || null, language_id: languageId,
        question_order: i + batchIdx + 1, marks: 1,
      }));
      const { error } = await supabase.from("questions").insert(batch);
      if (!error) totalSaved += batch.length;
      setSaved(totalSaved);
    }
    setSaving(false);
    setParsedQuestions([]); setPasteText("");
    router.push("/admin/tests"); router.refresh();
  };

  const ic = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 bg-white";

  const modeOptions: { id: UploadMode; icon: any; label: string; desc: string; badge?: string; color: string }[] = [
    { id: "ai", icon: Sparkles, label: "AI Smart Import", desc: "Paste any question paper — GPT extracts everything", badge: "Best", color: "blue" },
    { id: "paste", icon: ClipboardPaste, label: "Manual Paste", desc: "Paste structured text (no AI)", badge: "Fast", color: "amber" },
    { id: "csv", icon: FileText, label: "Upload CSV", desc: "Upload .csv file with columns", color: "green" },
    { id: "manual", icon: Plus, label: "Add Manually", desc: "Add one question at a time", color: "purple" },
  ];

  return (
    <div className="space-y-5">
      {/* Step 1: Settings */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-blue-900 text-white rounded-full text-xs flex items-center justify-center font-bold">1</span>
          Select Test & Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Target Test *</label>
            <select value={testId} onChange={e => setTestId(parseInt(e.target.value))} className={ic}>
              <option value="">Select test...</option>
              {tests.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
            <a href="/admin/tests/new" className="text-xs text-blue-700 hover:underline mt-1 block">+ Create new test</a>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Subject</label>
            <select value={subjectId} onChange={e => setSubjectId(parseInt(e.target.value))} className={ic}>
              <option value="0">No specific subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Topic</label>
            <select className={ic}>
              <option value="">No specific topic</option>
              {filteredTopics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Language</label>
            <select value={languageId} onChange={e => setLanguageId(parseInt(e.target.value))} className={ic}>
              {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Step 2: Mode */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-blue-900 text-white rounded-full text-xs flex items-center justify-center font-bold">2</span>
          Choose Upload Method
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {modeOptions.map(opt => {
            const Icon = opt.icon;
            const active = mode === opt.id;
            return (
              <button key={opt.id} onClick={() => setMode(opt.id)}
                className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all text-left ${active ? "border-blue-900 bg-blue-50 shadow-sm" : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? "bg-blue-900" : "bg-gray-100"}`}>
                  <Icon className={`w-4 h-4 ${active ? "text-white" : "text-gray-500"}`} />
                </div>
                <div>
                  <div className={`text-sm font-semibold ${active ? "text-blue-900" : "text-gray-800"}`}>{opt.label}</div>
                  <div className="text-xs text-gray-500 leading-relaxed mt-0.5">{opt.desc}</div>
                </div>
                {opt.badge && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${opt.id === "ai" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{opt.badge}</span>}
              </button>
            );
          })}
        </div>

        {/* AI Mode */}
        {mode === "ai" && (
          <div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">AI Smart Import — Paste Anything!</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Paste questions from Google, PDF copy, WhatsApp forwards, any format. GPT auto-extracts questions, options, answers + generates explanations.
                    Works with English, Hindi &amp; Gujarati.
                  </p>
                </div>
              </div>
            </div>
            <textarea
              value={pasteText} onChange={e => setPasteText(e.target.value)} rows={12}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 resize-y"
              placeholder={"Paste your question paper here...\n\nExample:\n1. What is the capital of Gujarat?\nA) Mumbai  B) Gandhinagar  C) Surat  D) Rajkot\nAnswer: B\n\nOR any unstructured format — AI will figure it out!"} />
            <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                {pasteText.length > 0 ? `${pasteText.length} characters pasted` : "Paste any question paper text"}
              </span>
              <button onClick={handleAIImport} disabled={aiLoading || !pasteText.trim()}
                className="bg-blue-900 hover:bg-blue-950 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2">
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {aiLoading ? "AI Processing..." : "Extract with AI"}
              </button>
            </div>
            {aiStatus && (
              <div className={`mt-3 text-sm px-4 py-2.5 rounded-xl ${aiStatus.startsWith("❌") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                {aiStatus}
              </div>
            )}
          </div>
        )}

        {/* Manual Paste Mode */}
        {mode === "paste" && (
          <div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4 text-sm text-amber-800">
              <strong>Format:</strong> Number + question + options A/B/C/D + Answer line
              <pre className="font-mono text-xs mt-1.5 text-amber-700 whitespace-pre-wrap">{"1. Question here\nA) Option A  B) Option B  C) Option C  D) Option D\nAnswer: B"}</pre>
            </div>
            <textarea value={pasteText} onChange={e => setPasteText(e.target.value)} rows={12}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 resize-y"
              placeholder="Paste your questions here..." />
            <div className="flex justify-end mt-3">
              <button onClick={() => {
                const { parsed, errors } = parseManualText(pasteText);
                setParsedQuestions(parsed); setParseErrors(errors);
              }} className="bg-blue-900 hover:bg-blue-950 text-white font-semibold px-6 py-2 rounded-xl text-sm">
                Parse Questions
              </button>
            </div>
          </div>
        )}

        {/* CSV Mode */}
        {mode === "csv" && (
          <div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
              <p className="text-sm font-semibold text-blue-800 mb-1">CSV Column Format:</p>
              <p className="text-xs text-blue-700 font-mono bg-blue-100 px-3 py-2 rounded-lg">
                Question | Option A | Option B | Option C | Option D | Correct (A/B/C/D) | Subject | Topic | Language | Difficulty | Explanation
              </p>
            </div>
            <div onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-blue-300 rounded-xl p-10 text-center cursor-pointer transition-colors group">
              <Upload className="w-8 h-8 text-gray-300 group-hover:text-blue-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Click to upload CSV file</p>
              <p className="text-xs text-gray-400 mt-1">Supports .csv format</p>
            </div>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={async e => {
              const file = e.target.files?.[0]; if (!file) return;
              const text = await file.text();
              const { parsed, errors } = parseCSVText(text);
              setParsedQuestions(parsed); setParseErrors(errors);
            }} />
          </div>
        )}

        {/* Manual Mode */}
        {mode === "manual" && (
          <div className="text-center py-6">
            <button onClick={() => setParsedQuestions(prev => [...prev, {
              _id: Date.now(), question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "A", difficulty: "medium",
            }])} className="bg-blue-900 text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-blue-950 inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add New Question
            </button>
          </div>
        )}
      </div>

      {/* Parse Errors */}
      {parseErrors.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
          <p className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> {parseErrors.length} issues found
          </p>
          {parseErrors.map((err, i) => <p key={i} className="text-xs text-red-600">{err}</p>)}
        </div>
      )}

      {/* Questions Preview + AI Actions */}
      {parsedQuestions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          {/* Header */}
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{parsedQuestions.length} Questions Ready</h3>
                  <p className="text-xs text-gray-500">
                    {selectedForAction.size > 0 ? `${selectedForAction.size} selected` : "Review and edit before saving"}
                  </p>
                </div>
              </div>
              <button onClick={handleSaveAll} disabled={saving || !testId}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving {saved}/{parsedQuestions.length}...</> : `💾 Save All ${parsedQuestions.length} Questions`}
              </button>
            </div>

            {/* AI Action Bar */}
            <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
              <p className="text-xs font-semibold text-purple-700 mb-2 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5" /> AI Actions
                {selectedForAction.size > 0 && <span className="bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded-full">{selectedForAction.size} selected</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                <button onClick={handleGenerateExplanations} disabled={aiLoading}
                  className="flex items-center gap-1.5 text-xs font-medium bg-white border border-purple-200 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50">
                  <BookOpen className="w-3.5 h-3.5" />
                  {selectedForAction.size > 0 ? `Add Explanations (${selectedForAction.size})` : "Add Explanations (missing)"}
                </button>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 flex items-center gap-1"><Languages className="w-3.5 h-3.5" /> Translate to:</span>
                  {[{ code: "en", label: "English" }, { code: "hi", label: "हिंदी" }, { code: "gu", label: "ગુજ" }].map(lang => (
                    <button key={lang.code} onClick={() => handleTranslate(lang.code)} disabled={aiLoading}
                      className="text-xs font-medium bg-white border border-blue-200 text-blue-700 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-colors">
                      {lang.label}
                    </button>
                  ))}
                </div>
                <button onClick={handleQualityCheck} disabled={aiLoading}
                  className="flex items-center gap-1.5 text-xs font-medium bg-white border border-green-200 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50">
                  <ShieldCheck className="w-3.5 h-3.5" /> Quality Check
                </button>
                <button onClick={selectAll}
                  className="flex items-center gap-1.5 text-xs font-medium bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                  {selectedForAction.size === parsedQuestions.length ? "Deselect All" : "Select All"}
                </button>
              </div>
              {aiStatus && (
                <div className={`mt-2 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${aiStatus.startsWith("❌") ? "bg-red-100 text-red-700" : "bg-white text-gray-700"}`}>
                  {aiLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  {aiStatus}
                </div>
              )}
            </div>
          </div>

          {/* Quality Report */}
          {showQuality && qualityReport && (
            <div className="px-5 py-4 bg-amber-50 border-b border-amber-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Quality Report
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${qualityReport.summary?.quality_score >= 80 ? "bg-green-200 text-green-800" : qualityReport.summary?.quality_score >= 60 ? "bg-amber-200 text-amber-800" : "bg-red-200 text-red-800"}`}>
                    Score: {qualityReport.summary?.quality_score}/100
                  </span>
                </p>
                <button onClick={() => setShowQuality(false)} className="text-amber-600 hover:text-amber-800"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex gap-4 text-xs text-amber-700 mb-3">
                <span>✅ Checked: {qualityReport.summary?.total_checked}</span>
                <span>⚠️ Issues: {qualityReport.summary?.issues_found}</span>
                <span>🔁 Duplicates: {qualityReport.summary?.duplicates}</span>
              </div>
              {qualityReport.issues?.slice(0, 5).map((issue: any, i: number) => (
                <div key={i} className={`text-xs px-3 py-1.5 rounded-lg mb-1 flex items-start gap-2 ${issue.severity === "high" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                  <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>[ID:{issue.id}] {issue.type}: {issue.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Questions List */}
          <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
            {parsedQuestions.map((q, idx) => (
              <div key={q._id} className={`${q._hasIssue ? "bg-amber-50/50" : ""}`}>
                <div className="flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}>
                  {/* Checkbox */}
                  <div onClick={e => { e.stopPropagation(); toggleSelect(q._id); }}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${selectedForAction.has(q._id) ? "bg-blue-900 border-blue-900" : "border-gray-300 hover:border-blue-400"}`}>
                    {selectedForAction.has(q._id) && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>

                  <span className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-xs font-bold text-blue-900 shrink-0">{idx + 1}</span>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 line-clamp-1">{q.question_text || <span className="text-gray-400 italic">Empty question</span>}</p>
                    {q._hasIssue && <p className="text-xs text-amber-600 mt-0.5 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{q._issueMsg}</p>}
                    {q._aiGenerated && !q._hasIssue && <p className="text-xs text-blue-500 mt-0.5 flex items-center gap-1"><Sparkles className="w-3 h-3" />AI extracted</p>}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${q.difficulty === "easy" ? "bg-green-100 text-green-700" : q.difficulty === "hard" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {q.difficulty}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Ans: {q.correct_option}</span>
                    {q.explanation && <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">exp</span>}
                    <button onClick={e => { e.stopPropagation(); removeQuestion(q._id); }}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded">
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {expandedIdx === idx ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>

                {/* Expanded Edit */}
                {expandedIdx === idx && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3 bg-gray-50/50">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Question</label>
                      <textarea value={q.question_text} onChange={e => updateQuestion(q._id, "question_text", e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-900 resize-none bg-white" rows={2} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(["a", "b", "c", "d"] as const).map(opt => (
                        <div key={opt}>
                          <label className={`text-xs font-semibold mb-1 block ${q.correct_option === opt.toUpperCase() ? "text-green-700" : "text-gray-500"}`}>
                            Option {opt.toUpperCase()} {q.correct_option === opt.toUpperCase() ? "✓ Correct" : ""}
                          </label>
                          <input value={(q as any)[`option_${opt}`] || ""} onChange={e => updateQuestion(q._id, `option_${opt}`, e.target.value)}
                            className={`w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-900 ${q.correct_option === opt.toUpperCase() ? "border-green-300 bg-green-50" : "border-gray-200 bg-white"}`} />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      <div className="flex-1 min-w-28">
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Correct Answer</label>
                        <select value={q.correct_option} onChange={e => updateQuestion(q._id, "correct_option", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none">
                          {["A", "B", "C", "D"].map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div className="flex-1 min-w-28">
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Difficulty</label>
                        <select value={q.difficulty} onChange={e => updateQuestion(q._id, "difficulty", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none">
                          {["easy", "medium", "hard"].map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 mb-1 block">Explanation</label>
                      <textarea value={q.explanation || ""} onChange={e => updateQuestion(q._id, "explanation", e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-900 resize-none bg-white" rows={2}
                        placeholder="Explanation (auto-generated or manual)" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer Save */}
          <div className="p-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              {parsedQuestions.filter(q => q.explanation).length}/{parsedQuestions.length} have explanations ·
              {parsedQuestions.filter(q => q._hasIssue).length > 0 && <span className="text-amber-600"> {parsedQuestions.filter(q => q._hasIssue).length} with issues</span>}
            </p>
            <button onClick={handleSaveAll} disabled={saving || !testId}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold px-8 py-3 rounded-xl text-sm flex items-center justify-center gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving {saved}/{parsedQuestions.length}...</> : `💾 Save All ${parsedQuestions.length} Questions`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
