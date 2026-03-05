import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import QuestionBankClient from "@/components/admin/QuestionBankClient";

export default async function QuestionBankPage({ searchParams }: { searchParams: { test?: string; page?: string } }) {
  const supabase = await createClient();
  const page = parseInt(searchParams.page || "1");
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  const [{ data: tests }, { data: subjects }] = await Promise.all([
    supabase.from("tests").select("id, title").order("created_at", { ascending: false }),
    supabase.from("subjects").select("id, name").order("name"),
  ]);

  let query = supabase
    .from("questions")
    .select("*, subject:subjects(name), test:tests(title)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (searchParams.test) query = query.eq("test_id", parseInt(searchParams.test));

  const { data: questions, count } = await query;
  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
          <p className="text-gray-500 text-sm mt-0.5">{count?.toLocaleString() || 0} total questions</p>
        </div>
        <Link href="/admin/upload" className="bg-blue-900 text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-blue-950 transition-colors">
          + Upload More
        </Link>
      </div>
      <QuestionBankClient questions={questions || []} tests={tests || []} subjects={subjects || []} currentTest={searchParams.test} page={page} totalPages={totalPages} />
    </div>
  );
}
