"use client";

import { Zap } from "lucide-react";
import { Input } from "@/components/ui/input";

interface VerbFieldsProps {
  editForm: any;
  handleInputChange: (e: any) => void;
}

const PRESENT_FORMS = [
  { name: "present_1sg", label: "1sg (I)", placeholder: "e.g., anyone" },
  { name: "present_2sg", label: "2sg (you)", placeholder: "e.g., inyone" },
  { name: "present_3sg", label: "3sg (he/she)", placeholder: "e.g., nyone" },
  { name: "present_1pl", label: "1pl (we)", placeholder: "e.g., kipwane" },
  { name: "present_2pl", label: "2pl (you all)", placeholder: "e.g., opwane" },
  { name: "present_3pl", label: "3pl (they)", placeholder: "e.g., pwane" }
];

export default function VerbFields({ editForm, handleInputChange }: VerbFieldsProps) {
  return (
    <div className="bg-amber-50/20 p-6 rounded-3xl border border-amber-200/50 space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-2 ml-1">
          <Zap size={14} className="text-amber-500" /> Imperative (Singular)
        </label>
        <Input
          name="imperative"
          placeholder="e.g. Cham!"
          value={editForm?.imperative || ""}
          onChange={handleInputChange}
          className="h-14 bg-white border-amber-200 rounded-2xl text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-amber-500 focus:border-amber-500 transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-2 ml-1">
          <Zap size={14} className="text-amber-500" /> Imperative (Plural)
        </label>
        <Input
          name="imperative_plural"
          placeholder="e.g. Ocham!"
          value={editForm?.imperative_plural || ""}
          onChange={handleInputChange}
          className="h-14 bg-white border-amber-200 rounded-2xl text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-amber-500 focus:border-amber-500 transition-all"
        />
      </div>

      <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border-2 border-amber-100">
        <input
          type="checkbox"
          id="is_irregular"
          name="is_irregular"
          checked={editForm?.is_irregular || false}
          onChange={(e) => {
            handleInputChange({
              target: { name: "is_irregular", value: e.target.checked }
            });
          }}
          className="w-5 h-5 accent-amber-600"
        />
        <label htmlFor="is_irregular" className="text-sm font-bold text-slate-700 cursor-pointer">
          Irregular verb (verb stem changes in singular and plural)
        </label>
      </div>

      {editForm?.is_irregular && (
        <div className="space-y-4">
          <p className="text-xs font-black text-amber-600 uppercase tracking-[0.2em]">
            Present Tense Forms (all required for irregular verbs){" "}
            <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            {PRESENT_FORMS.map((form) => (
              <div key={form.name} className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500">
                  {form.label}
                </label>
                <Input
                  name={form.name}
                  placeholder={form.placeholder}
                  value={editForm?.[form.name] || ""}
                  onChange={handleInputChange}
                  className="h-12 bg-white border-amber-200 rounded-xl text-base"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}