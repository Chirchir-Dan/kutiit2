"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, BookOpen, Menu, X, Heart, GraduationCap, ChevronDown, ChevronUp } from "lucide-react";
import { ContactModal } from "@/components/shared/ContactModal";
import { SupportModal } from "@/components/shared/SupportModal";

const FacebookIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex flex-col h-dvh bg-white">
      <header className="shrink-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100/50 h-20 flex items-center px-4 md:px-6">
        <nav className="flex w-full justify-between items-center max-w-7xl mx-auto gap-2">
          <Link href="/" className="shrink min-w-0 group">
            <div className="flex items-center gap-1.5 font-black text-emerald-600 tracking-tighter transition-colors group-hover:text-emerald-900">
              <BookOpen className="h-4 w-4 xs:h-5 xs:w-5 md:h-6 md:w-6 shrink-0" strokeWidth={3} /> 
              <span className="text-sm xs:text-base md:text-xl truncate uppercase">Kutiit</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 xs:gap-2 sm:gap-4 shrink-0">
            <a href="https://www.facebook.com/kutinyuu" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-900 transition-colors p-2">
              <FacebookIcon size={18} />
            </a>
            <Link href="/dictionary" className="text-[10px] md:text-[12px] font-black uppercase tracking-tight md:tracking-widest text-emerald-600 hover:text-emerald-900 transition-colors px-2">
              Dictionary
            </Link>
            <Link href="/learn" className="text-[10px] md:text-[12px] font-black uppercase tracking-tight md:tracking-widest text-emerald-600 hover:text-emerald-900 transition-colors px-2">
              Learn
            </Link>
            <ContactModal>
              <span className="bg-emerald-600 hover:bg-emerald-900 text-white rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase px-4 md:px-6 h-9 md:h-10 shadow-md hover:shadow-lg transition-all active:scale-95 shrink-0 ml-1 inline-flex items-center justify-center cursor-pointer">
                Contact
              </span>
            </ContactModal>
          </div>

          {/* Hamburger Button - Mobile only */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-emerald-50 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} className="text-emerald-600" /> : <Menu size={24} className="text-emerald-600" />}
          </button>
        </nav>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 md:hidden animate-in slide-in-from-right duration-300">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <span className="text-sm font-black uppercase text-emerald-600">Menu</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <a
                  href="https://www.facebook.com/kutinyuu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50 text-sm font-medium text-slate-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FacebookIcon size={20} /> Facebook
                </a>
                <Link
                  href="/dictionary"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50 text-sm font-medium text-slate-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BookOpen size={20} /> Dictionary
                </Link>
                <Link
                  href="/learn"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50 text-sm font-medium text-slate-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <GraduationCap size={20} /> Learn Nandi
                </Link>
                <ContactModal>
                  <span className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50 text-sm font-medium text-slate-700 transition-colors cursor-pointer">
                    <Mail size={20} /> Contact
                  </span>
                </ContactModal>
                <SupportModal>
                  <span className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50 text-sm font-medium text-slate-700 transition-colors cursor-pointer">
                    <Heart size={20} className="text-rose-500" /> Support the Project
                  </span>
                </SupportModal>
              </div>
              <div className="p-6 border-t border-slate-100">
                <p className="text-[9px] text-slate-400 font-medium text-center">
                  © {new Date().getFullYear()} Kutiit
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Footer - Ultra Compact */}
      <footer className="shrink-0 border-t bg-white px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center md:justify-start gap-x-2 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-emerald-600 h-6">
          <a href="mailto:kutiitadmin@gmail.com" className="hover:text-emerald-900 transition-colors shrink-0">
            Email
          </a>
          <span className="text-slate-200">|</span>
          <a href="https://www.facebook.com/kutinyuu" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-900 transition-colors shrink-0">
            FB
          </a>
          <span className="text-slate-200">|</span>
          <Link href="/dashboard" className="hover:text-emerald-900 transition-colors shrink-0">
            Admin
          </Link>
          <span className="text-slate-200">|</span>
          <span className="shrink-0 text-slate-400 font-bold">
            © {new Date().getFullYear()} Kutiit | All Rights Reserved
          </span>
        </div>
      </footer>
    </div>
  );
}