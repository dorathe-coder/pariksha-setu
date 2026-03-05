"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, BookOpen, ChevronDown, LayoutDashboard, FileText, Zap, LogOut } from "lucide-react";

export default function Navbar({ user }: { user?: { name: string; role: string } | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setMobileOpen(false)}>
            <div className="w-9 h-9 bg-blue-900 rounded-xl flex items-center justify-center shadow-sm">
              <BookOpen className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <span className="font-black text-blue-900 text-lg leading-none">ParikshaSetu</span>
              <span className="text-xs text-gray-400 hidden sm:block leading-none">પરીક્ષા સેતુ</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/exams" className="text-sm font-medium text-gray-600 hover:text-blue-900 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
              All Tests
            </Link>
            <Link href="/exams?cat=previous-year" className="text-sm font-medium text-gray-600 hover:text-blue-900 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
              Previous Year
            </Link>
            <Link href="/exams?cat=daily-quiz" className="text-sm font-medium text-gray-600 hover:text-blue-900 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
              Daily Quiz
            </Link>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <>
                <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-900 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin" className="flex items-center gap-1.5 text-sm font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-lg transition-colors border border-amber-200">
                    <Zap className="w-4 h-4" /> Admin
                  </Link>
                )}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <form action="/auth/signout" method="post">
                    <button type="submit" className="text-sm text-gray-500 hover:text-red-600 transition-colors">
                      <LogOut className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-semibold text-gray-700 hover:text-blue-900 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                  Login
                </Link>
                <Link href="/auth/register" className="bg-blue-900 hover:bg-blue-950 text-white text-sm font-bold px-5 py-2 rounded-xl transition-colors shadow-sm">
                  Register Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {[
              { href: "/exams", label: "All Tests", icon: FileText },
              { href: "/exams?cat=previous-year", label: "Previous Year Papers", icon: BookOpen },
              { href: "/exams?cat=daily-quiz", label: "Daily Quiz", icon: Zap },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                onClick={() => setMobileOpen(false)}>
                <item.icon className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="border-t border-gray-100 px-4 py-3">
            {user ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                  <div className="w-9 h-9 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
                <Link href="/dashboard" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                  <LayoutDashboard className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Dashboard</span>
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin" className="flex items-center gap-3 px-3 py-3 rounded-xl bg-amber-50 hover:bg-amber-100" onClick={() => setMobileOpen(false)}>
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-bold text-amber-700">Admin Panel</span>
                  </Link>
                )}
                <form action="/auth/signout" method="post">
                  <button type="submit" className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 text-red-600" onClick={() => setMobileOpen(false)}>
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Sign Out</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/auth/login" className="flex-1 text-center border border-gray-200 text-gray-700 text-sm font-semibold py-3 rounded-xl hover:bg-gray-50" onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
                <Link href="/auth/register" className="flex-1 text-center bg-blue-900 text-white text-sm font-bold py-3 rounded-xl hover:bg-blue-950" onClick={() => setMobileOpen(false)}>
                  Register Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
