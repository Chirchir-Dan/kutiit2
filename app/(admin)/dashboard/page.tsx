"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { 
  Loader2, Search, Save, X, BookOpen,
  ChevronRight, Plus, Languages, Zap, MessageSquareQuote, 
  HelpCircle, Inbox, Check, MapPin
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
import Fuse from "fuse.js"; 

const DIALECTS = [
  "Nandi", "Kipsigis", "Keiyo", "Tugen", "Marakwet", 
  "Pokot", "Sabaot", "Terik", "Sabiny", "Sebei"
];

// --- SUB-COMPONENTS ---

const EditorFields = ({ 
  editForm, 
  handleInputChange, 
  onDialectChange,
  onToggleAllDialects 
}: { 
  editForm: any, 
  handleInputChange: any, 
  onDialectChange: any,
  onToggleAllDialects: () => void 
}) => {
  const isProverbOrSaying = ["proverb", "saying"].includes(editForm?.word_type);
  const isRiddle = editForm?.word_type === "riddle";
  const isNoun = editForm?.word_type === "noun";
  const isVerb = editForm?.word_type === "verb";

  const allSelected = editForm?.dialects?.length === DIALECTS.length;

  return (
    <div className="space-y-8 py-2">
      {/* 1. Grammar Category */}
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

      {/* 2. Main Inputs */}
      <div className={`grid grid-cols-1 ${isRiddle ? "" : "md:grid-cols-2"} gap-6`}>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            {isRiddle ? "Tangoch" : isProverbOrSaying ? "saying/proverb" : " word"}
          </label>
          <Input 
            name="entry_name" 
            value={editForm?.entry_name || ""} 
            onChange={handleInputChange} 
            placeholder={isRiddle ? "e.g., Kirginyuu kipkeleny tulwo" : "Enter word..."}
            className="h-12 bg-white border-slate-200 rounded-xl font-bold" 
          />
        </div>

        {!isRiddle && (
          <div className="space-y-2 animate-in fade-in">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              {editForm?.word_type === 'saying' ? "Meaning" : isProverbOrSaying ? "Meaning" : "Translation"}
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

      {/* ... Specific morphology fields (Noun/Verb/Riddle) ... */}
      {isRiddle && (
        <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
          <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2 ml-1">
            <HelpCircle size={14} /> Walutiet
          </label>
          <Input name="answer" placeholder="Nee walutiet?" value={editForm?.answer || ""} onChange={handleInputChange} className="h-12 bg-emerald-50 border-emerald-100 rounded-xl font-bold text-emerald-600 focus-visible:ring-emerald-500 placeholder:text-emerald-300" />
        </div>
      )}

      {isNoun && (
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 animate-in fade-in">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
          {/* Singular Section */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Singular</p>
            <div className="flex gap-2">
              <Input 
                name="singular_indefinite" 
                placeholder="tany" 
                value={editForm?.singular_indefinite || ""} 
                onChange={handleInputChange} 
                className="bg-white flex-1 w-full" 
              />
              <Input 
                name="singular_definite" 
                placeholder="teta" 
                value={editForm?.singular_definite || ""} 
                onChange={handleInputChange} 
                className="bg-white flex-1 w-full" 
              />
            </div>
          </div>

          {/* Plural Section */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Plural</p>
            <div className="flex gap-2">
              <Input 
                name="plural_indefinite" 
                placeholder="tich" 
                value={editForm?.plural_indefinite || ""} 
                onChange={handleInputChange} 
                className="bg-white flex-1 w-full"  
              />
              <Input 
                name="plural_definite" 
                placeholder="tuga" 
                value={editForm?.plural_definite || ""} 
                onChange={handleInputChange} 
                className="bg-white flex-1 w-full" 
              />
            </div>
          </div>
        </div>
        </div>
      )}

      {isVerb && (
        <div className="bg-amber-50/30 p-5 rounded-2xl border border-amber-100 space-y-2 animate-in fade-in">
          <label className="text-[10px] font-black text-amber-800 uppercase tracking-widest flex items-center gap-2 ml-1">
            <Zap size={12} /> Imperative
          </label>
          <Input name="imperative" placeholder="e.g. Cham!" value={editForm?.imperative || ""} onChange={handleInputChange} className="h-12 bg-white border-amber-100 rounded-xl" />
        </div>
      )}

      {!isProverbOrSaying && !isRiddle && (
        <div className="space-y-2 animate-in fade-in">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
            <Languages size={14} className="text-emerald-600" /> Usage Examples
          </label>
          <Textarea name="examples" value={editForm?.examples || ""} onChange={handleInputChange} className="min-h-[100px] bg-white border-slate-200 rounded-2xl p-4 font-mono text-sm leading-relaxed" />
        </div>
      )}

      <div className="space-y-2">
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

      {/* 3. DIALECT SELECTION (Moved to Bottom) */}
      <div className="pt-6 border-t border-slate-100 space-y-4 pb-10">
        <div className="flex items-center justify-between px-1">
          <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
            <MapPin size={12} /> Dialect Scope
          </label>
          <button 
            type="button"
            onClick={onToggleAllDialects}
            className="text-[9px] font-black uppercase text-blue-500 hover:text-blue-700 transition-colors bg-blue-50 px-2 py-1 rounded-md"
          >
            {allSelected ? "Deselect All" : "Select All"}
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {DIALECTS.map((dialect) => (
            <div 
              key={dialect} 
              onClick={() => onDialectChange(dialect)}
              className={`flex items-center justify-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                editForm?.dialects?.includes(dialect) 
                ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                : "bg-white border-slate-200 text-slate-400 hover:border-blue-300"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-tight">{dialect}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [words, setWords] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [view, setView] = useState<"words" | "suggestions">("words");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => { fetchWords(); fetchSuggestions(); }, []);

  const fetchWords = async () => {
    setLoading(true);
    const { data } = await supabase.from("words").select("*").order("entry_name", { ascending: true });
    if (data) { 
      setWords(data); 
      if (data.length > 0 && !selectedWord && view === "words") { 
        setSelectedWord(data[0]); 
        setEditForm(data[0]); 
      } 
    }
    setLoading(false);
  };

  const fetchSuggestions = async () => {
    const { data } = await supabase.from("suggestions").select("*").order("created_at", { ascending: false });
    if (data) setSuggestions(data);
  };

  const handleSelect = (word: any) => {
    setSelectedWord(word);
    setEditForm({ ...word });
    if (window.innerWidth < 768) setIsModalOpen(true);
  };

  const handleDialectChange = (dialect: string) => {
    if (!editForm) return;
    const current = editForm.dialects || [];
    const updated = current.includes(dialect)
      ? current.filter((d: string) => d !== dialect)
      : [...current, dialect];
    setEditForm({ ...editForm, dialects: updated });
  };

  const handleToggleAllDialects = () => {
    if (!editForm) return;
    const allSelected = editForm.dialects?.length === DIALECTS.length;
    setEditForm({ 
      ...editForm, 
      dialects: allSelected ? [] : [...DIALECTS] 
    });
  };

  const handleAddNew = () => {
    const newEntry = { 
      entry_name: "", word_type: "noun", dialects: [""], translation_en: "", 
      examples: "", notes: "", imperative: "", answer: "",
      singular_indefinite: "", singular_definite: "",
      plural_indefinite: "", plural_definite: "", is_verified: true
    };
    setEditForm(newEntry);
    setSelectedWord(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editForm) return;
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

  const handleApproveSuggestion = async () => {
    if (!editForm) return;
    setSaving(true);
    const { id, created_at, user_email, ...wordData } = editForm;
    const { error: insertError } = await supabase.from("words").insert([{ ...wordData, is_verified: true }]);
    if (!insertError) {
      await supabase.from("suggestions").delete().eq("id", id);
      await fetchWords();
      await fetchSuggestions();
      setSelectedWord(null);
      setEditForm(null);
      setIsModalOpen(false);
    }
    setSaving(false);
  };

  const handleRejectSuggestion = async (id: string) => {
    if (!id || !confirm("Reject and delete this suggestion?")) return;
    const { error } = await supabase.from("suggestions").delete().eq("id", id);
    if (!error) {
      await fetchSuggestions();
      setSelectedWord(null);
      setEditForm(null);
      setIsModalOpen(false);
    }
  };

  // FUZZY SEARCH SETUP
  const fuse = useMemo(() => {
    const list = view === "words" ? words : suggestions;
    return new Fuse(list, {
      keys: [
        "entry_name", 
        "translation_en", 
        "answer", 
        "notes", 
        "examples",
        "dialects",
        "singular_indefinite",
        "singular_definite",
        "plural_indefinite",
        "plural_definite"
      ],
      threshold: 0.35,
      distance: 100,
    });
  }, [view, words, suggestions]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return view === "words" ? words : suggestions;
    return fuse.search(searchQuery).map(result => result.item);
  }, [searchQuery, fuse, view, words, suggestions]);

  return (
    <div className="flex h-full">
      {/* SIDEBAR */}
      <aside className="w-full md:w-80 lg:w-96 border-r bg-slate-50/30 flex flex-col shrink-0">
        <div className="p-4 border-b bg-white space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Database</span>
            <Button onClick={handleAddNew} variant="ghost" size="sm" className="h-7 px-2 text-emerald-600 font-black text-[10px] uppercase hover:bg-emerald-50 transition-colors">
              <Plus size={14} className="mr-1" /> New Entry
            </Button>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button 
              onClick={() => { setView("words"); setSelectedWord(null); setEditForm(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${view === "words" ? "bg-white shadow-sm text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              <BookOpen size={14} /> 
              Live
              <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[9px] ${view === "words" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
                {words.length}
              </span>
            </button>
            <button 
              onClick={() => { setView("suggestions"); setSelectedWord(null); setEditForm(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${view === "suggestions" ? "bg-white shadow-sm text-amber-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              <Inbox size={14} /> 
              Review
              {suggestions.length > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[9px] ${view === "suggestions" ? "bg-amber-100 text-amber-700" : "bg-amber-200 text-amber-800"}`}>
                  {suggestions.length}
                </span>
              )}
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <Input 
              placeholder="Search..." 
              className="pl-9 bg-white border-slate-200 h-11 text-xs rounded-xl focus-visible:ring-emerald-500" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => handleSelect(item)} 
              className={`w-full text-left p-5 border-b transition-all flex justify-between items-center ${selectedWord?.id === item.id ? "bg-white border-l-4 border-l-emerald-600 shadow-sm" : "hover:bg-white/60 border-l-4 border-l-transparent"}`}
            >
              <div className="min-w-0">
                <div className="font-bold text-slate-900 uppercase text-[11px] truncate">
                  {item.entry_name}
                </div>
                <div className="text-[10px] text-slate-400 italic truncate mt-0.5">{item.translation_en}</div>
              </div>
              <ChevronRight size={14} className={selectedWord?.id === item.id ? "text-emerald-500" : "text-slate-200"} />
            </button>
          ))}
        </div>
      </aside>

      {/* MAIN EDITOR */}
      <main className="hidden md:flex flex-1 flex-col bg-white overflow-hidden">
        {editForm ? (
          <>
            <div className="p-8 border-b flex justify-between items-center bg-white shrink-0">
              <div className="min-w-0">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-1">{editForm.word_type}</span>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 truncate">{editForm.entry_name || "New Entry"}</h1>
              </div>
              <div className="flex gap-3">
                {view === "suggestions" ? (
                  <>
                    <Button onClick={() => handleRejectSuggestion(editForm?.id)} variant="outline" className="border-rose-200 text-rose-500 hover:bg-rose-50 px-6 h-12 font-bold uppercase text-[10px] tracking-widest rounded-xl">
                      Reject
                    </Button>
                    <Button onClick={handleApproveSuggestion} disabled={saving} className="bg-emerald-600 px-10 h-12 font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-lg hover:bg-emerald-700 text-white">
                      {saving ? <Loader2 className="animate-spin" /> : <Check size={18} className="mr-2" />} Approve
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleSave} disabled={saving} className="bg-slate-900 px-10 h-12 font-bold uppercase text-[10px] tracking-widest rounded-xl shadow-lg hover:bg-black transition-all">
                    {saving ? <Loader2 className="animate-spin" /> : <Save size={18} className="mr-2" />} Save Changes
                  </Button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-12">
              <div className="max-w-2xl mx-auto">
                <EditorFields 
                  editForm={editForm} 
                  handleInputChange={(e:any) => setEditForm({...editForm, [e.target.name]: e.target.value})}
                  onDialectChange={handleDialectChange}
                  onToggleAllDialects={handleToggleAllDialects}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-200">
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <BookOpen size={32} className="opacity-20" />
            </div>
            <p className="uppercase font-black tracking-[0.2em] text-[10px]">Select an entry to begin</p>
          </div>
        )}
      </main>

      {/* MOBILE MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95vw] max-w-[550px] h-[90vh] p-0 flex flex-col border-none rounded-[2rem] overflow-hidden bg-white shadow-2xl [&>button]:hidden">
          <DialogHeader className="p-6 border-b bg-white shrink-0 flex flex-row items-center justify-between space-y-0">
            <div className="flex flex-col truncate pr-4">
              <span className="text-[10px] font-black text-emerald-600 uppercase block mb-0.5">
                {editForm?.word_type}
              </span>
              <DialogTitle className="text-lg font-black uppercase text-slate-900 truncate">
                {view === "suggestions" ? "Review Suggestion" : "Edit Entry"}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Form for editing entries and reviewing suggestions.
              </DialogDescription>
            </div>
            <div className="flex gap-2 items-center">
              <Button 
                onClick={view === "suggestions" ? handleApproveSuggestion : handleSave} 
                disabled={saving} 
                size="sm" 
                className="bg-emerald-600 rounded-xl h-10 px-6 text-[10px] font-black uppercase"
              >
                {saving ? <Loader2 className="animate-spin h-4 w-4" /> : "SAVE"}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full h-10 w-10">
                <X size={20} />
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-8 bg-white">
            <EditorFields 
              editForm={editForm} 
              handleInputChange={(e: any) => setEditForm({ ...editForm, [e.target.name]: e.target.value })} 
              onDialectChange={handleDialectChange}
              onToggleAllDialects={handleToggleAllDialects}
            />
            {view === "suggestions" && (
              <Button onClick={() => handleRejectSuggestion(editForm?.id)} variant="ghost" className="w-full mt-4 text-rose-500 font-black uppercase text-[10px]">
                Reject Suggestion
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
