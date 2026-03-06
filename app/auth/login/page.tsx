"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { BookOpen, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    router.push("/dashboard"); router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl text-gray-900 dark:text-white">ParikshaSetu</span>
          </Link>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Welcome back</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Login to continue your preparation</p>
        </div>

        <div className="card bg-white dark:bg-gray-900 p-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                  className="input pr-10" placeholder="Enter password" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-green-500/25 active:scale-95 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Signing in...</> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
            No account? <Link href="/auth/register" className="text-green-600 font-semibold hover:underline">Register free</Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-5">
          <Link href="/" className="hover:underline">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
}
