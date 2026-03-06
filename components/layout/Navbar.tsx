"use client";
import Link from "next/link";
import { useState } from "react";
import { useTheme } from "./ThemeProvider";
import { Menu, X, Sun, Moon, Search, BookOpen, LayoutDashboard, Zap, LogOut, ChevronDown } from "lucide-react";

export default function Navbar({ user }: { user?: { name: string; role: string } | null }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { dark, toggle } = useTheme();

  const navLinks = [
    { href: "/exams", label: "All Tests" },
    { href: "/exams?cat=previous-year", label: "Previous Year" },
    { href: "/exams?cat=daily-quiz", label: "Daily Quiz" },
    { href: "/exams?free=true", label: "Free Tests" },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setOpen(false)}>
            <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shadow-sm">
              <BookOpen className="w-[18px] h-[18px] text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-black text-gray-900 dark:text-white text-lg leading-none">ParikshaSetu</span>
              <p className="text-[10px] text-gray-400 leading-none mt-0.5">પરીક્ષા સેતુ</p>
            </div>
          </Link>

          {/* Search Bar — desktop */}
          <form action="/exams" method="GET" className="hidden md:flex flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input name="q" type="text" placeholder="Search tests, exams..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-green-500 focus:bg-white dark:focus:bg-gray-700 transition-all"
              />
            </div>
          </form>

          {/* Nav Links — desktop */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 px-3 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="ml-auto flex items-center gap-2">
            {/* Theme Toggle */}
            <button onClick={toggle}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={dark ? "Light mode" : "Dark mode"}>
              {dark ? <Sun className="w-4.5 h-4.5" style={{width:18,height:18}} /> : <Moon className="w-4.5 h-4.5" style={{width:18,height:18}} />}
            </button>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/dashboard"
                  className="flex items-center gap-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin"
                    className="flex items-center gap-1.5 text-sm font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 px-3 py-2 rounded-xl transition-colors border border-green-200 dark:border-green-800">
                    <Zap className="w-4 h-4" /> Admin
                  </Link>
                )}
                <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <form action="/auth/signout" method="post">
                    <button type="submit" className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Sign out">
                      <LogOut className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/auth/login"
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-green-600 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Login
                </Link>
                <Link href="/auth/register"
                  className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-5 py-2 rounded-xl transition-all hover:shadow-lg hover:shadow-green-500/25 active:scale-95">
                  Register Free
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => setOpen(!open)}>
              {open ? <X className="w-5 h-5 text-gray-700 dark:text-gray-300" /> : <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 fade-in">
          {/* Mobile Search */}
          <div className="px-4 pt-3 pb-2">
            <form action="/exams" method="GET">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input name="q" type="text" placeholder="Search tests..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:border-green-500" />
              </div>
            </form>
          </div>
          <div className="px-4 py-2 space-y-1">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href}
                className="flex items-center px-3 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3">
            {user ? (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2 mb-1">
                  <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
                <Link href="/dashboard" className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300" onClick={() => setOpen(false)}>
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin" className="flex items-center gap-3 px-3 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-bold" onClick={() => setOpen(false)}>
                    <Zap className="w-4 h-4" /> Admin Panel
                  </Link>
                )}
                <form action="/auth/signout" method="post">
                  <button type="submit" className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 text-sm font-medium">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/auth/login" className="flex-1 text-center border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold py-3 rounded-xl" onClick={() => setOpen(false)}>Login</Link>
                <Link href="/auth/register" className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-3 rounded-xl" onClick={() => setOpen(false)}>Register Free</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
