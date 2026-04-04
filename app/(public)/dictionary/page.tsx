"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Search, ChevronRight, X, MessageSquareQuote, Quote, HelpCircle, Frown, Languages, Plus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import SuggestWordModal from "@/components/shared/SuggestWordModal";

export default function DictionaryPage() {
  const [words, setWords] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    const { data } = await supabase.from("words").select("*").eq("is_verified", true).order("entry_name", { ascending: true });
    if (data) { 
      setWords(data); 
      if (data.length > 0) setSelectedWord(data[0]); 
    }
    setLoading(false);
  };

  const filteredWords = words.filter((w) => {
    const s = searchQuery.toLowerCase();
    return (
      w.entry_name?.toLowerCase().includes(s) || 
      w.translation_en?.toLowerCase().includes(s) || 
      w.answer?.toLowerCase().includes(s) ||
      w.notes?.toLowerCase().includes(s) ||
      w.examples?.toLowerCase().includes(s)
    );
  });

  const renderLingueeLine = (line: string) => {
    if (!line.includes("-")) return <p className="mb-2 text-slate-700">{line}</p>;
    const [nandi, english] = line.split("-");
    return (
      <div className="mb-4 border-l-4 border-emerald-500/20 pl-4 py-1">
        <p className="font-bold text-slate-900 text-lg tracking-tight">{nandi.trim()}</p>
        <p className="text-slate-500 italic text-sm mt-1">{english.trim()}</p>
      </div>
    );
  };

  const WordDetailContent = ({ word }: { word: any }) => {
    const isTraditional = ["proverb", "saying", "riddle"].includes(word.word_type);
    const isRiddle = word.word_type === "riddle";
    
    // Check if any noun-specific data exists
    const hasNounForms = word.singular_indefinite || word.singular_definite || word.plural_indefinite || word.plural_definite;

    return (
      <div className="max-w-3xl animate-in fade-in slide-in-from-right-4 duration-300 pb-32">
        <div className="flex flex-col gap-2 mb-8">
          <h1 className={`font-extrabold text-slate-900 tracking-tighter leading-tight ${isTraditional ? "text-3xl md:text-5xl italic" : "text-4xl md:text-6xl uppercase"}`}>
            {(isTraditional ) && <Quote size={28} className="inline mr-3 text-emerald-200" />}
            {word.entry_name}
          </h1>
        </div>
        
        {isRiddle && (
          <div className="mb-10 p-8 bg-emerald-50 rounded-[2.5rem] border-2 border-emerald-100 border-dashed relative overflow-hidden">
             <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2 mb-2">Walutiet</h4>
             <p className="text-4xl font-black text-emerald-900 uppercase tracking-tighter relative z-10">{word.answer || "---"}</p>
          </div>
        )}

        <div className="mb-10">
          {!isRiddle &&  
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                {isTraditional ? "Meaning" : "Translation"}
            </h4>
          }
          <p className="text-2xl md:text-3xl text-slate-700 font-semibold leading-snug tracking-tight">
            {word.translation_en}
          </p>
        </div>

        {/* MERGED NOUN FORMS SECTION */}
        {hasNounForms && (
          <div className="mb-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
            <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Noun Forms</h4>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Singular</span>
                <p className="text-sm font-bold text-slate-900">{word.singular_indefinite || "—"}</p>
                <p className="text-xs text-slate-500 mt-0.5">{word.singular_definite || ""}</p>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Plural</span>
                <p className="text-sm font-bold text-slate-900">{word.plural_indefinite || "—"}</p>
                <p className="text-xs text-slate-500 mt-0.5">{word.plural_definite || ""}</p>
              </div>
            </div>
          </div>
        )}

        {/* IMPERATIVE - SEPARATE FROM NOUNS */}
        {word.imperative && (
          <div className="mb-10 p-4 bg-slate-50 rounded-2xl border border-slate-100 inline-block">
            <span className="block text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Imperative</span>
            <span className="text-base font-bold text-slate-900">{word.imperative}</span>
          </div>
        )}

        {word.examples && (
          <div className="mb-10">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Languages size={14} className="text-emerald-500" /> Usage Examples
            </h4>
            <div className="space-y-2">
              {word.examples.split("\n").map((line: string, i: number) => line.trim() && (
                <div key={i}>{renderLingueeLine(line)}</div>
              ))}
            </div>
          </div>
        )}

        {word.notes && (
          <div className="mt-10 pt-10 border-t border-dashed border-slate-200">
            <h4 className="text-[10px] font-black text-slate-400 uppercase mb-4 flex items-center gap-2 tracking-widest">
              <MessageSquareQuote size={14} className="text-emerald-500" /> Notes & Context
            </h4>
            <div className="p-6 bg-slate-50/80 rounded-[1.5rem] text-slate-600 text-base italic leading-relaxed border border-slate-100 shadow-sm">
               {word.notes.split("\n").map((line: string, i: number) => <p key={i} className="mb-2 last:mb-0">{line}</p>)}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-white font-sans overflow-hidden">
      <header className="border-b bg-white p-4 shrink-0 shadow-sm z-10">
        <div className="max-w-7xl mx-auto">
           <div className="relative w-full">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
             <Input 
               placeholder="Search....." 
               className="pl-12 h-14 bg-slate-50 border-none rounded-2xl w-full font-bold text-lg placeholder:text-slate-300 focus-visible:ring-emerald-500" 
               value={searchQuery} 
               onChange={(e) => setSearchQuery(e.target.value)} 
             />
           </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full border-x">
        <aside className="flex w-full md:w-80 lg:w-96 flex-col border-r bg-slate-50/30 shrink-0 h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-white">
            {filteredWords.length > 0 ? (
              filteredWords.map((word) => (
                <button 
                  key={word.id} 
                  onClick={() => { setSelectedWord(word); if (window.innerWidth < 768) setIsModalOpen(true); }} 
                  className={`w-full text-left p-6 border-b transition-all flex justify-between items-center group ${selectedWord?.id === word.id ? "bg-white border-l-4 border-l-emerald-500 shadow-sm" : "hover:bg-slate-50 border-l-4 border-l-transparent"}`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-black text-slate-900 uppercase text-sm tracking-tight truncate">{word.entry_name}</div>
                    <div className="text-xs text-slate-400 italic truncate mt-1">
                      {word.word_type === 'riddle' ? word.answer : word.translation_en}
                    </div>
                  </div>
                  <ChevronRight size={16} className={selectedWord?.id === word.id ? "text-emerald-500" : "text-slate-200"} />
                </button>
              ))
            ) : searchQuery.length > 0 ? (
              <div className="p-12 text-center animate-in fade-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Frown size={40} />
                </div>
                <h3 className="text-2xl font-black uppercase text-slate-900 tracking-tighter">Mamii!</h3>
                <p className="text-slate-400 text-xs mt-3 leading-relaxed font-medium">We couldn't find anything for "{searchQuery}". Help us add it?</p>
                <Button 
                  onClick={() => setIsSuggestionModalOpen(true)} 
                  className="mt-8 bg-slate-900 hover:bg-black text-white w-full rounded-2xl py-7 font-black uppercase text-[10px] tracking-[0.2em] shadow-xl"
                >
                  <Plus size={14} className="mr-2" /> Suggest Word
                </Button>
              </div>
            ) : (
              <div className="p-12 text-center opacity-10">
                <Search size={48} className="mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Ready to search</p>
              </div>
            )}
          </div>
        </aside>

        <section className="hidden md:block flex-1 overflow-y-auto bg-white p-16">
          {selectedWord && filteredWords.length > 0 ? (
            <WordDetailContent word={selectedWord} />
          ) : (
            <div className="h-full flex items-center justify-center opacity-20 uppercase tracking-[0.5em] text-[10px] font-black">
              Kutiit Dictionary
            </div>
          )}
        </section>
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] w-[95vw] h-[92vh] rounded-[3rem] p-0 flex flex-col border-none bg-white shadow-2xl overflow-hidden [&>button]:hidden">
          <VisuallyHidden.Root>
            <DialogHeader>
              <DialogTitle>{selectedWord?.entry_name || "Word Details"}</DialogTitle>
              <DialogDescription>Full details for the selected entry.</DialogDescription>
            </DialogHeader>
          </VisuallyHidden.Root>
          
          <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-20 shrink-0">
             <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">
              {selectedWord?.word_type}
            </span>
            <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full bg-slate-50 h-10 w-10">
              <X size={20} className="text-slate-500" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-10 pt-6">
            {selectedWord && <WordDetailContent word={selectedWord} />}
          </div>
        </DialogContent>
      </Dialog>

      <SuggestWordModal 
        isOpen={isSuggestionModalOpen} 
        onOpenChange={setIsSuggestionModalOpen} 
        initialSearch={searchQuery}
        onSuccess={() => setSearchQuery("")} 
      />
    </div>
  );
}