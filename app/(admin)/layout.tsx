"use client";

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { LogOut, Globe, BookOpen } from "lucide-react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* GLOBAL ADMIN NAV */}
      <header className="h-14 border-b flex items-center justify-between px-6 shrink-0 bg-slate-900 text-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-bold tracking-tighter text-emerald-400">
            <BookOpen size={18} /> KUTIIT ADMIN
          </div>
          <Link 
            href="/dictionary" 
            className="text-[10px] uppercase font-bold bg-white/10 px-2 py-1 rounded hover:bg-white/20 transition-all flex items-center gap-1"
          >
            <Globe size={12} /> Public Site
          </Link>
        </div>

        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleLogout}
          className="text-white/50 hover:text-white gap-2"
        >
          <span className="text-xs uppercase font-bold">Sign Out</span>
          <LogOut size={16} />
        </Button>
      </header>

      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}