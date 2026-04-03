// app/(public)/layout.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { ContactModal } from "@/components/shared/ContactModal";

const FacebookIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-black/5 backdrop-blur-md border-b h-20 flex items-center px-6">
        <nav className="flex w-full justify-between items-center max-w-7xl mx-auto">
          <Link href="/" className="font-black text-2xl tracking-tighter text-slate-900 uppercase italic">
            Kutiit
          </Link>

          <div className="flex items-center gap-4">
            <a href="https://www.facebook.com/kutinyuu" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 transition-colors sm:block hidden">
              <FacebookIcon />
            </a>
            <Link href="/dictionary" className="text-[12px] font-black uppercase tracking-widest text-slate-900 hover:text-emerald-600 transition-colors px-2">
              Dictionary
            </Link>
            
            {/* Swapped Link for Modal */}
            <ContactModal>
              <Button size="sm" className="bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase px-5 shadow-lg cursor-pointer">
                Contact
              </Button>
            </ContactModal>
          </div>
        </nav>
      </header>

      <main className="flex-grow flex flex-col">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="border-t py-12 px-6 bg-black/5">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              © 2026 Kutiit Project 
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
              <FacebookIcon size={20} /> Kutiit
            </a>
          </div>
          <div className="flex items-center gap-8 pt-2">
            <Link href="/login" className="text-[10px] font-bold text-slate-400 uppercase hover:text-emerald-600 tracking-widest">
              Admin Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
