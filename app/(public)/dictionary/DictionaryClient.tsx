// app/(public)/dictionary/DictionaryClient.tsx

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  ChevronRight,
  X,
  MessageSquareQuote,
  Quote,
  Frown,
  Languages,
  Plus,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import SuggestWordModal from "@/components/shared/SuggestWordModal";
import { getWordTypeLabel } from "@/lib/wordTypeLabels";
import Fuse from "fuse.js";

interface ClientCacheEntry {
  results: any[];
  timestamp: number;
}

const clientSearchCache: Record<string, ClientCacheEntry> = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000;

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

  const wordTypes = ["all", ...new Set(words.map((w) => w.word_type).filter(Boolean))];

  const fuse = useMemo(() => {
    return new Fuse(words, {
      keys: ["entry_name", "translation_en", "translations", "answer", "notes", "examples"],
      threshold: 0.37,
      distance: 100
    });
  }, [words]);

  const performClientSearch = useCallback(
    (query: string) => {
      if (!query.trim()) {
        if (selectedType === "all") {
          setFilteredWords(words);
        } else {
          setFilteredWords(words.filter((w) => w.word_type === selectedType));
        }
        return;
      }

      setIsSearching(true);

      const cacheKey = `client|${query}|${selectedType}`;
      const cached = clientSearchCache[cacheKey];

      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setFilteredWords(cached.results);
        setIsSearching(false);
        return;
      }

      const results = fuse.search(query).map((result) => result.item);

      const filtered =
        selectedType === "all"
          ? results
          : results.filter((w) => w.word_type === selectedType);

      clientSearchCache[cacheKey] = {
        results: filtered,
        timestamp: Date.now()
      };

      setFilteredWords(filtered);
      setIsSearching(false);
    },
    [words, fuse, selectedType]
  );

  const performAPISearch = useCallback(
    async (query: string) => {
      const cacheKey = `api|${query}|${selectedType}`;

      const cached = clientSearchCache[cacheKey];
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setFilteredWords(cached.results);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const params = new URLSearchParams({
          q: query.trim(),
          type: selectedType,
          limit: "100"
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
        console.error("Search error:", error);
        performClientSearch(query);
      } finally {
        setIsSearching(false);
      }
    },
    [selectedType, performClientSearch]
  );

  const performSearch = useCallback(
    (query: string) => {
      if (!query.trim()) {
        if (selectedType === "all") {
          setFilteredWords(words);
        } else {
          setFilteredWords(words.filter((w) => w.word_type === selectedType));
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
    },
    [performClientSearch, performAPISearch, words, selectedType]
  );

  useEffect(() => {
    const cleanup = performSearch(searchQuery);
    return cleanup;
  }, [searchQuery, selectedType, performSearch]);

  const clearSearchCache = useCallback(async () => {
    Object.keys(clientSearchCache).forEach((key) => delete clientSearchCache[key]);
    try {
      await fetch("/api/search/clear-cache", { method: "POST" });
    } catch (error) {
      console.error("Failed to clear cache:", error);
    }
  }, []);

  const clearSearch = () => {
    setSearchQuery("");
    if (selectedType === "all") {
      setFilteredWords(words);
    } else {
      setFilteredWords(words.filter((w) => w.word_type === selectedType));
    }
  };

  const renderLingueeLine = (line: string) => {
    if (!line.includes("-")) {
      return (
        <p className="text-base text-slate-700 text-center">{line}</p>
      );
    }
    const [nandi, english] = line.split("-");
    return (
      <div className="border-l-4 border-emerald-500 pl-4 py-1">
        <p className="font-bold text-slate-900 text-base">{nandi.trim()}</p>
        <p className="text-slate-500 italic text-sm mt-1">{english.trim()}</p>
      </div>
    );
  };

  const WordDetailContent = ({ word }: { word: any }) => {
    const isTraditional = ["proverb", "saying", "riddle"].includes(word.word_type);
    const isRiddle = word.word_type === "riddle";
    const hasNounForms =
      word.singular_indefinite ||
      word.singular_definite ||
      word.plural_indefinite ||
      word.plural_definite;

    const translations =
      word.translations || (word.translation_en ? [word.translation_en] : []);

    return (
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300 pb-12">
        <div className="w-full bg-white rounded-[2rem] border-[3px] border-emerald-600 shadow-[0_20px_60px_-15px_rgba(5,150,105,0.35)] overflow-hidden">
          {/* Header band */}
          <div className="bg-emerald-600 px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0 mt-0.5">
                {isTraditional ? (
                  <Quote size={22} className="text-white" />
                ) : (
                  <BookOpen size={22} className="text-white" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h1
                  className={`font-black text-white leading-tight break-words ${
                    isTraditional
                      ? "text-xl md:text-2xl italic tracking-tight"
                      : "text-2xl md:text-3xl uppercase tracking-tighter"
                  }`}
                >
                  {word.entry_name}
                </h1>
                <p className="text-xs text-emerald-50/90 font-bold uppercase tracking-[0.15em] mt-1">
                  {getWordTypeLabel(word.word_type)}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Riddle Answer */}
            {isRiddle && word.answer && (
              <div className="bg-emerald-50 rounded-2xl p-5 border-2 border-emerald-100 text-center">
                <p className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-2">
                  Walutiet
                </p>
                <p className="text-3xl md:text-4xl font-black text-emerald-900 uppercase tracking-tighter">
                  {word.answer}
                </p>
              </div>
            )}

            {/* Translations / Meaning */}
            {!isRiddle && translations.length > 0 && (
              <div className="text-center space-y-2">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  {isTraditional ? "Meaning" : "Translations"}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {translations.map((translation: string, index: number) => (
                    <span key={index} className="text-xl md:text-2xl font-bold text-emerald-700">
                      {translation}
                      {index < translations.length - 1 && (
                        <span className="text-slate-300 mx-2">•</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Noun forms */}
            {hasNounForms && (
              <div className="bg-slate-50 rounded-2xl p-5 border-2 border-slate-100">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 text-center">
                  Forms
                </p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  {word.singular_indefinite && (
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase block mb-1 font-bold">
                        Singular (indef.)
                      </span>
                      <span className="font-bold text-slate-900 text-lg">
                        {word.singular_indefinite}
                      </span>
                    </div>
                  )}
                  {word.singular_definite && (
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase block mb-1 font-bold">
                        Singular (def.)
                      </span>
                      <span className="font-bold text-emerald-700 text-lg">
                        {word.singular_definite}
                      </span>
                    </div>
                  )}
                  {word.plural_indefinite && (
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase block mb-1 font-bold">
                        Plural (indef.)
                      </span>
                      <span className="font-bold text-slate-900 text-lg">
                        {word.plural_indefinite}
                      </span>
                    </div>
                  )}
                  {word.plural_definite && (
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase block mb-1 font-bold">
                        Plural (def.)
                      </span>
                      <span className="font-bold text-emerald-700 text-lg">
                        {word.plural_definite}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Imperative */}
            {word.imperative && (
              <div className="bg-amber-50 rounded-2xl p-5 border-2 border-amber-100 text-center">
                <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-2">
                  Imperative
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {word.imperative}
                  {word.imperative_plural && (
                    <span className="text-amber-700 ml-3">
                      / {word.imperative_plural}
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Examples */}
            {word.examples && (
              <div className="space-y-3">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 text-center flex items-center justify-center gap-2">
                  <Languages size={14} className="text-emerald-500" /> Examples
                </p>
                {word.examples
                  .split("\n")
                  .filter((line: string) => line.trim())
                  .map((line: string, i: number) => (
                    <div
                      key={i}
                      className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-100"
                    >
                      {renderLingueeLine(line)}
                    </div>
                  ))}
              </div>
            )}

            {/* Notes */}
            {word.notes && (
              <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-100">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 text-center flex items-center justify-center gap-2">
                  <MessageSquareQuote size={14} className="text-emerald-500" /> Notes & Context
                </p>
                <p className="text-sm text-slate-600 italic leading-relaxed whitespace-pre-wrap text-center">
                  {word.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row flex-1 h-full bg-white font-sans overflow-hidden max-w-7xl mx-auto w-full border-x">
      <aside className="flex w-full md:w-80 lg:w-96 flex-col border-r bg-slate-50/30 shrink-0 h-full overflow-hidden relative">
        <div className="sticky top-0 p-4 bg-white border-b shrink-0 z-30">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                size={18}
              />
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
              <Plus size={18} />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            {showFilters ? (
              <div className="flex flex-wrap items-center gap-2 w-full">
                <div className="flex flex-wrap gap-1.5 flex-1">
                  {wordTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                        selectedType === type
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {type === "all" ? "All" : getWordTypeLabel(type)}
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
                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all bg-slate-100 text-slate-500 hover:bg-slate-200"
              >
                Filters
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
          {filteredWords.length > 0 ? (
            filteredWords.map((word) => {
              const sidebarTranslations =
                word.translations || (word.translation_en ? [word.translation_en] : []);

              return (
                <button
                  key={word.id}
                  onClick={() => {
                    setSelectedWord(word);
                    if (window.innerWidth < 768) setIsModalOpen(true);
                  }}
                  className={`w-full text-left p-5 border-b transition-all flex justify-between items-center group ${
                    selectedWord?.id === word.id
                      ? "bg-white border-l-4 border-l-emerald-600 shadow-sm"
                      : "hover:bg-slate-50 border-l-4 border-l-transparent"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-black text-slate-900 uppercase text-sm tracking-tight truncate">
                      {word.entry_name}
                    </div>
                    <div className="text-xs text-slate-400 italic truncate mt-1">
                      {word.word_type === "riddle"
                        ? word.answer
                        : sidebarTranslations.join(", ")}
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className={
                      selectedWord?.id === word.id
                        ? "text-emerald-600"
                        : "text-slate-200"
                    }
                  />
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

      <section className="hidden md:block flex-1 overflow-y-auto bg-slate-50/50 p-8 custom-scrollbar relative">
        {selectedWord && filteredWords.length > 0 ? (
          <WordDetailContent word={selectedWord} />
        ) : (
          <div className="h-full flex items-center justify-center opacity-20 uppercase tracking-[0.5em] text-[10px] font-black">
            Select a word to begin
          </div>
        )}
      </section>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[85vh] rounded-[2rem] p-0 flex flex-col border-none bg-slate-50 overflow-hidden [&>button]:hidden">
          <VisuallyHidden.Root>
            <DialogHeader>
              <DialogTitle>{selectedWord?.entry_name || "Word Details"}</DialogTitle>
              <DialogDescription>Full details</DialogDescription>
            </DialogHeader>
          </VisuallyHidden.Root>
          <div className="p-4 border-b flex justify-end items-center bg-white sticky top-0 z-20 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsModalOpen(false)}
              className="rounded-full bg-slate-50 h-10 w-10"
            >
              <X size={20} className="text-slate-500" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
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