import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, Poppins } from "next/font/google";
import { ScrollToTop } from "@/components/scroll-to-top";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "InstaMealz",
  description: "Real Indian meals, ready in 5 minutes. Freeze-dried in Valsad.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white font-sans text-[#1d2f16]" suppressHydrationWarning>
        <ScrollToTop />
        {children}
      </body>
    </html>
  );
}
