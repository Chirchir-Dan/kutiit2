"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Loader2 } from "lucide-react";

interface AddWordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWordAdded: () => void;
}

export default function AddWordModal({ isOpen, onClose, onWordAdded }: AddWordModalProps) {
  const [word, setWord] = useState("");
  const [translations, setTranslations] = useState<string[]>([]);
  const [currentTranslation, setCurrentTranslation] = useState("");
  const [partOfSpeech, setPartOfSpeech] = useState("");
  const [example, setExample] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddTranslation = () => {
    const trimmed = currentTranslation.trim();
    if (trimmed && !translations.includes(trimmed)) {
      setTranslations([...translations, trimmed]);
      setCurrentTranslation("");
    }
  };

  const handleRemoveTranslation = (index: number) => {
    setTranslations(translations.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTranslation();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!word.trim()) {
      setError('Please enter a Kalenjin word');
      setLoading(false);
      return;
    }

    if (translations.length === 0) {
      setError('Please add at least one translation');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/words', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: word.trim(),
          translations: translations,
          partOfSpeech: partOfSpeech.trim() || null,
          example: example.trim() || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add word');
      }

      // Reset form
      setWord('');
      setTranslations([]);
      setCurrentTranslation('');
      setPartOfSpeech('');
      setExample('');
      onWordAdded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[600px] h-[92vh] rounded-[3rem] p-0 flex flex-col border-none bg-white shadow-2xl overflow-hidden [&>button]:hidden">
        {/* Header */}
        <DialogHeader className="p-8 pb-6 bg-emerald-50/50 shrink-0 relative overflow-hidden border-b border-emerald-100/50">
          <div className="flex flex-row items-center justify-between relative z-10">
            <div>
              <DialogTitle className="text-2xl font-black uppercase text-slate-900 tracking-tighter">
                Add New Word
              </DialogTitle>
              <p className="text-emerald-600/70 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                Expand the Kalenjin Dictionary
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="rounded-full h-10 w-10 bg-white hover:bg-emerald-100 text-slate-400 border border-emerald-100 transition-colors"
            >
              <X size={20} />
            </Button>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Kalenjin Word - Full Width */}
            <div className="space-y-2">
              <Label htmlFor="word" className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Kalenjin Word <span className="text-red-500">*</span>
              </Label>
              <Input
                id="word"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Enter Kalenjin word..."
                className="h-14 bg-slate-50/50 border-2 border-slate-100 rounded-2xl text-lg focus-visible:ring-emerald-500 focus:bg-white font-bold"
                disabled={loading}
              />
            </div>

            {/* Translations - Full Width */}
            <div className="space-y-2">
              <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Translations <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  value={currentTranslation}
                  onChange={(e) => setCurrentTranslation(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type translation and press Enter..."
                  className="h-14 bg-slate-50/50 border-2 border-slate-100 rounded-2xl text-lg focus-visible:ring-emerald-500 focus:bg-white flex-1"
                  disabled={loading}
                />
                <Button
                  type="button"
                  onClick={handleAddTranslation}
                  variant="outline"
                  className="h-14 px-6 rounded-2xl border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50"
                  disabled={loading || !currentTranslation.trim()}
                >
                  <Plus size={20} />
                </Button>
              </div>
              <p className="text-[10px] text-slate-400">Press Enter to add multiple translations</p>

              {/* Translation Tags */}
              {translations.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 p-4 bg-slate-50/80 rounded-2xl border-2 border-slate-100 min-h-[60px]">
                  {translations.map((translation, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-bold"
                    >
                      {translation}
                      <button
                        type="button"
                        onClick={() => handleRemoveTranslation(index)}
                        className="ml-1 hover:text-red-500 transition-colors"
                        disabled={loading}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {translations.length === 0 && (
                <p className="text-sm text-slate-400 mt-1">No translations added yet</p>
              )}
            </div>

            {/* Part of Speech - Full Width */}
            <div className="space-y-2">
              <Label htmlFor="partOfSpeech" className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Part of Speech
              </Label>
              <Input
                id="partOfSpeech"
                value={partOfSpeech}
                onChange={(e) => setPartOfSpeech(e.target.value)}
                placeholder="e.g., noun, verb, adjective..."
                className="h-14 bg-slate-50/50 border-2 border-slate-100 rounded-2xl text-lg focus-visible:ring-emerald-500 focus:bg-white"
                disabled={loading}
              />
            </div>

            {/* Example - Full Width */}
            <div className="space-y-2">
              <Label htmlFor="example" className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Example Sentence
              </Label>
              <Textarea
                id="example"
                value={example}
                onChange={(e) => setExample(e.target.value)}
                placeholder="Enter an example sentence..."
                className="min-h-[120px] bg-slate-50/50 border-2 border-slate-100 rounded-2xl p-5 text-base focus-visible:ring-emerald-500 focus:bg-white"
                rows={3}
                disabled={loading}
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
                <p className="text-sm text-red-600 font-bold">⚠️ {error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-14 rounded-2xl border-2 border-slate-200 font-bold text-sm"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !word.trim() || translations.length === 0}
                className="flex-1 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm uppercase tracking-wider"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Add Word"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}