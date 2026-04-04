"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Turnstile } from "@marsidev/react-turnstile"; 
import { 
  X, CheckCircle2, Loader2, BookOpen, HelpCircle, Zap, Languages, MessageSquareQuote, Sparkles, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export default function SuggestWordModal({ isOpen, onOpenChange, initialSearch }: any) {
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hp, setHp] = useState(""); 
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  
  const [form, setForm] = useState<any>({
    entry_name: initialSearch || "",
    word_type: "noun",
    translation_en: "",
    singular_indefinite: "",
    singular_definite: "",
    plural_indefinite: "",
    plural_definite: "",
    imperative: "",
    answer: "",
    examples: "",
    notes: "",
    is_verified: false 
  });

  const handleInputChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isProverbOrSaying = ["proverb", "saying"].includes(form.word_type);
  const isRiddle = form.word_type === "riddle";
  const isNoun = form.word_type === "noun";
  const isVerb = form.word_type === "verb";

  const isFormValid = () => {
    if (!form.entry_name.trim()) return false;
    if (isRiddle) return form.answer.trim().length > 0 && turnstileToken !== null;
    return form.translation_en.trim().length > 0 && turnstileToken !== null;
  };

  const handleSubmit = async () => {
    if (hp !== "") {
      setSaving(true);
      setTimeout(() => {
        setSubmitted(true);
        setSaving(false);
      }, 1000);
      return;
    }

    if (!turnstileToken) return;

    setSaving(true);
    const { error } = await supabase.from("suggestions").insert([form]);

    if (!error) {
      setSubmitted(true);
      setTimeout(() => {
        onOpenChange(false);
        setSubmitted(false);
        setTurnstileToken(null);
        setForm({ 
          entry_name: "", word_type: "noun", translation_en: "", 
          singular_indefinite: "", singular_definite: "", 
          plural_indefinite: "", plural_definite: "", 
          imperative: "", answer: "", examples: "", notes: "", is_verified: false 
        });
      }, 2500);
    }
    setSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] w-[95vw] max-h-[92vh] rounded-[3rem] p-0 flex flex-col border-none bg-slate-50 shadow-2xl overflow-hidden [&>button]:hidden">
        
        <DialogHeader className="p-8 pb-10 bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 scale-150">
            <Sparkles size={120} className="text-white" />
          </div>
          <div className="flex flex-row items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-inner">
                <BookOpen size={24} className="text-indigo-300" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black uppercase text-white tracking-tighter leading-none">
                  Suggest Entry
                </DialogTitle>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-1">
                  Build the Kalenjin Heritage
                </p>
                <VisuallyHidden.Root><DialogDescription>Contribute to Kutiit</DialogDescription></VisuallyHidden.Root>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full h-12 w-12 bg-white/5 hover:bg-white/10 text-white border border-white/10">
              <X size={24} />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 -mt-6 bg-slate-50 rounded-t-[3rem] relative z-20">
          {submitted ? (
            <div className="py-24 text-center animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Kongoi!</h3>
              <p className="text-slate-500 mt-3 text-lg font-medium italic px-10">Your contribution helps keep the Kalenjin language alive.</p>
            </div>
          ) : (
            <div className="space-y-8 pb-12">
              
              <div className="opacity-0 absolute -z-50 pointer-events-none" aria-hidden="true">
                <input 
                  type="text" 
                  name="user_verification_token" 
                  value={hp} 
                  onChange={(e) => setHp(e.target.value)} 
                  tabIndex={-1} 
                  autoComplete="off" 
                />
              </div>

              {/* Category Selector */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] ml-2">Grammar Category</label>
                <div className="relative group">
                  <select 
                    name="word_type" 
                    value={form.word_type} 
                    onChange={handleInputChange} 
                    className="w-full h-14 rounded-2xl border-2 border-slate-200 bg-white px-5 text-base font-bold outline-none ring-offset-2 focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all appearance-none cursor-pointer text-slate-700"
                  >
                    <optgroup label="Standard Parts of Speech">
                      <option value="noun">Noun</option>
                      <option value="verb">Verb</option>
                      <option value="adjective">Adjective</option>
                      <option value="adverb">Adverb</option>
                    </optgroup>
                    <optgroup label="Traditional Literature">
                      <option value="proverb">Kalewenet</option>
                      <option value="riddle">Tangoch</option>
                      <option value="saying">Saying</option>
                    </optgroup>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
                    <Zap size={18} className="text-indigo-600" />
                  </div>
                </div>
              </div>

              {/* Main Entry Field */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                  {isRiddle ? "Tangoch" : isProverbOrSaying ? "Proverb/Saying" : "Kalenjin Word"}
                </label>
                <Input 
                  name="entry_name" 
                  value={form.entry_name} 
                  placeholder="e.g teta or Ke-labat"
                  onChange={handleInputChange} 
                  className="h-14 bg-white border-2 border-slate-200 rounded-2xl  text-lg focus-visible:ring-indigo-500 shadow-sm" 
                />
              </div>

              {/* Conditional Content */}
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                {isRiddle ? (
                   <div className="space-y-3 p-6 bg-indigo-50/30 rounded-3xl border-2 border-indigo-100/50 shadow-sm">
                    <label className="text-[11px] font-black text-indigo-700 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                      <HelpCircle size={14} /> Walutiet
                    </label>
                    <Input 
                      name="answer" 
                      placeholder="Answer to the tangoch..."
                      value={form.answer} 
                      onChange={handleInputChange} 
                      className="h-14 bg-white border-indigo-100 rounded-2xl font-black text-indigo-900 focus-visible:ring-indigo-500" 
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                      {isProverbOrSaying ? "Meaning" : "Translation"}
                    </label>
                    <Input 
                      name="translation_en" 
                      placeholder={isProverbOrSaying ? "What does it mean?" : "e.g cow or to run"}
                      value={form.translation_en} 
                      onChange={handleInputChange} 
                      className="h-14 bg-white border-2 border-slate-200 rounded-2xl  focus-visible:ring-indigo-500 shadow-sm" 
                    />
                  </div>
                )}
              </div>

              {/* Noun Morphology - RESTORED */}
              {isNoun && (
                <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 ml-2">Singular Forms</p>
                      <div className="space-y-3">
                        <Input name="singular_indefinite" placeholder="Indefinite: e.g. tany" value={form.singular_indefinite} onChange={handleInputChange} className="bg-slate-50/50 border-none rounded-xl" />
                        <Input name="singular_definite" placeholder="Definite: e.g. teta" value={form.singular_definite} onChange={handleInputChange} className="bg-slate-50/50 border-none rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-2 ml-2">Plural Forms</p>
                      <div className="space-y-3">
                        <Input name="plural_indefinite" placeholder="indefinite: e.g. tich" value={form.plural_indefinite} onChange={handleInputChange} className="bg-slate-50/50 border-none rounded-xl" />
                        <Input name="plural_definite" placeholder="definite: e.g. tuga" value={form.plural_definite} onChange={handleInputChange} className="bg-slate-50/50 border-none rounded-xl" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Verb Imperative - RESTORED */}
              {isVerb && (
                <div className="bg-slate-100/50 p-6 rounded-3xl border-2 border-slate-200/50 space-y-3">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Zap size={14} className="text-indigo-500" /> Command Form
                  </label>
                  <Input name="imperative" placeholder="e.g. Cham!" value={form.imperative} onChange={handleInputChange} className="h-14 bg-white border-none rounded-xl font-bold" />
                </div>
              )}

              {/* Usage Examples - RESTORED */}
              {!isProverbOrSaying && !isRiddle && (
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-2">
                    <Languages size={14} className="text-indigo-400" /> Examples
                  </label>
                  <Textarea 
                    name="examples" 
                    placeholder="Kalenjin - English (separate with ' - ' . one line = one example)"
                    value={form.examples} 
                    onChange={handleInputChange} 
                    className="min-h-[100px] bg-white border-2 border-slate-100 rounded-2xl p-5 font-mono text-sm shadow-sm" 
                  />
                </div>
              )}

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-2">
                  <MessageSquareQuote size={14} className="text-indigo-400" /> Notes
                </label>
                <Textarea 
                  name="notes" 
                  value={form.notes} 
                  onChange={handleInputChange} 
                  placeholder="is it dialect specific? any cultural context? related words? variations?" 
                  className="min-h-[100px] bg-slate-200/30 border-none rounded-2xl p-5 text-base italic shadow-inner" 
                />
              </div>

              {/* TURNSTILE WIDGET */}
              <div className="flex justify-center py-2">
                <Turnstile
                  siteKey="0x4AAAAAAC0n6ihaIamC4RCT"
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  options={{
                    theme: "light",
                    size: "normal",
                  }}
                />
              </div>

              {/* FINAL SUBMIT BUTTON */}
              <div className="space-y-3">
                <Button 
                  onClick={handleSubmit} 
                  disabled={saving || !isFormValid()} 
                  className="w-full bg-slate-900 hover:bg-indigo-950 text-white h-16 rounded-[1.5rem] font-black uppercase text-sm tracking-[0.2em] shadow-xl transition-all disabled:opacity-20 group"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      Submit for Review <Sparkles size={16} />
                    </span>
                  )}
                </Button>
                
                {!isFormValid() && form.entry_name && (
                  <p className="text-center text-[10px] font-black uppercase text-indigo-400 tracking-widest animate-pulse flex items-center justify-center gap-1">
                    <AlertCircle size={12} /> 
                    {!turnstileToken 
                      ? "Please verify you are human" 
                      : `Please provide ${isRiddle ? "Walutiet" : isProverbOrSaying ? "the meaning" : "a translation"}`
                    }
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}