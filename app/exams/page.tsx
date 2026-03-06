import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TestCard from "@/components/exam/TestCard";
import type { Test } from "@/types/database";
import { Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";

export default async function ExamsPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let profile = null;
  if (user) {
    const { data } = await supabase.from("users").select("name, role").eq("id", user.id).single();
    profile = data;
  }

  const { q, cat, exam: examParam, subject, free } = searchParams;

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
    .limit(48);

  if (q) query = query.ilike("title", `%${q}%`);
  if (examParam) query = query.eq("exam_id", parseInt(examParam));
  if (cat) {
    const catObj = (categories || []).find(c => c.slug === cat || c.type === cat);
    if (catObj) query = query.eq("category_id", catObj.id);
  }
  if (subject) query = query.eq("subject_id", parseInt(subject));
  if (free === "true") query = query.eq("is_free", true);

  const { data: tests } = await query;
  const hasFilters = !!(q || cat || examParam || subject || free);

  const categoryTabs = [
    { label: "All", value: null },
    { label: "Mock Test", value: "mock-test" },
    { label: "Previous Year", value: "previous-year" },
    { label: "Topic Wise", value: "topic-wise" },
    { label: "Daily Quiz", value: "daily-quiz" },
    { label: "Mini Test", value: "mini-test" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar user={profile} />

      {/* Header + Search */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-4">All Tests</h1>
          <form method="GET" className="flex gap-2">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input name="q" type="text" defaultValue={q || ""} placeholder="Search tests by name, exam..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:border-green-500 focus:bg-white dark:focus:bg-gray-700 transition-all" />
              {q && (
                <Link href="/exams" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </Link>
              )}
            </div>
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">Search</button>
            {hasFilters && (
              <Link href="/exams" className="border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 px-4 py-2.5 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1.5">
                <X className="w-3.5 h-3.5" /> Clear
              </Link>
            )}
          </form>

          {/* Category Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
            {categoryTabs.map(tab => (
              <Link key={tab.label}
                href={tab.value ? `/exams?cat=${tab.value}${examParam ? `&exam=${examParam}` : ""}` : `/exams${examParam ? `?exam=${examParam}` : ""}`}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  cat === tab.value || (!cat && !tab.value)
                    ? "bg-green-600 text-white shadow-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}>
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="lg:w-56 shrink-0">
          <div className="card bg-white dark:bg-gray-900 p-5 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-green-600" /> Filters
              </h3>
              {hasFilters && <Link href="/exams" className="text-xs text-green-600 hover:underline">Clear all</Link>}
            </div>

            {/* Exam Filter */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Exam</label>
              <div className="space-y-0.5 max-h-48 overflow-y-auto">
                <Link href={`/exams${cat ? `?cat=${cat}` : ""}${q ? `${cat ? "&" : "?"}q=${q}` : ""}`}
                  className={`flex items-center w-full px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${!examParam ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}>
                  All Exams
                </Link>
                {exams?.map(ex => {
                  const url = new URLSearchParams({ ...(cat && { cat }), ...(q && { q }), exam: String(ex.id) });
                  return (
                    <Link key={ex.id} href={`/exams?${url}`}
                      className={`flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${examParam === String(ex.id) ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}>
                      <span>{ex.icon}</span> {ex.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Subject Filter */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Subject</label>
              <div className="space-y-0.5 max-h-48 overflow-y-auto">
                <Link href={(() => { const p = new URLSearchParams({...(cat&&{cat}),...(examParam&&{exam:examParam}),...(q&&{q})}); return `/exams?${p}`; })()}
                  className={`flex items-center w-full px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${!subject ? "bg-green-50 dark:bg-green-950 text-green-700" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}>All Subjects</Link>
                {subjects?.map(s => {
                  const p = new URLSearchParams({...(cat&&{cat}),...(examParam&&{exam:examParam}),...(q&&{q}),subject:String(s.id)});
                  return <Link key={s.id} href={`/exams?${p}`}
                    className={`flex items-center w-full px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${subject===String(s.id) ? "bg-green-50 dark:bg-green-950 text-green-700" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}>{s.name}</Link>;
                })}
              </div>
            </div>

            {/* Free/Paid */}
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Price</label>
              <div className="flex gap-2">
                {[{ label: "Free", val: "true" }, { label: "Paid", val: "false" }].map(p => {
                  const url = new URLSearchParams({ ...(cat && { cat }), ...(examParam && { exam: examParam }), ...(q && { q }), ...(free !== p.val && { free: p.val }) });
                  return (
                    <Link key={p.val} href={`/exams?${url}`}
                      className={`flex-1 text-center py-1.5 rounded-lg text-xs font-semibold transition-colors ${free === p.val ? (p.val === "true" ? "bg-green-600 text-white" : "bg-amber-500 text-white") : "border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}>
                      {p.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Tests Grid */}
        <main className="flex-1">
          {q && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {tests?.length || 0} results for <strong className="text-gray-900 dark:text-white">"{q}"</strong>
            </p>
          )}
          {tests && tests.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
              {(tests as unknown as Test[]).map(test => (
                <TestCard key={test.id} test={test} userId={user?.id} />
              ))}
            </div>
          ) : (
            <div className="card bg-white dark:bg-gray-900 text-center py-16 px-4">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">No tests found</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Try different filters or search terms</p>
              <Link href="/exams" className="text-green-600 hover:underline text-sm font-semibold">Clear all filters</Link>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}
