"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, BookOpen, LayoutDashboard, FileText, Upload, Users, Settings, Zap, ExternalLink } from "lucide-react";
import { useTheme } from "@/components/layout/ThemeProvider";
import { Sun, Moon } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/tests", label: "Tests", icon: FileText },
  { href: "/admin/questions", label: "Question Bank", icon: BookOpen },
  { href: "/admin/upload", label: "AI Import", icon: Zap },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/exams", label: "Exams & Categories", icon: Settings },
];

export default function AdminMobileHeader({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { dark, toggle } = useTheme();
  const pageTitle = links.find(l => l.exact ? pathname === l.href : pathname.startsWith(l.href))?.label || "Admin";

  return (
    <header className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 h-14 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <span className="font-bold text-gray-900 dark:text-white text-sm">{pageTitle}</span>
      </div>
      <button onClick={toggle} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-gray-900 shadow-xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-black text-gray-900 dark:text-white text-sm">Admin Panel</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="space-y-0.5">
              {links.map(({ href, label, icon: Icon, exact }) => {
                const active = exact ? pathname === href : pathname.startsWith(href);
                return (
                  <Link key={href} href={href} onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}>
                    <Icon className="w-4 h-4" /> {label}
                  </Link>
                );
              })}
              <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800">
                <ExternalLink className="w-4 h-4" /> View Site
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
