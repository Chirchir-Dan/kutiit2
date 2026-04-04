"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Loader2, Search, Save, X, BookOpen, LogOut,
  ChevronRight, Plus, Languages, Zap, MessageSquareQuote, Quote, HelpCircle,
  ExternalLink
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// --- SUB-COMPONENTS ---

const EditorFields = ({ editForm, handleInputChange }: { editForm: any, handleInputChange: any }) => {
  const isProverbOrSaying = ["proverb", "saying"].includes(editForm?.word_type);
  const isRiddle = editForm?.word_type === "riddle";
  const isNoun = editForm?.word_type === "noun";
  const isVerb = editForm?.word_type === "verb";

  return (
    <div className="space-y-8 py-2">
      {/* 1. MASTER TYPE SELECTOR */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Grammar Category</label>
        <select 
          name="word_type" 
          value={editForm?.word_type || "noun"} 
          onChange={handleInputChange} 
          className="w-full h-12 rounded-xl border-2 border-slate-100 bg-white px-4 text-sm font-bold outline-none focus:border-emerald-500 appearance-none cursor-pointer"
        >
          <optgroup label="Standard Parts of Speech">
            <option value="noun">Noun</option>
            <option value="verb">Verb</option>
            <option value="adjective">Adjective</option>
            <option value="adverb">Adverb</option>
            <option value="pronoun">Pronoun</option>
            <option value="preposition">Preposition</option>
            <option value="conjunction">Conjunction</option>
            <option value="interjection">Interjection</option>
            <option value="particle">Particle</option>
          </optgroup>
          <optgroup label="Traditional Literature">
            <option value="proverb">Kalewenet</option>
            <option value="riddle">Tangoch</option>
            <option value="saying">Saying</option>
          </optgroup>
        </select>
      </div>

      <div className={`grid grid-cols-1 ${isRiddle ? "" : "md:grid-cols-2"} gap-6`}>
        {/* 2. NANDI TEXT ENTRY */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            {isRiddle ? "Riddle Text (Tangoch)" : isProverbOrSaying ? "Nandi Text" : "Nandi Entry"}
          </label>
          <Input 
            name="entry_name" 
            value={editForm?.entry_name || ""} 
            onChange={handleInputChange} 
            placeholder={isRiddle ? "e.g., Aing'un amun..." : "Enter word..."}
            className="h-12 bg-white border-slate-200 rounded-xl font-bold" 
          />
        </div>

        {/* 3. CONDITIONAL TRANSLATION (Hidden for Tangoch) */}
        {!isRiddle && (
          <div className="space-y-2 animate-in fade-in">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              {editForm?.word_type === 'saying' ? "Meaning" : isProverbOrSaying ? "Meaning" : "English Translation"}
            </label>
            <Input 
              name="translation_en" 
              value={editForm?.translation_en || ""} 
              onChange={handleInputChange} 
              className="h-12 bg-white border-slate-200 rounded-xl" 
            />
          </div>
        )}
      </div>

      {/* 4. RIDDLE ANSWER (Walutiet) */}
      {isRiddle && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
          <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2 ml-1">
            <HelpCircle size={14} /> Walutiet
          </label>
          <Input 
            name="answer" 
            placeholder="Nee walutiet?"
            value={editForm?.answer || ""} 
            onChange={handleInputChange} 
            className="h-12 bg-emerald-50 border-emerald-100 rounded-xl font-bold text-emerald-600 focus-visible:ring-emerald-500 placeholder:text-emerald-300" 
          />
        </div>
      )}

      {/* 5. NOUN MORPHOLOGY */}
      {isNoun && (
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Singular</p>
              <div className="flex gap-2">
                <Input name="singular_indefinite" placeholder="tany" value={editForm?.singular_indefinite || ""} onChange={handleInputChange} className="bg-white" />
                <Input name="singular_definite" placeholder="teta" value={editForm?.singular_definite || ""} onChange={handleInputChange} className="bg-white" />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Plural</p>
              <div className="flex gap-2">
                <Input name="plural_indefinite" placeholder="tich" value={editForm?.plural_indefinite || ""} onChange={handleInputChange} className="bg-white" />
                <Input name="plural_definite" placeholder="tuga" value={editForm?.plural_definite || ""} onChange={handleInputChange} className="bg-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. VERB MORPHOLOGY */}
      {isVerb && (
        <div className="bg-amber-50/30 p-5 rounded-2xl border border-amber-100 space-y-2 animate-in fade-in">
          <label className="text-[10px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-2 ml-1">
            <Zap size={12} /> Imperative
          </label>
          <Input name="imperative" placeholder="e.g. Cham!" value={editForm?.imperative || ""} onChange={handleInputChange} className="h-12 bg-white border-amber-100 rounded-xl" />
        </div>
      )}

      {/* 7. EXAMPLES (Hidden for Traditional Lit) */}
      {!isProverbOrSaying && !isRiddle && (
        <div className="space-y-2 animate-in fade-in">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
            <Languages size={14} className="text-emerald-600" /> Usage Examples
          </label>
          <Textarea name="examples" value={editForm?.examples || ""} onChange={handleInputChange} className="min-h-[100px] bg-white border-slate-200 rounded-2xl p-4 font-mono text-sm leading-relaxed" />
        </div>
      )}

      {/* 8. NOTES & CONTEXT */}
      <div className="space-y-2 pb-10">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
          <MessageSquareQuote size={14} className="text-emerald-600" /> Notes & Context
        </label>
        <Textarea 
          name="notes" 
          value={editForm?.notes || ""} 
          onChange={handleInputChange} 
          placeholder="Cultural significance or grammar tips..."
          className="min-h-[100px] bg-slate-50/50 border-slate-200 rounded-2xl p-4 text-sm italic" 
        />
      </div>
    </div>
  );
};

// --- MAIN PAGE ---

export default function AdminDashboard() {
  const router = useRouter();
  const [words, setWords] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { fetchWords(); }, []);

  const fetchWords = async () => {
    setLoading(true);
    const { data } = await supabase.from("words").select("*").order("entry_name", { ascending: true });
    if (data) { 
      setWords(data); 
      if (data.length > 0 && !selectedWord) { 
        setSelectedWord(data[0]); 
        setEditForm(data[0]); 
      } 
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleSelect = (word: any) => {
    setSelectedWord(word);
    setEditForm({ ...word });
    if (window.innerWidth < 768) setIsModalOpen(true);
  };

  const handleAddNew = () => {
    const newEntry = { 
      entry_name: "", word_type: "noun", translation_en: "", 
      examples: "", notes: "", imperative: "", answer: "",
      singular_indefinite: "", singular_definite: "",
      plural_indefinite: "", plural_definite: "", is_verified: true
    };
    setEditForm(newEntry);
    setSelectedWord(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = editForm.id 
      ? await supabase.from("words").update(editForm).eq("id", editForm.id)
      : await supabase.from("words").insert([editForm]);
    
    if (!error) { 
      await fetchWords(); 
      setIsModalOpen(false); 
    }
    setSaving(false);
  };

  const filteredWords = words.filter((w) => {
    const s = searchQuery.toLowerCase();
    return w.entry_name?.toLowerCase().includes(s) || w.translation_en?.toLowerCase().includes(s);
  });

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden fixed inset-0">
      {/* SIDEBAR */}
      <aside className="flex flex-col w-full md:w-80 lg:w-96 border-r bg-slate-50/50 shrink-0 h-full overflow-hidden">
        <div className="p-4 border-b bg-white space-y-4 shrink-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 uppercase text-[10px] tracking-widest flex items-center gap-2">
                <BookOpen size={16} className="text-emerald-600" /> Kutiit Admin
              </span>
              {/* PUBLIC PAGE LINK */}
              <button 
                onClick={() => router.push("/")}
                className="text-[9px] font-bold text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-1 border-l pl-2 border-slate-200"
              >
                PUBLIC <ExternalLink size={10} />
              </button>
            </div>
            <div className="flex gap-2">
                <Button onClick={handleAddNew} size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8 text-[10px] font-bold uppercase tracking-wider">
                    <Plus size={14} className="mr-1" /> Add
                </Button>
                <Button variant="outline" onClick={handleLogout} size="sm" className="h-8 w-8 p-0 border-slate-200">
                    <LogOut size={14} className="text-slate-400" />
                </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <Input 
              placeholder="Search..." 
              className="pl-9 bg-slate-100 border-none h-10 text-xs rounded-xl focus-visible:ring-emerald-500" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white/50">
          {filteredWords.map((word) => {
            const isRiddle = word.word_type === 'riddle';
            const isProverb = word.word_type === 'proverb';
            const isSaying = word.word_type === 'saying';

            return (
              <button 
                key={word.id} 
                onClick={() => handleSelect(word)} 
                className={`w-full text-left p-4 border-b transition-all flex justify-between items-center ${selectedWord?.id === word.id ? "bg-white border-l-4 border-l-emerald-600 shadow-sm" : "hover:bg-slate-100 border-l-4 border-l-transparent"}`}
              >
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 uppercase text-[11px] truncate flex items-center gap-2">
                    {(isRiddle || isProverb || isSaying) && <Quote size={10} className="text-emerald-500" />}
                    {word.entry_name}
                  </div>
                  
                  <div className="text-[10px] text-slate-400 italic truncate mt-0.5">
                    {(isRiddle || isProverb || isSaying) ? (
                        null 
                    ) : (
                        word.translation_en 
                    )}
                  </div>
                </div>
                <ChevronRight size={14} className={selectedWord?.id === word.id ? "text-emerald-500" : "text-slate-200"} />
              </button>
            );
          })}
        </div>
      </aside>

      {/* DESKTOP EDITOR PANE */}
      <main className="hidden md:flex flex-1 flex-col h-full bg-white overflow-hidden">
        {editForm ? (
          <>
            <div className="p-8 border-b flex justify-between items-center bg-white shrink-0">
              <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-900 truncate pr-4">{editForm.entry_name || "New Entry"}</h1>
              <Button onClick={handleSave} disabled={saving} className="bg-slate-900 px-10 h-12 font-bold uppercase text-[10px] tracking-widest shadow-lg hover:bg-black transition-all">
                {saving ? <Loader2 className="animate-spin" /> : <Save size={18} className="mr-2" />} Save Entry
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-10">
              <div className="max-w-2xl mx-auto">
                <EditorFields editForm={editForm} handleInputChange={(e:any) => setEditForm({...editForm, [e.target.name]: e.target.value})} />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-200 uppercase font-black tracking-widest text-xs">
            <BookOpen size={40} className="mb-4 opacity-10" />
            Select an entry to edit
          </div>
        )}
      </main>

      {/* MOBILE MODAL EDITOR */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95vw] max-w-[550px] h-[90vh] p-0 flex flex-col border-none rounded-[2rem] overflow-hidden bg-white shadow-2xl [&>button]:hidden">
          <DialogHeader className="p-6 border-b bg-white shrink-0 flex flex-row items-center justify-between space-y-0">
            <div className="flex flex-col truncate pr-4">
               <span className="text-[10px] font-black text-emerald-600 uppercase block mb-0.5">{editForm?.word_type}</span>
               <DialogTitle className="text-lg font-black uppercase text-slate-900 truncate">
                {editForm?.id ? "Edit Entry" : "New Entry"}
               </DialogTitle>
            </div>
            <div className="flex gap-2 items-center shrink-0">
              <Button onClick={handleSave} disabled={saving} size="sm" className="bg-emerald-600 rounded-xl h-10 px-6 text-[10px] font-black uppercase shadow-md">SAVE</Button>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full h-10 w-10 hover:bg-slate-100"><X size={20} className="text-slate-400" /></Button>
            </div>
          </DialogHeader>
          <DialogDescription className="sr-only">
            Editor for managing Nandi vocabulary, proverbs, and riddles.
          </DialogDescription>
          <div className="flex-1 overflow-y-auto p-8 bg-white">
            <EditorFields editForm={editForm} handleInputChange={(e:any) => setEditForm({...editForm, [e.target.name]: e.target.value})} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}