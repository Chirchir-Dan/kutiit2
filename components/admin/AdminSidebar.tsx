"use client";

import { useMemo } from "react";
import {
  Search,
  X,
  BookOpen,
  Plus,
  ChevronRight,
  Inbox
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminSidebarProps {
  view: "words" | "suggestions";
  onViewChange: (view: "words" | "suggestions") => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isSearching: boolean;
  words: any[];
  suggestions: any[];
  currentList: any[];
  selectedWord: any;
  onSelect: (word: any) => void;
  onAddNew: () => void;
  onClearCache: () => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  showIrregularOnly: boolean;
  onIrregularToggle: (show: boolean) => void;
}

export default function AdminSidebar({
  view,
  onViewChange,
  searchQuery,
  onSearchChange,
  isSearching,
  words,
  suggestions,
  currentList,
  selectedWord,
  onSelect,
  onAddNew,
  onClearCache,
  selectedType,
  onTypeChange,
  showIrregularOnly,
  onIrregularToggle
}: AdminSidebarProps) {
  const wordTypes = useMemo(() => {
    const types = new Set(words.map((w) => w.word_type).filter(Boolean));
    return ["all", ...Array.from(types)];
  }, [words]);

  const filteredList = useMemo(() => {
    let result = currentList;

    if (view === "words") {
      if (selectedType !== "all") {
        result = result.filter((w) => w.word_type === selectedType);
      }
      if (showIrregularOnly) {
        result = result.filter((w) => w.is_irregular === true);
      }
    }

    return result;
  }, [currentList, selectedType, showIrregularOnly, view]);

  return (
    <aside className="w-full md:w-80 lg:w-96 border-r bg-slate-50/30 flex flex-col shrink-0">
      <div className="p-4 border-b bg-white space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
            Database
          </span>
          <div className="flex gap-2">
            <Button
              onClick={onClearCache}
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-amber-600 font-black text-[10px] uppercase hover:bg-amber-50 transition-colors"
              title="Clear search cache"
            >
              <X size={12} className="mr-1" /> Clear Cache
            </Button>
            <Button
              onClick={onAddNew}
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-emerald-600 font-black text-[10px] uppercase hover:bg-emerald-50 transition-colors"
            >
              <Plus size={14} className="mr-1" /> New Entry
            </Button>
          </div>
        </div>

        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => onViewChange("words")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${
              view === "words"
                ? "bg-white shadow-sm text-emerald-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <BookOpen size={14} />
            Live
            <span
              className={`ml-1 px-1.5 py-0.5 rounded-md text-[9px] ${
                view === "words"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {words.length}
            </span>
          </button>
          <button
            onClick={() => onViewChange("suggestions")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${
              view === "suggestions"
                ? "bg-white shadow-sm text-amber-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Inbox size={14} />
            Review
            {suggestions.length > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-md text-[9px] ${
                  view === "suggestions"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-amber-200 text-amber-800"
                }`}
              >
                {suggestions.length}
              </span>
            )}
          </button>
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={14}
          />
          <Input
            placeholder={
              view === "words" ? "Search words..." : "Search suggestions..."
            }
            className="pl-9 bg-white border-slate-200 h-11 text-xs rounded-xl focus-visible:ring-emerald-500"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent"></div>
            </div>
          )}
        </div>

        {view === "words" && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {wordTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => onTypeChange(type)}
                  className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase transition-all ${
                    selectedType === type
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {type === "all" ? "All" : type}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 cursor-pointer px-1">
              <input
                type="checkbox"
                checked={showIrregularOnly}
                onChange={(e) => onIrregularToggle(e.target.checked)}
                className="w-3.5 h-3.5 accent-amber-600"
              />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Irregular verbs only
              </span>
            </label>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredList.length > 0 ? (
          filteredList.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className={`w-full text-left p-5 border-b transition-all flex justify-between items-center ${
                selectedWord?.id === item.id
                  ? "bg-white border-l-4 border-l-emerald-600 shadow-sm"
                  : "hover:bg-white/60 border-l-4 border-l-transparent"
              }`}
            >
              <div className="min-w-0">
                <div className="font-bold text-slate-900 uppercase text-[11px] truncate">
                  {item.entry_name}
                </div>
                <div className="text-[10px] text-slate-400 italic truncate mt-0.5">
                  {(
                    item.translations ||
                    (item.translation_en ? [item.translation_en] : [])
                  ).join(", ")}
                </div>
              </div>
              <ChevronRight
                size={14}
                className={
                  selectedWord?.id === item.id
                    ? "text-emerald-500"
                    : "text-slate-200"
                }
              />
            </button>
          ))
        ) : (
          <div className="p-10 text-center">
            <div className="text-slate-400 text-sm">
              {searchQuery ? (
                <>
                  <p className="font-bold">No results found</p>
                  <p className="text-xs mt-1">Try adjusting your search</p>
                </>
              ) : (
                <p className="font-bold">
                  No {view === "words" ? "words" : "suggestions"} available
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}