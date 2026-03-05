import { createClient } from "@/lib/supabase/server";
import TestForm from "@/components/admin/TestForm";

export default async function NewTestPage() {
  const supabase = await createClient();
  const [{ data: exams }, { data: categories }, { data: subjects }, { data: topics }, { data: languages }] = await Promise.all([
    supabase.from("exams").select("id, name, icon").eq("is_active", true).order("name"),
    supabase.from("categories").select("id, name, type").eq("is_active", true),
    supabase.from("subjects").select("id, name").eq("is_active", true).order("name"),
    supabase.from("topics").select("id, name, subject_id").eq("is_active", true),
    supabase.from("languages").select("id, name, code"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Test</h1>
      <TestForm exams={exams || []} categories={categories || []} subjects={subjects || []} topics={topics || []} languages={languages || []} />
    </div>
  );
}
