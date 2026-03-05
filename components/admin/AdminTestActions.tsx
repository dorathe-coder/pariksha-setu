"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Edit, Trash2, ToggleLeft, ToggleRight, Upload } from "lucide-react";

export default function AdminTestActions({ testId, isActive }: { testId: number; isActive: boolean }) {
  const [active, setActive] = useState(isActive);
  const router = useRouter();
  const supabase = createClient();

  const toggleActive = async () => {
    await supabase.from("tests").update({ is_active: !active }).eq("id", testId);
    setActive(!active);
    router.refresh();
  };

  const deleteTest = async () => {
    if (!confirm("Delete this test and all its questions? This cannot be undone.")) return;
    await supabase.from("tests").delete().eq("id", testId);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2 justify-end">
      <Link href={`/admin/upload?test=${testId}`}
        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-900 hover:bg-blue-50 transition-colors" title="Add Questions">
        <Upload className="w-4 h-4" />
      </Link>
      <Link href={`/admin/tests/${testId}/edit`}
        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-900 hover:bg-blue-50 transition-colors" title="Edit">
        <Edit className="w-4 h-4" />
      </Link>
      <button onClick={toggleActive}
        className={`p-1.5 rounded-lg transition-colors ${active ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`} title={active ? "Disable" : "Enable"}>
        {active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
      </button>
      <button onClick={deleteTest}
        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
