// types/index.ts

export type WordType = 
  | 'noun' 
  | 'verb' 
  | 'adjective' 
  | 'adverb' 
  | 'pronoun' 
  | 'preposition' 
  | 'conjunction' 
  | 'interjection' 
  | 'particle'
  | 'proverb'   // Kalewenet
  | 'riddle'    // Tangoch
  | 'saying';   // Ng’olyot

export interface NandiWord {
  id: string;
  entry_name: string; 
  word_type: WordType;
  translation_en: string;
  is_verified: boolean;
  
  /** * An array of Kalenjin dialects (e.g., ['Nandi', 'Kipsigis'])
   * Added to support the multi-dialect nature of the Kutiit platform.
   */
  dialects?: string[]; 

  // Morphology
  singular_indefinite?: string;
  singular_definite?: string;
  plural_indefinite?: string;
  plural_definite?: string;
  imperative?: string;

  // Metadata
  notes?: string; 
  examples?: string;
  answer?: string; // Specifically for Riddles
}