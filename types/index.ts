// types/index.ts

export type WordType = 'noun' | 'verb' | 'adjective' | 'adverb';

export interface NandiWord {
  id: string;
  word_type: WordType;
  translation_en: string;
  is_verified: boolean;
  
  // Noun specific
  singular_indefinite?: string;
  singular_definite?: string;
  plural_indefinite?: string;
  plural_definite?: string;

  // Verb/Other specific
  entry_name?: string; 
  infinitive?: string;
}