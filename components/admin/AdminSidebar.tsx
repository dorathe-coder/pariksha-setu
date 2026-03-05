"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, BookOpen, Upload, Settings, Users, LogOut, Sparkles, ChevronRight } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/tests", label: "Tests", icon: FileText },
  { href: "/admin/questions", label: "Question Bank", icon: BookOpen },
  { href: "/admin/upload", label: "AI Import", icon: Sparkles, ai: true },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/exams", label: "Exams & Categories", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-blue-900 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">P</span>
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm leading-tight">ParikshaSetu</div>
            <div className="text-xs text-gray-400">Admin Panel</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(item => {
          const active = isActive(item.href, item.exact);
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active ? "bg-blue-900 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}>
              <item.icon className={`w-4.5 h-4.5 shrink-0 ${active ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} style={{width:'18px',height:'18px'}} />
              <span className="flex-1">{item.label}</span>
              {item.ai && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${active ? "bg-white/20 text-white" : "bg-purple-100 text-purple-700"}`}>
                  AI
                </span>
              )}
              {active && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        <Link href="/" target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
          <span className="text-base">🌐</span> View Site
        </Link>
        <a href="/auth/signout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </a>
      </div>
    </aside>
  );
}
