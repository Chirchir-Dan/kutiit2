"use client";

import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import EditorFields from "./EditorFields";

interface AdminMobileModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export default function AdminMobileModal({
  isOpen,
  onClose,
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
}: AdminMobileModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] w-[95vw] max-h-[85vh] rounded-[3rem] p-0 flex flex-col border-none bg-white shadow-2xl overflow-hidden [&>button]:hidden">
        <DialogHeader className="p-8 pb-6 bg-emerald-50/50 shrink-0 relative overflow-hidden border-b border-emerald-100/50">
          <div className="flex flex-row items-center justify-between relative z-10">
            <div>
              <DialogTitle className="text-2xl font-black uppercase text-slate-900 tracking-tighter">
                {editForm?.id ? "Edit Entry" : "New Entry"}
              </DialogTitle>
              <p className="text-emerald-600/70 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                {editForm?.id
                  ? "Update word in dictionary"
                  : "Expand the Nandi Dictionary"}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <Button
                onClick={view === "suggestions" ? onApprove : onSave}
                disabled={saving}
                className="bg-emerald-600 rounded-2xl h-12 px-8 text-[10px] font-black uppercase hover:bg-emerald-700"
              >
                {saving ? <Loader2 className="animate-spin h-5 w-5" /> : "SAVE"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full h-10 w-10 bg-white hover:bg-emerald-100 text-slate-400 border border-emerald-100"
              >
                <X size={20} />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 bg-white">
          {error && (
            <div className="mb-4 text-red-500 text-xs font-bold bg-red-50 px-3 py-2 rounded-lg border border-red-200">
              ⚠️ {error}
            </div>
          )}
          <EditorFields
            editForm={editForm}
            handleInputChange={handleInputChange}
            handleAddTranslation={handleAddTranslation}
            handleRemoveTranslation={handleRemoveTranslation}
            handleTranslationKeyDown={handleTranslationKeyDown}
          />
          {view === "suggestions" && (
            <Button
              onClick={() => onReject(editForm?.id)}
              variant="ghost"
              className="w-full mt-4 text-rose-500 font-black uppercase text-[10px]"
            >
              Reject Suggestion
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}