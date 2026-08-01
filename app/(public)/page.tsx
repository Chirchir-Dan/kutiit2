"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Facebook, Mail, Heart } from "lucide-react";
import { ContactModal } from "@/components/shared/ContactModal";
import { SupportModal } from "@/components/shared/SupportModal";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-black uppercase tracking-tighter text-slate-900">
                Kutiit
              </span>
            </Link>

            {/* Desktop Navigation - Hidden on mobile */}
            <nav className="hidden md:flex items-center gap-4">
              <ContactModal>
                <button className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-2">
                  <Mail size={16} /> Contact
                </button>
              </ContactModal>
              
              <SupportModal>
                <button className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-2">
                  <Heart size={16} className="text-rose-500" /> Support
                </button>
              </SupportModal>
              
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-2"
              >
                <Facebook size={16} /> Facebook
              </a>
            </nav>

            {/* Hamburger Button - Mobile only */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white">
            <div className="px-4 py-4 space-y-3">
              <ContactModal>
                <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-600 flex items-center gap-3">
                  <Mail size={18} className="text-slate-400" /> Contact
                </button>
              </ContactModal>
              
              <SupportModal>
                <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-600 flex items-center gap-3">
                  <Heart size={18} className="text-rose-500" /> Support
                </button>
              </SupportModal>
              
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-50 text-sm font-medium text-slate-600 flex items-center gap-3"
              >
                <Facebook size={18} className="text-slate-400" /> Facebook
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}