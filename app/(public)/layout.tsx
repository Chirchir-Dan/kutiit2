"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, BookOpen, Menu, X } from "lucide-react";
import { ContactModal } from "@/components/shared/ContactModal";

const FacebookIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <header className="shrink-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100/50 h-20 flex items-center px-4 md:px-6">
        <nav className="flex w-full justify-between items-center max-w-7xl mx-auto gap-2">
          <Link href="/" className="shrink min-w-0 group">
            <div className="flex items-center gap-1.5 font-black text-emerald-600 tracking-tighter transition-colors group-hover:text-emerald-900">
              <BookOpen className="h-4 w-4 xs:h-5 xs:w-5 md:h-6 md:w-6 shrink-0" strokeWidth={3} /> 
              <span className="text-sm xs:text-base md:text-xl truncate uppercase">Kutiit</span>
            </div>
          </Link>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-1 xs:gap-2 sm:gap-4 shrink-0">
            <a href="https://www.facebook.com/kutinyuu" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-900 transition-colors p-2">
              <FacebookIcon size={18} />
            </a>
            <Link href="/dictionary" className="text-[10px] md:text-[12px] font-black uppercase tracking-tight md:tracking-widest text-emerald-600 hover:text-emerald-900 transition-colors px-2">
              Dictionary
            </Link>
            <ContactModal>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-900 text-white rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase px-4 md:px-6 h-9 md:h-10 shadow-md hover:shadow-lg transition-all active:scale-95 shrink-0 ml-1">
                Contact
              </Button>
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

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-emerald-100/50 animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-4 space-y-2 max-w-7xl mx-auto">
            <a
              href="https://www.facebook.com/kutinyuu"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50 text-sm font-medium text-emerald-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <FacebookIcon size={20} /> Facebook
            </a>
            <Link
              href="/dictionary"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50 text-sm font-medium text-emerald-600 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <BookOpen size={20} /> Dictionary
            </Link>
            <ContactModal>
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-50 text-sm font-medium text-emerald-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Mail size={20} /> Contact
              </button>
            </ContactModal>
          </div>
        </div>
      )}

      <main className="flex-grow overflow-hidden w-full">
        <div className="h-full flex flex-col">
           {children}
        </div>
      </main>

      <footer className="h-0 shrink-0 border-t bg-white py-2 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center md:justify-start gap-x-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-600">
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
          <span className="pt-1 shrink-0 text-slate-400 font-bold">
            © {new Date().getFullYear()} Kutiit | All Rights Reserved
          </span>
        </div>
      </footer>
    </div>
  );
}