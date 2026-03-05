import { createClient } from "@/lib/supabase/server";
import AIImportClient from "@/components/admin/AIImportClient";

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upload Questions</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            AI-powered import — paste any question paper and GPT extracts everything automatically
          </p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
          <span className="text-lg">✨</span>
          <span className="text-xs font-semibold text-blue-700">GPT-4 Powered</span>
        </div>
      </div>
      <AIImportClient
        tests={tests || []}
        subjects={subjects || []}
        topics={topics || []}
        languages={languages || []}
        defaultTestId={searchParams.test ? parseInt(searchParams.test) : undefined}
      />
    </div>
  );
}
