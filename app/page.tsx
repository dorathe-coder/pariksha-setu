import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { createClient } from '@/lib/supabase/server';
import { BookOpen, Clock, Users, TrendingUp, CheckCircle, Star, Zap, Shield } from 'lucide-react';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let profile = null;
  if (user) {
    const { data } = await supabase.from('users').select('name, role').eq('id', user.id).single();
    profile = data;
  }

  const { count: testCount } = await supabase.from('tests').select('*', { count: 'exact', head: true }).eq('is_active', true);
  const { count: questionCount } = await supabase.from('questions').select('*', { count: 'exact', head: true });
  const { count: studentCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student');

  const { data: featuredTests } = await supabase
    .from('tests')
    .select('id, title, total_questions, timer_minutes, attempt_count, is_free, negative_marking, marks_per_question, exam:exams(name,icon), category:categories(name,type)')
    .eq('is_active', true)
    .eq('is_free', true)
    .order('attempt_count', { ascending: false })
    .limit(6);

  const examCategories = [
    { name: 'GPSC Class 1-2', slug: 'gpsc-class-1-2', icon: '🏛️', color: 'from-blue-500 to-blue-700', desc: 'Class 1 & 2' },
    { name: 'Talati', slug: 'talati', icon: '📋', color: 'from-amber-500 to-orange-600', desc: 'Village Level' },
    { name: 'Bin Sachivalay', slug: 'bin-sachivalay', icon: '📝', color: 'from-purple-500 to-purple-700', desc: 'Clerk Posts' },
    { name: 'GSSSB', slug: 'gsssb', icon: '🏢', color: 'from-green-500 to-emerald-600', desc: 'Board Exams' },
    { name: 'Gujarat Police', slug: 'gujarat-police', icon: '👮', color: 'from-red-500 to-red-700', desc: 'Constable' },
    { name: 'Revenue Talati', slug: 'revenue-talati', icon: '📑', color: 'from-teal-500 to-cyan-600', desc: 'Revenue Dept' },
    { name: 'SSC CGL', slug: 'ssc-cgl', icon: '📚', color: 'from-indigo-500 to-indigo-700', desc: 'Central Exam' },
    { name: 'Railway RRB', slug: 'railway-rrb', icon: '🚂', color: 'from-rose-500 to-pink-600', desc: 'Railway Jobs' },
  ];

  const features = [
    { icon: Zap, title: 'AI-Powered Questions', desc: 'Questions with AI-generated explanations in English, Hindi & Gujarati', color: 'text-purple-600 bg-purple-50' },
    { icon: Shield, title: 'Negative Marking', desc: 'Real exam simulation with accurate negative marking support', color: 'text-red-600 bg-red-50' },
    { icon: TrendingUp, title: 'Performance Analytics', desc: 'Detailed analysis of your strong and weak areas after every test', color: 'text-green-600 bg-green-50' },
    { icon: Clock, title: 'Timed Practice', desc: 'Practice under exam conditions with auto-submit timer', color: 'text-blue-600 bg-blue-50' },
    { icon: BookOpen, title: 'Previous Year Papers', desc: 'All previous year question papers with answer keys', color: 'text-amber-600 bg-amber-50' },
    { icon: Star, title: 'Daily Quiz', desc: 'Free daily quiz to keep your preparation consistent', color: 'text-pink-600 bg-pink-50' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={profile} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Gujarat No. 1 Exam Platform</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-5">
              Crack Your<br />
              <span className="text-amber-400">Government Exam</span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-200 mb-8 max-w-2xl mx-auto leading-relaxed">
              AI-powered practice tests for GPSC, Talati, Bin Sachivalay, GSSSB & 10+ Gujarat government exams.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
              <Link href="/exams" className="bg-amber-500 hover:bg-amber-400 text-white font-bold px-8 py-3.5 rounded-xl transition-all text-base shadow-lg hover:shadow-amber-500/30">
                Start Practicing Free →
              </Link>
              <Link href="/exams?cat=daily-quiz" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl transition-all text-base">
                Today's Free Quiz
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-8 text-center">
              {[
                { value: `${testCount || 0}+`, label: "Tests Available" },
                { value: `${questionCount ? Math.floor(questionCount / 1000) + "K+" : "0"}`, label: "Questions" },
                { value: `${studentCount || 0}+`, label: "Students" },
              ].map(s => (
                <div key={s.label} className="text-white">
                  <div className="text-3xl font-black text-amber-400">{s.value}</div>
                  <div className="text-sm text-blue-200 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Exam Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900">Choose Your Exam</h2>
            <p className="text-gray-500 mt-2">Practice tests for all major Gujarat government exams</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {examCategories.map(exam => (
              <Link key={exam.slug} href={`/exams?exam=${exam.slug}`}
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all text-center bg-white hover:-translate-y-0.5">
                <div className={`w-12 h-12 bg-gradient-to-br ${exam.color} rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover:shadow-md transition-shadow`}>
                  {exam.icon}
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-800 leading-tight">{exam.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{exam.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900">Why ParikshaSetu?</h2>
            <p className="text-gray-500 mt-2">Built specifically for Gujarat government exam preparation</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tests */}
      {featuredTests && featuredTests.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-gray-900">Free Practice Tests</h2>
                <p className="text-gray-500 mt-1">Most popular tests this week</p>
              </div>
              <Link href="/exams" className="text-sm font-semibold text-blue-900 hover:underline">View all →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredTests.map((test: any) => (
                <div key={test.id} className="bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all group overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Free</span>
                      {test.exam && <span className="text-xs text-gray-500">{test.exam.icon} {test.exam.name}</span>}
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm leading-snug mb-3 group-hover:text-blue-900 transition-colors line-clamp-2">{test.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{test.total_questions} Qs</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{test.timer_minutes}m</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{test.attempt_count}</span>
                    </div>
                    {test.negative_marking > 0 && <p className="text-xs text-red-500 mt-1.5">⚠️ Negative marking: -{test.negative_marking}</p>}
                  </div>
                  <div className="px-5 pb-4">
                    {user ? (
                      <Link href={`/test/${test.id}`} className="block w-full bg-blue-900 hover:bg-blue-950 text-white text-sm font-bold py-2.5 rounded-xl text-center transition-colors">
                        Start Test
                      </Link>
                    ) : (
                      <Link href="/auth/login" className="block w-full border-2 border-blue-900 text-blue-900 hover:bg-blue-50 text-sm font-bold py-2.5 rounded-xl text-center transition-colors">
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
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Ready to Start Preparing?</h2>
          <p className="text-blue-200 text-lg mb-8">Join thousands of students who are already preparing smarter with AI-powered tests.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register" className="bg-amber-500 hover:bg-amber-400 text-white font-bold px-10 py-4 rounded-xl transition-all text-base shadow-lg">
              Create Free Account →
            </Link>
            <Link href="/exams" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-10 py-4 rounded-xl transition-all text-base">
              Browse Tests
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
