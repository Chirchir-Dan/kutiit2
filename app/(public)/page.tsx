"use client";

import { useState, useEffect } from "react"; 
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, GraduationCap, Sparkles } from "lucide-react";
import { ContactModal } from "@/components/shared/ContactModal";
import { SupportModal } from "@/components/shared/SupportModal";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-start px-4 md:px-6 text-center max-w-5xl mx-auto space-y-8 md:space-y-12 pt-10 md:pt-10 pb-10 overflow-x-hidden">
      
      {/* HERO SECTION */}
      <div className="space-y-4 md:space-y-6 w-full">
        <div className="flex justify-center mb-2">
          <Badge variant="outline" className=" border-emerald-200 bg-emerald-50 text-emerald-600 px-3 md:px-4 py-1 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] whitespace-nowrap">
            Digital Language Preservation
          </Badge>
        </div>
        
        <h1 className="pt-10 text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9] md:leading-[0.85] break-words">
          <span className="text-emerald-600">Kalenjin</span>
        </h1>
        
        <p className="text-sm sm:text-base md:text-2xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed px-2">
          The open digital infrastructure for the Kalenjin community across the world. 
        </p>
      </div>

      {/* PRIMARY CTA */}
      <Button asChild size="lg" className="bg-slate-900 hover:bg-black text-white px-6 md:px-10 h-14 md:h-16 rounded-2xl font-bold uppercase text-[10px] md:text-xs tracking-widest shadow-2xl transition-all hover:scale-105 active:scale-95 w-full sm:w-auto shrink-0">
        <Link href="/dictionary" className="flex items-center justify-center">
          Explore Dictionary <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
        </Link>
      </Button>

      {/* PROMO CARD */}
      <div className="w-full mt-4 md:mt-8 bg-emerald-600 rounded-[1.5rem] md:rounded-[3rem] p-6 md:p-12 text-white text-left flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 shadow-2xl shadow-emerald-200 relative overflow-hidden shrink-0">
        <Sparkles className="absolute -right-4 -top-4 text-emerald-500 w-20 h-20 md:w-32 md:h-32 opacity-20 pointer-events-none" />
        
        <div className="space-y-3 md:space-y-4 max-w-xl z-10 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-white uppercase text-[8px] md:text-[10px] font-black tracking-widest">
            <GraduationCap size={14} className="md:size-4" /> Now Offering Lessons
          </div>
          <h2 className="text-xl sm:text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight">Master the Language</h2>
          <p className="text-white font-medium text-xs md:text-sm">Join our structured classes for grammar and tonal accuracy.</p>
        </div>
        
        {mounted && (
          <ContactModal>
            <Button className="bg-white text-emerald-800 hover:text-white hover:bg-emerald-900 h-12 md:h-14 px-6 md:px-8 rounded-xl font-black uppercase text-[10px] md:text-xs tracking-widest z-10 shrink-0 shadow-lg cursor-pointer w-full md:w-auto">
              Inquire Now
            </Button>
          </ContactModal>
        )}
      </div>

      {/* SUPPORT SECTION */}
       {mounted && (
        <div className="pt-4 shrink-0">
          <SupportModal>
            <button className="flex items-center gap-2 px-6 py-3 bg-[#FFDD00] hover:bg-black hover:text-white text-black rounded-full font-black uppercase text-[10px] tracking-widest transition-all shadow-md group">
              <span className="group-hover:animate-bounce">☕</span>
              Support Project
            </button>
          </SupportModal>
        </div>
      )} 
      
    </div>
  );
}