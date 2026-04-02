// components/shared/WordCard.tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { NandiWord } from "@/types";

export function WordCard({ word }: { word: NandiWord }) {
  const isNoun = word.word_type === 'noun';

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow border-slate-200">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 capitalize">
              {isNoun ? word.singular_indefinite : word.entry_name}
            </h3>
            <p className="text-blue-600 font-medium">{word.translation_en}</p>
          </div>
          <Badge variant="outline" className="capitalize bg-slate-50">
            {word.word_type}
          </Badge>
        </div>

        {isNoun && (
          <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm border-t pt-4 border-slate-100">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Singular</p>
              <p className="text-slate-700"><span className="text-slate-400">Indef:</span> {word.singular_indefinite}</p>
              <p className="text-slate-700"><span className="text-slate-400">Def:</span> {word.singular_definite}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Plural</p>
              <p className="text-slate-700"><span className="text-slate-400">Indef:</span> {word.plural_indefinite}</p>
              <p className="text-slate-700"><span className="text-slate-400">Def:</span> {word.plural_definite}</p>
            </div>
          </div>
        )}

        {!isNoun && word.word_type === 'verb' && (
          <div className="text-sm border-t pt-4 border-slate-100">
             <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Infinitive</p>
             <p className="text-slate-700 italic font-serif text-lg">{word.infinitive}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}