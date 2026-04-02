"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, BookMarked, Info, Languages, CheckCircle2 } from "lucide-react";

interface AddWordModalProps {
  onWordAdded: () => void;
  editData?: any; // Data for editing
  onClose?: () => void;
}

export function AddWordModal({ onWordAdded, editData, onClose }: AddWordModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const initialState = {
    entry_name: "",
    word_type: "noun",
    translation_en: "",
    singular_indefinite: "",
    singular_definite: "",
    plural_indefinite: "",
    plural_definite: "",
    imperative: "",
    examples: "",
    is_verified: false
  };

  const [formData, setFormData] = useState(initialState);

  // Sync formData with editData when editing begins
  useEffect(() => {
    if (editData) {
      // We map through the editData and ensure no value is null
      const sanitizedData = { ...initialState };
      
      Object.keys(initialState).forEach((key) => {
        // If the database has a value, use it; otherwise, fall back to empty string
        // @ts-ignore - dynamic key access
        sanitizedData[key] = editData[key] ?? initialState[key];
      });

      setFormData(sanitizedData);
      setOpen(true);
    }
  }, [editData]);

  const handleClose = () => {
    setOpen(false);
    setFormData(initialState);
    if (onClose) onClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const { error } = editData 
      ? await supabase.from("words").update(formData).eq("id", editData.id)
      : await supabase.from("words").insert([formData]);

    if (!error) {
      handleClose();
      onWordAdded();
    } else {
      alert(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if(!val) handleClose(); else setOpen(true); }}>
      {!editData && (
        <DialogTrigger asChild>
          <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-md h-11 px-6">
            <Plus className="mr-2 h-5 w-5" /> Add Nandi Entry
          </Button>
        </DialogTrigger>
      )}
      
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto border-none shadow-2xl">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <BookMarked className="text-emerald-600 h-6 w-6" />
            {editData ? `Edit: ${editData.entry_name}` : "New Dictionary Entry"}
          </DialogTitle>
          <DialogDescription>Capture specific Nandi grammatical forms and usage examples.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="font-semibold">Word Type</Label>
              <Select value={formData.word_type} onValueChange={(v) => setFormData({...formData, word_type: v})}>
                <SelectTrigger className="mt-1.5 h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="noun">Noun</SelectItem>
                  <SelectItem value="verb">Verb</SelectItem>
                  <SelectItem value="adjective">Adjective</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="entry_name" className="font-semibold text-emerald-800">Headword</Label>
              <Input id="entry_name" value={formData.entry_name} onChange={(e) => setFormData({...formData, entry_name: e.target.value})} required className="h-11 border-emerald-100" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="translation_en" className="font-semibold">English Translation</Label>
            <Input id="translation_en" value={formData.translation_en} onChange={(e) => setFormData({...formData, translation_en: e.target.value})} required className="h-11" />
          </div>

          {/* Conditional Sections */}
          {formData.word_type === "noun" && (
            <section className="p-5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 flex items-center gap-2"><Info size={14} /> Noun Inflections</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] text-slate-500 uppercase">Singular (Indef / Def)</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Indef" value={formData.singular_indefinite} onChange={(e) => setFormData({...formData, singular_indefinite: e.target.value})} className="bg-white h-9" />
                    <Input placeholder="Def" value={formData.singular_definite} onChange={(e) => setFormData({...formData, singular_definite: e.target.value})} className="bg-white h-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] text-slate-500 uppercase">Plural (Indef / Def)</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Indef" value={formData.plural_indefinite} onChange={(e) => setFormData({...formData, plural_indefinite: e.target.value})} className="bg-white h-9" />
                    <Input placeholder="Def" value={formData.plural_definite} onChange={(e) => setFormData({...formData, plural_definite: e.target.value})} className="bg-white h-9" />
                  </div>
                </div>
              </div>
            </section>
          )}

          {formData.word_type === "verb" && (
            <section className="p-5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-700 flex items-center gap-2"><Languages size={14} /> Verb Command Form</h4>
              <div className="space-y-2">
                <Label className="text-[10px] text-slate-500 uppercase">Imperative (Singular)</Label>
                <Input placeholder="e.g., Cham!" value={formData.imperative} onChange={(e) => setFormData({...formData, imperative: e.target.value})} className="bg-white" />
              </div>
            </section>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="examples" className="font-semibold">Usage Examples (Nandi & English)</Label>
            <Textarea 
              id="examples" 
              placeholder="Mi teta gaa - The cow is at home" 
              className="min-h-[120px] bg-slate-50/50 italic border-slate-200" 
              value={formData.examples} 
              onChange={(e) => setFormData({...formData, examples: e.target.value})} 
            />
          </div>

          <div className="flex items-center space-x-2 p-4 border rounded-xl bg-slate-50/50">
            <input type="checkbox" id="verify" checked={formData.is_verified} onChange={(e) => setFormData({...formData, is_verified: e.target.checked})} className="h-5 w-5 accent-emerald-600 rounded" />
            <Label htmlFor="verify" className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
              <CheckCircle2 size={18} className={formData.is_verified ? "text-emerald-600" : "text-slate-400"} />
              Verified linguistically
            </Label>
          </div>

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-14 text-lg font-bold rounded-xl shadow-lg" disabled={loading}>
            {loading ? <Loader2 className="mr-2 animate-spin" /> : editData ? "Update Entry" : "Save Entry"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}