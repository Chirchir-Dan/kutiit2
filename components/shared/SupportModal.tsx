"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExternalLink, Smartphone } from "lucide-react";

export function SupportModal({ children }: { children: React.ReactNode }) {
  const paypalLink = "https://www.paypal.com/ncp/payment/PC2SUV467UC62";

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] p-8 bg-white border-none shadow-2xl">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-slate-900 text-center">
            Support Kutiit
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <a 
            href={paypalLink}
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between p-6 rounded-2xl bg-blue-50 border-2 border-transparent hover:border-blue-200 transition-all group"
          >
            <div className="flex flex-col items-start">
              <span className="font-black uppercase text-[12px] tracking-widest text-slate-900">PAYPAL / CARD</span>
            </div>
            <ExternalLink size={20} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
          </a>

          {/* M-PESA / LOCAL */}
          <div className="flex items-center justify-between p-6 rounded-2xl bg-emerald-50 border-2 border-transparent hover:border-emerald-200 transition-all group cursor-default">
            <div className="flex flex-col items-start">
              <span className="font-black uppercase text-[12px] tracking-widest text-slate-900">M-Pesa</span>
              <span className="text-[14px] font-black text-emerald-600 mt-1 uppercase">TILL NUMBER: 9007419</span>
            </div>
            <Smartphone size={20} className="text-emerald-400" />
          </div>

          <p className="text-[10px] text-center text-slate-600 font-medium px-4 mt-4 leading-relaxed">
            Your support keeps the kALENJIN language alive in the digital age. <br/> 
            <span className="font-bold text-slate-900 uppercase">KONGOI!</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}