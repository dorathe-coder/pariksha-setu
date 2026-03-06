import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { BookOpen, Clock, Users, TrendingUp, CheckCircle, Zap, Shield, Target, ArrowRight, Star } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let profile = null;
  if (user) {
    const { data } = await supabase.from("users").select("name, role").eq("id", user.id).single();
    profile = data;
  }

  const { count: testCount } = await supabase.from("tests").select("*", { count: "exact", head: true }).eq("is_active", true);
  const { count: questionCount } = await supabase.from("questions").select("*", { count: "exact", head: true });
  const { count: studentCount } = await supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "student");

  const { data: featuredTests } = await supabase
    .from("tests")
    .select("id,title,total_questions,timer_minutes,attempt_count,is_free,negative_marking,marks_per_question,exam:exams(name,icon),category:categories(name,type)")
    .eq("is_active", true)
    .eq("is_free", true)
    .order("attempt_count", { ascending: false })
    .limit(6);

  const examCategories = [
    { name: "GPSC Class 1-2", slug: "gpsc-class-1-2", icon: "🏛️", bg: "bg-blue-50 dark:bg-blue-950", border: "border-blue-100 dark:border-blue-900", iconBg: "bg-blue-100 dark:bg-blue-900" },
    { name: "Talati", slug: "talati", icon: "📋", bg: "bg-amber-50 dark:bg-amber-950", border: "border-amber-100 dark:border-amber-900", iconBg: "bg-amber-100 dark:bg-amber-900" },
    { name: "Bin Sachivalay", slug: "bin-sachivalay", icon: "📝", bg: "bg-purple-50 dark:bg-purple-950", border: "border-purple-100 dark:border-purple-900", iconBg: "bg-purple-100 dark:bg-purple-900" },
    { name: "GSSSB", slug: "gsssb", icon: "🏢", bg: "bg-green-50 dark:bg-green-950", border: "border-green-100 dark:border-green-900", iconBg: "bg-green-100 dark:bg-green-900" },
    { name: "Gujarat Police", slug: "gujarat-police", icon: "👮", bg: "bg-red-50 dark:bg-red-950", border: "border-red-100 dark:border-red-900", iconBg: "bg-red-100 dark:bg-red-900" },
    { name: "Revenue Talati", slug: "revenue-talati", icon: "📑", bg: "bg-teal-50 dark:bg-teal-950", border: "border-teal-100 dark:border-teal-900", iconBg: "bg-teal-100 dark:bg-teal-900" },
    { name: "SSC CGL", slug: "ssc-cgl", icon: "📚", bg: "bg-indigo-50 dark:bg-indigo-950", border: "border-indigo-100 dark:border-indigo-900", iconBg: "bg-indigo-100 dark:bg-indigo-900" },
    { name: "Railway RRB", slug: "railway-rrb", icon: "🚂", bg: "bg-rose-50 dark:bg-rose-950", border: "border-rose-100 dark:border-rose-900", iconBg: "bg-rose-100 dark:bg-rose-900" },
  ];

  const features = [
    { icon: Zap, title: "AI-Powered Import", desc: "Paste any text — AI extracts questions automatically", color: "text-purple-600 bg-purple-50 dark:bg-purple-950" },
    { icon: Shield, title: "Negative Marking", desc: "Real exam simulation with accurate marking", color: "text-red-600 bg-red-50 dark:bg-red-950" },
    { icon: TrendingUp, title: "Performance Analytics", desc: "Detailed subject-wise analysis after every test", color: "text-green-600 bg-green-50 dark:bg-green-950" },
    { icon: Clock, title: "Timed Practice", desc: "Auto-submit timer just like real exams", color: "text-blue-600 bg-blue-50 dark:bg-blue-950" },
    { icon: BookOpen, title: "Previous Year Papers", desc: "All past papers with detailed answer keys", color: "text-amber-600 bg-amber-50 dark:bg-amber-950" },
    { icon: Target, title: "Topic-wise Tests", desc: "Focus on your weak areas with targeted practice", color: "text-pink-600 bg-pink-50 dark:bg-pink-950" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar user={profile} />

      {/* HERO */}
      <section className="relative bg-white dark:bg-gray-950 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-50 dark:bg-green-950/30 rounded-full blur-3xl opacity-60 translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50 dark:bg-blue-950/30 rounded-full blur-3xl opacity-40 -translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-full px-4 py-1.5 mb-6 slide-up">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wider">Gujarat No. 1 Exam Platform</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-tight mb-5 slide-up" style={{animationDelay:"0.1s"}}>
              Crack Your<br />
              <span className="text-green-600 dark:text-green-400">Government Exam</span>
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-xl leading-relaxed slide-up" style={{animationDelay:"0.15s"}}>
              Smart practice tests for GPSC, Talati, Bin Sachivalay, GSSSB & 10+ Gujarat government exams. Free to start.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-12 slide-up" style={{animationDelay:"0.2s"}}>
              <Link href="/exams"
                className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-xl transition-all hover:shadow-xl hover:shadow-green-500/25 active:scale-95 text-base">
                Start Practicing Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/exams?cat=daily-quiz"
                className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-green-500 hover:text-green-600 font-semibold px-8 py-4 rounded-xl transition-all text-base bg-white dark:bg-gray-900">
                Today's Free Quiz
              </Link>
            </div>
            <div className="flex flex-wrap gap-8 slide-up" style={{animationDelay:"0.25s"}}>
              {[
                { value: `${testCount || 0}+`, label: "Tests" },
                { value: `${questionCount ? (questionCount >= 1000 ? Math.floor(questionCount/1000)+"K+" : questionCount+"+") : "0"}`, label: "Questions" },
                { value: `${studentCount || 0}+`, label: "Students" },
              ].map(s => (
                <div key={s.label}>
                  <div className="text-2xl font-black text-green-600 dark:text-green-400">{s.value}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EXAM CATEGORIES */}
      <section className="py-14 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">Choose Your Exam</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">All major Gujarat government exams</p>
            </div>
            <Link href="/exams" className="text-sm font-semibold text-green-600 hover:underline flex items-center gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 stagger">
            {examCategories.map(exam => (
              <Link key={exam.slug} href={`/exams?exam=${exam.slug}`}
                className={`group flex flex-col items-center gap-2.5 p-4 rounded-2xl border ${exam.bg} ${exam.border} hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-center`}>
                <div className={`w-12 h-12 ${exam.iconBg} rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200`}>
                  {exam.icon}
                </div>
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">{exam.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-14 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">Why ParikshaSetu?</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Built for serious Gujarat exam aspirants</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {features.map(f => (
              <div key={f.title} className="card card-hover p-6 bg-white dark:bg-gray-900">
                <div className={`w-11 h-11 ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED FREE TESTS */}
      {featuredTests && featuredTests.length > 0 && (
        <section className="py-14 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">Popular Free Tests</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Start practicing for free right now</p>
              </div>
              <Link href="/exams?free=true" className="text-sm font-semibold text-green-600 hover:underline flex items-center gap-1">View all <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
              {(featuredTests as any[]).map(test => (
                <div key={test.id} className="card card-hover bg-white dark:bg-gray-900 overflow-hidden group">
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="badge bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400">Free</span>
                      {test.exam && <span className="text-xs text-gray-500 dark:text-gray-400">{test.exam.icon} {test.exam.name}</span>}
                      {test.negative_marking > 0 && <span className="badge bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400">-{test.negative_marking}</span>}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug mb-3 group-hover:text-green-600 transition-colors line-clamp-2">{test.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{test.total_questions} Qs</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{test.timer_minutes}m</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{test.attempt_count}</span>
                    </div>
                  </div>
                  <div className="px-5 pb-4">
                    {user ? (
                      <Link href={`/test/${test.id}`}
                        className="block w-full bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-2.5 rounded-xl text-center transition-all hover:shadow-lg hover:shadow-green-500/25 active:scale-95">
                        Start Test
                      </Link>
                    ) : (
                      <Link href="/auth/login"
                        className="block w-full border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 text-sm font-bold py-2.5 rounded-xl text-center transition-colors">
                        Login to Start
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-green-600 dark:bg-green-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='2'/%3E%3C/g%3E%3C/svg%3E\")"}} />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Ready to Start?</h2>
          <p className="text-green-100 text-lg mb-8">Join thousands of students preparing smarter. Free forever.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-green-700 font-bold px-10 py-4 rounded-xl transition-all hover:shadow-xl text-base active:scale-95">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/exams"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-10 py-4 rounded-xl transition-all text-base">
              Browse Tests
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
