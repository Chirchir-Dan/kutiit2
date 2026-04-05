import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquareQuote, Lightbulb, Quote, MapPin } from "lucide-react";

export function WordCard({ word }: { word: any }) {
  // 1. Keep the specialized checks for layout shifts
  const isRiddle = word.word_type === 'riddle';
  const isProverb = word.word_type === 'proverb' || word.word_type === 'saying';
  
  // 2. Check for "Noun-like" data instead of just the 'noun' string
  const hasGrammarForms = word.singular_definite || word.plural_definite || word.imperative;

  return (
    <Card className={`overflow-hidden hover:shadow-md transition-all border-slate-200 ${isProverb ? 'bg-emerald-50/30' : 'bg-white'}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">7
            <div className="flex items-center gap-2 mb-1">
              {isProverb && <Quote size={14} className="text-emerald-600" />}
              {isRiddle && <Lightbulb size={14} className="text-amber-500" />}
              <h3 className={`font-bold text-slate-900 uppercase tracking-tight ${isProverb ? 'text-xl' : 'text-2xl'}`}>
                {word.entry_name}
              </h3>
            </div>
            <p className="text-emerald-600 font-semibold italic">{word.translation_en}</p>
            
            {/* Dialect Badges */}
            {word.dialects && word.dialects.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {word.dialects.map((d: string) => (
                  <Badge key={d} variant="secondary" className="text-[8px] px-1.5 py-0 bg-slate-100 text-slate-500 border-none font-black uppercase">
                    <MapPin size={8} className="mr-0.5" /> {d}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* Universal Badge - Shows whatever type is in the DB (Adjective, etc) */}
          
        </div>

        {/* Dynamic Grammar Section (Appears for Nouns AND Verbs if data exists) */}
        {hasGrammarForms && (
          <div className="grid grid-cols-2 gap-3 text-sm border-t pt-4 border-slate-100 mb-2">
            {word.singular_definite && (
              <div className="space-y-1">
                <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Singular</p>
                <p className="text-slate-700 text-xs font-bold">{word.singular_definite}</p>
              </div>
            )}
            {word.plural_definite && (
              <div className="space-y-1">
                <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Plural</p>
                <p className="text-slate-700 text-xs font-bold">{word.plural_definite}</p>
              </div>
            )}
            {word.imperative && (
              <div className="col-span-2 space-y-1 mt-1">
                <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Imperative (Command)</p>
                <p className="text-slate-700 text-xs font-bold">{word.imperative}</p>
              </div>
            )}
          </div>
        )}

        {/* Riddle/Proverb Answer Logic */}
        {(isRiddle || isProverb) && (word.answer || word.notes) && (
          <div className={`mt-2 p-3 rounded-xl border ${isRiddle ? 'bg-amber-100/50 border-amber-200' : 'bg-emerald-100/30 border-emerald-200'}`}>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
              {isRiddle ? "Answer / Walutiet" : "Meaning / Explanation"}
            </p>
            <p className="text-slate-800 font-bold">{word.answer || word.notes}</p>
          </div>
        )}

        {/* Standard Usage/Context - For all other word types */}
        {!isRiddle && !isProverb && word.notes && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquareQuote size={12} className="text-emerald-500" />
              <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Usage & Context</p>
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