import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentTests from "@/components/dashboard/RecentTests";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import DailyQuizBanner from "@/components/dashboard/DailyQuizBanner";
import type { Result } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single();

  const { data: results } = await supabase
    .from("results")
    .select("*, test:tests(id, title, total_marks, exam:exams(name, icon), category:categories(name, type))")
    .eq("user_id", user.id)
    .eq("is_completed", true)
    .order("submitted_at", { ascending: false })
    .limit(20);

  const totalTests = results?.length || 0;
  const avgAccuracy = totalTests > 0
    ? Math.round((results || []).reduce((s, r) => s + (r.accuracy || 0), 0) / totalTests)
    : 0;
  const bestScore = totalTests > 0 ? Math.max(...(results || []).map(r => r.accuracy || 0)) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar user={profile} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Hello, {profile?.name?.split(" ")[0] || "Student"} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Track your progress and keep improving</p>
        </div>

        <DailyQuizBanner userId={user.id} />

        <DashboardStats
          totalTests={totalTests}
          avgAccuracy={avgAccuracy}
          bestScore={Math.round(bestScore)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <PerformanceChart results={results as unknown as Result[] || []} />
          </div>
          <div>
            <RecentTests results={results as unknown as Result[] || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
