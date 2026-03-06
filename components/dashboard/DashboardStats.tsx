import { BookOpen, Target, TrendingUp, Award } from "lucide-react";

interface Props {
  totalTests: number;
  avgAccuracy: number;
  bestScore: number;
}

export default function DashboardStats({ totalTests, avgAccuracy, bestScore }: Props) {
  const stats = [
    { label: "Tests Attempted", value: totalTests, icon: <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />, color: "bg-blue-50 dark:bg-blue-950" },
    { label: "Avg Accuracy", value: avgAccuracy + "%", icon: <Target className="w-5 h-5 text-green-600 dark:text-green-400" />, color: "bg-green-50 dark:bg-green-950" },
    { label: "Best Score", value: bestScore + "%", icon: <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />, color: "bg-amber-50 dark:bg-amber-950" },
    { label: "Streak", value: "3 days", icon: <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />, color: "bg-purple-50 dark:bg-purple-950" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
            {stat.icon}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">{stat.value}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
