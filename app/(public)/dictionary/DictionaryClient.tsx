"use client";

import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { 
  Search, ChevronRight, X, MessageSquareQuote, Quote, Frown, Languages, Plus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import SuggestWordModal from "@/components/shared/SuggestWordModal";

export default function DictionaryClient({ initialWords }: { initialWords: any[] }) {
  const [words] = useState<any[]>(initialWords);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWord, setSelectedWord] = useState<any>(initialWords[0] || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);

  const fuse = useMemo(() => {
    return new Fuse(words, {
      keys: [
        "entry_name", 
        "translation_en", 
        "answer", 
        "notes", 
        "examples",
        "dialects",
        "singular_indefinite",
        "singular_definite",
        "plural_indefinite",
        "plural_definite"
      ],
      threshold: 0.35,
      distance: 100,
    });
  }, [words]);

  const filteredWords = useMemo(() => {
    if (!searchQuery.trim()) return words;
    return fuse.search(searchQuery).map(result => result.item);
  }, [searchQuery, fuse, words]);

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
    const hasNounForms = word.singular_indefinite || word.singular_definite || word.plural_indefinite || word.plural_definite;

    return (
      <div className="max-w-3xl animate-in fade-in slide-in-from-right-4 duration-300 pb-32">
        <div className="flex flex-col gap-2 mb-8">
          <div className="flex flex-wrap gap-2 mb-2"></div>
          <h1 className={`font-extrabold text-slate-900 tracking-tighter leading-tight ${isTraditional ? "text-3xl md:text-5xl italic" : "text-4xl md:text-6xl uppercase"}`}>
            {(isTraditional ) && <Quote size={28} className="inline mr-3 text-emerald-200" />}
            {word.entry_name}
          </h1>
        </div>
        
        {isRiddle && (
          <div className="mb-10 p-8 bg-emerald-50 rounded-[2.5rem] border-2 border-emerald-100 border-dashed relative overflow-hidden">
             <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-2">Walutiet</h4>
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

        {hasNounForms && (
          <div className="mb-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm">
            <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Noun Forms</h4>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Singular</span>
                <p className="text-sm font-bold text-slate-900">{word.singular_indefinite || "—"}</p>
                {word.singular_definite && <p className="text-[10px] text-emerald-600 font-medium bg-emerald-50/50 px-1.5 py-0.5 rounded-md inline-block mt-1">{word.singular_definite}</p>}
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Plural</span>
                <p className="text-sm font-bold text-slate-900">{word.plural_indefinite || "—"}</p>
                {word.plural_definite && <p className="text-[10px] text-emerald-600 font-medium bg-emerald-50/50 px-1.5 py-0.5 rounded-md inline-block mt-1">{word.plural_definite}</p>}
              </div>
            </div>
          </div>
        )}

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

        {word.dialects && word.dialects.length > 0 && (
          <div className="mt-8 pt-4 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 font-medium italic">
              {word.dialects.length > 4? `Dialects: Universal` : `Dialects: ${word.dialects.join(", ")}`}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row flex-1 h-full bg-white font-sans overflow-hidden max-w-7xl mx-auto w-full border-x">
      <aside className="flex w-full md:w-80 lg:w-96 flex-col border-r bg-slate-50/30 shrink-0 h-full overflow-hidden relative">
        {/* UPDATED HEADER: Search + Add word button side-by-side */}
        <div className="sticky top-0 p-4 bg-white border-b shrink-0 z-30">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <Input 
                placeholder="Search words..." 
                className="pl-10 h-12 bg-slate-50 border-none rounded-xl w-full font-bold text-sm placeholder:text-slate-300 focus-visible:ring-emerald-500" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
            </div>
            <Button 
              onClick={() => setIsSuggestionModalOpen(true)}
              variant="ghost"
              size="icon"
              className="h-12 w-12 shrink-0 bg-emerald-50 hover:bg-emerald-100 text-bold text-emerald-600 rounded-xl border border-emerald-100 transition-all active:scale-95"
              title="Add word"
            >
              ADD
            </Button>
          </div>
        </div>

        {/* 2. SCROLLABLE CONTENT - Removed pb-24 padding as the footer button is gone */}
        <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
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
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Frown size={32} />
              </div>
              <h3 className="text-lg font-black uppercase text-slate-900">Not found</h3>
              <p className="text-sm text-slate-500 mt-2">You can use the "ADD" button to add a new word.</p>
            </div>
          ) : (
            <div className="p-12 text-center opacity-10">
              <Search size={40} className="mx-auto mb-4" />
            </div>
          )}
        </div>
      </aside>

      <section className="hidden md:block flex-1 overflow-y-auto bg-white p-12 pt-0 custom-scrollbar relative">
        {selectedWord && filteredWords.length > 0 ? (
          <>
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 pt-12 pb-4 mb-4 border-b border-slate-50">
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">
                {selectedWord.word_type}
              </span>
            </div>
            <WordDetailContent word={selectedWord} />
          </>
        ) : (
          <div className="h-full flex items-center justify-center opacity-20 uppercase tracking-[0.5em] text-[10px] font-black">
            Select a word to begin
          </div>
        )}
      </section>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] w-[95vw] h-[92vh] rounded-[3rem] p-0 flex flex-col border-none bg-white shadow-2xl overflow-hidden [&>button]:hidden">
          <VisuallyHidden.Root>
            <DialogHeader>
              <DialogTitle>{selectedWord?.entry_name || "Word Details"}</DialogTitle>
              <DialogDescription>Full details</DialogDescription>
            </DialogHeader>
          </VisuallyHidden.Root>
          <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-20 shrink-0">
             <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">{selectedWord?.word_type}</span>
            <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full bg-slate-50 h-10 w-10"><X size={20} className="text-slate-500" /></Button>
          </div>
          <div className="flex-1 overflow-y-auto p-10 pt-6">
            {selectedWord && <WordDetailContent word={selectedWord} />}
          </div>
        </DialogContent>
      </Dialog>

      <SuggestWordModal isOpen={isSuggestionModalOpen} onOpenChange={setIsSuggestionModalOpen} initialSearch={searchQuery} onSuccess={() => setIsSuggestionModalOpen(false)} />
    </div>
  );
}