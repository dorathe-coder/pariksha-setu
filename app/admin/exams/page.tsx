import { createClient } from "@/lib/supabase/server";
import ExamManagerClient from "@/components/admin/ExamManagerClient";

export default async function AdminExamsPage() {
  const supabase = await createClient();
  const [{ data: exams }, { data: categories }, { data: subjects }, { data: topics }] = await Promise.all([
    supabase.from("exams").select("*").order("category, name"),
    supabase.from("categories").select("*").order("name"),
    supabase.from("subjects").select("*").order("name"),
    supabase.from("topics").select("*, subject:subjects(name)").order("name"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Exams, Categories & Subjects</h1>
      <ExamManagerClient exams={exams || []} categories={categories || []} subjects={subjects || []} topics={topics || []} />
    </div>
  );
}
