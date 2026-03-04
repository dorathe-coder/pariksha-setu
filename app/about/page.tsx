import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";

export default async function AboutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let profile = null;
  if (user) {
    const { data } = await supabase.from("users").select("name, role").eq("id", user.id).single();
    profile = data;
  }
  return (
    <div className="min-h-screen">
      <Navbar user={profile} />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About ParikshaSetu</h1>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-5 text-gray-600 leading-relaxed">
          <p>
            <strong className="text-gray-900">ParikshaSetu</strong> (પરીક્ષા સેતુ — Bridge to Exam Success) is Gujarat&apos;s dedicated competitive exam preparation platform.
          </p>
          <p>
            We provide high-quality practice tests, mock exams, and previous year question papers for all major Gujarat government exams including GPSC, Talati, Revenue Talati, Bin Sachivalay Clerk, GSSSB, and Gujarat Police.
          </p>
          <p>
            Our platform also covers central government exams like SSC, Railway (RRB), and Banking (IBPS, SBI) for a comprehensive preparation experience.
          </p>
          <h2 className="text-xl font-bold text-gray-900 pt-2">Our Mission</h2>
          <p>
            To make quality exam preparation accessible to every student in Gujarat — regardless of their location or financial condition. Our daily free quiz, free mock tests, and detailed result analytics ensure every aspirant can measure and improve their preparation.
          </p>
          <h2 className="text-xl font-bold text-gray-900 pt-2">Key Features</h2>
          <ul className="list-disc list-inside space-y-1.5 text-sm">
            <li>200+ question uploads in under 5 minutes by admin</li>
            <li>Auto-generated result with topic-wise analysis</li>
            <li>Tests available in Gujarati, English, and Hindi</li>
            <li>Daily free quiz — 10 new questions every day</li>
            <li>Previous year papers for all major Gujarat exams</li>
            <li>Rank among all students who attempted the same test</li>
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
}
