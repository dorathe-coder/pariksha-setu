import { createClient } from "@/lib/supabase/server";
import BulkUploadClient from "@/components/admin/BulkUploadClient";

export default async function UploadPage({ searchParams }: { searchParams: { test?: string } }) {
  const supabase = await createClient();
  const [{ data: tests }, { data: subjects }, { data: topics }, { data: languages }] = await Promise.all([
    supabase.from("tests").select("id, title").eq("is_active", true).order("created_at", { ascending: false }),
    supabase.from("subjects").select("id, name").eq("is_active", true).order("name"),
    supabase.from("topics").select("id, name, subject_id").eq("is_active", true).order("name"),
    supabase.from("languages").select("id, name, code"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Bulk Upload Questions</h1>
      <p className="text-gray-500 text-sm mb-6">Upload 200+ questions in 2-4 minutes via CSV, Excel, or copy-paste</p>
      <BulkUploadClient
        tests={tests || []}
        subjects={subjects || []}
        topics={topics || []}
        languages={languages || []}
        defaultTestId={searchParams.test ? parseInt(searchParams.test) : undefined}
      />
    </div>
  );
}
