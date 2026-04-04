"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  ChevronRight, 
  X, 
  MessageSquareQuote,
  Quote,
  HelpCircle,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export default function DictionaryPage() {
  const [words, setWords] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchWords = async () => {
      const { data } = await supabase
        .from("words")
        .select("*")
        .order("entry_name", { ascending: true });
      
      if (data) {
        setWords(data);
        setSelectedWord(data[0]);
      }
      setLoading(false);
    };
    fetchWords();
  }, []);

  const filteredWords = words.filter((w) => {
    const s = searchQuery.toLowerCase();
    return (
      w.entry_name?.toLowerCase().includes(s) ||
      w.translation_en?.toLowerCase().includes(s) ||
      w.notes?.toLowerCase().includes(s) ||
      w.examples?.toLowerCase().includes(s) ||
      w.answer?.toLowerCase().includes(s) ||
      w.imperative?.toLowerCase().includes(s) ||
      w.singular_indefinite?.toLowerCase().includes(s) ||
      w.singular_definite?.toLowerCase().includes(s) ||
      w.plural_indefinite?.toLowerCase().includes(s) ||
      w.plural_definite?.toLowerCase().includes(s)
    );
  });

  const handleSelectWord = (word: any) => {
    setSelectedWord(word);
    if (window.innerWidth < 768) {
      setIsModalOpen(true);
    }
  };

  const WordDetailContent = ({ word }: { word: any }) => {
    const isRiddle = word.word_type === "riddle";
    const isProverb = word.word_type === "proverb";
    const isSaying = word.word_type === "saying";
    const isTraditional = isRiddle || isProverb || isSaying;

    return (
      <div className="max-w-3xl animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex flex-col gap-2 mb-6">
          <Badge variant="outline" className="w-fit text-emerald-600 bg-emerald-50 border-emerald-200 uppercase text-[10px] tracking-widest font-black">
             {isRiddle ? 'Tangoch' : isProverb ? 'Kalewenet' : word.word_type}
          </Badge>
          <h1 className={`font-extrabold text-slate-900 tracking-tight leading-tight ${isTraditional ? "text-3xl md:text-4xl italic" : "text-4xl md:text-5xl uppercase"}`}>
            {isTraditional && <Quote size={24} className="inline mr-3 text-emerald-200" />}
            {word.entry_name}
          </h1>
        </div>
        
        {isRiddle && (
          <div className="mb-8 space-y-6">
            <div className="p-6 bg-emerald-50 rounded-3xl border-2 border-emerald-100 border-dashed">
               <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2 mb-2">
                 <HelpCircle size={14} /> Walutiet
               </h4>
               <p className="text-3xl font-black text-emerald-900 uppercase tracking-tight">{word.answer}</p>
            </div>
          </div>
        )}

        {(isProverb || isSaying || isRiddle) && (
          <div className="mb-8">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Meaning</h4>
            <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed">
              {word.translation_en}
            </p>
          </div>
        )}

        {!isTraditional && (
          <div className="mb-8">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">English Translation</h4>
            <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed uppercase">
              {word.translation_en}
            </p>
          </div>
        )}

        {!isTraditional && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {word.word_type === "noun" && (
                <div className="p-4 rounded-xl border bg-slate-50 border-slate-100 shadow-sm col-span-full">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest">Morphology</h4>
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="text-slate-400 text-[9px] uppercase font-bold mb-1">Singular</p>
                      <p className="font-bold text-slate-800">{word.singular_indefinite || "—"} / {word.singular_definite || "—"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[9px] uppercase font-bold mb-1">Plural</p>
                      <p className="font-bold text-slate-800">{word.plural_indefinite || "—"} / {word.plural_definite || "—"}</p>
                    </div>
                  </div>
                </div>
              )}
              {word.word_type === "verb" && word.imperative && (
                <div className="p-5 rounded-xl border bg-blue-50 border-blue-100 col-span-full shadow-sm">
                  <h4 className="text-[10px] font-bold text-blue-600 uppercase mb-2 tracking-widest">Imperative</h4>
                  <p className="text-2xl font-bold text-blue-900">{word.imperative}</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b pb-2">
                <Info className="text-emerald-500" size={16} /> Sentence Usage
              </h3>
              {word.examples ? (
                <div className="space-y-3">
                  {word.examples.split('\n').filter((l: any) => l.trim()).map((line: string, i: number) => (
                    <div key={i} className="p-4 rounded-xl border bg-white shadow-sm italic text-slate-700 border-l-4 border-l-slate-200">"{line}"</div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-300 text-xs italic uppercase tracking-widest">No examples available</p>
              )}
            </div>
          </>
        )}

        {word.notes && (
          <div className="mt-12 pt-8 border-t border-dashed border-slate-200">
            <h4 className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest flex items-center gap-2">
              <MessageSquareQuote size={14} className="text-emerald-500" /> {isTraditional ? "More Context" : "Additional Notes"}
            </h4>
            <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 text-slate-600 text-sm italic leading-relaxed">
               {word.notes}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-white font-sans overflow-hidden">
      <header className="border-b bg-white p-4 shrink-0 shadow-sm z-10">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
             <Input 
               placeholder="Search entries..." 
               className="pl-10 h-11 bg-slate-50 border-none rounded-xl focus-visible:ring-emerald-500/20 text-md shadow-inner w-full"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full border-x bg-white">
        <aside className="flex w-full md:w-80 lg:w-96 flex-col border-r bg-slate-50/30 shrink-0 h-full overflow-hidden">
          <div className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b flex justify-between bg-white px-5 shrink-0">
            <span>{mounted ? `${filteredWords.length} Entries` : ""}</span>
          </div>
          <div className="flex-1 overflow-y-auto bg-white">
            {filteredWords.map((word) => (
              <button
                key={word.id}
                onClick={() => handleSelectWord(word)}
                className={`w-full text-left p-5 border-b transition-all flex justify-between items-center group ${
                  selectedWord?.id === word.id ? "bg-white border-l-4 border-l-emerald-500 shadow-sm" : "hover:bg-slate-50 border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex-1 pr-2 min-w-0">
                  <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors uppercase text-sm flex items-center gap-2 truncate">
                    {["riddle", "proverb", "saying"].includes(word.word_type) && <Quote size={10} className="text-emerald-400 shrink-0" />}
                    <span className="truncate">{word.entry_name}</span>
                  </div>
                  <div className="text-xs text-slate-400 italic line-clamp-1 mt-0.5 truncate">
                    {word.word_type === 'riddle' ? `Answer: ${word.answer}` : word.translation_en}
                  </div>
                </div>
                <ChevronRight size={16} className={selectedWord?.id === word.id ? "text-emerald-500" : "text-slate-200"} />
              </button>
            ))}
          </div>
        </aside>

        <section className="hidden md:block flex-1 overflow-y-auto bg-white p-12">
          {selectedWord ? <WordDetailContent word={selectedWord} /> : (
             <div className="h-full flex items-center justify-center text-slate-300 uppercase font-black text-[10px] tracking-widest">
               Select an entry to view
             </div>
          )}
        </section>
      </main>

      {/* FIXED MODAL: Added sizeable container and accessibility labels */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[550px] w-[95vw] max-h-[85vh] rounded-[2.5rem] p-0 flex flex-col border-none bg-white shadow-2xl overflow-hidden [&>button]:hidden">
          <VisuallyHidden.Root>
            <DialogHeader>
              <DialogTitle>{selectedWord?.entry_name || "Entry Details"}</DialogTitle>
              <DialogDescription>Details for {selectedWord?.entry_name}</DialogDescription>
            </DialogHeader>
          </VisuallyHidden.Root>

          <div className="p-5 border-b flex justify-between items-center bg-white sticky top-0 z-20 shrink-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedWord?.word_type}</span>
            <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full hover:bg-slate-50">
              <X size={20} />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-8 pt-4">
            {selectedWord && <WordDetailContent word={selectedWord} />}
            <div className="h-6" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}