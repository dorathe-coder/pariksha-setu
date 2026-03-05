import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { Zap, CheckCircle, Lock } from "lucide-react";

export default async function DailyQuizPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("users").select("name, role").eq("id", user.id).single();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: attempt } = await supabase
    .from("daily_quiz_attempts")
    .select("*, test:tests(id, title, total_questions)")
    .eq("user_id", user.id)
    .eq("quiz_date", today)
    .single();

  // Find daily quiz test for today (category type = daily_quiz, active)
  const { data: todayTest } = await supabase
    .from("tests")
    .select("id, title, total_questions, timer_minutes")
    .eq("is_active", true)
    .in("category_id", 
      (await supabase.from("categories").select("id").eq("type", "daily_quiz")).data?.map(c => c.id) || []
    )
    .limit(1)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={profile} />
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Zap className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Quiz</h1>
        <p className="text-gray-500 mb-8">10 fresh questions every day. Track your daily streak.</p>

        {attempt?.completed ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
            <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-green-800 mb-1">Today Done!</h2>
            <p className="text-green-700 text-sm mb-4">You have completed today's daily quiz. Come back tomorrow!</p>
            <Link href="/dashboard" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-xl inline-block transition-colors text-sm">
              View Dashboard
            </Link>
          </div>
        ) : todayTest ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">{todayTest.title}</h2>
            <p className="text-sm text-gray-500 mb-5">{todayTest.total_questions} questions · {todayTest.timer_minutes} minutes · Free</p>
            <Link href={`/test/${todayTest.id}`}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-3 rounded-xl transition-colors inline-block">
              Start Today's Quiz
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-gray-500 text-sm">No daily quiz available today. Check back soon!</p>
            <Link href="/exams" className="text-blue-900 hover:underline text-sm mt-2 block">Browse other tests</Link>
          </div>
        )}
      </div>
    </div>
  );
}
