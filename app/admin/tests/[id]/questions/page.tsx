import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import TestQuestionsEditor from "@/components/admin/TestQuestionsEditor";

export default async function TestQuestionsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const testId = parseInt(params.id);

  const { data: test } = await supabase
    .from("tests")
    .select("*, exam:exams(name,icon), category:categories(name)")
    .eq("id", testId)
    .single();

  if (!test) notFound();

  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("test_id", testId)
    .order("question_order", { ascending: true });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/tests" className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <ChevronLeft className="w-4 h-4" /> Tests
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{(test.exam as any)?.icon} {test.title}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{questions?.length || 0} questions · {test.timer_minutes}min · +{test.marks_per_question}{test.negative_marking > 0 ? `/-${test.negative_marking}` : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/tests/${testId}/edit`}
            className="border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Edit Test Info
          </Link>
          <Link href={`/admin/upload?test=${testId}`}
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add Questions
          </Link>
        </div>
      </div>

      <TestQuestionsEditor testId={testId} initialQuestions={questions || []} marksPerQuestion={test.marks_per_question || 1} />
    </div>
  );
}
