// components/shared/WordCard.tsx

import { Card, CardContent } from "@/components/ui/card";
import {
  MessageSquareQuote,
  Lightbulb,
  Quote,
  BookOpen
} from "lucide-react";
import { getWordTypeLabel } from "@/lib/wordTypeLabels";

export function WordCard({ word }: { word: any }) {
  const isRiddle = word.word_type === "riddle";
  const isProverb = word.word_type === "proverb" || word.word_type === "saying";

  const hasGrammarForms =
    word.singular_definite || word.plural_definite || word.imperative;

  return (
    <Card className="overflow-hidden border-[3px] border-emerald-600 rounded-[1.75rem] shadow-[0_15px_40px_-15px_rgba(5,150,105,0.3)] bg-white">
      <CardContent className="p-0">
        {/* Header band */}
        <div className="bg-emerald-600 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0 mt-0.5">
              {isProverb ? (
                <Quote size={18} className="text-white" />
              ) : isRiddle ? (
                <Lightbulb size={18} className="text-white" />
              ) : (
                <BookOpen size={18} className="text-white" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3
                className={`font-black text-white leading-tight break-words ${
                  isProverb
                    ? "text-base italic tracking-tight"
                    : "text-lg uppercase tracking-tighter"
                }`}
              >
                {word.entry_name}
              </h3>
              <p className="text-[11px] text-emerald-50/90 font-bold uppercase tracking-[0.15em] mt-0.5">
                {getWordTypeLabel(word.word_type)}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Translation */}
          {word.translation_en && (
            <p className="text-lg font-bold text-emerald-700 text-center">
              {word.translation_en}
            </p>
          )}

          {/* Grammar forms */}
          {hasGrammarForms && (
            <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 text-center">
                Forms
              </p>
              <div className="grid grid-cols-2 gap-3 text-center">
                {word.singular_definite && (
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block mb-0.5 font-bold">
                      Singular
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {word.singular_definite}
                    </span>
                  </div>
                )}
                {word.plural_definite && (
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block mb-0.5 font-bold">
                      Plural
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {word.plural_definite}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Imperative */}
          {word.imperative && (
            <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-100 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-1">
                Imperative
              </p>
              <p className="text-base font-bold text-slate-900">
                {word.imperative}
              </p>
            </div>
          )}

          {/* Riddle answer or Proverb meaning */}
          {(isRiddle || isProverb) && (word.answer || word.notes) && (
            <div className="bg-emerald-50 rounded-2xl p-4 border-2 border-emerald-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-1.5 text-center">
                {isRiddle ? "Walutiet" : "Meaning"}
              </p>
              <p className="text-base font-bold text-slate-900 text-center">
                {word.answer || word.notes}
              </p>
            </div>
          )}

          {/* Notes for regular words */}
          {!isRiddle && !isProverb && word.notes && (
            <div className="bg-slate-50 rounded-2xl p-4 border-2 border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 text-center flex items-center justify-center gap-1.5">
                <MessageSquareQuote size={12} className="text-emerald-500" /> Notes
              </p>
              <p className="text-xs text-slate-600 italic leading-relaxed text-center">
                {word.notes}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}