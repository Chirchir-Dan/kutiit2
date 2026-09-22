import { Metadata } from "next";
import DictionaryClient from "./DictionaryClient";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Kutiit | A Nandi Dictionary",
  description:
    "A comprehensive digital archive for the Nandi language. Search words, translations, proverbs, riddles, and sayings with verified meanings and example sentences.",
  keywords: [
    "Nandi dictionary",
    "Kutiit",
    "Nandi language",
    "Nandi words",
    "Nandi translation",
    "Nandi proverbs",
    "Nandi riddles",
    "Tangoch",
    "Ng'olyot",
    "Kalewenet",
    "African linguistics",
    "Nilotic languages",
    "Kalenjin languages",
    "Nandi grammar",
    "Nandi language preservation",
  ],
  openGraph: {
    title: "Kutiit — A Nandi Dictionary",
    description:
      "Preserving the Nandi language through a living dictionary of words, meanings, and cultural wisdom. Explore, learn, and contribute.",
    type: "website",
  },
};

export const revalidate = 3600;

export default async function DictionaryPage() {
  const { data } = await supabase
    .from("words")
    .select("*")
    .eq("is_verified", true)
    .order("entry_name", { ascending: true })
    .limit(100);

  return <DictionaryClient initialWords={data || []} />;
}