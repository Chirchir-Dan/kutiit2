"use client";

import { useState, useEffect } from "react"; 
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Search, Plus, Heart, GraduationCap, ArrowRight, Mail, Database, 
  Menu, X, BookOpen, Coffee 
} from "lucide-react";
import { ContactModal } from "@/components/shared/ContactModal";
import { SupportModal } from "@/components/shared/SupportModal";
import SuggestWordModal from "@/components/shared/SuggestWordModal";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-start px-4 md:px-6 text-center max-w-5xl mx-auto pt-6 pb-20 overflow-x-hidden">
      
      {/* Top Bar with Hamburger Menu */}
      <div className="w-full flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-emerald-600" />
          <span className="text-xs font-bold uppercase text-slate-400 tracking-widest">Kutiit</span>
        </div>
        
        {/* Desktop Navigation - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-2">
          {mounted && (
            <ContactModal>
              <Button variant="ghost" size="sm" className="text-xs font-medium text-slate-500 hover:text-emerald-600">
                Contact
              </Button>
            </ContactModal>
          )}
          {mounted && (
            <SupportModal>
              <Button variant="ghost" size="sm" className="text-xs font-medium text-slate-500 hover:text-emerald-600 flex items-center gap-1">
                <Heart size={14} className="text-rose-500" /> Support
              </Button>
            </SupportModal>
          )}
          {mounted && (
            <ContactModal>
              <Button variant="ghost" size="sm" className="text-xs font-medium text-slate-500 hover:text-emerald-600 flex items-center gap-1">
                <GraduationCap size={14} className="text-blue-500" /> Lessons
              </Button>
            </ContactModal>
          )}
        </div>

        {/* Hamburger Button - Mobile only */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="w-full md:hidden mb-6 p-4 bg-white border border-slate-200 rounded-2xl shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-2">
            {mounted && (
              <ContactModal>
                <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-600 flex items-center gap-3">
                  <Mail size={18} className="text-slate-400" /> Contact
                </button>
              </ContactModal>
            )}
            {mounted && (
              <SupportModal>
                <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-600 flex items-center gap-3">
                  <Heart size={18} className="text-rose-500" /> Support the Project
                </button>
              </SupportModal>
            )}
            {mounted && (
              <ContactModal>
                <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-600 flex items-center gap-3">
                  <GraduationCap size={18} className="text-blue-500" /> Learn Nandi Grammar
                </button>
              </ContactModal>
            )}
          </div>
        </div>
      )}
      
      {/* 1. HERO - FLUID TYPOGRAPHY */}
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

      {/* 3. DOCUMENTATION - Clean */}
      <section className="w-full py-10 border-t border-slate-100 max-w-4xl mx-auto flex flex-col items-center text-center px-2 mt-8">
        <div className="space-y-4 max-w-2xl">
          <h3 className="text-base sm:text-xl font-black uppercase tracking-tight text-slate-900 flex items-center justify-center gap-2">
            <Database size={16} className="text-emerald-600" /> Professional Documentation
          </h3>
          <p className="text-xs sm:text-base text-slate-600 font-medium leading-relaxed">
            This database serves as a primary reference point for documenting Kalenjin terminology. 
            We maintain a verified record of linguistic expression to support daily communication 
            and academic research.
          </p>
        </div>
      </section>

      {/* 4. SUPPORT - Clean card */}
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