// app/(public)/word-of-the-day/WordOfTheDayClient.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Check,
  Calendar,
  BookOpen,
  ArrowLeft,
  Sparkles
} from "lucide-react";

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
}

export default function WordOfTheDayClient({ word }: WordOfTheDayProps) {
  const [copied, setCopied] = useState(false);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const displayWord = word.entry_name || word.translation_en;
  const displayMeaning =
    word.word_type === "riddle" && word.answer
      ? word.answer
      : word.translation_en;

  const buildTikTokText = () => {
    const lines: string[] = [];
    lines.push(`📚 Nandi Word of the Day`);
    lines.push(``);
    lines.push(`🗣️ ${displayWord}`);
    lines.push(`💬 ${displayMeaning}`);
    if (word.word_type) lines.push(`📖 ${word.word_type}`);
    if (word.examples) {
      const firstExample = word.examples.split("\n")[0].trim();
      if (firstExample) {
        lines.push(``);
        lines.push(`Example: ${firstExample}`);
      }
    }
    lines.push(``);
    lines.push(`#Nandi #Kalenjin #Kutiit #LanguageLearning #AfricanLanguages #Kenya #WordOfTheDay`);
    return lines.join("\n");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildTikTokText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-12 md:py-20 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-8">
        <Calendar size={16} className="text-emerald-600" />
        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
          {today}
        </span>
      </div>

      {/* Word Card */}
      <div className="w-full bg-white rounded-[3rem] border-2 border-emerald-100 shadow-xl overflow-hidden">
        {/* Header band */}
        <div className="bg-emerald-50/50 px-8 py-6 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-widest text-emerald-700">
                Word of the Day
              </h1>
              <p className="text-[10px] text-emerald-600/70 font-bold uppercase tracking-wider">
                {word.word_type}
              </p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="p-8 md:p-12 space-y-8">
          {/* The word */}
          <div className="text-center space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              Today's word
            </p>
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-none">
              {displayWord}
            </h2>
            <div className="flex items-center justify-center gap-3 pt-3">
              <div className="h-px w-12 bg-emerald-200" />
              <p className="text-2xl md:text-3xl font-bold text-emerald-700">
                {displayMeaning}
              </p>
              <div className="h-px w-12 bg-emerald-200" />
            </div>
          </div>

          {/* Word forms */}
          {(word.singular_indefinite ||
            word.singular_definite ||
            word.plural_indefinite ||
            word.plural_definite) && (
            <div className="bg-slate-50 rounded-2xl p-6 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                Forms
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {word.singular_indefinite && (
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">
                      Singular (indef.)
                    </span>
                    <span className="font-bold text-slate-900">
                      {word.singular_indefinite}
                    </span>
                  </div>
                )}
                {word.singular_definite && (
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">
                      Singular (def.)
                    </span>
                    <span className="font-bold text-emerald-700">
                      {word.singular_definite}
                    </span>
                  </div>
                )}
                {word.plural_indefinite && (
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">
                      Plural (indef.)
                    </span>
                    <span className="font-bold text-slate-900">
                      {word.plural_indefinite}
                    </span>
                  </div>
                )}
                {word.plural_definite && (
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">
                      Plural (def.)
                    </span>
                    <span className="font-bold text-emerald-700">
                      {word.plural_definite}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Imperative */}
          {word.imperative && (
            <div className="bg-amber-50/50 rounded-2xl p-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-2">
                Imperative
              </p>
              <p className="text-lg font-bold text-slate-900">
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
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Example
              </p>
              {word.examples
                .split("\n")
                .filter((l) => l.trim())
                .slice(0, 3)
                .map((line, i) => (
                  <div
                    key={i}
                    className="p-5 bg-slate-50 rounded-2xl border-l-4 border-emerald-500/30"
                  >
                    <p className="text-base font-medium text-slate-700 whitespace-pre-wrap">
                      {line.trim()}
                    </p>
                  </div>
                ))}
            </div>
          )}

          {/* Notes */}
          {word.notes && (
            <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Notes
              </p>
              <p className="text-sm text-slate-600 italic leading-relaxed whitespace-pre-wrap">
                {word.notes}
              </p>
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="bg-slate-50 px-8 py-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleCopy}
            className="flex-1 bg-slate-900 hover:bg-black text-white h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest"
          >
            {copied ? (
              <>
                <Check size={16} className="mr-2" /> Copied for TikTok
              </>
            ) : (
              <>
                <Copy size={16} className="mr-2" /> Copy for TikTok
              </>
            )}
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1 border-2 border-slate-200 h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-white"
          >
            <Link href="/dictionary" className="flex items-center justify-center">
              <BookOpen size={16} className="mr-2" /> Browse Dictionary
            </Link>
          </Button>
        </div>
      </div>

      {/* Back link */}
      <Link
        href="/"
        className="mt-8 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-2"
      >
        <ArrowLeft size={14} /> Back to Home
      </Link>
    </div>
  );
}