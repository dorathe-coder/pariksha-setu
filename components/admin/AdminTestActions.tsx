"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Edit, Trash2, ToggleLeft, ToggleRight, Upload, BarChart2, Copy, Loader2 } from "lucide-react";

export default function AdminTestActions({ testId, isActive }: { testId: number; isActive: boolean }) {
  const [active, setActive] = useState(isActive);
  const [duplicating, setDuplicating] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const toggleActive = async () => {
    await supabase.from("tests").update({ is_active: !active }).eq("id", testId);
    setActive(!active);
    router.refresh();
  };

  const deleteTest = async () => {
    if (!confirm("Delete this test AND all its questions and results? This CANNOT be undone.")) return;
    await supabase.from("questions").delete().eq("test_id", testId);
    await supabase.from("tests").delete().eq("id", testId);
    router.refresh();
  };

  const duplicateTest = async () => {
    setDuplicating(true);
    // Fetch the test
    const { data: test } = await supabase.from("tests").select("*").eq("id", testId).single();
    if (!test) { setDuplicating(false); return; }

    // Create duplicate
    const { data: newTest } = await supabase.from("tests").insert({
      ...test, id: undefined, title: test.title + " (Copy)", attempt_count: 0,
      is_active: false, created_at: undefined, updated_at: undefined,
    }).select("id").single();

    if (newTest) {
      // Copy questions
      const { data: questions } = await supabase.from("questions").select("*").eq("test_id", testId);
      if (questions && questions.length > 0) {
        const newQs = questions.map(q => ({ ...q, id: undefined, test_id: newTest.id, created_at: undefined }));
        await supabase.from("questions").insert(newQs);
      }
    }
    setDuplicating(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-1 justify-end">
      <Link href={`/admin/upload?test=${testId}`}
        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-900 hover:bg-blue-50 transition-colors" title="Add Questions">
        <Upload className="w-4 h-4" />
      </Link>
      <Link href={`/admin/tests/${testId}/analytics`}
        className="p-1.5 rounded-lg text-gray-400 hover:text-purple-700 hover:bg-purple-50 transition-colors" title="Analytics">
        <BarChart2 className="w-4 h-4" />
      </Link>
      <Link href={`/admin/tests/${testId}/edit`}
        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-900 hover:bg-blue-50 transition-colors" title="Edit">
        <Edit className="w-4 h-4" />
      </Link>
      <button onClick={duplicateTest} disabled={duplicating}
        className="p-1.5 rounded-lg text-gray-400 hover:text-green-700 hover:bg-green-50 transition-colors" title="Duplicate">
        {duplicating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
      </button>
      <button onClick={toggleActive}
        className={`p-1.5 rounded-lg transition-colors ${active ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
        title={active ? "Disable" : "Enable"}>
        {active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
      </button>
      <button onClick={deleteTest}
        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
