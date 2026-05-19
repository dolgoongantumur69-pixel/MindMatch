import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MindMatch — Сэтгэл зүйнд суурилсан ажил хайх платформ",
  description: "Big Five тестээр таны зан чанарт тохирох ажлыг олоорой",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" className={geist.variable} style={{ backgroundColor: "#FAF7F4" }}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </head>
      <body style={{ backgroundColor: "#FAF7F4" }}>
        <Providers>
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-10">{children}</main>
          <footer className="mt-24 py-10 border-t" style={{ borderColor: "#ECD4BA" }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "#344648" }}>
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <span className="font-bold text-sm" style={{ color: "#344648" }}>MindMatch</span>
              </div>
              <p className="text-sm" style={{ color: "#7D8E95" }}>
                © 2026 MindMatch · Зан чанарт суурилсан ажил хайх платформ
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
