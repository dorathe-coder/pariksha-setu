"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/layout/ThemeProvider";
import { LayoutDashboard, FileText, Upload, BookOpen, Settings, Users, BarChart2, Sun, Moon, Zap, ChevronRight, ExternalLink } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/tests", label: "Tests", icon: FileText },
  { href: "/admin/questions", label: "Question Bank", icon: BookOpen },
  { href: "/admin/upload", label: "AI Import", icon: Zap, badge: "AI" },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/exams", label: "Exams & Categories", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { dark, toggle } = useTheme();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="w-56 shrink-0 hidden lg:flex flex-col min-h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-800">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-black text-gray-900 dark:text-white text-sm leading-none">ParikshaSetu</p>
            <p className="text-xs text-gray-400 leading-none mt-0.5">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {links.map(({ href, label, icon: Icon, exact, badge }) => {
          const active = isActive(href, exact);
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                active
                  ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
              }`}>
              <Icon className={`w-4 h-4 shrink-0 ${active ? "text-green-600 dark:text-green-400" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"}`} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 rounded-full">{badge}</span>
              )}
              {active && <ChevronRight className="w-3.5 h-3.5 text-green-500" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
        <Link href="/" target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
          <ExternalLink className="w-4 h-4" /> View Site
        </Link>
        <button onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {dark ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </aside>
  );
}
