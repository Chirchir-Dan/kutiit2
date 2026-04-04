"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, BookOpen } from "lucide-react";
import { ContactModal } from "@/components/shared/ContactModal";
import { Badge } from "@/components/ui/badge";

const FacebookIcon = ({ size = 18 }: { size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-white overflow-x-hidden">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-black/5 backdrop-blur-md border-b h-20 flex items-center px-4 md:px-6 overflow-hidden">
        <nav className="flex w-full justify-between items-center max-w-7xl mx-auto gap-2">
          
          {/* LOGO SECTION - Flexible scaling */}
          <Link href="/" className="shrink min-w-0">
             <div className="flex items-center gap-1.5 font-black text-emerald-700 tracking-tighter">
              <BookOpen className="h-4 w-4 xs:h-5 xs:w-5 md:h-6 md:w-6 shrink-0" strokeWidth={3} /> 
              {/* Text shrinks slightly on tiny screens to make room for nav items */}
              <span className="text-sm xs:text-base md:text-xl truncate uppercase">Kutiit</span>
              <Badge className="bg-emerald-100 text-emerald-700 border-none text-[6px] md:text-[8px] font-bold px-1 py-0 shrink-0">
                BETA
              </Badge>
            </div>
          </Link>

          {/* ACTIONS SECTION */}
          <div className="flex items-center gap-1 xs:gap-2 sm:gap-4 shrink-0">
            {/* Facebook - Only hides if screen is under 400px */}
            <a 
              href="https://www.facebook.com/kutinyuu" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-slate-500 hover:text-blue-600 transition-colors hidden min-[200px]:block"
            >
              <FacebookIcon size={18} />
            </a>
            
            {/* Dictionary Link - Stays visible unless screen is extremely narrow (<360px) */}
            <Link 
              href="/dictionary" 
              className="hidden min-[200px]:block text-[10px] md:text-[12px] font-black uppercase tracking-tight md:tracking-widest text-slate-900 hover:text-emerald-600 transition-colors px-1"
            >
              Dictionary
            </Link>
            
            <ContactModal>
              <Button 
                size="sm" 
                className="bg-slate-900 text-white rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-bold uppercase px-3 md:px-5 h-8 md:h-9 shadow-lg cursor-pointer transition-transform active:scale-95 shrink-0"
              >
                Contact
              </Button>
            </ContactModal>
          </div>
        </nav>
      </header>

      <main className="flex-grow flex flex-col w-full">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="border-t py-12 px-6 bg-black/5 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-6">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} Kutiit Project 
            </p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              Preserving Kalenjin Heritage
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-slate-400">
            <Mail size={14} className="text-emerald-600" />
            <a href="mailto:kutiitadmin@gmail.com" className="text-[10px] font-bold hover:text-emerald-600 transition-colors tracking-widest uppercase">
              kutiitadmin@gmail.com
            </a>
          </div>

          <div className="flex items-center gap-8 pt-2">
            <a href="https://www.facebook.com/kutinyuu" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
              <FacebookIcon size={20} />
            </a>
            <Link href="/login" className="text-[10px] font-bold text-slate-400 uppercase hover:text-emerald-600 tracking-widest">
              Admin Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}