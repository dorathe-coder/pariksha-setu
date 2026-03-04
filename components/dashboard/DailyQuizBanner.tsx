import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Zap, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default async function DailyQuizBanner({ userId }: { userId: string }) {
  const supabase = await createClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: attempt } = await supabase
    .from("daily_quiz_attempts")
    .select("completed")
    .eq("user_id", userId)
    .eq("quiz_date", today)
    .single();

  const completed = attempt?.completed || false;

  return (
    <div className={`rounded-2xl p-4 mb-6 flex items-center justify-between gap-4 ${completed ? "bg-green-50 border border-green-100" : "bg-amber-50 border border-amber-100"}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${completed ? "bg-green-100" : "bg-amber-100"}`}>
          {completed ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Zap className="w-5 h-5 text-amber-600" />}
        </div>
        <div>
          <p className={`font-semibold text-sm ${completed ? "text-green-800" : "text-amber-800"}`}>
            {completed ? "Daily Quiz Completed!" : "Daily Quiz Available"}
          </p>
          <p className={`text-xs ${completed ? "text-green-600" : "text-amber-600"}`}>
            {completed ? "Come back tomorrow for new questions" : "10 free questions — starts fresh every day"}
          </p>
        </div>
      </div>
      {!completed && (
        <Link href="/exams?cat=daily-quiz" className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors shrink-0">
          Start Now
        </Link>
      )}
    </div>
  );
}
