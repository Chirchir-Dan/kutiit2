"use client";

import { Input } from "@/components/ui/input";

interface NounFieldsProps {
  editForm: any;
  handleInputChange: (e: any) => void;
}

export default function NounFields({ editForm, handleInputChange }: NounFieldsProps) {
  return (
    <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200 space-y-6">
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2">
          Singular
        </p>
        <div className="space-y-2">
          <Input
            name="singular_indefinite"
            placeholder="Indefinite: tany"
            value={editForm?.singular_indefinite || ""}
            onChange={handleInputChange}
            className="h-12 bg-white border-slate-200 rounded-xl text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500 w-full"
          />
          <Input
            name="singular_definite"
            placeholder="Definite: teta"
            value={editForm?.singular_definite || ""}
            onChange={handleInputChange}
            className="h-12 bg-white border-emerald-200 rounded-xl text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500 w-full"
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2">
          Plural
        </p>
        <div className="space-y-2">
          <Input
            name="plural_indefinite"
            placeholder="Indefinite: tich"
            value={editForm?.plural_indefinite || ""}
            onChange={handleInputChange}
            className="h-12 bg-white border-slate-200 rounded-xl text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500 w-full"
          />
          <Input
            name="plural_definite"
            placeholder="Definite: tuga"
            value={editForm?.plural_definite || ""}
            onChange={handleInputChange}
            className="h-12 bg-white border-emerald-200 rounded-xl text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500 w-full"
          />
        </div>
      </div>
    </div>
  );
}