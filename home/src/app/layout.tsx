import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_JP, Zen_Antique } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "locpham — notes",
  description: "鍵を持っている人のためのノート。",
};

// Self-hosted by next/font; Zen Antique has no Vietnamese subset, so Vietnamese diacritics in headings fall back
// body face for all running text (the serif and ui tokens both point at it)
const body = Noto_Sans_JP({ subsets: ["latin", "vietnamese"], weight: ["400", "500", "700"], variable: "--font-body", display: "swap" });
// heading face; Zen Antique has a single (already heavy) weight
const heading = Zen_Antique({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--font-zen", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin", "latin-ext", "vietnamese"], variable: "--font-jetbrains", display: "swap" });

// set the theme before first paint to avoid a flash
const themeScript = `try{if(localStorage.getItem('theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${body.variable} ${jetbrains.variable} ${heading.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="pt-[72px]">
        <Header />
        {children}
      </body>
    </html>
  );
}
