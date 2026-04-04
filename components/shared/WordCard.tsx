// components/shared/WordCard.tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { NandiWord } from "@/types";
import { MessageSquareQuote, Lightbulb, Quote } from "lucide-react";

export function WordCard({ word }: { word: NandiWord }) {
  const isNoun = word.word_type === 'noun';
  const isVerb = word.word_type === 'verb';
  const isRiddle = word.word_type === 'riddle';
  const isProverb = word.word_type === 'proverb';

  return (
    <Card className={`overflow-hidden hover:shadow-md transition-all border-slate-200 ${isProverb ? 'bg-emerald-50/30' : 'bg-white'}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {isProverb && <Quote size={14} className="text-emerald-600" />}
              {isRiddle && <Lightbulb size={14} className="text-amber-500" />}
              <h3 className={`font-bold text-slate-900 uppercase tracking-tight ${isProverb ? 'text-xl' : 'text-2xl'}`}>
                {word.entry_name}
              </h3>
            </div>
            <p className="text-emerald-600 font-semibold italic">{word.translation_en}</p>
          </div>
          <Badge variant="outline" className="uppercase bg-white text-[10px] font-black shrink-0">
            {word.word_type}
          </Badge>
        </div>

        {/* Noun Grid */}
        {isNoun && (
          <div className="grid grid-cols-2 gap-3 text-sm border-t pt-4 border-slate-100 mb-2">
            <div className="space-y-1">
              <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Singular</p>
              <p className="text-slate-700 text-xs">Def: <span className="font-bold">{word.singular_definite || "—"}</span></p>
            </div>
            <div className="space-y-1">
              <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Plural</p>
              <p className="text-slate-700 text-xs">Def: <span className="font-bold">{word.plural_definite || "—"}</span></p>
            </div>
          </div>
        )}

        {/* Riddle Answer Section */}
        {isRiddle && word.notes && (
          <div className="mt-2 p-3 bg-amber-100/50 rounded-xl border border-amber-200">
            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Answer / Walutiet</p>
            <p className="text-slate-800 font-bold">{word.notes}</p>
          </div>
        )}

        {/* Standard Notes (for Sayings/Proverbs) */}
        {!isRiddle && word.notes && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquareQuote size={12} className="text-emerald-500" />
              <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Context</p>
            </div>
            <p className="text-slate-600 text-xs italic leading-relaxed">
              {word.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}