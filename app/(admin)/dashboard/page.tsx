"use client";

import { useEffect, useState, useCallback } from "react";
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

const DIALECTS = [
  "Nandi", "Kipsigis", "Keiyo", "Tugen", "Marakwet", 
  "Pokot", "Sabaot", "Terik", "Sabiny", "Sebei"
];

// --- SUB-COMPONENTS ---

const EditorFields = ({ 
  editForm, 
  handleInputChange, 
  onDialectChange,
  onToggleAllDialects,
  handleAddTranslation,
  handleRemoveTranslation,
  handleTranslationKeyDown
}: { 
  editForm: any, 
  handleInputChange: any, 
  onDialectChange: any,
  onToggleAllDialects: () => void,
  handleAddTranslation: any,
  handleRemoveTranslation: any,
  handleTranslationKeyDown: any
}) => {
  const isProverbOrSaying = ["proverb", "saying"].includes(editForm?.word_type);
  const isRiddle = editForm?.word_type === "riddle";
  const isNoun = editForm?.word_type === "noun";
  const isVerb = editForm?.word_type === "verb";
  const isName = editForm?.word_type === "name";

  const allSelected = editForm?.dialects?.length === DIALECTS.length;

  return (
    <div className="space-y-6 py-2">
      {/* 1. Grammar Category */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Grammar Category</label>
        <select 
          name="word_type" 
          value={editForm?.word_type || "noun"} 
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

      {/* 2. Word Entry */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
          {isRiddle ? "Tangoch" : isProverbOrSaying ? "Proverb / Saying" : isName ? "Name" : "Word"}
        </label>
        <Input 
          name="entry_name" 
          value={editForm?.entry_name || ""} 
          onChange={handleInputChange} 
          placeholder={isRiddle ? "e.g., Kirginyuu kipkeleny tulwo" : isName ? "e.g., Kipng'ung'uny" : "Enter word..."}
          className="h-14 bg-white border-2 border-slate-200 rounded-2xl text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500 focus:border-emerald-500 transition-all" 
        />
      </div>

      {/* 3. Translations */}
      {!isRiddle && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">
            {editForm?.word_type === 'saying' ? "Meaning" : isProverbOrSaying ? "Meaning" : isName ? "Meaning" : "Translations"}
          </label>
          <div className="flex gap-2">
            <Input 
              name="translation_input"
              value={editForm?.translation_input || ""}
              onChange={handleInputChange}
              onKeyDown={handleTranslationKeyDown}
              placeholder={isName ? "meanig of name" : "Type translation and press Enter..."}
              className="h-14 bg-white border-2 border-slate-200 rounded-2xl text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500 focus:border-emerald-500 transition-all flex-1"
            />
            <Button
              type="button"
              onClick={handleAddTranslation}
              variant="outline"
              className="h-14 px-6 rounded-2xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50"
            >
              <Plus size={18} className="text-slate-500" />
            </Button>
          </div>
          <p className="text-[10px] text-slate-400 ml-1">Press Enter to add multiple translations</p>
          
          {/* Translation Tags */}
          {editForm?.translations && editForm.translations.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 min-h-[60px]">
              {editForm.translations.map((translation: string, index: number) => (
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
          {(!editForm?.translations || editForm.translations.length === 0) && (
            <p className="text-sm text-slate-400 mt-1">No translations added yet</p>
          )}
        </div>
      )}

      {/* 4. Riddle Answer */}
      {isRiddle && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-2 ml-1">
            <HelpCircle size={14} /> Walutiet
          </label>
          <Input 
            name="answer" 
            placeholder="Nee walutiet?" 
            value={editForm?.answer || ""} 
            onChange={handleInputChange} 
            className="h-14 bg-white border-2 border-emerald-200 rounded-2xl text-base font-normal text-slate-700 placeholder:text-emerald-400 focus-visible:ring-emerald-500 focus:border-emerald-500 transition-all" 
          />
        </div>
      )}

      {/* 5. Noun Forms */}
      {isNoun && (
        <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200 space-y-6">
          {/* Singular Section */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2">Singular</p>
            <div className="space-y-2">
              <Input 
                name="singular_indefinite" 
                placeholder="Indefinite: tany" 
                value={editForm?.singular_indefinite || ""} 
                onChange={handleInputChange} 
                className="h-12 bg-white border-slate-200 rounded-xl text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500 w-full" 
              />
              <Input 
                name="singular_definite" 
                placeholder="Definite: teta" 
                value={editForm?.singular_definite || ""} 
                onChange={handleInputChange} 
                className="h-12 bg-white border-emerald-200 rounded-xl text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500 w-full" 
              />
            </div>
          </div>

          {/* Plural Section */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2">Plural</p>
            <div className="space-y-2">
              <Input 
                name="plural_indefinite" 
                placeholder="Indefinite: tich" 
                value={editForm?.plural_indefinite || ""} 
                onChange={handleInputChange} 
                className="h-12 bg-white border-slate-200 rounded-xl text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500 w-full" 
              />
              <Input 
                name="plural_definite" 
                placeholder="Definite: tuga" 
                value={editForm?.plural_definite || ""} 
                onChange={handleInputChange} 
                className="h-12 bg-white border-emerald-200 rounded-xl text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500 w-full" 
              />
            </div>
          </div>
        </div>
      )}

      {/* 6. Verb Forms */}
      {isVerb && (
        <div className="bg-amber-50/20 p-6 rounded-3xl border border-amber-200/50 space-y-2">
          <label className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-2 ml-1">
            <Zap size={14} className="text-amber-500" /> Imperative
          </label>
          <Input 
            name="imperative" 
            placeholder="e.g. Cham!" 
            value={editForm?.imperative || ""} 
            onChange={handleInputChange} 
            className="h-14 bg-white border-amber-200 rounded-2xl text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-amber-500 focus:border-amber-500 transition-all" 
          />
        </div>
      )}

      {/* 7. Usage Examples */}
      {!isProverbOrSaying && !isRiddle && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2 ml-1">
            <Languages size={14} className="text-emerald-500" /> Usage Examples
          </label>
          <Textarea 
            name="examples" 
            value={editForm?.examples || ""} 
            onChange={handleInputChange} 
            placeholder="Enter example sentences (one per line)"
            className="min-h-[120px] bg-white border-2 border-slate-200 rounded-2xl p-5 text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500 focus:border-emerald-500 transition-all resize-none" 
          />
        </div>
      )}

      {/* 8. Notes & Context */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2 ml-1">
          <MessageSquareQuote size={14} className="text-emerald-500" /> Notes & Context
        </label>
        <Textarea 
          name="notes" 
          value={editForm?.notes || ""} 
          onChange={handleInputChange} 
          placeholder="Cultural significance or grammar tips..."
          className="min-h-[120px] bg-white border-2 border-slate-200 rounded-2xl p-5 text-base font-normal text-slate-700 placeholder:text-slate-400 focus-visible:ring-emerald-500 focus:border-emerald-500 transition-all resize-none" 
        />
      </div>

      {/* 9. DIALECT SELECTION */}
      <div className="pt-6 border-t border-slate-200 space-y-4">
        <div className="flex items-center justify-between px-1">
          <label className="text-xs font-semibold text-blue-600 uppercase tracking-wider flex items-center gap-2">
            <MapPin size={14} /> Dialect Scope
          </label>
          <button 
            type="button"
            onClick={onToggleAllDialects}
            className="text-[10px] font-semibold uppercase text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-md border border-blue-200"
          >
            {allSelected ? "Deselect All" : "Select All"}
          </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {DIALECTS.map((dialect) => (
            <div 
              key={dialect} 
              onClick={() => onDialectChange(dialect)}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                editForm?.dialects?.includes(dialect) 
                ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                : "bg-white border-slate-200 text-slate-500 hover:border-blue-300"
              }`}
            >
              <span className="text-[10px] font-medium uppercase tracking-tight">{dialect}</span>
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
  const [isSearching, setIsSearching] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch all words initially
  useEffect(() => { 
    fetchWords(); 
    fetchSuggestions(); 
  }, []);

  const fetchWords = async () => {
    setLoading(true);
    const { data } = await supabase.from("words").select("*").order("entry_name", { ascending: true });
    if (data) { 
      setWords(data); 
      if (data.length > 0 && !selectedWord && view === "words") { 
        setSelectedWord(data[0]); 
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

  const fetchSuggestions = async () => {
    const { data } = await supabase.from("suggestions").select("*").order("created_at", { ascending: false });
    if (data) setSuggestions(data);
  };

  const clearSearchCache = async () => {
    try {
      await fetch('/api/search/clear-cache', { method: 'POST' });
      console.log('🗑️ Admin: Cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const handleManualClearCache = async () => {
    try {
      await clearSearchCache();
      setToastMessage("✅ Search cache cleared successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      setToastMessage("❌ Failed to clear cache");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      fetchWords();
      return;
    }

    setIsSearching(true);
    try {
      const params = new URLSearchParams({
        q: query.trim(),
        limit: '200'
      });
      
      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();
      
      if (data.results) {
        setWords(data.results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (view === "words") {
      performSearch(searchQuery);
    } else {
      if (!searchQuery.trim()) {
        fetchSuggestions();
      } else {
        const filtered = suggestions.filter(item => {
          const queryLower = searchQuery.toLowerCase();
          return item.entry_name?.toLowerCase().includes(queryLower) ||
                 item.translation_en?.toLowerCase().includes(queryLower) ||
                 item.translations?.some((t: string) => t.toLowerCase().includes(queryLower));
        });
        setSuggestions(filtered);
      }
    }
  }, [searchQuery, view]);

  const handleSelect = (word: any) => {
    setSelectedWord(word);
    const translations = word.translations || (word.translation_en ? [word.translation_en] : []);
    setEditForm({ 
      ...word, 
      translations: translations,
      translation_input: "" 
    });
    setError(null);
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

  const handleAddTranslation = () => {
    if (!editForm?.translation_input?.trim()) return;
    const newTranslation = editForm.translation_input.trim();
    if (!editForm.translations?.includes(newTranslation)) {
      setEditForm({
        ...editForm,
        translations: [...(editForm.translations || []), newTranslation],
        translation_input: ""
      });
    }
  };

  const handleRemoveTranslation = (index: number) => {
    if (!editForm) return;
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

  const handleAddNew = () => {
    setError(null);
    setEditForm({ 
      entry_name: "", word_type: "noun", dialects: [], 
      translations: [], translation_input: "",
      translation_en: "", 
      examples: "", notes: "", imperative: "", answer: "",
      singular_indefinite: "", singular_definite: "",
      plural_indefinite: "", plural_definite: "", is_verified: true
    });
    setSelectedWord(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editForm) return;
    
    setError(null);
    
    if (!editForm.entry_name?.trim()) {
      setError("Please enter a word");
      return;
    }
    
    if (editForm.word_type !== 'riddle' && (!editForm.translations || editForm.translations.length === 0)) {
      setError("Please add at least one translation");
      return;
    }
    
    if (editForm.word_type === 'riddle' && !editForm.answer?.trim()) {
      setError("Please enter the answer for this riddle");
      return;
    }
    
    setSaving(true);

    const { translation_input, ...cleanData } = editForm;
    
    const saveData = { 
      ...cleanData, 
      translation_en: cleanData.translations?.[0] || "",
      translations: cleanData.translations || []
    };
    
    const { error: supabaseError } = editForm.id 
      ? await supabase.from("words").update(saveData).eq("id", editForm.id)
      : await supabase.from("words").insert([saveData]);
    
    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      setError(`Failed to save: ${supabaseError.message}`);
      setSaving(false);
      return;
    }
    
    await clearSearchCache();
    await fetchWords();
    setIsModalOpen(false);
    setSaving(false);
    setError(null);
  };

  const handleApproveSuggestion = async () => {
    if (!editForm) return;
    setSaving(true);
    setError(null);
    
    const { id, created_at, user_email, translation_input, ...cleanData } = editForm;
    
    const insertData = {
      ...cleanData,
      translation_en: cleanData.translations?.[0] || "",
      translations: cleanData.translations || [],
      is_verified: true
    };
    
    const { error: insertError } = await supabase.from("words").insert([insertData]);
    if (insertError) {
      console.error('Supabase error:', insertError);
      setError(`Failed to approve: ${insertError.message}`);
      setSaving(false);
      return;
    }
    
    await supabase.from("suggestions").delete().eq("id", id);
    await clearSearchCache();
    await fetchWords();
    await fetchSuggestions();
    setSelectedWord(null);
    setEditForm(null);
    setIsModalOpen(false);
    setSaving(false);
    setError(null);
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

  const handleViewChange = (newView: "words" | "suggestions") => {
    setView(newView);
    setSearchQuery("");
    setSelectedWord(null);
    setEditForm(null);
    setError(null);
    if (newView === "words") {
      fetchWords();
    } else {
      fetchSuggestions();
    }
  };

  const currentList = view === "words" ? words : suggestions;

  return (
    <div className="flex h-full">
      {/* SIDEBAR */}
      <aside className="w-full md:w-80 lg:w-96 border-r bg-slate-50/30 flex flex-col shrink-0">
        <div className="p-4 border-b bg-white space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Database</span>
            <div className="flex gap-2">
              <Button 
                onClick={handleManualClearCache} 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-amber-600 font-black text-[10px] uppercase hover:bg-amber-50 transition-colors"
                title="Clear search cache (forces fresh data from database)"
              >
                <X size={12} className="mr-1" /> Clear Cache
              </Button>
              <Button onClick={handleAddNew} variant="ghost" size="sm" className="h-7 px-2 text-emerald-600 font-black text-[10px] uppercase hover:bg-emerald-50 transition-colors">
                <Plus size={14} className="mr-1" /> New Entry
              </Button>
            </div>
          </div>

          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button 
              onClick={() => handleViewChange("words")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${view === "words" ? "bg-white shadow-sm text-emerald-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              <BookOpen size={14} /> 
              Live
              <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[9px] ${view === "words" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
                {words.length}
              </span>
            </button>
            <button 
              onClick={() => handleViewChange("suggestions")}
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
              placeholder={view === "words" ? "Search words..." : "Search suggestions..."}
              className="pl-9 bg-white border-slate-200 h-11 text-xs rounded-xl focus-visible:ring-emerald-500" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent"></div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {currentList.length > 0 ? (
            currentList.map((item) => (
              <button 
                key={item.id} 
                onClick={() => handleSelect(item)} 
                className={`w-full text-left p-5 border-b transition-all flex justify-between items-center ${selectedWord?.id === item.id ? "bg-white border-l-4 border-l-emerald-600 shadow-sm" : "hover:bg-white/60 border-l-4 border-l-transparent"}`}
              >
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 uppercase text-[11px] truncate">
                    {item.entry_name}
                  </div>
                  <div className="text-[10px] text-slate-400 italic truncate mt-0.5">
                    {(item.translations || (item.translation_en ? [item.translation_en] : [])).join(', ')}
                  </div>
                </div>
                <ChevronRight size={14} className={selectedWord?.id === item.id ? "text-emerald-500" : "text-slate-200"} />
              </button>
            ))
          ) : (
            <div className="p-10 text-center">
              <div className="text-slate-400 text-sm">
                {searchQuery ? (
                  <>
                    <p className="font-bold">No results found</p>
                    <p className="text-xs mt-1">Try adjusting your search</p>
                  </>
                ) : (
                  <p className="font-bold">No {view === "words" ? "words" : "suggestions"} available</p>
                )}
              </div>
            </div>
          )}
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
              <div className="flex flex-col items-end gap-2">
                {error && (
                  <div className="text-red-500 text-xs font-bold bg-red-50 px-3 py-1 rounded-lg border border-red-200">
                    ⚠️ {error}
                  </div>
                )}
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
            </div>
            <div className="flex-1 overflow-y-auto p-12">
              <div className="max-w-2xl mx-auto">
                <EditorFields 
                  editForm={editForm} 
                  handleInputChange={(e:any) => setEditForm({...editForm, [e.target.name]: e.target.value})}
                  onDialectChange={handleDialectChange}
                  onToggleAllDialects={handleToggleAllDialects}
                  handleAddTranslation={handleAddTranslation}
                  handleRemoveTranslation={handleRemoveTranslation}
                  handleTranslationKeyDown={handleTranslationKeyDown}
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
        <DialogContent className="sm:max-w-[650px] w-[95vw] max-h-[85vh] rounded-[3rem] p-0 flex flex-col border-none bg-white shadow-2xl overflow-hidden [&>button]:hidden">
          <DialogHeader className="p-8 pb-6 bg-emerald-50/50 shrink-0 relative overflow-hidden border-b border-emerald-100/50">
            <div className="flex flex-row items-center justify-between relative z-10">
              <div>
                <DialogTitle className="text-2xl font-black uppercase text-slate-900 tracking-tighter">
                  {editForm?.id ? "Edit Entry" : "New Entry"}
                </DialogTitle>
                <p className="text-emerald-600/70 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                  {editForm?.id ? "Update word in dictionary" : "Expand the Kalenjin Dictionary"}
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <Button 
                  onClick={view === "suggestions" ? handleApproveSuggestion : handleSave} 
                  disabled={saving} 
                  className="bg-emerald-600 rounded-2xl h-12 px-8 text-[10px] font-black uppercase hover:bg-emerald-700"
                >
                  {saving ? <Loader2 className="animate-spin h-5 w-5" /> : "SAVE"}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsModalOpen(false)} 
                  className="rounded-full h-10 w-10 bg-white hover:bg-emerald-100 text-slate-400 border border-emerald-100"
                >
                  <X size={20} />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-8 bg-white">
            {error && (
              <div className="mb-4 text-red-500 text-xs font-bold bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                ⚠️ {error}
              </div>
            )}
            <EditorFields 
              editForm={editForm} 
              handleInputChange={(e: any) => setEditForm({ ...editForm, [e.target.name]: e.target.value })} 
              onDialectChange={handleDialectChange}
              onToggleAllDialects={handleToggleAllDialects}
              handleAddTranslation={handleAddTranslation}
              handleRemoveTranslation={handleRemoveTranslation}
              handleTranslationKeyDown={handleTranslationKeyDown}
            />
            {view === "suggestions" && (
              <Button onClick={() => handleRejectSuggestion(editForm?.id)} variant="ghost" className="w-full mt-4 text-rose-500 font-black uppercase text-[10px]">
                Reject Suggestion
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast notification for cache clearing */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 bg-white border border-slate-200 shadow-lg rounded-xl px-6 py-4 max-w-sm animate-in slide-in-from-bottom-5 duration-300">
          <p className="text-sm font-medium text-slate-900">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}