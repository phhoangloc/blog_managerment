import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Newsreader } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "locpham — notes",
  description: "Notes for the people who have the key.",
};

// Self-hosted by next/font; every family here has a Vietnamese subset
const newsreader = Newsreader({ subsets: ["latin", "latin-ext", "vietnamese"], style: ["normal", "italic"], variable: "--font-newsreader", display: "swap" });
const inter = Inter({ subsets: ["latin", "latin-ext", "vietnamese"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin", "latin-ext", "vietnamese"], variable: "--font-jetbrains", display: "swap" });

// set the theme before first paint to avoid a flash
const themeScript = `try{if(localStorage.getItem('theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${inter.variable} ${jetbrains.variable}`} suppressHydrationWarning>
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
