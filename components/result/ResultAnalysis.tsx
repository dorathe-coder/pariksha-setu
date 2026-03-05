"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import type { ResultDetail } from "@/types/database";

export default function ResultAnalysis({ details }: { details: ResultDetail[] }) {
  // Group by subject
  const subjectMap: Record<string, { name: string; correct: number; wrong: number; total: number }> = {};
  details.forEach(d => {
    const subName = (d.question as any)?.subject?.name || "Other";
    if (!subjectMap[subName]) subjectMap[subName] = { name: subName, correct: 0, wrong: 0, total: 0 };
    subjectMap[subName].total++;
    if (d.is_correct) subjectMap[subName].correct++;
    else if (!d.is_skipped) subjectMap[subName].wrong++;
  });

  const subjectData = Object.values(subjectMap).map(s => ({
    ...s,
    accuracy: Math.round((s.correct / s.total) * 100),
  })).sort((a, b) => b.total - a.total).slice(0, 8);

  // Difficulty breakdown
  const diffMap: Record<string, { correct: number; total: number }> = { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } };
  details.forEach(d => {
    const diff = (d.question as any)?.difficulty || "medium";
    if (diffMap[diff]) {
      diffMap[diff].total++;
      if (d.is_correct) diffMap[diff].correct++;
    }
  });

  const pieData = Object.entries(diffMap).filter(([, v]) => v.total > 0).map(([name, v]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: v.total,
    correct: v.correct,
  }));

  const PIE_COLORS = ["#16A34A", "#F59E0B", "#DC2626"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Subject Analysis */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-5">Subject-wise Performance</h3>
        {subjectData.length > 0 ? (
          <>
            <div className="space-y-3 mb-5">
              {subjectData.map(s => (
                <div key={s.name} className="flex items-center gap-3">
                  <div className="w-32 text-xs text-gray-600 truncate shrink-0">{s.name}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${s.accuracy >= 70 ? "bg-green-500" : s.accuracy >= 50 ? "bg-amber-500" : "bg-red-400"}`} style={{ width: `${s.accuracy}%` }} />
                  </div>
                  <div className="text-xs font-semibold text-gray-700 w-10 text-right">{s.accuracy}%</div>
                  <div className="text-xs text-gray-400 w-16 text-right">{s.correct}/{s.total}</div>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={subjectData} margin={{ top: 0, right: 0, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                <Bar dataKey="correct" fill="#16A34A" name="Correct" radius={[4,4,0,0]} />
                <Bar dataKey="wrong" fill="#DC2626" name="Wrong" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">No subject data available</p>
        )}
      </div>

      {/* Difficulty Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-5">Difficulty Breakdown</h3>
        {pieData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "10px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-3">
              {pieData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.correct}/{item.value}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-400 text-center py-8">No data</p>
        )}
      </div>
    </div>
  );
}
