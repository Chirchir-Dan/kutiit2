import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "Kutiit | The Nandi Dictionary",
    template: "%s | Kutiit"
  },
  description:
    "An open-source digital platform for the Nandi language. Explore our comprehensive dictionary of words, proverbs, riddles, and cultural wisdom, with verified meanings and example sentences.",
  keywords: [
    "Nandi Dictionary",
    "Nandi Language",
    "Nandi to English",
    "English to Nandi",
    "Nandi Proverbs",
    "Nandi Riddles",
    "Tangoch",
    "Ng'olyot",
    "Kalewenet",
    "Nandi Grammar",
    "Nandi Culture",
    "Nilotic Languages",
    "Kalenjin Languages",
    "African Languages Digitalization",
    "Language Preservation",
    "Kutiit",
    "Linguistics Kenya"
  ],
  authors: [{ name: "Kutiit Project" }],
  metadataBase: new URL("https://kutiit.vercel.app"),
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Kutiit | The Nandi Dictionary",
    description:
      "Preserving and promoting the Nandi language through an open digital dictionary of words, meanings, and cultural wisdom.",
    url: "https://kutiit.com",
    siteName: "Kutiit",
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Kutiit | Nandi Language Platform",
    description:
      "A dictionary of Nandi words, proverbs, riddles, and grammar."
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="antialiased font-sans selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}