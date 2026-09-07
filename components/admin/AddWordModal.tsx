"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [isIrregular, setIsIrregular] = useState(false);
  const [present1sg, setPresent1sg] = useState("");
  const [present2sg, setPresent2sg] = useState("");
  const [present3sg, setPresent3sg] = useState("");
  const [present1pl, setPresent1pl] = useState("");
  const [present2pl, setPresent2pl] = useState("");
  const [present3pl, setPresent3pl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isVerb = partOfSpeech.trim().toLowerCase() === 'verb';

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
          isIrregular: isIrregular,
          present1sg: present1sg.trim() || null,
          present2sg: present2sg.trim() || null,
          present3sg: present3sg.trim() || null,
          present1pl: present1pl.trim() || null,
          present2pl: present2pl.trim() || null,
          present3pl: present3pl.trim() || null,
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
      setIsIrregular(false);
      setPresent1sg('');
      setPresent2sg('');
      setPresent3sg('');
      setPresent1pl('');
      setPresent2pl('');
      setPresent3pl('');
      onWordAdded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const irregularFields = [
    { label: "Present 1sg (I)", value: present1sg, setter: setPresent1sg, placeholder: "e.g., anyone" },
    { label: "Present 2sg (you)", value: present2sg, setter: setPresent2sg, placeholder: "e.g., inyone" },
    { label: "Present 3sg (he/she)", value: present3sg, setter: setPresent3sg, placeholder: "e.g., nyone" },
    { label: "Present 1pl (we)", value: present1pl, setter: setPresent1pl, placeholder: "e.g., kipwane" },
    { label: "Present 2pl (you all)", value: present2pl, setter: setPresent2pl, placeholder: "e.g., opwane" },
    { label: "Present 3pl (they)", value: present3pl, setter: setPresent3pl, placeholder: "e.g., pwane" },
  ];

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
            {/* Kalenjin Word */}
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

            {/* Translations */}
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
            </div>

            {/* Part of Speech */}
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

            {/* Irregular Verb Section */}
            {isVerb && (
              <div className="space-y-3 p-5 bg-amber-50/50 rounded-2xl border-2 border-amber-100">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isIrregular"
                    checked={isIrregular}
                    onCheckedChange={(checked) => setIsIrregular(checked === true)}
                    disabled={loading}
                  />
                  <Label htmlFor="isIrregular" className="text-sm font-bold text-slate-700 cursor-pointer">
                    Irregular verb (does not follow regular ke-/ki- patterns)
                  </Label>
                </div>

                {isIrregular && (
                  <div className="space-y-4 mt-4">
                    <p className="text-[11px] font-black text-amber-600 uppercase tracking-[0.2em]">
                      Present Tense Forms
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {irregularFields.map((field) => (
                        <div key={field.label} className="space-y-1">
                          <Label className="text-[10px] font-bold text-slate-500">
                            {field.label}
                          </Label>
                          <Input
                            value={field.value}
                            onChange={(e) => field.setter(e.target.value)}
                            placeholder={field.placeholder}
                            className="h-12 bg-white border-2 border-amber-100 rounded-xl text-base focus-visible:ring-amber-500"
                            disabled={loading}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Example */}
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

            {/* Error */}
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