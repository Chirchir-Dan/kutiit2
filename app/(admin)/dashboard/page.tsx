"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminMainEditor from "@/components/admin/AdminMainEditor";
import AdminMobileModal from "@/components/admin/AdminMobileModal";
import { useAdminWords } from "@/hooks/useAdminWords";
import { useWordEditor } from "@/hooks/useWordEditor";

export default function AdminDashboard() {
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showIrregularOnly, setShowIrregularOnly] = useState(false);

  const {
    words,
    suggestions,
    view,
    setView,
    searchQuery,
    setSearchQuery,
    isSearching,
    fetchWords,
    fetchSuggestions
  } = useAdminWords();

  const {
    editForm,
    setEditForm,
    saving,
    error,
    handleSelect: selectWord,
    handleAddNew: addNewWord,
    handleInputChange,
    handleAddTranslation,
    handleRemoveTranslation,
    handleTranslationKeyDown,
    handleSave: saveWord,
    handleApproveSuggestion: approveSuggestion,
    handleRejectSuggestion: rejectSuggestion
  } = useWordEditor({
    onAfterSave: async () => {
      await fetchWords();
      setIsModalOpen(false);
      setSelectedWord(null);
    },
    onAfterApprove: async () => {
      await fetchWords();
      await fetchSuggestions();
      setIsModalOpen(false);
      setSelectedWord(null);
    }
  });

  const handleSelect = (word: any) => {
    selectWord(word);
    setSelectedWord(word);
    if (window.innerWidth < 768) setIsModalOpen(true);
  };

  const handleAddNew = () => {
    addNewWord();
    setSelectedWord(null);
    setIsModalOpen(true);
  };

  const handleClearCache = async () => {
    try {
      await fetch("/api/search/clear-cache", { method: "POST" });
      setToastMessage("✅ Search cache cleared successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch {
      setToastMessage("❌ Failed to clear cache");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleViewChange = (newView: "words" | "suggestions") => {
    setView(newView);
    setSearchQuery("");
    setSelectedWord(null);
    setEditForm(null);
    setSelectedType("all");
    setShowIrregularOnly(false);
    if (newView === "words") {
      fetchWords();
    } else {
      fetchSuggestions();
    }
  };

  const currentList = view === "words" ? words : suggestions;

  return (
    <div className="flex h-full">
      <AdminSidebar
        view={view}
        onViewChange={handleViewChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSearching={isSearching}
        words={words}
        suggestions={suggestions}
        currentList={currentList}
        selectedWord={selectedWord}
        onSelect={handleSelect}
        onAddNew={handleAddNew}
        onClearCache={handleClearCache}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        showIrregularOnly={showIrregularOnly}
        onIrregularToggle={setShowIrregularOnly}
      />

      <AdminMainEditor
        editForm={editForm}
        view={view}
        error={error}
        saving={saving}
        onSave={saveWord}
        onApprove={approveSuggestion}
        onReject={rejectSuggestion}
        handleInputChange={handleInputChange}
        handleAddTranslation={handleAddTranslation}
        handleRemoveTranslation={handleRemoveTranslation}
        handleTranslationKeyDown={handleTranslationKeyDown}
      />

      <AdminMobileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editForm={editForm}
        view={view}
        error={error}
        saving={saving}
        onSave={saveWord}
        onApprove={approveSuggestion}
        onReject={rejectSuggestion}
        handleInputChange={handleInputChange}
        handleAddTranslation={handleAddTranslation}
        handleRemoveTranslation={handleRemoveTranslation}
        handleTranslationKeyDown={handleTranslationKeyDown}
      />

      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 bg-white border border-slate-200 shadow-lg rounded-xl px-6 py-4 max-w-sm">
          <p className="text-sm font-medium text-slate-900">{toastMessage}</p>
        </div>
      )}
    </div>
  );
}