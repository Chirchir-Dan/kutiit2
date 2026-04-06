import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: "Kutiit | The Universal Kalenjin Dictionary",
    template: "%s | Kutiit"
  },
  description: "The premier open-source digital platform for the Kalenjin languages. Explore our comprehensive dictionary, proverbs, and cultural resources for Nandi, Kipsigis, Marakwet, Keiyo, Pokot, Tugen, Sabaot, and Terik.",
  keywords: [
    "English-Kalenjin Dictionary", "Kalenjin Proverbs", "Nandi Language Resources", "Kipsigis Dictionary", "kalenjing to English", "Marakwet Language", "Keiyo Dictionary", "Pokot Language Resources", "Tugen Dictionary", "Sabaot Language", "Terik Dictionary", 
    "Kalenjin Dictionary", "Nandi Language", "Kipsigis Dictionary", "Kalenjin Proverbs", 
    "Kutiit", "Linguistics Kenya", "Marakwet language", "Keiyo", "Pokot", "Tugen", 
    "Sabaot", "Terik", "Kalenjin Culture", "African Languages Digitalization", "tangoch riddles", "ng’olyot sayings", "kalwenet", "wise sayings", "language preservation", "Kalenjin grammar"
  ],
  authors: [{ name: "Kutiit Project" }],
  metadataBase: new URL('https://kutiit.vercel.app'), // Replace with your actual domain
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Kutiit | The Digital Home of Kalenjin Languages",
    description: "Preserving and promoting the rich linguistic heritage of the Kalenjin people through an open digital textbook and dictionary.",
    url: 'https://kutiit.com',
    siteName: 'Kutiit',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Kutiit | Kalenjin Language Platform",
    description: "Dictionary, proverbs, and grammar resources for all Kalenjin dialects.",
  },
};

export default function RootLayout({
  children,
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