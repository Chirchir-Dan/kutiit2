"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink, LogOut } from "lucide-react";
// Import your Footer component here
// import Footer from "@/components/Footer"; 

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* 1. HEADER */}
      <nav className="h-16 border-b bg-white flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="font-black text-slate-900 uppercase text-xs tracking-tighter">
              Kutiit <span className="text-emerald-600">Admin</span>
            </span>
          </div>
          <button 
            onClick={() => router.push("/dictionary")}
            className="text-[10px] font-black text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-1.5 uppercase tracking-widest"
          >
            Public Site <ExternalLink size={12} />
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={handleLogout} 
            className="text-slate-400 hover:text-rose-500 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
          >
            Logout <LogOut size={16} />
          </Button>
        </div>
      </nav>

      {/* 2. MAIN DASHBOARD AREA (Flexible height) */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>

      {/* 3. FOOTER (Stays at the very bottom) */}
      <footer className="shrink-0 border-t bg-slate-50 py-4 px-6">
         <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
           <p>© {new Date().getFullYear()} Kutiit Project</p>
           <p>Admin Portal v2.0</p>
         </div>
      </footer>
    </div>
  );
}