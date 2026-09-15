"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TranslationInputProps {
  translations: string[];
  inputValue: string;
  onInputChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  label: string;
  placeholder: string;
}

export default function TranslationInput({
  translations,
  inputValue,
  onInputChange,
  onAdd,
  onRemove,
  onKeyDown,
  label,
  placeholder
}: TranslationInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
        {label}
      </label>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="h-14 bg-white border-2 border-slate-200 rounded-2xl text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500 focus:border-emerald-500 transition-all flex-1"
        />
        <Button
          type="button"
          onClick={onAdd}
          variant="outline"
          className="h-14 px-6 rounded-2xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50"
        >
          <Plus size={18} className="text-slate-500" />
        </Button>
      </div>
      <p className="text-[10px] text-slate-400 ml-1">
        Press Enter to add multiple translations
      </p>

      {translations && translations.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 min-h-[60px]">
          {translations.map((translation, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium"
            >
              {translation}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="ml-1 hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}
      {(!translations || translations.length === 0) && (
        <p className="text-sm text-slate-400 mt-1">No translations added yet</p>
      )}
    </div>
  );
}