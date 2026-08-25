"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Turnstile } from "@marsidev/react-turnstile"; 
import { 
  X, CheckCircle2, Loader2, BookOpen, HelpCircle, Zap, Languages, MessageSquareQuote, Sparkles, AlertCircle, MapPin, Globe, Plus
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
import { Checkbox } from "@/components/ui/checkbox";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

const DIALECTS = [
  "Nandi", "Kipsigis", "Keiyo", "Tugen", "Marakwet", 
  "Pokot", "Sabaot", "Terik", "Sabiny", "Sebei"
];

export default function SuggestWordModal({ isOpen, onOpenChange, initialSearch, onSuccess }: any) {
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hp, setHp] = useState(""); 
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  
  const [form, setForm] = useState<any>({
    entry_name: initialSearch || "",
    word_type: "noun",
    dialects: [""], 
    translations: [],
    translation_input: "",
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

  const handleAddTranslation = () => {
    if (!form.translation_input?.trim()) return;
    const newTranslation = form.translation_input.trim();
    if (!form.translations.includes(newTranslation)) {
      setForm({
        ...form,
        translations: [...form.translations, newTranslation],
        translation_input: ""
      });
    }
  };

  const handleRemoveTranslation = (index: number) => {
    setForm({
      ...form,
      translations: form.translations.filter((_: any, i: number) => i !== index)
    });
  };

  const handleTranslationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTranslation();
    }
  };

  const handleDialectChange = (dialect: string) => {
    const current = form.dialects || [];
    const updated = current.includes(dialect)
      ? current.filter((d: string) => d !== dialect)
      : [...current, dialect];
    setForm({ ...form, dialects: updated });
  };

  const toggleUniversal = (checked: boolean) => {
    setForm({ ...form, dialects: checked ? [...DIALECTS] : [] });
  };

  const isUniversal = form.dialects.length === DIALECTS.length;
  const isProverbOrSaying = ["proverb", "saying"].includes(form.word_type);
  const isRiddle = form.word_type === "riddle";
  const isNoun = form.word_type === "noun";
  const isVerb = form.word_type === "verb";
  const isName = form.word_type === "name";

  const isFormValid = () => {
    if (!form.entry_name.trim()) return false;
    if (form.dialects.length === 0) return false;
    if (isRiddle) return form.answer.trim().length > 0 && turnstileToken !== null;
    return form.translations.length > 0 && turnstileToken !== null;
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
    
    const submitData = {
      ...form,
      translation_en: form.translations[0] || "",
      translation_input: undefined,
    };
    
    const { error } = await supabase.from("suggestions").insert([submitData]);

    if (!error) {
      if (onSuccess) onSuccess();
      setSubmitted(true);
      
      setTimeout(() => {
        onOpenChange(false);
        setSubmitted(false);
        setTurnstileToken(null);
        setForm({ 
          entry_name: "", word_type: "noun", dialects: [], 
          translations: [], translation_input: "",
          translation_en: "", 
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
      <DialogContent className="sm:max-w-[650px] w-[95vw] max-h-[85vh] rounded-[3rem] p-0 flex flex-col border-none bg-white shadow-2xl overflow-hidden [&>button]:hidden">
        
        <DialogHeader className="p-8 pb-10 bg-emerald-50/50 shrink-0 relative overflow-hidden border-b border-emerald-100/50">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 scale-150 pointer-events-none">
            <Sparkles size={120} className="text-emerald-600" />
          </div>
          <div className="flex flex-row items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="bg-white p-3 rounded-2xl border border-emerald-100 shadow-sm">
                <BookOpen size={24} className="text-emerald-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black uppercase text-slate-900 tracking-tighter leading-none">
                  Contribute
                </DialogTitle>
                <p className="text-emerald-600/70 text-[10px] font-medium uppercase tracking-[0.2em] mt-2 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  Build the Kalenjin Heritage
                </p>
                <VisuallyHidden.Root><DialogDescription>Contribute to Kutiit</DialogDescription></VisuallyHidden.Root>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange(false)} 
              className="rounded-full h-10 w-10 bg-white hover:bg-emerald-100 text-slate-400 border border-emerald-100 transition-colors"
            >
              <X size={20} />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 bg-white relative z-20">
          {submitted ? (
            <div className="py-24 text-center animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border border-emerald-100">
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

              {/* Grammar Category */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                  Grammar Category
                </label>
                <select 
                  name="word_type" 
                  value={form.word_type} 
                  onChange={handleInputChange} 
                  className="w-full h-14 rounded-2xl border-2 border-slate-200 bg-white px-5 text-base font-normal text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all appearance-none cursor-pointer"
                >
                  <optgroup label="Standard Parts of Speech">
                    <option value="noun">Noun</option>
                    <option value="name">Name</option>
                    <option value="verb">Verb</option>
                    <option value="adjective">Adjective</option>
                    <option value="adverb">Adverb</option>
                    <option value="pronoun">Pronoun</option>
                    <option value="preposition">Preposition</option>
                    <option value="conjunction">Conjunction</option>
                    <option value="interjection">Interjection</option>
                    <option value="expression">Expression</option>
                    <option value="number">Number</option>
                    <option value="particle">Particle</option>
                  </optgroup>
                  <optgroup label="Traditional Literature">
                    <option value="proverb">Kalewenet</option>
                    <option value="riddle">Tangoch</option>
                    <option value="saying">Saying</option>   
                  </optgroup>
                </select>
              </div>

              {/* Word / Entry Name */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                  {isRiddle ? "Tangoch" : isProverbOrSaying ? "Proverb / Saying" : "Word"}
                </label>
                <Input 
                  name="entry_name" 
                  value={form.entry_name} 
                  placeholder={isNoun ? "e.g. Teta" : isVerb ? "e.g. Cham" : isName ? "e.g. Kipng'ung'uny" : isRiddle ? "kirginyuu kipkelenye tulwo?" : isProverbOrSaying ? "e.g. Proverb / Saying" : "Enter word..."}
                  onChange={handleInputChange} 
                  className="h-14 bg-white border-2 border-slate-200 rounded-2xl text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500 focus:border-emerald-500 transition-all" 
                />
              </div>

              {/* Translations / Meaning */}
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                {isRiddle ? (
                  <div className="space-y-2 p-6 bg-emerald-50/30 rounded-3xl border-2 border-emerald-100/50">
                    <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-2 ml-1">
                      <HelpCircle size={14} /> Walutiet
                    </label>
                    <Input 
                      name="answer" 
                      placeholder="Answer to the tangoch..."
                      value={form.answer} 
                      onChange={handleInputChange} 
                      className="h-14 bg-white border-emerald-200 rounded-2xl text-base font-normal text-emerald-800 placeholder:text-emerald-400 focus-visible:ring-emerald-500" 
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
                      {isProverbOrSaying ? "Meaning" : "Translations"}
                    </label>
                    
                    <div className="flex gap-2">
                      <Input 
                        name="translation_input"
                        placeholder={isProverbOrSaying ? "What does it mean? (press Enter)" : isVerb ? "e.g. To love" : isNoun ? "e.g. Cow" : isName ? "e.g. Kipng'ung'uny" : "Type translation and press Enter"}
                        value={form.translation_input} 
                        onChange={handleInputChange}
                        onKeyDown={handleTranslationKeyDown}
                        className="h-14 bg-white border-2 border-slate-200 rounded-2xl text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500 focus:border-emerald-500 transition-all flex-1" 
                      />
                      <Button
                        type="button"
                        onClick={handleAddTranslation}
                        variant="outline"
                        className="h-14 px-6 rounded-2xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50"
                        disabled={!form.translation_input?.trim()}
                      >
                        <Plus size={18} className="text-slate-500" />
                      </Button>
                    </div>
                    <p className="text-[10px] text-slate-400 ml-1">Press Enter to add multiple translations</p>

                    {form.translations.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 min-h-[60px]">
                        {form.translations.map((translation: string, index: number) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium"
                          >
                            {translation}
                            <button
                              type="button"
                              onClick={() => handleRemoveTranslation(index)}
                              className="ml-1 hover:text-red-500 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    {form.translations.length === 0 && (
                      <p className="text-sm text-slate-400 mt-1">No translations added yet</p>
                    )}
                  </div>
                )}
              </div>

              {/* Noun Forms */}
              {isNoun && (
                <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-200 space-y-6">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2">Singular Forms</p>
                    <div className="space-y-3">
                      <Input name="singular_indefinite" placeholder="Indefinite: e.g. tany" value={form.singular_indefinite} onChange={handleInputChange} className="h-14 bg-white border-slate-200 rounded-xl text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500" />
                      <Input name="singular_definite" placeholder="Definite: e.g. teta" value={form.singular_definite} onChange={handleInputChange} className="h-14 bg-white border-emerald-200 rounded-xl text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2">Plural Forms</p>
                    <div className="space-y-3">
                      <Input name="plural_indefinite" placeholder="Indefinite: e.g. tich" value={form.plural_indefinite} onChange={handleInputChange} className="h-14 bg-white border-slate-200 rounded-xl text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500" />
                      <Input name="plural_definite" placeholder="Definite: e.g. tuga" value={form.plural_definite} onChange={handleInputChange} className="h-14 bg-white border-emerald-200 rounded-xl text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500" />
                    </div>
                  </div>
                </div>
              )}

              {/* Verb Forms */}
              {isVerb && (
                <div className="bg-amber-50/20 p-6 rounded-3xl border border-amber-200/50 space-y-2">
                  <label className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-2 ml-1">
                    <Zap size={14} className="text-amber-500" /> Command Form
                  </label>
                  <Input name="imperative" placeholder="e.g. Cham!" value={form.imperative} onChange={handleInputChange} className="h-14 bg-white border-amber-200 rounded-2xl text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-amber-500" />
                </div>
              )}

              {/* Examples */}
              {!isProverbOrSaying && !isRiddle && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2 ml-1">
                    <Languages size={14} className="text-emerald-500" /> Examples
                  </label>
                  <Textarea 
                    name="examples" 
                    placeholder="Provide both Kalenjin and English, separated by a dash e.g. Hello - Chamgei"
                    value={form.examples} 
                    onChange={handleInputChange} 
                    className="min-h-[100px] bg-white border-2 border-slate-200 rounded-2xl p-5 text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500 focus:border-emerald-500 transition-all resize-none" 
                  />
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2 ml-1">
                  <MessageSquareQuote size={14} className="text-emerald-500" /> Notes
                </label>
                <Textarea 
                  name="notes" 
                  value={form.notes} 
                  onChange={handleInputChange} 
                  placeholder="Any context? Related words? Variations?"
                  className="min-h-[100px] bg-white border-2 border-slate-200 rounded-2xl p-5 text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500 focus:border-emerald-500 transition-all resize-none" 
                />
              </div>

              {/* Dialects */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                    <MapPin size={14} /> Applicable Dialects
                  </label>
                  
                  <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 cursor-pointer" onClick={() => toggleUniversal(!isUniversal)}>
                    <Checkbox 
                      id="universal" 
                      checked={isUniversal}
                      onCheckedChange={toggleUniversal}
                      className="border-blue-400 data-[state=checked]:bg-blue-600"
                    />
                    <label htmlFor="universal" className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider cursor-pointer flex items-center gap-1">
                      <Globe size={12} /> Universal
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-6 bg-blue-50/30 rounded-[2rem] border border-blue-200/50">
                  {DIALECTS.map((dialect) => (
                    <div key={dialect} className="flex items-center space-x-2">
                      <Checkbox 
                        id={dialect} 
                        checked={form.dialects.includes(dialect)}
                        onCheckedChange={() => handleDialectChange(dialect)}
                        className="border-blue-300 data-[state=checked]:bg-blue-600"
                      />
                      <label htmlFor={dialect} className="text-xs font-medium text-slate-600 cursor-pointer select-none">
                        {dialect}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Turnstile */}
              <div className="flex justify-center py-2">
                <Turnstile
                  siteKey="0x4AAAAAAC0n6ihaIamC4RCT"
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  options={{ theme: "light", size: "normal" }}
                />
              </div>

              {/* Submit */}
              <div className="space-y-3 pt-4">
                <Button 
                  onClick={handleSubmit} 
                  disabled={saving || !isFormValid()} 
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white h-16 rounded-[1.5rem] font-bold uppercase text-sm tracking-[0.15em] shadow-xl transition-all disabled:opacity-30"
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
                  <p className="text-center text-[10px] font-medium uppercase text-emerald-600 tracking-widest animate-pulse flex items-center justify-center gap-1">
                    <AlertCircle size={12} /> 
                    {!turnstileToken 
                      ? "Human verification required" 
                      : form.dialects.length === 0 
                        ? "Select at least one dialect"
                        : `Missing ${isRiddle ? "Walutiet" : "Translation"}`
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