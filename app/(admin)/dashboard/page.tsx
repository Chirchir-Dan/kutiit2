"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Search, 
  Save, 
  X, 
  BookOpen, 
  ChevronRight, 
  Plus,
  Languages,
  Zap
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// 1. STABLE EDITOR COMPONENT (Outside main to keep focus)
const EditorFields = ({ editForm, handleInputChange }: { editForm: any, handleInputChange: any }) => (
  <div className="space-y-8 py-2">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nandi Entry</label>
        <Input 
          name="entry_name" 
          value={editForm?.entry_name || ""} 
          placeholder="e.g Teta"
          onChange={handleInputChange} 
          className="h-12 bg-white border-slate-200 rounded-xl font-bold focus-visible:ring-emerald-500/20" 
        />
      </div>
      <div className="space-y-2">
        <label  className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">English Translation</label>
        <Input 
          name="translation_en" 
          value={editForm?.translation_en || ""} 
          placeholder="e.g Cow"
          onChange={handleInputChange} 
          className="h-12 bg-white border-slate-200 rounded-xl focus-visible:ring-emerald-500/20" 
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Word Type</label>
        <select 
          name="word_type" 
          value={editForm?.word_type || "noun"} 
          onChange={handleInputChange} 
          className="w-full h-12 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none appearance-none"
        >
          <option value="noun">Noun</option>
          <option value="verb">Verb</option>
          <option value="adjective">Adjective</option>
          <option value="phrase">Phrase</option>
        </select>
      </div>
    </div>

    {/* NOUN SECTION */}
    {editForm?.word_type === "noun" && (
      <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Singular</p>
            <Input name="singular_indefinite" placeholder="e.g tany" value={editForm?.singular_indefinite || ""} onChange={handleInputChange} className="bg-white" />
            <Input name="singular_definite" placeholder="e.g. teta" value={editForm?.singular_definite || ""} onChange={handleInputChange} className="bg-white border-emerald-100" />
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Plural</p>
            <Input name="plural_indefinite" placeholder="tich" value={editForm?.plural_indefinite || ""} onChange={handleInputChange} className="bg-white" />
            <Input name="plural_definite" placeholder="tuga" value={editForm?.plural_definite || ""} onChange={handleInputChange} className="bg-white border-emerald-100" />
          </div>
        </div>
      </div>
    )}

    {/* VERB SECTION (IMPERATIVE) */}
    {editForm?.word_type === "verb" && (
      <div className="bg-amber-50/30 p-5 rounded-2xl border border-amber-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2 ml-1">
            <Zap size={12} /> Imperative Form
          </label>
          <Input 
            name="imperative" 
            placeholder="e.g. Cham!" 
            value={editForm?.imperative || ""} 
            onChange={handleInputChange} 
            className="h-12 bg-white border-amber-100 rounded-xl focus-visible:ring-amber-500/20 font-medium" 
          />
        </div>
      </div>
    )}

    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
        <Languages size={14} className="text-emerald-600" /> Examples
      </label>
      <Textarea 
        name="examples" 
        value={editForm?.examples || ""} 
        onChange={handleInputChange} 
        className="min-h-[220px] bg-white border-slate-200 rounded-2xl p-4 font-mono text-sm shadow-inner focus-visible:ring-emerald-500/20 leading-relaxed" 
      />
    </div>
  </div>
);

export default function AdminDashboard() {
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

  const filteredWords = words.filter((w) => {
    const s = searchQuery.toLowerCase();
    return (
      w.entry_name?.toLowerCase().includes(s) ||
      w.translation_en?.toLowerCase().includes(s) ||
      w.singular_indefinite?.toLowerCase().includes(s) ||
      w.singular_definite?.toLowerCase().includes(s) ||
      w.plural_indefinite?.toLowerCase().includes(s) ||
      w.plural_definite?.toLowerCase().includes(s) ||
      w.examples?.toLowerCase().includes(s) ||
      w.imperative?.toLowerCase().includes(s)
    );
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSelect = (word: any) => {
    setSelectedWord(word);
    setEditForm({ ...word });
    if (window.innerWidth < 768) setIsModalOpen(true);
  };

  const handleAddNew = () => {
    const newWord = { entry_name: "", translation_en: "", word_type: "noun", examples: "", imperative: "" };
    setSelectedWord(null);
    setEditForm(newWord);
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

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="flex flex-col w-full md:w-80 lg:w-96 border-r bg-slate-50/50 shrink-0 h-full">
        <div className="p-4 border-b bg-white space-y-4 shadow-sm z-10">
          <div className="flex items-center justify-between">
            <span className="font-black text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2">
              <BookOpen size={16} className="text-emerald-600" /> Kutiit Admin
            </span>
            <Button onClick={handleAddNew} size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8 rounded-lg text-[10px] font-bold uppercase px-3">
              <Plus size={14} className="mr-1" /> Add
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <Input 
              placeholder="Search..." 
              className="pl-9 bg-slate-100 border-none h-10 text-xs rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {filteredWords.map((word) => (
            <button
              key={word.id}
              onClick={() => handleSelect(word)}
              className={`w-full text-left p-4 border-b transition-all flex justify-between items-center group ${
                selectedWord?.id === word.id 
                  ? "bg-white border-l-4 border-l-emerald-600 shadow-sm" 
                  : "hover:bg-slate-100 border-l-4 border-l-transparent"
              }`}
            >
              <div className="min-w-0">
                <div className="font-bold text-slate-900 uppercase text-[11px] truncate group-hover:text-emerald-700">{word.entry_name}</div>
                <div className="text-[10px] text-slate-400 italic truncate mt-0.5">{word.translation_en}</div>
              </div>
              <ChevronRight size={14} className={selectedWord?.id === word.id ? "text-emerald-500" : "text-slate-200 group-hover:text-slate-400"} />
            </button>
          ))}
        </ScrollArea>
      </aside>

      {/* DESKTOP EDITOR */}
      <main className="hidden md:flex flex-1 flex-col h-full bg-white">
        {editForm && (
          <div className="flex flex-col h-full">
            <div className="p-8 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h1 className="text-3xl font-black uppercase tracking-tighter truncate text-slate-900 pr-4">{editForm.entry_name || "New Entry"}</h1>
              <Button onClick={handleSave} disabled={saving} className="bg-slate-900 hover:bg-black px-10 rounded-xl h-12 font-bold uppercase text-xs tracking-widest shadow-lg transition-all active:scale-95">
                {saving ? <Loader2 className="animate-spin" /> : <Save size={18} className="mr-2" />}
                Save
              </Button>
            </div>
            <ScrollArea className="flex-1 p-10">
              <div className="max-w-2xl mx-auto">
                <EditorFields editForm={editForm} handleInputChange={handleInputChange} />
              </div>
            </ScrollArea>
          </div>
        )}
      </main>

      {/* MOBILE MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        {/* Added [&>button]:hidden to hide the default Shadcn X button */}
        <DialogContent className="w-[92vw] max-w-[500px] max-h-[88vh] p-0 flex flex-col border-none overflow-hidden rounded-[2.5rem] shadow-2xl bg-white outline-none [&>button]:hidden">
          <DialogHeader className="p-5 border-b bg-white flex flex-row items-center justify-between space-y-0 shrink-0">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg font-black uppercase tracking-tight truncate pr-4 text-slate-900">
                {editForm?.entry_name || "New Word"}
              </DialogTitle>
            </div>
            <div className="flex gap-2 items-center">
              <Button onClick={handleSave} disabled={saving} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-5 text-[10px] font-black uppercase tracking-widest">
                {saving ? <Loader2 size={14} className="animate-spin" /> : "SAVE"}
              </Button>
              {/* Our Custom X Button */}
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full h-10 w-10 hover:bg-slate-100 transition-colors">
                <X size={20} className="text-slate-400" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6 bg-white custom-scrollbar">
            <EditorFields editForm={editForm} handleInputChange={handleInputChange} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}