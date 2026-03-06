"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, BookOpen, Upload, Settings, Users, LogOut, Sparkles, ChevronRight, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/layout/ThemeProvider";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/tests", label: "Tests", icon: FileText },
  { href: "/admin/questions", label: "Question Bank", icon: BookOpen },
  { href: "/admin/upload", label: "AI Import", icon: Sparkles, ai: true },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/exams", label: "Exams & Categories", icon: Settings },
];

export default function AdminSidebar({ adminName }: { adminName?: string }) {
  const pathname = usePathname();
  const { dark, toggle } = useTheme();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 fixed top-0 left-0 h-screen flex flex-col border-r z-40 transition-colors"
      style={{backgroundColor: 'var(--card)', borderColor: 'var(--border)'}}>
      
      {/* Logo */}
      <div className="p-5 border-b" style={{borderColor: 'var(--border)'}}>
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white text-sm font-black">P</span>
          </div>
          <div>
            <div className="font-black text-sm leading-tight" style={{color: 'var(--text)'}}>ParikshaSetu</div>
            <div className="text-xs mt-0.5" style={{color: 'var(--text3)'}}>Admin Panel</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(item => {
          const active = isActive(item.href, item.exact);
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? "bg-green-600 text-white shadow-sm"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              style={!active ? {color: 'var(--text2)'} : {}}>
              <item.icon className="w-[18px] h-[18px] shrink-0" style={{width:18,height:18}} />
              <span className="flex-1">{item.label}</span>
              {item.ai && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${active ? "bg-white/20 text-white" : "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400"}`}>
                  AI
                </span>
              )}
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t space-y-1" style={{borderColor: 'var(--border)'}}>
        {adminName && (
          <div className="px-3 py-2 text-xs rounded-xl mb-1" style={{color: 'var(--text3)', backgroundColor: 'var(--bg2)'}}>
            👤 <span className="font-semibold" style={{color: 'var(--text2)'}}>{adminName}</span>
          </div>
        )}
        <button onClick={toggle}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          style={{color: 'var(--text3)'}}>
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {dark ? "Light Mode" : "Dark Mode"}
        </button>
        <Link href="/" target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          style={{color: 'var(--text3)'}}>
          <span>🌐</span> View Site
        </Link>
        <a href="/auth/signout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </a>
      </div>
    </aside>
  );
}
