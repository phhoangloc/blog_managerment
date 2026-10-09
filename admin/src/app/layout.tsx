import type { Metadata } from "next";
import { Be_Vietnam_Pro, Paytone_One } from "next/font/google";
import "./globals.css";

const heading = Paytone_One({ weight: "400", subsets: ["latin", "vietnamese"], variable: "--font-heading" });
const body = Be_Vietnam_Pro({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Admin",
  description: "User and file management",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${heading.variable} ${body.variable} antialiased`}>{children}</body>
    </html>
  );
}
