"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Loader2, Search, Save, X, BookOpen, LogOut,
  ChevronRight, Plus, Languages, Zap, MessageSquareQuote, Quote
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

// 1. DYNAMIC FORM COMPONENT
const EditorFields = ({ editForm, handleInputChange, handleAddTranslation, handleRemoveTranslation, handleTranslationKeyDown }: { 
  editForm: any, 
  handleInputChange: any,
  handleAddTranslation: any,
  handleRemoveTranslation: any,
  handleTranslationKeyDown: any
}) => {
  const isLongForm = ["proverb", "saying", "tangoch"].includes(editForm?.word_type);
  const isNoun = editForm?.word_type === "noun";
  const isVerb = editForm?.word_type === "verb";

  return (
    <div className="space-y-8 py-2">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest ml-1">Type</label>
        <select 
          name="word_type" 
          value={editForm?.word_type || "noun"} 
          onChange={handleInputChange} 
          className="w-full h-12 rounded-xl border-2 border-slate-100 bg-white px-4 text-sm font-bold outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
        >
          <option value="noun">Noun</option>
          <option value="verb">Verb</option>
          <option value="adjective">Adjective</option>
          <option value="proverb">Proverb</option>
          <option value="saying">Saying</option>
          <option value="tangoch">Tangoch</option>
          <option value="phrase">Phrase</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            {isLongForm ? "Nandi Text" : "Nandi Entry"}
          </label>
          <Input 
            name="entry_name" 
            value={editForm?.entry_name || ""} 
            onChange={handleInputChange} 
            className="h-12 bg-white border-slate-200 rounded-xl font-bold" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            {isLongForm ? "Meaning" : "Translations"}
          </label>
          {/* Multiple Translations Input */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input 
                name="translation_input"
                value={editForm?.translation_input || ""}
                onChange={handleInputChange}
                onKeyDown={handleTranslationKeyDown}
                placeholder="Type translation and press Enter..."
                className="h-12 bg-white border-slate-200 rounded-xl flex-1"
              />
              <Button
                type="button"
                onClick={handleAddTranslation}
                variant="outline"
                className="h-12 px-4 rounded-xl border-slate-200"
              >
                <Plus size={16} />
              </Button>
            </div>
            <p className="text-[10px] text-slate-400 ml-1">Press Enter to add multiple translations</p>
            
            {/* Translation Tags */}
            {editForm?.translations && editForm.translations.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 p-3 bg-slate-50/80 rounded-xl border border-slate-100 min-h-[50px]">
                {editForm.translations.map((translation: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium"
                  >
                    {translation}
                    <button
                      type="button"
                      onClick={() => handleRemoveTranslation(index)}
                      className="ml-1 hover:text-red-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            {(!editForm?.translations || editForm.translations.length === 0) && (
              <p className="text-xs text-slate-400 mt-1">No translations added yet</p>
            )}
          </div>
        </div>
      </div>

      {isNoun && (
        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Singular</p>
              <div className="flex gap-2">
                <Input name="singular_indefinite" placeholder="Indef" value={editForm?.singular_indefinite || ""} onChange={handleInputChange} className="bg-white" />
                <Input name="singular_definite" placeholder="Def" value={editForm?.singular_definite || ""} onChange={handleInputChange} className="bg-white" />
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Plural</p>
              <div className="flex gap-2">
                <Input name="plural_indefinite" placeholder="Indef" value={editForm?.plural_indefinite || ""} onChange={handleInputChange} className="bg-white" />
                <Input name="plural_definite" placeholder="Def" value={editForm?.plural_definite || ""} onChange={handleInputChange} className="bg-white" />
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

      {!isLongForm && (
        <div className="space-y-2 animate-in fade-in">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
            <Languages size={14} className="text-emerald-600" /> Examples
          </label>
          <Textarea name="examples" value={editForm?.examples || ""} onChange={handleInputChange} className="min-h-[120px] bg-white border-slate-200 rounded-2xl p-4 font-mono text-sm leading-relaxed" />
        </div>
      )}

      <div className="space-y-2 pb-10">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
          <MessageSquareQuote size={14} className="text-emerald-600" /> Notes
        </label>
        <Textarea 
          name="notes" 
          value={editForm?.notes || ""} 
          onChange={handleInputChange} 
          className="min-h-[100px] bg-slate-50/50 border-slate-200 rounded-2xl p-4 text-sm italic" 
        />
      </div>
    </div>
  );
};

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
        // Handle existing data - initialize translations array from translation_en
        const wordData = data[0];
        const translations = wordData.translations || (wordData.translation_en ? [wordData.translation_en] : []);
        setEditForm({ 
          ...wordData, 
          translations: translations,
          translation_input: "" 
        }); 
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
    // Convert single translation to array if needed
    const translations = word.translations || (word.translation_en ? [word.translation_en] : []);
    setEditForm({ 
      ...word, 
      translations: translations,
      translation_input: "" 
    });
    if (window.innerWidth < 768) setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditForm({ 
      entry_name: "", word_type: "noun", 
      translations: [], translation_input: "",
      translation_en: "",
      examples: "", notes: "", imperative: "",
      singular_indefinite: "", singular_definite: "",
      plural_indefinite: "", plural_definite: ""
    });
    setSelectedWord(null);
    setIsModalOpen(true);
  };

  // Translation handlers
  const handleAddTranslation = () => {
    if (!editForm?.translation_input?.trim()) return;
    const newTranslation = editForm.translation_input.trim();
    if (!editForm.translations.includes(newTranslation)) {
      setEditForm({
        ...editForm,
        translations: [...editForm.translations, newTranslation],
        translation_input: ""
      });
    }
  };

  const handleRemoveTranslation = (index: number) => {
    setEditForm({
      ...editForm,
      translations: editForm.translations.filter((_: any, i: number) => i !== index)
    });
  };

  const handleTranslationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTranslation();
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Prepare data for saving
    const saveData = { 
      ...editForm, 
      // Remove temporary field
      translation_input: undefined,
      // Set translation_en as the first translation (for backward compatibility)
      translation_en: editForm.translations?.[0] || "",
      // Store all translations as a JSON array
      translations: editForm.translations || []
    };
    
    const { error } = editForm.id 
      ? await supabase.from("words").update(saveData).eq("id", editForm.id)
      : await supabase.from("words").insert([saveData]);
    
    if (!error) { 
      await fetchWords(); 
      setIsModalOpen(false); 
    }
    setSaving(false);
  };

  // Modified handleInputChange to handle the translation_input field
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const filteredWords = words.filter((w) => {
    const s = searchQuery.toLowerCase();
    return w.entry_name?.toLowerCase().includes(s) || w.translation_en?.toLowerCase().includes(s);
  });

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden fixed inset-0">
      <aside className="flex flex-col w-full md:w-80 lg:w-96 border-r bg-slate-50/50 shrink-0 h-full overflow-hidden">
        <div className="p-4 border-b bg-white space-y-4 shrink-0 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-black text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2">
              <BookOpen size={16} className="text-emerald-600" /> Admin
            </span>
            <div className="flex gap-2">
                <Button onClick={handleAddNew} size="sm" className="bg-emerald-600 h-8 text-[10px] font-bold uppercase">
                    <Plus size={14} className="mr-1" /> Add
                </Button>
                <Button variant="outline" onClick={handleLogout} size="sm" className="h-8 w-8 p-0 border-slate-200">
                    <LogOut size={14} className="text-slate-400" />
                </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <Input placeholder="Search..." className="pl-9 bg-slate-100 border-none h-10 text-xs rounded-xl" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white/50">
          {filteredWords.map((word) => (
            <button 
              key={word.id} 
              onClick={() => handleSelect(word)} 
              className={`w-full text-left p-4 border-b transition-all flex justify-between items-center ${selectedWord?.id === word.id ? "bg-white border-l-4 border-l-emerald-600 shadow-sm" : "hover:bg-slate-100 border-l-4 border-l-transparent"}`}
            >
              <div className="min-w-0">
                <div className="font-bold text-slate-900 uppercase text-[11px] truncate flex items-center gap-2">
                  {["proverb", "tangoch"].includes(word.word_type) && <Quote size={10} className="text-emerald-500" />}
                  {word.entry_name}
                </div>
                <div className="text-[10px] text-slate-400 italic truncate mt-0.5">
                  {word.translations ? word.translations.join(", ") : word.translation_en}
                </div>
              </div>
              <ChevronRight size={14} className={selectedWord?.id === word.id ? "text-emerald-500" : "text-slate-200"} />
            </button>
          ))}
        </div>
      </aside>

      <main className="hidden md:flex flex-1 flex-col h-full bg-white overflow-hidden">
        {editForm && (
          <>
            <div className="p-8 border-b flex justify-between items-center bg-white shrink-0">
              <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 truncate pr-4">{editForm.entry_name || "New Entry"}</h1>
              <Button onClick={handleSave} disabled={saving} className="bg-slate-900 px-10 h-12 font-bold uppercase text-xs tracking-widest shadow-lg">
                {saving ? <Loader2 className="animate-spin" /> : <Save size={18} className="mr-2" />} Save
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-10">
              <div className="max-w-2xl mx-auto">
                <EditorFields 
                  editForm={editForm} 
                  handleInputChange={handleInputChange}
                  handleAddTranslation={handleAddTranslation}
                  handleRemoveTranslation={handleRemoveTranslation}
                  handleTranslationKeyDown={handleTranslationKeyDown}
                />
              </div>
            </div>
          </>
        )}
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95vw] max-w-[550px] h-[90vh] p-0 flex flex-col border-none rounded-[2rem] overflow-hidden bg-white shadow-2xl">
          <DialogHeader className="p-6 border-b bg-white shrink-0 flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-xl font-black uppercase text-slate-900 truncate">
              {editForm?.id ? "Edit Entry" : "New Entry"}
            </DialogTitle>
            <div className="flex gap-2 items-center">
              <Button onClick={handleSave} disabled={saving} size="sm" className="bg-emerald-600 rounded-xl h-10 px-6 text-[10px] font-black uppercase">SAVE</Button>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full h-10 w-10"><X size={20} className="text-slate-400" /></Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-8 bg-white">
            <EditorFields 
              editForm={editForm} 
              handleInputChange={handleInputChange}
              handleAddTranslation={handleAddTranslation}
              handleRemoveTranslation={handleRemoveTranslation}
              handleTranslationKeyDown={handleTranslationKeyDown}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}