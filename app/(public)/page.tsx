// app/(public)/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, GraduationCap, Sparkles } from "lucide-react";
import { ContactModal } from "@/components/shared/ContactModal";

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto space-y-12 py-20">
      <div className="space-y-6">
        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
          Digital Language Preservation
        </Badge>
        
        <h1 className="text-6xl md:text-9xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85]">
          <span className="text-emerald-600">Kalenjin</span>
        </h1>
        
        <p className="text-lg md:text-2xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
          The open digital infrastructure for the Kalenjin community across the world. 
          <span className="text-slate-900"> Built for the future, rooted in tradition.</span>
        </p>
      </div>

      <Button asChild size="lg" className="bg-slate-900 hover:bg-black text-white px-10 h-16 rounded-2xl font-bold uppercase text-xs tracking-widest shadow-2xl transition-all hover:scale-105 active:scale-95">
        <Link href="/dictionary">
          Explore Dictionary <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>

      {/* PROMO CARD */}
      <div className="w-full mt-8 bg-emerald-600 rounded-[3rem] p-8 md:p-12 text-white text-left flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-emerald-200 relative overflow-hidden">
        <Sparkles className="absolute -right-4 -top-4 text-emerald-500 w-32 h-32 opacity-20" />
        <div className="space-y-4 max-w-xl z-10">
          <div className="flex items-center gap-2 text-emerald-200 uppercase text-[10px] font-black tracking-widest">
            <GraduationCap size={18} /> Now Offering Lessons
          </div>
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Master the Language</h2>
          <p className="text-emerald-50/80 font-medium text-sm">Join our structured classes for grammar, tonal accuracy, and cultural idioms, sayings e.t.c.</p>
        </div>
        
        {/* Swapped mailto Link for Modal */}
        <ContactModal>
          <Button className="bg-white text-emerald-700 hover:bg-emerald-50 h-14 px-8 rounded-xl font-black uppercase text-xs tracking-widest z-10 shrink-0 shadow-lg cursor-pointer">
            Inquire Now
          </Button>
        </ContactModal>
      </div>
    </div>
  );
}
