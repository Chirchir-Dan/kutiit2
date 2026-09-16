"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface UseWordEditorOptions {
  onAfterSave: () => Promise<void>;
  onAfterApprove: () => Promise<void>;
}

export function useWordEditor({
  onAfterSave,
  onAfterApprove
}: UseWordEditorOptions) {
  const [editForm, setEditForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearSearchCache = useCallback(async () => {
    try {
      await fetch("/api/search/clear-cache", { method: "POST" });
    } catch (err) {
      console.error("Failed to clear search cache:", err);
    }
  }, []);

  const triggerEmbedding = useCallback(
    (payload: { id?: string; entry_name?: string; text: string }) => {
      if (!payload.text?.trim()) return;
      if (!payload.id && !payload.entry_name) return;

      fetch("/api/admin/embed-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch((err) => {
        console.error("Embedding generation failed:", err);
      });
    },
    []
  );

  const handleSelect = useCallback((word: any) => {
    const translations =
      word.translations ||
      (word.translation_en ? [word.translation_en] : []);
    setEditForm({ ...word, translations, translation_input: "" });
    setError(null);
  }, []);

  const handleAddNew = useCallback(() => {
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
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | { target: { name: string; value: any } }) => {
      setEditForm((prev: any) => {
        if (!prev) return prev;
        return { ...prev, [e.target.name]: e.target.value };
      });
    },
    []
  );

  const handleAddTranslation = useCallback(() => {
    setEditForm((prev: any) => {
      if (!prev?.translation_input?.trim()) return prev;
      const newTranslation = prev.translation_input.trim();
      if (prev.translations?.includes(newTranslation)) return prev;
      return {
        ...prev,
        translations: [...(prev.translations || []), newTranslation],
        translation_input: ""
      };
    });
  }, []);

  const handleRemoveTranslation = useCallback((index: number) => {
    setEditForm((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        translations: prev.translations.filter(
          (_: any, i: number) => i !== index
        )
      };
    });
  }, []);

  const handleTranslationKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddTranslation();
      }
    },
    [handleAddTranslation]
  );

  const validate = useCallback((form: any): string | null => {
    if (!form?.entry_name?.trim()) return "Please enter a word";

    if (
      form.word_type !== "riddle" &&
      (!form.translations || form.translations.length === 0)
    ) {
      return "Please add at least one translation";
    }

    if (form.word_type === "riddle" && !form.answer?.trim()) {
      return "Please enter the answer for this riddle";
    }

    if (form.word_type === "verb" && form.is_irregular) {
      const required = [
        "present_1sg",
        "present_2sg",
        "present_3sg",
        "present_1pl",
        "present_2pl",
        "present_3pl"
      ];
      const missing = required.filter((field) => !form[field]?.trim());
      if (missing.length > 0) {
        return `Please enter all 6 present tense forms: ${missing.join(", ")}`;
      }
    }

    return null;
  }, []);

  const buildEmbeddingText = (data: any): string => {
    return [
      data.entry_name,
      data.translation_en,
      ...(data.translations || []).slice(1),
      data.word_type ? `(${data.word_type})` : "",
      data.notes || ""
    ]
      .filter(Boolean)
      .join(" ");
  };

  const handleSave = useCallback(async () => {
    if (!editForm) return;

    const validationError = validate(editForm);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const { translation_input, ...cleanData } = editForm;
      const saveData = {
        ...cleanData,
        translation_en: cleanData.translations?.[0] || "",
        translations: cleanData.translations || [],
      };

      const { error: supabaseError } = editForm.id
        ? await supabase.from("words").update(saveData).eq("id", editForm.id)
        : await supabase.from("words").insert([saveData]);

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      triggerEmbedding({
        id: editForm.id || undefined,
        entry_name: saveData.entry_name,
        text: buildEmbeddingText(saveData)
      });

      await clearSearchCache();
      await onAfterSave();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Save failed:", err);
      setError(`Failed to save: ${message}`);
    } finally {
      setSaving(false);
    }
  }, [editForm, validate, clearSearchCache, onAfterSave, triggerEmbedding]);

  const handleApproveSuggestion = useCallback(async () => {
    if (!editForm) return;

    setSaving(true);
    setError(null);

    try {
      const { id, created_at, user_email, translation_input, ...cleanData } =
        editForm;

      const insertData = {
        ...cleanData,
        translation_en: cleanData.translations?.[0] || "",
        translations: cleanData.translations || [],
        is_verified: true
      };

      const { error: insertError } = await supabase
        .from("words")
        .insert([insertData]);

      if (insertError) {
        throw new Error(insertError.message);
      }

      triggerEmbedding({
        entry_name: insertData.entry_name,
        text: buildEmbeddingText(insertData)
      });

      const { error: deleteError } = await supabase
        .from("suggestions")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error("Failed to delete suggestion:", deleteError);
      }

      await clearSearchCache();
      await onAfterApprove();
      setEditForm(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Approve failed:", err);
      setError(`Failed to approve: ${message}`);
    } finally {
      setSaving(false);
    }
  }, [editForm, clearSearchCache, onAfterApprove, triggerEmbedding]);

  const handleRejectSuggestion = useCallback(
    async (id: string) => {
      if (!id) return;
      if (!confirm("Reject and delete this suggestion?")) return;

      try {
        const { error: deleteError } = await supabase
          .from("suggestions")
          .delete()
          .eq("id", id);

        if (deleteError) {
          throw new Error(deleteError.message);
        }

        await onAfterApprove();
        setEditForm(null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred";
        console.error("Reject failed:", err);
        setError(`Failed to reject: ${message}`);
      }
    },
    [onAfterApprove]
  );

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