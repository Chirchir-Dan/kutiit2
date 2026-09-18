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
    <div className="flex-1 flex flex-col items-center px-4 py-8 md:py-12 max-w-2xl mx-auto w-full">
      {/* Card */}
      <div className="w-full bg-white rounded-[2rem] border-[3px] border-emerald-600 shadow-[0_20px_60px_-15px_rgba(5,150,105,0.35)] overflow-hidden">
        {/* Header band */}
        <div className="bg-emerald-600 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
              <Sparkles size={22} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-black uppercase tracking-tight text-white leading-tight">
                Ng&apos;olyot ap Rani
              </h1>
              <p className="text-xs text-emerald-50/90 font-bold uppercase tracking-[0.15em] mt-0.5">
                {getWordTypeLabel(word.word_type)}
              </p>
            </div>
          </div>

          {dateString && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/20">
              <Calendar size={15} className="text-white/80 shrink-0" />
              <span className="text-sm font-bold text-white tracking-wide">
                {dateString}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 space-y-6">
          {/* The word */}
          <div className="text-center space-y-2">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none break-words">
              {displayWord}
            </h2>
            <div className="flex items-center justify-center gap-3 pt-2">
              <div className="h-[2px] w-8 bg-emerald-600" />
              <p className="text-xl md:text-2xl font-bold text-emerald-700">
                {displayMeaning}
              </p>
              <div className="h-[2px] w-8 bg-emerald-600" />
            </div>
          </div>

          {/* Word forms */}
          {(word.singular_indefinite ||
            word.singular_definite ||
            word.plural_indefinite ||
            word.plural_definite) && (
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
                    className="p-4 bg-slate-50 rounded-xl border-l-4 border-emerald-500"
                  >
                    <p className="text-base font-medium text-slate-700 whitespace-pre-wrap text-center">
                      {line.trim()}
                    </p>
                  </div>
                ))}
            </div>
          )}

          {/* Notes */}
          {word.notes && (
            <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-100">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 text-center">
                Notes
              </p>
              <p className="text-sm text-slate-600 italic leading-relaxed whitespace-pre-wrap text-center">
                {word.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-emerald-50 px-6 py-4 border-t-2 border-emerald-100 flex justify-center">
          <Button
            asChild
            variant="outline"
            className="border-2 border-emerald-600 bg-white hover:bg-emerald-50 h-11 px-6 rounded-xl font-bold uppercase text-xs tracking-widest text-emerald-700"
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
        className="mt-6 text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-2"
      >
        <ArrowLeft size={15} /> Back to Home
      </Link>
    </div>
  );
}