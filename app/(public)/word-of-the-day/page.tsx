// app/(public)/word-of-the-day/page.tsx

import { Metadata } from "next";
import { getWordOfTheDay } from "@/lib/wordOfTheDay";
import { getNandiDate } from "@/lib/nandiDate";
import WordOfTheDayClient from "./WordOfTheDayClient";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Ng'olyot ap Rani | Kutiit",
  description:
    "One Nandi word every day. Learn a new word, its meaning, and an example sentence.",
  openGraph: {
    title: "Ng'olyot ap Rani — Nandi Word of the Day",
    description: "One new Nandi word every day.",
    type: "website"
  }
};

export default async function WordOfTheDayPage() {
  const [word, nandiDate] = await Promise.all([
    getWordOfTheDay(),
    getNandiDate()
  ]);

  if (!word) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <p className="text-slate-500">No word available today.</p>
      </div>
    );
  }

  return <WordOfTheDayClient word={word} nandiDate={nandiDate} />;
}