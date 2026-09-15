"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function useWordEditor(
  onAfterSave: () => Promise<void>,
  onAfterApprove: () => Promise<void>
) {
  const [editForm, setEditForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearSearchCache = async () => {
    try {
      await fetch("/api/search/clear-cache", { method: "POST" });
    } catch (error) {
      console.error("Failed to clear cache:", error);
    }
  };

  const handleSelect = (word: any) => {
    const translations =
      word.translations ||
      (word.translation_en ? [word.translation_en] : []);
    setEditForm({ ...word, translations, translation_input: "" });
    setError(null);
  };

  const handleAddNew = () => {
    setError(null);
    setEditForm({
      entry_name: "",
      word_type: "noun",
      translations: [],
      translation_input: "",
      translation_en: "",
      examples: "",
      notes: "",
      imperative: "",
      imperative_plural: "",
      answer: "",
      singular_indefinite: "",
      singular_definite: "",
      plural_indefinite: "",
      plural_definite: "",
      is_verified: true,
      is_irregular: false,
      present_1sg: "",
      present_2sg: "",
      present_3sg: "",
      present_1pl: "",
      present_2pl: "",
      present_3pl: ""
    });
  };

  const handleInputChange = (e: any) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
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
      translations: editForm.translations.filter(
        (_: any, i: number) => i !== index
      )
    });
  };

  const handleTranslationKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTranslation();
    }
  };

  const validate = (): string | null => {
    if (!editForm?.entry_name?.trim()) return "Please enter a word";

    if (
      editForm.word_type !== "riddle" &&
      (!editForm.translations || editForm.translations.length === 0)
    ) {
      return "Please add at least one translation";
    }

    if (editForm.word_type === "riddle" && !editForm.answer?.trim()) {
      return "Please enter the answer for this riddle";
    }

    if (editForm.word_type === "verb" && editForm.is_irregular) {
      const required = [
        "present_1sg",
        "present_2sg",
        "present_3sg",
        "present_1pl",
        "present_2pl",
        "present_3pl"
      ];
      const missing = required.filter((field) => !editForm[field]?.trim());
      if (missing.length > 0) {
        return `Please enter all 6 present tense forms: ${missing.join(", ")}`;
      }
    }

    return null;
  };

  const handleSave = async () => {
    if (!editForm) return;

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    const { translation_input, ...cleanData } = editForm;
    const saveData = {
      ...cleanData,
      translation_en: cleanData.translations?.[0] || "",
      translations: cleanData.translations || [],
      dialects: ["Nandi"]
    };

    const { error: supabaseError } = editForm.id
      ? await supabase.from("words").update(saveData).eq("id", editForm.id)
      : await supabase.from("words").insert([saveData]);

    if (supabaseError) {
      setError(`Failed to save: ${supabaseError.message}`);
      setSaving(false);
      return;
    }

    await clearSearchCache();
    await onAfterSave();
    setSaving(false);
  };

  const handleApproveSuggestion = async () => {
    if (!editForm) return;
    setSaving(true);
    setError(null);

    const { id, created_at, user_email, translation_input, ...cleanData } =
      editForm;

    const insertData = {
      ...cleanData,
      translation_en: cleanData.translations?.[0] || "",
      translations: cleanData.translations || [],
      dialects: ["Nandi"],
      is_verified: true
    };

    const { error: insertError } = await supabase
      .from("words")
      .insert([insertData]);

    if (insertError) {
      setError(`Failed to approve: ${insertError.message}`);
      setSaving(false);
      return;
    }

    await supabase.from("suggestions").delete().eq("id", id);
    await clearSearchCache();
    await onAfterApprove();
    setEditForm(null);
    setSaving(false);
  };

  const handleRejectSuggestion = async (id: string) => {
    if (!id || !confirm("Reject and delete this suggestion?")) return;
    const { error } = await supabase.from("suggestions").delete().eq("id", id);
    if (!error) {
      await onAfterApprove();
      setEditForm(null);
    }
  };

  return {
    editForm,
    setEditForm,
    saving,
    error,
    setError,
    handleSelect,
    handleAddNew,
    handleInputChange,
    handleAddTranslation,
    handleRemoveTranslation,
    handleTranslationKeyDown,
    handleSave,
    handleApproveSuggestion,
    handleRejectSuggestion
  };
}