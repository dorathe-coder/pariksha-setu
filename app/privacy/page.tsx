import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";

export default async function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6 text-gray-600 leading-relaxed text-sm">
          <p>Last updated: January 2024</p>
          <h2 className="text-lg font-bold text-gray-900">1. Information We Collect</h2>
          <p>We collect your name, email address, and performance data (test scores, accuracy, time taken) when you register and use the platform.</p>
          <h2 className="text-lg font-bold text-gray-900">2. How We Use Your Data</h2>
          <p>Your data is used to provide personalized test results, analytics, and to improve the platform. We never sell your data to third parties.</p>
          <h2 className="text-lg font-bold text-gray-900">3. Data Storage</h2>
          <p>All data is stored securely on Supabase servers with row-level security. Your password is hashed and never stored in plain text.</p>
          <h2 className="text-lg font-bold text-gray-900">4. Your Rights</h2>
          <p>You can request deletion of your account and all associated data at any time by contacting us at support@parikhasetu.in</p>
          <h2 className="text-lg font-bold text-gray-900">5. Cookies</h2>
          <p>We use authentication cookies necessary for login functionality only. No tracking or advertising cookies are used.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
