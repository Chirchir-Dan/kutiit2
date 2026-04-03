"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, ChevronRight, Languages, Info, Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  const filteredWords = words
    .filter((w) => {
      const s = searchQuery.toLowerCase();
      return (
        w.entry_name?.toLowerCase().includes(s) ||
        w.translation_en?.toLowerCase().includes(s) ||
        w.singular_indefinite?.toLowerCase().includes(s) ||
        w.singular_definite?.toLowerCase().includes(s) ||
        w.plural_indefinite?.toLowerCase().includes(s) ||
        w.plural_definite?.toLowerCase().includes(s) ||
        w.examples?.toLowerCase().includes(s)
      );
    })
    .sort((a, b) => a.entry_name.localeCompare(b.entry_name));

  useEffect(() => {
    if (filteredWords.length > 0) {
      if (searchQuery !== "" || !selectedWord) {
        setSelectedWord(filteredWords[0]);
      }
    } else {
      setSelectedWord(null);
    }
  }, [searchQuery, words]);

  const handleSelectWord = (word: any) => {
    setSelectedWord(word);
    if (window.innerWidth < 768) {
      setIsModalOpen(true);
    }
  };

  const WordDetailContent = ({ word }: { word: any }) => (
    <div className="max-w-3xl animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-baseline gap-4 mb-2">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight uppercase">
          {word.entry_name}
        </h1>
        <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200 uppercase">
          {word.word_type}
        </Badge>
      </div>
      
      <p className="text-xl md:text-2xl text-slate-500 mb-8 font-medium">
        {word.translation_en}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {word.word_type === "noun" && (
          <>
            <div className="p-4 rounded-xl border bg-slate-50 border-slate-100">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest">Singular Forms</h4>
              <div className="space-y-1">
                <p><span className="text-slate-400 text-xs">Indef:</span> <span className="font-bold text-slate-700">{word.singular_indefinite || "—"}</span></p>
                <p><span className="text-slate-400 text-xs">Def:</span> <span className="font-bold text-emerald-700">{word.singular_definite || "—"}</span></p>
              </div>
            </div>
            <div className="p-4 rounded-xl border bg-slate-50 border-slate-100">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest">Plural Forms</h4>
              <div className="space-y-1">
                <p><span className="text-slate-400 text-xs">Indef:</span> <span className="font-bold text-slate-700">{word.plural_indefinite || "—"}</span></p>
                <p><span className="text-slate-400 text-xs">Def:</span> <span className="font-bold text-emerald-700">{word.plural_definite || "—"}</span></p>
              </div>
            </div>
          </>
        )}
        
        {word.word_type === "verb" && word.imperative && (
          <div className="p-5 rounded-xl border bg-blue-50 border-blue-100 col-span-full">
            <h4 className="text-[10px] font-bold text-blue-500 uppercase mb-2 tracking-widest flex items-center gap-2">
              <Languages size={14} /> Imperative (Command)
            </h4>
            <p className="text-2xl font-bold text-blue-900">{word.imperative}</p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
          <Info className="text-emerald-500" size={20} />
          Usage Examples
        </h3>
        
        {word.examples ? (
          <div className="space-y-3">
            {word.examples.split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => {
              const parts = line.split('-');
              return (
                <div key={i} className="p-4 hover:bg-slate-50 rounded-xl transition-colors border-l-4 border-slate-100 hover:border-emerald-500 bg-white shadow-sm border">
                  <p className="font-bold text-slate-800 italic">"{parts[0]?.trim()}"</p>
                  <p className="text-slate-500 text-sm mt-1">"{parts[1]?.trim()}"</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed text-slate-300 text-sm">
            No usage examples available yet.
          </div>
        )}
      </div>
    </div>
  );

 return (
    /* 1. Change h-screen to min-h-screen but keep the main container fixed to viewport height */
    <div className="flex flex-col h-screen bg-white font-sans overflow-hidden">
      
      {/* HEADER: Remains static at the top */}
      <header className="border-b bg-white p-4 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-2 font-black text-emerald-700 text-xl tracking-tighter">
            <BookOpen className="h-6 w-6" strokeWidth={3} /> KUTIIT
          </div>
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
              placeholder="Search..." 
              className="pl-10 h-11 bg-slate-50 border-none rounded-xl focus-visible:ring-emerald-500/20 text-md shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER: Uses flex-1 and overflow-hidden to contain the scrollable areas */}
      <main className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full border-x bg-white">
        
        {/* SIDEBAR: overflow-y-auto ensures it scrolls independently */}
        <aside className="hidden md:flex w-80 lg:w-96 flex-col border-r bg-slate-50/30 shrink-0">
          <div className="p-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b flex justify-between bg-white px-5 shrink-0">
            <span>{mounted ? `${filteredWords.length} Entries` : "Loading..."}</span>
            {(loading || !mounted) && <Loader2 size={12} className="animate-spin text-emerald-600" />}
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredWords.map((word) => (
              <button
                key={word.id}
                onClick={() => handleSelectWord(word)}
                className={`w-full text-left p-5 border-b transition-all flex justify-between items-center group ${
                  selectedWord?.id === word.id 
                    ? "bg-white border-l-4 border-l-emerald-500 shadow-sm" 
                    : "hover:bg-slate-100 border-l-4 border-l-transparent"
                }`}
              >
                <div className="flex-1 pr-2">
                  <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors uppercase text-sm">
                    {word.entry_name}
                  </div>
                  <div className="text-xs text-slate-400 italic line-clamp-1 mt-0.5 font-medium">
                    {word.translation_en}
                  </div>
                </div>
                <ChevronRight size={16} className={selectedWord?.id === word.id ? "text-emerald-500" : "text-slate-200"} />
              </button>
            ))}
            {/* Added padding at bottom so the last item isn't hugged by the screen edge */}
            <div className="h-20" /> 
          </div>
        </aside>

        {/* MOBILE LIST: Visible only on mobile, replaces the desktop detail view when no word is selected */}
        <section className="flex-1 md:hidden overflow-y-auto p-0">
           {filteredWords.map((word) => (
              <button
                key={word.id}
                onClick={() => handleSelectWord(word)}
                className="w-full text-left p-6 border-b flex justify-between items-center bg-white"
              >
                <div>
                  <div className="font-black text-slate-900 uppercase text-lg">{word.entry_name}</div>
                  <div className="text-sm text-slate-500">{word.translation_en}</div>
                </div>
                <ChevronRight size={20} className="text-emerald-500" />
              </button>
            ))}
            <div className="h-20" />
        </section>

        {/* DESKTOP DETAIL VIEW: Independent scroll zone */}
        <section className="hidden md:block flex-1 overflow-y-auto bg-white p-12 custom-scrollbar">
          {selectedWord ? (
            <WordDetailContent word={selectedWord} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-200">
              <BookOpen size={80} className="opacity-10 mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">Select an entry</p>
            </div>
          )}
          <div className="h-20" /> {/* Safe zone for the bottom of the content */}
        </section>
      </main>

      {/* MOBILE MODAL: Uses Dialog from components */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-full max-w-full sm:max-w-[500px] h-full sm:h-auto max-h-screen sm:max-h-[85vh] p-0 flex flex-col border-none overflow-hidden rounded-none sm:rounded-[2.5rem] shadow-2xl bg-white [&>button]:hidden">
          <DialogHeader className="p-6 border-b bg-white flex flex-row items-center justify-between space-y-0 shrink-0">
            <DialogTitle className="text-sm font-black uppercase tracking-widest text-slate-400">
              Dictionary Entry
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full h-10 w-10">
              <X size={20} className="text-slate-400" />
            </Button>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-8 bg-white">
            {selectedWord && <WordDetailContent word={selectedWord} />}
            <div className="h-12" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}