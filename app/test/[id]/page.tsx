import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TestAttemptClient from "@/components/exam/TestAttemptClient";

export default async function TestAttemptPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const testId = parseInt(params.id);

  const { data: test } = await supabase
    .from("tests")
    .select("*, exam:exams(name,icon), category:categories(name,type), language:languages(name,code)")
    .eq("id", testId)
    .eq("is_active", true)
    .single();

  if (!test) redirect("/exams");

  const { data: questions } = await supabase
    .from("questions")
    .select("id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, marks, question_order, subject_id, topic_id")
    .eq("test_id", testId)
    .eq("is_active", true)
    .order("question_order", { ascending: true });

  if (!questions || questions.length === 0) redirect("/exams");

  // Check if already attempted and completed
  const { data: existingResult } = await supabase
    .from("results")
    .select("id, is_completed")
    .eq("user_id", user.id)
    .eq("test_id", testId)
    .eq("is_completed", true)
    .single();

  if (existingResult) redirect(`/result/${existingResult.id}`);

  return (
    <TestAttemptClient
      test={test}
      questions={questions}
      userId={user.id}
    />
  );
}
