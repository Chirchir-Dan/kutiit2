// app/(public)/word-of-the-day/WordOfTheDayClient.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowLeft, Sparkles, Calendar } from "lucide-react";
import type { NandiCalendar } from "@/lib/nandiDate";
import { getWordTypeLabel } from "@/lib/wordTypeLabels";

interface WordOfTheDayProps {
  word: {
    id: string;
    entry_name: string | null;
    translation_en: string;
    word_type: string;
    singular_indefinite: string | null;
    singular_definite: string | null;
    plural_indefinite: string | null;
    plural_definite: string | null;
    imperative: string | null;
    imperative_plural: string | null;
    examples: string | null;
    notes: string | null;
    answer: string | null;
    translations: string[] | null;
  };
  calendar: NandiCalendar;
}

function formatNandiDate(date: Date, calendar: NandiCalendar): string {
  const dayEn = date
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
  const monthEn = date
    .toLocaleDateString("en-US", { month: "long" })
    .toLowerCase();

  const dayName = calendar.dayNames[dayEn] || null;
  const monthName = calendar.monthNames[monthEn] || null;
  const dayOfMonth = date.getDate();
  const year = date.getFullYear();

  const parts: string[] = [];
  if (dayName) parts.push(dayName);
  parts.push(String(dayOfMonth));
  if (monthName) parts.push(monthName);
  parts.push(String(year));

  return parts.join(", ");
}

// Scale font based on length so long words don't break mid-word
function getWordSizeClass(word: string): string {
  const len = word.length;
  if (len > 22) return "text-xl sm:text-2xl md:text-3xl";
  if (len > 16) return "text-2xl sm:text-3xl md:text-4xl";
  if (len > 10) return "text-3xl sm:text-4xl md:text-5xl";
  return "text-4xl sm:text-5xl md:text-6xl";
}

export default function WordOfTheDayClient({
  word,
  calendar
}: WordOfTheDayProps) {
  const [dateString, setDateString] = useState<string>("");

  useEffect(() => {
    const nairobiNow = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Africa/Nairobi" })
    );
    setDateString(formatNandiDate(nairobiNow, calendar));
  }, [calendar]);

  const displayWord = word.entry_name || word.translation_en;
  const displayMeaning =
    word.word_type === "riddle" && word.answer
      ? word.answer
      : word.translation_en;

  return (
    <div className="flex-1 flex flex-col items-center px-3 sm:px-4 py-6 md:py-12 max-w-2xl mx-auto w-full">
      {/* Card */}
      <div className="w-full bg-white rounded-[1.5rem] sm:rounded-[2rem] border-[3px] border-emerald-600 shadow-[0_20px_60px_-15px_rgba(5,150,105,0.35)] overflow-hidden">
        {/* Header band */}
        <div className="bg-emerald-600 px-4 sm:px-6 py-4 sm:py-5">
          {/* Row 1: Icon + Word Type */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <Sparkles size={20} className="text-white" />
            </div>
            <p className="text-xs sm:text-sm font-black text-amber-200 uppercase tracking-[0.2em] truncate">
              {getWordTypeLabel(word.word_type)}
            </p>
          </div>

          {/* Row 2: Card title */}
          <h1 className="mt-3 text-base sm:text-lg md:text-xl font-black uppercase tracking-tight text-white leading-tight">
            Ng&apos;olyot ap Rani
          </h1>

          {/* Date */}
          {dateString && (
            <div className="flex items-start gap-2 mt-4 pt-4 border-t border-white/20">
              <Calendar size={15} className="text-white/80 shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                {dateString}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
          {/* The word */}
          <div className="text-center space-y-2">
            <h2
              className={`${getWordSizeClass(displayWord)} font-black text-slate-900 uppercase tracking-tighter leading-tight [overflow-wrap:normal] [word-break:keep-all]`}
            >
              {displayWord}
            </h2>
            <div className="flex items-center justify-center gap-2 sm:gap-3 pt-2 flex-wrap">
              <div className="hidden sm:block h-[2px] w-8 bg-emerald-600" />
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-700">
                {displayMeaning}
              </p>
              <div className="hidden sm:block h-[2px] w-8 bg-emerald-600" />
            </div>
          </div>

          {/* Word forms */}
          {(word.singular_indefinite ||
            word.singular_definite ||
            word.plural_indefinite ||
            word.plural_definite) && (
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
              <p className="text-lg sm:text-xl font-bold text-slate-900">
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
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 text-center">
                Example
              </p>
              {word.examples
                .split("\n")
                .filter((l) => l.trim())
                .slice(0, 2)
                .map((line, i) => (
                  <div
                    key={i}
                    className="p-3 sm:p-4 bg-slate-50 rounded-xl border-l-4 border-emerald-500"
                  >
                    <p className="text-sm sm:text-base font-medium text-slate-700 whitespace-pre-wrap text-center break-words">
                      {line.trim()}
                    </p>
                  </div>
                ))}
            </div>
          )}

          {/* Notes */}
          {word.notes && (
            <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border-2 border-slate-100">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 text-center">
                Notes
              </p>
              <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed whitespace-pre-wrap text-center break-words">
                {word.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-emerald-50 px-4 sm:px-6 py-4 border-t-2 border-emerald-100 flex justify-center">
          <Button
            asChild
            variant="outline"
            className="border-2 border-emerald-600 bg-white hover:bg-emerald-50 h-11 px-5 sm:px-6 rounded-xl font-bold uppercase text-[11px] sm:text-xs tracking-widest text-emerald-700"
          >
            <Link href="/dictionary" className="flex items-center justify-center">
              <BookOpen size={15} className="mr-2" /> Browse Dictionary
            </Link>
          </Button>
        </div>
      </div>

      {/* Back link */}
      <Link
        href="/"
        className="mt-6 text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-2"
      >
        <ArrowLeft size={15} /> Back to Home
      </Link>
    </div>
  );
}