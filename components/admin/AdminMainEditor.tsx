"use client";

import { Save, Loader2, BookOpen, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditorFields from "./EditorFields";

interface AdminMainEditorProps {
  editForm: any;
  view: "words" | "suggestions";
  error: string | null;
  saving: boolean;
  onSave: () => void;
  onApprove: () => void;
  onReject: (id: string) => void;
  handleInputChange: (e: any) => void;
  handleAddTranslation: () => void;
  handleRemoveTranslation: (index: number) => void;
  handleTranslationKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function AdminMainEditor({
  editForm,
  view,
  error,
  saving,
  onSave,
  onApprove,
  onReject,
  handleInputChange,
  handleAddTranslation,
  handleRemoveTranslation,
  handleTranslationKeyDown
}: AdminMainEditorProps) {
  if (!editForm) {
    return (
      <main className="hidden md:flex flex-1 flex-col bg-white overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center text-slate-200">
          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
            <BookOpen size={32} className="opacity-20" />
          </div>
          <p className="uppercase font-black tracking-[0.2em] text-[10px]">
            Select an entry to begin
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="hidden md:flex flex-1 flex-col bg-white overflow-hidden">
      <div className="p-8 border-b flex justify-between items-center bg-white shrink-0">
        <div className="min-w-0">
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">
            {editForm.word_type}
          </span>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 truncate">
            {editForm.entry_name || "New Entry"}
          </h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          {error && (
            <div className="text-red-500 text-xs font-bold bg-red-50 px-3 py-1 rounded-lg border border-red-200">
              ⚠️ {error}
            </div>
          )}
          <div className="flex gap-3">
            {view === "suggestions" ? (
              <>
                <Button
                  onClick={() => onReject(editForm?.id)}
                  variant="outline"
                  className="border-rose-200 text-rose-500 hover:bg-rose-50 px-6 h-12 font-bold uppercase text-[10px] tracking-widest rounded-xl"
                >
                  Reject
                </Button>
                <Button
                  onClick={onApprove}
                  disabled={saving}
                  className="bg-emerald-600 px-10 h-12 font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-lg hover:bg-emerald-700 text-white"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Check size={18} className="mr-2" />
                  )}{" "}
                  Approve
                </Button>
              </>
            ) : (
              <Button
                onClick={onSave}
                disabled={saving}
                className="bg-slate-900 px-10 h-12 font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-lg hover:bg-black transition-all"
              >
                {saving ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Save size={18} className="mr-2" />
                )}{" "}
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-12">
        <div className="max-w-2xl mx-auto">
          <EditorFields
            editForm={editForm}
            handleInputChange={handleInputChange}
            handleAddTranslation={handleAddTranslation}
            handleRemoveTranslation={handleRemoveTranslation}
            handleTranslationKeyDown={handleTranslationKeyDown}
          />
        </div>
      </div>
    </main>
  );
}