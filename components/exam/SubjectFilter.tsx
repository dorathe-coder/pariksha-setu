"use client";

export default function SubjectFilter({ subjects, currentSubject, cat, examParam, q }: {
  subjects: { id: number; name: string }[];
  currentSubject?: string;
  cat?: string;
  examParam?: string;
  q?: string;
}) {
  return (
    <select
      defaultValue={currentSubject || ""}
      onChange={e => {
        const url = new URLSearchParams({
          ...(cat && { cat }),
          ...(examParam && { exam: examParam }),
          ...(q && { q }),
          ...(e.target.value && { subject: e.target.value }),
        });
        window.location.href = `/exams?${url}`;
      }}
      className="w-full text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-2 bg-white dark:bg-gray-800 focus:outline-none focus:border-green-500 text-gray-700 dark:text-gray-300"
    >
      <option value="">All Subjects</option>
      {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
    </select>
  );
}
