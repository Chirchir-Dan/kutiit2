// app/(public)/word-of-the-day/page.tsx

import { Metadata } from "next";
import { getWordOfTheDay } from "@/lib/wordOfTheDay";
import WordOfTheDayClient from "./WordOfTheDayClient";

export const revalidate = 3600; // refresh hourly (word changes daily)

export const metadata: Metadata = {
  title: "Word of the Day | Kutiit",
  description:
    "One Nandi word every day. Learn a new word, its meaning, and an example sentence.",
  openGraph: {
    title: "Nandi Word of the Day",
    description: "One new Nandi word every day.",
    type: "website"
  }
};

export default async function WordOfTheDayPage() {
  const word = await getWordOfTheDay();

  if (!word) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <p className="text-slate-500">Mamii ng'olyot rani!.</p>
      </div>
    );
  }

  return <WordOfTheDayClient word={word} />;
}