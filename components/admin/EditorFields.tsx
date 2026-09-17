// components/admin/EditorFields.tsx

"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Languages,
  MessageSquareQuote,
  HelpCircle
} from "lucide-react";
import TranslationInput from "./TranslationInput";
import NounFields from "./NounFields";
import VerbFields from "./VerbFields";

interface EditorFieldsProps {
  editForm: any;
  handleInputChange: (e: any) => void;
  handleAddTranslation: () => void;
  handleRemoveTranslation: (index: number) => void;
  handleTranslationKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function EditorFields({
  editForm,
  handleInputChange,
  handleAddTranslation,
  handleRemoveTranslation,
  handleTranslationKeyDown
}: EditorFieldsProps) {
  const isProverbOrSaying = ["proverb", "saying"].includes(editForm?.word_type);
  const isRiddle = editForm?.word_type === "riddle";
  const isNoun = editForm?.word_type === "noun";
  const isVerb = editForm?.word_type === "verb";
  const isName = editForm?.word_type === "name";

  return (
    <div className="space-y-6 py-2">
      {/* 1. Grammar Category */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
          Grammar Category
        </label>
        <select
          name="word_type"
          value={editForm?.word_type || "noun"}
          onChange={handleInputChange}
          className="w-full h-14 rounded-2xl border-2 border-slate-200 bg-white px-5 text-base font-normal text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all appearance-none cursor-pointer"
        >
          <optgroup label="Standard Parts of Speech">
            <option value="noun">Noun</option>
            <option value="name">Name</option>
            <option value="verb">Verb</option>
            <option value="adjective">Adjective</option>
            <option value="adverb">Adverb</option>
            <option value="pronoun">Pronoun</option>
            <option value="preposition">Preposition</option>
            <option value="conjunction">Conjunction</option>
            <option value="interjection">Interjection</option>
            <option value="expression">Expression</option>
            <option value="number">Number</option>
            <option value="particle">Particle</option>
          </optgroup>
          <optgroup label="Traditional Literature">
            <option value="proverb">Kalewenet</option>
            <option value="riddle">Tangoch</option>
            <option value="saying">Saying</option>
          </optgroup>
        </select>
      </div>

      {/* 2. Entry Name */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
          {isRiddle
            ? "Tangoch"
            : isProverbOrSaying
            ? "Proverb / Saying"
            : isName
            ? "Name"
            : "Word"}
        </label>
        <Input
          name="entry_name"
          value={editForm?.entry_name || ""}
          onChange={handleInputChange}
          placeholder={
            isRiddle
              ? "e.g., Kirginyuu kipkeleny tulwo"
              : isName
              ? "e.g., Kipng'ung'uny"
              : "Enter word..."
          }
          className="h-14 bg-white border-2 border-slate-200 rounded-2xl text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500 focus:border-emerald-500 transition-all"
        />
      </div>

      {/* 3. Riddle Answer (Nandi) */}
      {isRiddle && (
        <div className="space-y-2 p-6 bg-emerald-50/30 rounded-3xl border-2 border-emerald-100/50">
          <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-2 ml-1">
            <HelpCircle size={14} /> Walutiet (Answer in Nandi)
          </label>
          <Input
            name="answer"
            placeholder="Nee walutiet? e.g., Koita"
            value={editForm?.answer || ""}
            onChange={handleInputChange}
            className="h-14 bg-white border-emerald-200 rounded-2xl text-base font-normal text-slate-700 placeholder:text-emerald-400 focus-visible:ring-emerald-500 focus:border-emerald-500 transition-all"
          />
        </div>
      )}

      {/* 4. Translations — shown for all types including riddles */}
      <TranslationInput
        translations={editForm?.translations || []}
        inputValue={editForm?.translation_input || ""}
        onInputChange={(value) =>
          handleInputChange({ target: { name: "translation_input", value } })
        }
        onAdd={handleAddTranslation}
        onRemove={handleRemoveTranslation}
        onKeyDown={handleTranslationKeyDown}
        label={
          isRiddle
            ? "Answer Translation (English)"
            : editForm?.word_type === "saying"
            ? "Meaning"
            : isProverbOrSaying
            ? "Meaning"
            : isName
            ? "Meaning"
            : "Translations"
        }
        placeholder={
          isRiddle
            ? "English meaning of the answer, e.g., Stone"
            : isName
            ? "meaning of name"
            : "Type translation and press Enter..."
        }
      />

      {/* 5. Noun Forms */}
      {isNoun && (
        <NounFields editForm={editForm} handleInputChange={handleInputChange} />
      )}

      {/* 6. Verb Forms */}
      {isVerb && (
        <VerbFields editForm={editForm} handleInputChange={handleInputChange} />
      )}

      {/* 7. Usage Examples */}
      {!isProverbOrSaying && !isRiddle && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2 ml-1">
            <Languages size={14} className="text-emerald-500" /> Usage Examples
          </label>
          <Textarea
            name="examples"
            value={editForm?.examples || ""}
            onChange={handleInputChange}
            placeholder="Enter example sentences (one per line)"
            className="min-h-[120px] bg-white border-2 border-slate-200 rounded-2xl p-5 text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
          />
        </div>
      )}

      {/* 8. Notes & Context */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2 ml-1">
          <MessageSquareQuote size={14} className="text-emerald-500" /> Notes & Context
        </label>
        <Textarea
          name="notes"
          value={editForm?.notes || ""}
          onChange={handleInputChange}
          placeholder="Cultural significance or grammar tips..."
          className="min-h-[120px] bg-white border-2 border-slate-200 rounded-2xl p-5 text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
        />
      </div>
    </div>
  );
}