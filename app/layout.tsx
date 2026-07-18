import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ViewProvider } from "@/lib/view-context";
import { ThemeProvider } from "@/lib/theme-context";
import { Header } from "@/components/Header";
import { WebScrollProvider } from "@/lib/web-scroll-context";
import {
  THEME_EXPIRY_MS,
  THEME_STORAGE_KEY,
  THEME_TIMESTAMP_KEY,
} from "@/lib/theme-config";
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Andrei's Portfolio",
  description:
    "Full-Stack Developer portfolio featuring an interactive CLI terminal and a modern web interface. Built with Next.js, TypeScript, and Tailwind CSS.",
  keywords: [
    "developer",
    "portfolio",
    "full-stack",
    "react",
    "next.js",
    "typescript",
  ],
  authors: [{ name: "Andrei Kyle Hidalgo" }],
  openGraph: {
    title: "Andrei Kyle Hidalgo | Full-Stack Developer",
    description:
      "Interactive developer portfolio with dual web and CLI views.",
    type: "website",
  },
};

const themeScript = `(function(){try{document.documentElement.classList.add("no-transition");var k=${JSON.stringify(THEME_STORAGE_KEY)};var tk=${JSON.stringify(THEME_TIMESTAMP_KEY)};var t=localStorage.getItem(k);var ts=localStorage.getItem(tk);if((t==="light"||t==="dark")&&ts&&Number.isFinite(Number(ts))&&Date.now()-Number(ts)>=0&&Date.now()-Number(ts)<${THEME_EXPIRY_MS}){if(t==="dark")document.documentElement.classList.add("dark");return}localStorage.removeItem(k);localStorage.removeItem(tk);var h=new Date().getHours();if(h<6||h>=18)document.documentElement.classList.add("dark")}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body className="flex h-full flex-col bg-background text-foreground">
        <ThemeProvider>
          <ViewProvider>
            <WebScrollProvider>
              <Header />
              <main className="flex min-h-0 flex-1 flex-col">
                {children}
              </main>
            </WebScrollProvider>
          </ViewProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
