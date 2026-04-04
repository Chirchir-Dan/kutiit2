"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, BookOpen } from "lucide-react";
import { ContactModal } from "@/components/shared/ContactModal";
import { Badge } from "@/components/ui/badge";

const FacebookIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-white overflow-hidden">
      <header className="shrink-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100/50 h-20 flex items-center px-4 md:px-6">
        <nav className="flex w-full justify-between items-center max-w-7xl mx-auto gap-2">
          <Link href="/" className="shrink min-w-0 group">
            <div className="flex items-center gap-1.5 font-black text-emerald-600 tracking-tighter transition-colors group-hover:text-emerald-700">
              <BookOpen className="h-4 w-4 xs:h-5 xs:w-5 md:h-6 md:w-6 shrink-0" strokeWidth={3} /> 
              <span className="text-sm xs:text-base md:text-xl truncate uppercase">Kutiit</span>
              <Badge className="bg-emerald-100 text-emerald-700 border-none text-[6px] md:text-[8px] font-bold px-1.5 py-0.5 shrink-0">BETA</Badge>
            </div>
          </Link>
          <div className="flex items-center gap-1 xs:gap-2 sm:gap-4 shrink-0">
            <a href="https://www.facebook.com/kutinyuu" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-600 transition-colors hidden min-[280px]:block p-2">
              <FacebookIcon size={18} />
            </a>
            <Link href="/dictionary" className="hidden min-[250px]:block text-[10px] md:text-[12px] font-black uppercase tracking-tight md:tracking-widest text-slate-600 hover:text-emerald-600 transition-colors px-2">
              Dictionary
            </Link>
            <ContactModal>
              <Button size="sm" className="bg-slate-900 hover:bg-black text-white rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase px-4 md:px-6 h-9 md:h-10 shadow-md hover:shadow-lg transition-all active:scale-95 shrink-0 ml-1">
                Contact
              </Button>
            </ContactModal>
          </div>
        </nav>
      </header>

      {/* DISABLING GLOBAL SCROLL HERE */}
      <main className="flex-grow overflow-hidden w-full">
        <div className="h-full flex flex-col">
           {children}
        </div>
      </main>

      <footer className="border-t border-slate-100 py-6 px-6 bg-slate-50 shrink-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">© {new Date().getFullYear()} Kutiit Project</p>
          </div>
          <div className="flex items-center gap-3">
            <Mail size={14} className="text-emerald-600" />
            <a href="mailto:kutiitadmin@gmail.com" className="text-[10px] font-bold text-slate-600 hover:text-emerald-600 transition-colors tracking-widest uppercase">kutiitadmin@gmail.com</a>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://www.facebook.com/kutinyuu" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-emerald-600 transition-colors"><FacebookIcon size={18} /></a>
            <Link href="/login" className="text-[10px] font-black text-slate-400 uppercase hover:text-slate-900 tracking-[0.2em]">Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}