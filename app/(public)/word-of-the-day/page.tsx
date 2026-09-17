// app/(public)/word-of-the-day/page.tsx

import { Metadata } from "next";
import { getWordOfTheDay } from "@/lib/wordOfTheDay";
import { getNandiCalendar } from "@/lib/nandiDate";
import WordOfTheDayClient from "./WordOfTheDayClient";

export const revalidate = 60;

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
  const [word, calendar] = await Promise.all([
    getWordOfTheDay(),
    getNandiCalendar()
  ]);

  if (!word) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <p className="text-slate-500">No word available today.</p>
      </div>
    );
  }

  return <WordOfTheDayClient word={word} calendar={calendar} />;
}