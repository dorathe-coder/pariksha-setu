import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-gray-900 dark:text-white">ParikshaSetu</span>
          </Link>
          <div className="flex items-center gap-5 text-sm text-gray-500 dark:text-gray-400 flex-wrap justify-center">
            <Link href="/exams" className="hover:text-green-600 transition-colors">Tests</Link>
            <Link href="/exams?cat=daily-quiz" className="hover:text-green-600 transition-colors">Daily Quiz</Link>
            <Link href="/about" className="hover:text-green-600 transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-green-600 transition-colors">Privacy</Link>
            <Link href="/contact" className="hover:text-green-600 transition-colors">Contact</Link>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-600">© 2025 ParikshaSetu</p>
        </div>
      </div>
    </footer>
  );
}
