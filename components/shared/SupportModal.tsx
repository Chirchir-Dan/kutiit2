"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Smartphone, CheckCircle2, ExternalLink } from "lucide-react";

export function SupportModal({ children }: { children: React.ReactNode }) {
  const paypalLink = "https://www.paypal.com/ncp/payment/PC2SUV467UC62";

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[92vw] sm:max-w-[400px] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 bg-white border-none shadow-2xl overflow-hidden [&>button]:hidden">
        
        <DialogHeader className="mb-4 md:mb-6">
          <DialogTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter text-slate-900 text-center">
            Support Kutiit
          </DialogTitle>
          <DialogDescription className="sr-only text-center">
            Help sustain the Kutiit project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* --- PAYPAL SECTION (TEMPORARILY DISABLED) --- */}
          {/* <a 
            href={paypalLink}
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between p-5 md:p-6 rounded-2xl bg-blue-50 border-2 border-transparent hover:border-blue-200 transition-all group"
          >
            <div className="flex flex-col items-start min-w-0">
              <span className="font-black uppercase text-[10px] md:text-[12px] tracking-widest text-slate-900">PAYPAL / CARD</span>
              <span className="text-[11px] font-bold text-blue-600 mt-1 uppercase tracking-tighter">International Support</span>
            </div>
            <ExternalLink size={20} className="text-blue-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </a> 
          */}

          {/* M-PESA / LOCAL - Primary Method */}
          <div className="flex items-center justify-between p-5 md:p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-100 transition-all cursor-default">
            <div className="flex flex-col items-start min-w-0">
              <span className="font-black uppercase text-[10px] md:text-[12px] tracking-widest text-emerald-800 flex items-center gap-1.5">
                <Smartphone size={14} className="shrink-0" /> M-Pesa
              </span>
          
              <p>Till Number</p>
              <span className="text-xl md:text-2xl font-black text-slate-900 mt-1 tracking-tight truncate">
                9007419
              </span>
              <p>Daniel Kipkosgei</p>
            </div>
            <div className="hidden xs:flex h-12 w-12 items-center justify-center bg-emerald-100 rounded-full shrink-0">
               <Smartphone size={24} className="text-emerald-600" />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
             <p className="text-[10px] md:text-[11px] text-center text-slate-600 font-medium leading-relaxed">
               Your contribution directly supports the digital preservation and maintenance of the <span className="text-emerald-700 font-bold uppercase">Kalenjin</span> language infrastructure.
             </p>
          </div>

          <p className="text-[10px] text-center text-slate-400 font-black px-4 mt-2 tracking-[0.2em] uppercase italic">
            Kongoi Mising!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}