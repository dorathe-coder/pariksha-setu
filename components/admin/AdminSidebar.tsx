"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Plus, Upload, Settings, Users, FileText, Home, LogOut } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/tests", label: "Manage Tests", icon: FileText },
  { href: "/admin/upload", label: "Upload Questions", icon: Upload },
  { href: "/admin/questions", label: "Question Bank", icon: BookOpen },
  { href: "/admin/exams", label: "Exams & Categories", icon: Settings },
  { href: "/admin/students", label: "Students", icon: Users },
];

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col z-40">
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm text-white">ParikshaSetu</div>
            <div className="text-xs text-gray-400">Admin Panel</div>
          </div>
        </div>
      </div>
      <div className="px-3 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-white">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-medium text-white">{adminName}</div>
            <div className="text-xs text-amber-400">Administrator</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(item => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive(item.href, item.exact) ? "bg-amber-500 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}>
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
          <Home className="w-4 h-4" /> View Website
        </Link>
        <form action="/auth/signout" method="post">
          <button type="submit" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-900/40 hover:text-red-400 transition-colors w-full">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
