"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Search, ChevronRight, X, MessageSquareQuote, Quote, Frown, Languages, Plus, 
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import SuggestWordModal from "@/components/shared/SuggestWordModal";
import Fuse from "fuse.js";

// Client-side cache for instant repeat searches
interface ClientCacheEntry {
  results: any[];
  timestamp: number;
}

const clientSearchCache: Record<string, ClientCacheEntry> = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export default function DictionaryClient({ initialWords }: { initialWords: any[] }) {
  const [words] = useState<any[]>(initialWords);
  const [filteredWords, setFilteredWords] = useState<any[]>(initialWords);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWord, setSelectedWord] = useState<any>(initialWords[0] || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Get unique word types for filter
  const wordTypes = ["all", ...new Set(words.map(w => w.word_type).filter(Boolean))];

  // Initialize Fuse.js for client-side search
  const fuse = useMemo(() => {
    return new Fuse(words, {
      keys: [
        "entry_name", 
        "translation_en", 
        "translations",
        "answer", 
        "notes", 
        "examples",
        "dialects"
      ],
      threshold: 0.37,
      distance: 100,
    });
  }, [words]);

  // Client-side search with cache
  const performClientSearch = useCallback((query: string) => {
    if (!query.trim()) {
      if (selectedType === "all") {
        setFilteredWords(words);
      } else {
        setFilteredWords(words.filter(w => w.word_type === selectedType));
      }
      return;
    }

    setIsSearching(true);
    
    const cacheKey = `client|${query}|${selectedType}`;
    const cached = clientSearchCache[cacheKey];
    
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      console.log('✅ Client cache hit:', query);
      setFilteredWords(cached.results);
      setIsSearching(false);
      return;
    }

    let results = fuse.search(query).map(result => result.item);
    
    const filtered = selectedType === "all" 
      ? results 
      : results.filter(w => w.word_type === selectedType);
    
    clientSearchCache[cacheKey] = {
      results: filtered,
      timestamp: Date.now()
    };
    
    setFilteredWords(filtered);
    setIsSearching(false);
  }, [words, fuse, selectedType]);

  // API search with cache
  const performAPISearch = useCallback(async (query: string) => {
    const cacheKey = `api|${query}|${selectedType}`;
    
    const cached = clientSearchCache[cacheKey];
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
      console.log('✅ Client cache hit (API):', query);
      setFilteredWords(cached.results);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        q: query.trim(),
        type: selectedType,
        limit: '100'
      });
      
      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();
      
      if (data.results) {
        clientSearchCache[cacheKey] = {
          results: data.results,
          timestamp: Date.now()
        };
        setFilteredWords(data.results);
      } else {
        setFilteredWords([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      performClientSearch(query);
    } finally {
      setIsSearching(false);
    }
  }, [selectedType, performClientSearch]);

  // Smart search with debounce
  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      if (selectedType === "all") {
        setFilteredWords(words);
      } else {
        setFilteredWords(words.filter(w => w.word_type === selectedType));
      }
      return;
    }

    if (query.length <= 3) {
      performClientSearch(query);
      return;
    }

    const timer = setTimeout(() => {
      performAPISearch(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [performClientSearch, performAPISearch, words, selectedType]);

  // Update search when query or type changes
  useEffect(() => {
    const cleanup = performSearch(searchQuery);
    return cleanup;
  }, [searchQuery, selectedType, performSearch]);

  // Clear cache when needed
  const clearSearchCache = useCallback(async () => {
    Object.keys(clientSearchCache).forEach(key => delete clientSearchCache[key]);
    try {
      await fetch('/api/search/clear-cache', { method: 'POST' });
      console.log('🗑️ Cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }, []);

  const clearSearch = () => {
    setSearchQuery("");
    if (selectedType === "all") {
      setFilteredWords(words);
    } else {
      setFilteredWords(words.filter(w => w.word_type === selectedType));
    }
  };

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
    
    const translations = word.translations || (word.translation_en ? [word.translation_en] : []);

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
                {isTraditional ? "Meaning" : "Translations"}
            </h4>
          }
          <div className="space-y-1">
            {translations.map((translation: string, index: number) => (
              <p key={index} className="text-2xl md:text-3xl text-slate-700 font-semibold leading-snug tracking-tight">
                {translation}
                {index < translations.length - 1 && (
                  <span className="text-slate-300 mx-2">•</span>
                )}
              </p>
            ))}
          </div>
        </div>

        {/* 🔥 FIXED: Noun Forms - Indefinite and Definite on separate lines */}
        {hasNounForms && (
          <div className="mb-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm">
            <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4">Noun Forms</h4>
            <div className="space-y-6">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Singular</span>
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-900">{word.singular_indefinite || "—"}</p>
                  {word.singular_definite && (
                    <p className="text-sm text-emerald-600 font-medium bg-emerald-50/50 px-2 py-1 rounded-md inline-block">{word.singular_definite}</p>
                  )}
                </div>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Plural</span>
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-900">{word.plural_indefinite || "—"}</p>
                  {word.plural_definite && (
                    <p className="text-sm text-emerald-600 font-medium bg-emerald-50/50 px-2 py-1 rounded-md inline-block">{word.plural_definite}</p>
                  )}
                </div>
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
        <div className="sticky top-0 p-4 bg-white border-b shrink-0 z-30">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <Input 
                placeholder="Search words..." 
                className="pl-10 h-12 bg-slate-50 border-none rounded-xl w-full font-normal text-sm placeholder:text-slate-300 focus-visible:ring-emerald-500" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent"></div>
                </div>
              )}
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
          
          {/* Type Filter */}
         {/* Type Filter - Collapsible with X button */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {showFilters ? (
              <div className="flex flex-wrap items-center gap-2 w-full">
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {wordTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase transition-all ${
                        selectedType === type
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {type === "all" ? "All" : type}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-1 rounded-full hover:bg-slate-100 transition-colors shrink-0"
                  aria-label="Hide filters"
                >
                  <X size={16} className="text-slate-400" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowFilters(true)}
                className="px-3 py-1 rounded-full text-[9px] font-bold uppercase transition-all bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                Filters
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
          {filteredWords.length > 0 ? (
            filteredWords.map((word) => {
              const sidebarTranslations = word.translations || (word.translation_en ? [word.translation_en] : []);
              
              return (
                <button 
                  key={word.id} 
                  onClick={() => { setSelectedWord(word); if (window.innerWidth < 768) setIsModalOpen(true); }} 
                  className={`w-full text-left p-6 border-b transition-all flex justify-between items-center group ${selectedWord?.id === word.id ? "bg-white border-l-4 border-l-emerald-500 shadow-sm" : "hover:bg-slate-50 border-l-4 border-l-transparent"}`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-black text-slate-900 uppercase text-sm tracking-tight truncate">{word.entry_name}</div>
                    <div className="text-xs text-slate-400 italic truncate mt-1">
                      {word.word_type === 'riddle' 
                        ? word.answer 
                        : sidebarTranslations.join(', ')
                      }
                    </div>
                  </div>
                  <ChevronRight size={16} className={selectedWord?.id === word.id ? "text-emerald-500" : "text-slate-200"} />
                </button>
              );
            })
          ) : searchQuery.length > 0 ? (
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Frown size={32} />
              </div>
              <h3 className="text-lg font-black uppercase text-slate-900">Not found</h3>
              <p className="text-sm text-slate-500 mt-2">No words match your search.</p>
              <Button 
                onClick={clearSearch}
                variant="ghost"
                className="mt-4 text-emerald-600 font-bold text-sm"
              >
                Clear search
              </Button>
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

      {/* 🔥 FIXED: Modal height */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[85vh] rounded-[3rem] p-0 flex flex-col border-none bg-white shadow-2xl overflow-hidden [&>button]:hidden">
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

      <SuggestWordModal 
        isOpen={isSuggestionModalOpen} 
        onOpenChange={setIsSuggestionModalOpen} 
        initialSearch={searchQuery} 
        onSuccess={() => {
          setIsSuggestionModalOpen(false);
          clearSearchCache();
        }} 
      />
    </div>
  );
}