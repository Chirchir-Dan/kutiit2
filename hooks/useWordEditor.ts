// hooks/useWordEditor.ts

"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface UseWordEditorOptions {
  onAfterSave: () => Promise<void>;
  onAfterApprove: () => Promise<void>;
}

// Whitelist of actual columns in the words table.
// Only these fields are ever sent to Supabase on save/insert.
// Any computed field (similarity_score, similarity, etc.) is silently dropped.
const COLUMN_WHITELIST = [
  "entry_name",
  "translation_en",
  "translations",
  "answer",
  "word_type",
  "singular_indefinite",
  "singular_definite",
  "plural_indefinite",
  "plural_definite",
  "imperative",
  "imperative_plural",
  "examples",
  "notes",
  "is_verified",
  "is_irregular",
  "present_1sg",
  "present_2sg",
  "present_3sg",
  "present_1pl",
  "present_2pl",
  "present_3pl"
] as const;

function pickColumns(obj: any): any {
  const result: any = {};
  for (const key of COLUMN_WHITELIST) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
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
    (
      e:
        | React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >
        | { target: { name: string; value: any } }
    ) => {
      setEditForm((prev: any) => {
        if (!prev) return prev;

        const updated = { ...prev, [e.target.name]: e.target.value };

        // When word_type changes, clear fields that no longer apply
        if (e.target.name === "word_type") {
          const newType = e.target.value;

          // Verb-only fields
          if (newType !== "verb") {
            updated.imperative = "";
            updated.imperative_plural = "";
            updated.is_irregular = false;
            updated.present_1sg = "";
            updated.present_2sg = "";
            updated.present_3sg = "";
            updated.present_1pl = "";
            updated.present_2pl = "";
            updated.present_3pl = "";
          }

          // Noun-only fields
          if (newType !== "noun") {
            updated.singular_indefinite = "";
            updated.singular_definite = "";
            updated.plural_indefinite = "";
            updated.plural_definite = "";
          }

          // Riddle-only field
          if (newType !== "riddle") {
            updated.answer = "";
          }
        }

        return updated;
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

    if (form.word_type === "riddle") {
      if (!form.answer?.trim()) {
        return "Please enter the answer (Walutiet) in Nandi";
      }
      if (!form.translations || form.translations.length === 0) {
        return "Please add the English translation of the answer";
      }
    } else {
      if (!form.translations || form.translations.length === 0) {
        return "Please add at least one translation";
      }
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
    const clean = (s: string | null | undefined): string =>
      (s || "").replace(/\bNandi\b/gi, "").trim();

    const parts: string[] = [];

    if (data.entry_name) parts.push(clean(data.entry_name));
    if (data.translation_en) parts.push(clean(data.translation_en));

    if (data.translations && data.translations.length > 0) {
      parts.push(data.translations.map(clean).filter(Boolean).join(", "));
    }

    if (data.answer) parts.push(clean(data.answer));
    if (data.word_type) parts.push(`(${data.word_type})`);
    if (data.notes) parts.push(clean(data.notes));

    return parts.filter(Boolean).join(" ");
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
      // Pick only real DB columns — drops similarity_score, translation_input,
      // and any other transient field the search API may have added.
      const columnData = pickColumns(editForm);

      const saveData = {
        ...columnData,
        translation_en: columnData.translations?.[0] || "",
        translations: columnData.translations || []
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
      // Pick only real columns before insert
      const columnData = pickColumns(editForm);

      const insertData = {
        ...columnData,
        translation_en: columnData.translations?.[0] || "",
        translations: columnData.translations || [],
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

      const suggestionId = editForm.id;
      if (suggestionId) {
        const { error: deleteError } = await supabase
          .from("suggestions")
          .delete()
          .eq("id", suggestionId);

        if (deleteError) {
          console.error("Failed to delete suggestion:", deleteError);
        }
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