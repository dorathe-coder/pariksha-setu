import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import TestForm from "@/components/admin/TestForm";
import { ChevronLeft } from "lucide-react";

export default async function EditTestPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const testId = parseInt(params.id);

  const [{ data: test }, { data: exams }, { data: categories }, { data: subjects }, { data: topics }, { data: languages }] = await Promise.all([
    supabase.from("tests").select("*").eq("id", testId).single(),
    supabase.from("exams").select("id, name, icon, category").eq("is_active", true).order("name"),
    supabase.from("categories").select("id, name, type").eq("is_active", true).order("name"),
    supabase.from("subjects").select("id, name").eq("is_active", true).order("name"),
    supabase.from("topics").select("id, name, subject_id").eq("is_active", true).order("name"),
    supabase.from("languages").select("id, name, code"),
  ]);

  if (!test) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/tests" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Tests
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900">Edit Test</h1>
      </div>
      <TestForm
        exams={exams || []}
        categories={categories || []}
        subjects={subjects || []}
        topics={topics || []}
        languages={languages || []}
        testId={testId}
        defaultValues={test}
      />
    </div>
  );
}
