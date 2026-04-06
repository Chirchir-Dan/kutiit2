"use client";

import { useState, useEffect } from "react"; 
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Plus, Heart, GraduationCap, ArrowRight, Mail, Database } from "lucide-react";
import { ContactModal } from "@/components/shared/ContactModal";
import { SupportModal } from "@/components/shared/SupportModal";
import SuggestWordModal from "@/components/shared/SuggestWordModal";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    /* px-4 for mobile, px-6 for desktop. space-y controlled for mobile flow */
    <div className="flex-1 flex flex-col items-center justify-start px-4 md:px-6 text-center max-w-5xl mx-auto space-y-10 md:space-y-20 pt-8 pb-20 overflow-x-hidden">
      
      {/* 1. HERO - FLUID TYPOGRAPHY */}
      <div className="space-y-6 w-full px-2">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tight leading-[0.9]">
            <span className="pb-5 text-emerald-600">Kalenjin</span>
            <span className=" pt-5 text-slate-900"> Dictionary</span>
          </h1>
          <p className="text-[10px] sm:text-xs md:text-lg text-emerald-600 font-bold uppercase tracking-[0.2em]">
            Kalenjin to English Translation Resource
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto text-slate-900">
          <p className="text-sm sm:text-base md:text-lg font-medium text-slate-600 leading-relaxed">
            Kutiit is a comprehensive database for Kalenjin words, phrases, riddles and proverbs. 
            Search the resource below, if a term is missing, use the <strong className="text-emerald-600">Add</strong> button 
            beside the search bar in the dictionary to contribute.
          </p>
        </div>

        {/* 2. CORE ACTIONS - STACK ON MOBILE */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button asChild className="bg-slate-900 hover:bg-black text-white px-8 py-6 md:h-14 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-xl w-full sm:w-auto">
            <Link href="/dictionary" className="flex items-center justify-center">
              <Search className="mr-2 h-4 w-4" /> Search Database
            </Link>
          </Button>

          {mounted && (
            <SuggestWordModal>
              <Button variant="outline" className="border-2 border-slate-200 hover:bg-slate-50 text-slate-900 px-8 py-6 md:h-14 rounded-xl font-bold uppercase text-[10px] tracking-widest w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4 text-emerald-600" /> Add
              </Button>
            </SuggestWordModal>
          )}
        </div>
      </div>

      {/* 3. DOCUMENTATION - CENTERED & COMPACT */}
      <section className="w-full py-10 border-t border-slate-100 max-w-4xl mx-auto flex flex-col items-center text-center px-2">
        <div className="space-y-4 max-w-2xl">
          <h3 className="text-base sm:text-xl font-black uppercase tracking-tight text-slate-900 flex items-center justify-center gap-2">
            <Database size={16} className="text-emerald-600" /> Professional Documentation
          </h3>
          <p className="text-xs sm:text-base text-slate-600 font-medium leading-relaxed">
            This database serves as a primary reference point for documenting Kalenjin terminology. 
            We maintain a verified record of linguistic expression to support daily communication 
            and academic research.
          </p>
          {mounted && (
            <ContactModal>
              <button className="inline-flex items-center gap-2 text-emerald-600 font-bold text-[10px] sm:text-sm hover:underline underline-offset-4 uppercase tracking-wide">
                <Mail size={12} /> Contact for collaborations
              </button>
            </ContactModal>
          )}
        </div>
      </section>

      {/* 4. LESSONS PROMO - FULL WIDTH ON MOBILE */}
      <div data-nosnippet className="w-full bg-slate-900 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-12 text-white text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
        <div className="space-y-3 flex flex-col items-center md:items-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full uppercase text-[9px] font-black tracking-widest">
            <GraduationCap size={12} /> Education
          </div>
          <h3 className="text-xl sm:text-3xl font-black uppercase tracking-tight">Master the Language</h3>
          <p className="text-slate-400 font-medium text-xs sm:text-base max-w-sm">
            Structured classes focusing on grammar, pronunciation, and tonal accuracy.
          </p>
        </div>
        
        {mounted && (
          <ContactModal>
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white py-6 md:h-14 px-10 rounded-xl font-bold uppercase text-[10px] tracking-widest shrink-0 shadow-lg w-full md:w-auto">
              Inquire Now <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </ContactModal>
        )}
      </div>

      {/* 5. SUPPORT - THE "COINS" SECTION (Mobile Optimized) */}
      {mounted && (
        <div className="w-full max-w-xl mx-auto p-6 sm:p-10 rounded-[1.5rem] md:rounded-[2rem] border-2 border-dotted border-amber-200 bg-amber-50/30 flex flex-col items-center gap-5">
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