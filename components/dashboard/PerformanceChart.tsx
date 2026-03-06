"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import type { Result } from "@/types/database";

export default function PerformanceChart({ results }: { results: Result[] }) {
  const chartData = [...results].reverse().slice(-10).map(r => ({
    date: format(new Date(r.submitted_at), "dd MMM"),
    accuracy: Math.round(r.accuracy),
    score: Math.round((r.score / (r.max_score || 1)) * 100),
  }));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Performance Trend</h3>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
            <Tooltip
              contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "12px" }}
              formatter={(value: number) => [value + "%", ""]}
            />
            <Line type="monotone" dataKey="accuracy" stroke="#1E3A8A" strokeWidth={2} dot={{ r: 4, fill: "#1E3A8A" }} name="Accuracy" />
            <Line type="monotone" dataKey="score" stroke="#F59E0B" strokeWidth={2} dot={{ r: 4, fill: "#F59E0B" }} name="Score" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
          Attempt tests to see your performance graph
        </div>
      )}
    </div>
  );
}
