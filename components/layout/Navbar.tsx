"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, BookOpen } from "lucide-react";

export default function Navbar({ user }: { user?: { name: string; role: string } | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-blue-900">ParikshaSetu</span>
            <span className="text-xs text-gray-400 hidden sm:block">| પરીક્ષા સેતુ</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/exams" className="text-sm font-medium text-gray-700 hover:text-blue-900">All Exams</Link>
            <Link href="/exams?cat=daily-quiz" className="text-sm font-medium text-gray-700 hover:text-blue-900">Daily Quiz</Link>
            <Link href="/exams?cat=previous-year" className="text-sm font-medium text-gray-700 hover:text-blue-900">Previous Year</Link>
          </div>
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-blue-900">Dashboard</Link>
                {user.role === "admin" && <Link href="/admin" className="text-sm font-medium text-amber-600">Admin</Link>}
                <form action="/auth/signout" method="post">
                  <button type="submit" className="border border-gray-200 text-sm px-4 py-1.5 rounded-xl hover:bg-gray-50">Sign Out</button>
                </form>
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-medium text-gray-700 hover:text-blue-900">Login</Link>
                <Link href="/auth/register" className="bg-blue-900 text-white text-sm font-medium px-5 py-2 rounded-xl hover:bg-blue-950">Register Free</Link>
              </>
            )}
          </div>
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white py-4 px-4 space-y-2">
          <Link href="/exams" className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>All Exams</Link>
          <Link href="/exams?cat=daily-quiz" className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>Daily Quiz</Link>
          {!user && (
            <div className="flex gap-3 pt-2">
              <Link href="/auth/login" className="flex-1 text-center border border-gray-200 text-sm py-2 rounded-xl">Login</Link>
              <Link href="/auth/register" className="flex-1 text-center bg-blue-900 text-white text-sm py-2 rounded-xl">Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
