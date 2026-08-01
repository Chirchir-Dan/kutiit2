"use client";

import { useState, useEffect } from "react"; 
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Plus, Heart } from "lucide-react";
import { SupportModal } from "@/components/shared/SupportModal";
import SuggestWordModal from "@/components/shared/SuggestWordModal";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-start px-4 md:px-6 text-center max-w-5xl mx-auto space-y-10 md:space-y-16 pt-8 pb-20 overflow-x-hidden">
      
      {/* 1. HERO */}
      <div className="space-y-6 w-full px-2">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tight leading-[0.9]">
            <span className="text-emerald-600">Kalenjin</span>
            <span className="text-slate-900"> Dictionary</span>
          </h1>
          <p className="text-[10px] sm:text-xs md:text-lg text-emerald-600 font-bold uppercase tracking-[0.2em]">
            Kalenjin to English Translation Resource
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <p className="text-sm sm:text-base md:text-lg font-medium text-slate-600 leading-relaxed">
            Kutiit is a comprehensive database for Kalenjin words, phrases, riddles and proverbs. 
            Search the resource below, if a term is missing, use the <strong className="text-emerald-600">Add</strong> button 
            beside the search bar in the dictionary to contribute.
          </p>
        </div>

        {/* 2. CORE ACTIONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button asChild className="bg-slate-900 hover:bg-black text-white px-8 py-6 md:h-14 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-xl w-full sm:w-auto">
            <Link href="/dictionary" className="flex items-center justify-center">
              <Search className="mr-2 h-4 w-4" /> Search Dictionary
            </Link>
          </Button>

          {mounted && (
            <SuggestWordModal>
              <Button variant="outline" className="border-2 border-slate-200 hover:bg-slate-50 text-slate-900 px-8 py-6 md:h-14 rounded-xl font-bold uppercase text-[10px] tracking-widest w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4 text-emerald-600" /> Add Word
              </Button>
            </SuggestWordModal>
          )}
        </div>
      </div>

      {/* 3. SUPPORT SECTION */}
      {mounted && (
        <div className="w-full max-w-xl mx-auto p-6 sm:p-8 rounded-[1.5rem] border-2 border-dotted border-amber-200 bg-amber-50/30 flex flex-col items-center gap-4">
          <div className="text-center space-y-1">
            <h4 className="text-slate-900 font-black text-[10px] sm:text-xs uppercase tracking-[0.2em]">Support the Project</h4>
            <p className="text-[9px] sm:text-[10px] text-emerald-600 font-bold uppercase tracking-tight">
              Help keep the database free
            </p>
          </div>
          
          <SupportModal>
            <button className="flex items-center justify-center gap-2 px-8 py-4 bg-[#FFDD00] hover:bg-black hover:text-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-md active:scale-95 group w-full sm:w-auto">
              <Heart className="w-4 h-4 group-hover:fill-red-500 group-hover:text-red-500 transition-colors" />
              Drop some coins
            </button>
          </SupportModal>
          
          <p className="text-[10px] sm:text-xs text-slate-500 max-w-xs leading-relaxed font-medium italic">
            "If you find value in this resource, consider dropping some coins to help us cover server costs and keep the database free for everyone."
          </p>
        </div>
      )} 
      
    </div>
  );
}