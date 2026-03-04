import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatScore(score: number, max: number): string {
  return `${score.toFixed(2)} / ${max}`;
}

export function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 80) return "text-green-600";
  if (accuracy >= 60) return "text-yellow-600";
  return "text-red-600";
}

export function getDifficultyBadge(difficulty: string) {
  const map: Record<string, string> = {
    easy: "bg-green-100 text-green-700",
    medium: "bg-yellow-100 text-yellow-700",
    hard: "bg-red-100 text-red-700",
  };
  return map[difficulty] || "bg-gray-100 text-gray-700";
}

export function getCategoryBadge(type: string) {
  const map: Record<string, string> = {
    mock_test: "bg-blue-100 text-blue-700",
    previous_year: "bg-purple-100 text-purple-700",
    topic_wise: "bg-orange-100 text-orange-700",
    daily_quiz: "bg-green-100 text-green-700",
    full_test: "bg-red-100 text-red-700",
    mini_test: "bg-gray-100 text-gray-700",
  };
  return map[type] || "bg-gray-100 text-gray-700";
}
