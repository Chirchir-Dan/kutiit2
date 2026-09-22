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

function getWordSizeClass(word: string, isTraditional: boolean): string {
  const len = word.length;
  if (isTraditional) {
    if (len > 30) return "text-base sm:text-lg md:text-xl";
    if (len > 20) return "text-lg sm:text-xl md:text-2xl";
    return "text-xl sm:text-2xl md:text-3xl";
  }
  if (len > 22) return "text-lg sm:text-xl md:text-2xl";
  if (len > 16) return "text-xl sm:text-2xl md:text-3xl";
  return "text-2xl sm:text-3xl md:text-4xl";
}

export default function DictionaryClient({
  initialWords
}: {
  initialWords: any[];
}) {
  const [words] = useState<any[]>(initialWords);
  const [filteredWords, setFilteredWords] = useState<any[]>(initialWords);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWord, setSelectedWord] = useState<any>(
    initialWords[0] || null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const wordTypes = [
    "all",
    ...new Set(words.map((w) => w.word_type).filter(Boolean))
  ];

  const fuse = useMemo(() => {
    return new Fuse(words, {
      keys: [
        "entry_name",
        "translation_en",
        "translations",
        "answer",
        "notes",
        "examples"
      ],
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

      // Always search via API for fuzzy matching
      const timer = setTimeout(() => {
        performAPISearch(query);
      }, 300);

      return () => clearTimeout(timer);
    },
    [performAPISearch, words, selectedType]
  );

  useEffect(() => {
    const cleanup = performSearch(searchQuery);
    return cleanup;
  }, [searchQuery, selectedType, performSearch]);

  const clearSearchCache = useCallback(async () => {
    Object.keys(clientSearchCache).forEach(
      (key) => delete clientSearchCache[key]
    );
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
        <p className="text-sm sm:text-base text-slate-700 text-center">{line}</p>
      );
    }
    const [nandi, english] = line.split("-");
    return (
      <div className="border-l-4 border-emerald-500 pl-4 py-1">
        <p className="font-bold text-slate-900 text-sm sm:text-base break-words">
          {nandi.trim()}
        </p>
        <p className="text-slate-500 italic text-xs sm:text-sm mt-1 break-words">
          {english.trim()}
        </p>
      </div>
    );
  };

  const WordDetailContent = ({
    word,
    onClose
  }: {
    word: any;
    onClose?: () => void;
  }) => {
    const isTraditional = ["proverb", "saying", "riddle"].includes(
      word.word_type
    );
    const isRiddle = word.word_type === "riddle";
    const hasNounForms =
      word.singular_indefinite ||
      word.singular_definite ||
      word.plural_indefinite ||
      word.plural_definite;

    const translations =
      word.translations || (word.translation_en ? [word.translation_en] : []);

    const displayWord = word.entry_name || word.translation_en;

    return (
      <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4 duration-300 pb-4">
        <div className="w-full bg-white rounded-[1.5rem] sm:rounded-[2rem] border-[3px] border-emerald-600 shadow-[0_20px_60px_-15px_rgba(5,150,105,0.35)] overflow-hidden">
          {/* Header band */}
          <div className="bg-emerald-600 px-4 sm:px-6 py-4 sm:py-5 relative">
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur flex items-center justify-center transition-colors z-10"
                aria-label="Close"
              >
                <X size={18} className="text-white" />
              </button>
            )}

            {/* Row 1: Icon + Word Type */}
            <div className="flex items-center gap-3 min-w-0 pr-10">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
                {isTraditional ? (
                  <Quote size={20} className="text-white" />
                ) : (
                  <BookOpen size={20} className="text-white" />
                )}
              </div>
              <p className="text-xs sm:text-sm font-black text-amber-200 uppercase tracking-[0.2em] truncate">
                {getWordTypeLabel(word.word_type)}
              </p>
            </div>

            {/* Row 2: The Word */}
            <h1
              className={`mt-3 font-black text-white leading-tight [overflow-wrap:normal] [word-break:keep-all] ${getWordSizeClass(
                displayWord,
                isTraditional
              )} ${
                isTraditional
                  ? "italic tracking-tight"
                  : "uppercase tracking-tighter"
              }`}
            >
              {displayWord}
            </h1>
          </div>

          {/* Body */}
          <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
            {/* Riddle Answer */}
            {isRiddle && word.answer && (
              <div className="bg-emerald-50 rounded-2xl p-4 sm:p-5 border-2 border-emerald-100 text-center">
                <p className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-2">
                  Walutiet
                </p>
                <p className="text-2xl sm:text-3xl md:text-4xl font-black text-emerald-900 uppercase tracking-tighter [overflow-wrap:normal]">
                  {word.answer}
                </p>
              </div>
            )}

            {/* Translations */}
            {!isRiddle && translations.length > 0 && (
              <div className="text-center space-y-2">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">
                  {isTraditional ? "Meaning" : "Translations"}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {translations.map((translation: string, index: number) => (
                    <span
                      key={index}
                      className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-700 break-words"
                    >
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
              <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border-2 border-slate-100">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 text-center">
                  Forms
                </p>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
                  {word.singular_indefinite && (
                    <div className="min-w-0">
                      <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase block mb-1 font-bold">
                        Singular (indef.)
                      </span>
                      <span className="font-bold text-slate-900 text-xs sm:text-sm md:text-base [overflow-wrap:normal] [word-break:keep-all]">
                        {word.singular_indefinite}
                      </span>
                    </div>
                  )}
                  {word.singular_definite && (
                    <div className="min-w-0">
                      <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase block mb-1 font-bold">
                        Singular (def.)
                      </span>
                      <span className="font-bold text-emerald-700 text-xs sm:text-sm md:text-base [overflow-wrap:normal] [word-break:keep-all]">
                        {word.singular_definite}
                      </span>
                    </div>
                  )}
                  {word.plural_indefinite && (
                    <div className="min-w-0">
                      <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase block mb-1 font-bold">
                        Plural (indef.)
                      </span>
                      <span className="font-bold text-slate-900 text-xs sm:text-sm md:text-base [overflow-wrap:normal] [word-break:keep-all]">
                        {word.plural_indefinite}
                      </span>
                    </div>
                  )}
                  {word.plural_definite && (
                    <div className="min-w-0">
                      <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase block mb-1 font-bold">
                        Plural (def.)
                      </span>
                      <span className="font-bold text-emerald-700 text-xs sm:text-sm md:text-base [overflow-wrap:normal] [word-break:keep-all]">
                        {word.plural_definite}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Imperative */}
            {word.imperative && (
              <div className="bg-amber-50 rounded-2xl p-4 sm:p-5 border-2 border-amber-100 text-center">
                <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-2">
                  Imperative
                </p>
                <p className="text-lg sm:text-xl font-bold text-slate-900 break-words">
                  {word.imperative}
                  {word.imperative_plural && (
                    <span className="text-amber-700 ml-2 sm:ml-3">
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
                      className="p-3 sm:p-4 bg-slate-50 rounded-xl border-l-4 border-emerald-500"
                    >
                      {renderLingueeLine(line)}
                    </div>
                  ))}
              </div>
            )}

            {/* Notes */}
            {word.notes && (
              <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border-2 border-slate-100">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 text-center flex items-center justify-center gap-2">
                  <MessageSquareQuote size={14} className="text-emerald-500" />{" "}
                  Notes &amp; Context
                </p>
                <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed whitespace-pre-wrap text-center break-words">
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
                word.translations ||
                (word.translation_en ? [word.translation_en] : []);

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
              <h3 className="text-lg font-black uppercase text-slate-900">
                Not found
              </h3>
              <p className="text-sm text-slate-500 mt-2">
                No words match your search.
              </p>
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
        <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] rounded-[1.5rem] p-0 flex flex-col border-none bg-transparent shadow-none overflow-hidden [&>button]:hidden">
          <VisuallyHidden.Root>
            <DialogHeader>
              <DialogTitle>
                {selectedWord?.entry_name || "Word Details"}
              </DialogTitle>
              <DialogDescription>Full details</DialogDescription>
            </DialogHeader>
          </VisuallyHidden.Root>
          <div className="flex-1 overflow-y-auto py-4">
            {selectedWord && (
              <WordDetailContent
                word={selectedWord}
                onClose={() => setIsModalOpen(false)}
              />
            )}
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