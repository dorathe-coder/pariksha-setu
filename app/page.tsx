import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { createClient } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let profile = null;
  if (user) {
    const { data } = await supabase.from('users').select('name, role').eq('id', user.id).single();
    profile = data;
  }
  const guExams = [
    { name: 'GPSC Class 1-2', slug: 'gpsc-class-1-2', icon: '🏛', color: 'bg-blue-50 border-blue-100' },
    { name: 'Talati', slug: 'talati', icon: '📋', color: 'bg-amber-50 border-amber-100' },
    { name: 'Revenue Talati', slug: 'revenue-talati', icon: '📋', color: 'bg-green-50 border-green-100' },
    { name: 'Bin Sachivalay', slug: 'bin-sachivalay', icon: '📝', color: 'bg-purple-50 border-purple-100' },
    { name: 'GSSSB', slug: 'gsssb', icon: '🏢', color: 'bg-pink-50 border-pink-100' },
    { name: 'Gujarat Police', slug: 'gujarat-police', icon: '👮', color: 'bg-red-50 border-red-100' },
  ];
  return (
    <div className='min-h-screen'>
      <Navbar user={profile} />
      <section className='bg-white border-b border-gray-100'>
        <div className='max-w-7xl mx-auto px-4 py-16 lg:py-24 text-center'>
          <p className='text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 inline-block mb-6 uppercase tracking-wide'>
            Gujarat Best Exam Platform
          </p>
          <h1 className='text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4'>
            Crack Your <span className='text-blue-900'>Government Exam</span> with Smart Practice
          </h1>
          <p className='text-lg text-gray-500 mb-8 max-w-2xl mx-auto'>
            Practice for GPSC, Talati, Bin Sachivalay, GSSSB, Police and 10+ Gujarat exams.
          </p>
          <div className='flex flex-col sm:flex-row gap-3 justify-center'>
            <Link href='/exams' className='bg-blue-900 hover:bg-blue-950 text-white font-semibold px-8 py-3 rounded-xl transition-colors'>Browse All Tests</Link>
            <Link href='/exams?cat=daily-quiz' className='border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold px-8 py-3 rounded-xl transition-colors'>Daily Free Quiz</Link>
          </div>
        </div>
      </section>
      <section className='py-16 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-8'>Gujarat State Exams</h2>
          <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4'>
            {guExams.map(exam => (
              <Link key={exam.slug} href={'/exams/' + exam.slug} className={exam.color + ' border rounded-2xl p-4 text-center hover:shadow-md transition-all'}>
                <div className='text-3xl mb-2'>{exam.icon}</div>
                <div className='text-sm font-semibold text-gray-800'>{exam.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className='py-16 bg-blue-900'>
        <div className='max-w-7xl mx-auto px-4 text-center'>
          <h2 className='text-3xl font-bold text-white mb-3'>Start Preparing Today</h2>
          <p className='text-blue-200 mb-8'>No credit card. No hidden fees. Start free.</p>
          <Link href='/auth/register' className='bg-amber-500 hover:bg-amber-400 text-white font-bold px-10 py-3.5 rounded-xl transition-colors inline-block'>
            Create Free Account
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}