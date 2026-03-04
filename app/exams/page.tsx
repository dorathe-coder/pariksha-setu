import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TestCard from "@/components/exam/TestCard";
import ExamFilters from "@/components/exam/ExamFilters";
import type { Test } from "@/types/database";

export default async function ExamsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let profile = null;
  if (user) {
    const { data } = await supabase.from("users").select("name, role").eq("id", user.id).single();
    profile = data;
  }

  const cat = searchParams.cat as string | undefined;
  const exam = searchParams.exam as string | undefined;
  const subject = searchParams.subject as string | undefined;
  const free = searchParams.free as string | undefined;

  const [{ data: exams }, { data: categories }, { data: subjects }] = await Promise.all([
    supabase.from("exams").select("*").eq("is_active", true).order("name"),
    supabase.from("categories").select("*").eq("is_active", true),
    supabase.from("subjects").select("*").eq("is_active", true).order("name"),
  ]);

  let query = supabase
    .from("tests")
    .select("*, exam:exams(id,name,icon), category:categories(id,name,type), subject:subjects(id,name), language:languages(id,name,code)")
    .eq("is_active", true)
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .limit(24);

  if (exam) query = query.eq("exam_id", parseInt(exam));
  if (cat) {
    const catObj = (categories || []).find((c) => c.slug === cat || c.type === cat);
    if (catObj) query = query.eq("category_id", catObj.id);
  }
  if (subject) query = query.eq("subject_id", parseInt(subject));
  if (free === "true") query = query.eq("is_free", true);

  const { data: tests } = await query;

  const currentParams: Record<string, string | undefined> = {
    cat,
    exam,
    subject,
    free,
  };

  return (
    <div className="min-h-screen">
      <Navbar user={profile} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">All Tests</h1>
          <p className="text-gray-500 text-sm mt-1">Browse tests by exam, category, subject and more</p>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 shrink-0">
            <ExamFilters
              exams={exams || []}
              categories={categories || []}
              subjects={subjects || []}
              currentParams={currentParams}
            />
          </aside>
          <main className="flex-1">
            {tests && tests.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {(tests as unknown as Test[]).map((test) => (
                  <TestCard key={test.id} test={test} userId={user?.id} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="text-4xl mb-3">📋</div>
                <h3 className="font-semibold text-gray-900 mb-1">No tests found</h3>
                <p className="text-gray-500 text-sm">Try adjusting your filters</p>
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}