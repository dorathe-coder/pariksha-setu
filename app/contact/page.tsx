import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { Mail, Phone, MapPin } from "lucide-react";

export default async function ContactPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
        <p className="text-gray-500 mb-8">Questions, suggestions, or issues? We are here to help.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Get in Touch</h2>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-blue-900" />
              <span>support@parikhasetu.in</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <MapPin className="w-4 h-4 text-blue-900" />
              <span>Ahmedabad, Gujarat, India</span>
            </div>
            <p className="text-xs text-gray-400">Response time: Within 24 hours on working days</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <h2 className="font-semibold text-gray-900 mb-3">Quick Links</h2>
            <ul className="space-y-2 text-sm text-blue-900">
              <li><a href="/exams" className="hover:underline">Browse All Tests</a></li>
              <li><a href="/auth/register" className="hover:underline">Create Free Account</a></li>
              <li><a href="/privacy" className="hover:underline">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:underline">Terms of Use</a></li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
