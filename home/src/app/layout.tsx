import type { Metadata } from "next";
import { JetBrains_Mono, Prompt, Noto_Serif } from "next/font/google";
import Header from "@/components/Header";
import PageTransition from "@/components/PageTransition";
import "./globals.css";

export const metadata: Metadata = {
  title: "locpham — notes",
  description: "Code, cơm và cột sống",
};

// body face for all running text (the serif and ui tokens both point at it)
const body = Prompt({ subsets: ["latin", "latin-ext", "vietnamese"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });
// heading face
const heading = Noto_Serif({ subsets: ["latin", "latin-ext", "vietnamese"], weight: ["500", "700"], variable: "--font-heading-face", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin", "latin-ext", "vietnamese"], variable: "--font-jetbrains", display: "swap" });

// set the theme before first paint to avoid a flash
const themeScript = `try{if(localStorage.getItem('theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${body.variable} ${jetbrains.variable} ${heading.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="pt-[72px]">
        <PageTransition />
        <Header />
        {children}
      </body>
    </html>
  );
}
