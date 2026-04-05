import { Metadata } from "next";
import DictionaryClient from "./DictionaryClient";
import { supabase } from "@/lib/supabase";

// 1. Universal Kalenjin SEO Metadata
export const metadata: Metadata = {
  title: "Kutiit | The Universal Kalenjin Dictionary",
  description: "The premier digital archive for the Kalenjin language family. Search words, translations, and proverbs across Nandi, Kipsigis, Keiyo, Tugen, Marakwet, Pokot, Sabiny (Sebei), and Sabaot dialects.",
  keywords: [
    "Kalenjin dictionary", 
    "Kutiit", 
    "Nandi dictionary", 
    "Pokot dictionary", 
    "Marakwet translation", 
    "Tugen language", 
    "Sabiny Sebei dictionary", 
    "Sabaot wordlist",
    "Kalenjin proverbs",
    "African linguistics",
    "Tangoch riddles",
    "Ng’olyot sayings",
    "Kalwenet wisdom",
    "Kalenjin language preservation",
    "Kalenjin grammar",
  ],
  openGraph: {
    title: "Kutiit - The Unified Kalenjin Language Platform",
    description: "Preserving the rich linguistic heritage of the Kalenjin people across East Africa. and the world. Explore words, meanings, and cultural wisdom in one place.",
    type: "website",
  },
};

// 2. Set ISR to 1 hour
export const revalidate = 3600; 

export default async function DictionaryPage() {
  const { data } = await supabase
    .from("words")
    .select("*")
    .eq("is_verified", true)
    .order("entry_name", { ascending: true });

  return <DictionaryClient initialWords={data || []} />;
}