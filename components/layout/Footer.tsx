import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">ParikshaSetu</span>
            </div>
            <p className="text-sm leading-relaxed mb-3">
              Gujarat competitive exam practice platform. GPSC, Talati, GSSSB, Police, SSC and more.
            </p>
            <p className="text-sm font-medium text-amber-400">ગુજરાતની સૌથી વિશ્વસનીય પરીક્ષા તૈયારી</p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Exam Categories</h4>
            <ul className="space-y-2">
              {[
                ["/exams?cat=gujarat", "Gujarat State Exams"],
                ["/exams?cat=central", "Central Govt Exams"],
                ["/exams?cat=banking", "Banking Exams"],
                ["/exams?cat=railway", "Railway Exams"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Practice</h4>
            <ul className="space-y-2">
              {[
                ["/exams?cat=daily-quiz", "Daily Quiz"],
                ["/exams?cat=previous-year", "Previous Year Papers"],
                ["/exams?cat=mock-test", "Mock Tests"],
                ["/exams?cat=topic-wise", "Topic Wise Tests"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2">
              {[
                ["/about", "About Us"],
                ["/contact", "Contact"],
                ["/privacy", "Privacy Policy"],
                ["/terms", "Terms of Use"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">&copy; 2024 ParikshaSetu. All rights reserved.</p>
          <p className="text-sm">Made with dedication for Gujarat exam aspirants</p>
        </div>
      </div>
    </footer>
  );
}
