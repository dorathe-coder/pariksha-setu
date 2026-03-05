import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import ResultSummary from "@/components/result/ResultSummary";
import ResultAnalysis from "@/components/result/ResultAnalysis";
import ResultQuestions from "@/components/result/ResultQuestions";
import type { Result, ResultDetail } from "@/types/database";

export default async function ResultPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const resultId = parseInt(params.id);

  const { data: result } = await supabase
    .from("results")
    .select("*, test:tests(*, exam:exams(name,icon,slug), category:categories(name,type))")
    .eq("id", resultId)
    .eq("user_id", user.id)
    .single();

  if (!result) redirect("/dashboard");

  const { data: details } = await supabase
    .from("result_details")
    .select("*, question:questions(*, subject:subjects(name), topic:topics(name))")
    .eq("result_id", resultId)
    .order("id");

  const { data: profile } = await supabase.from("users").select("name, role").eq("id", user.id).single();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={profile} />
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <ResultSummary result={result as unknown as Result} />
        <ResultAnalysis details={details as unknown as ResultDetail[] || []} />
        <ResultQuestions details={details as unknown as ResultDetail[] || []} testId={result.test_id} userId={user.id} />
      </div>
    </div>
  );
}
