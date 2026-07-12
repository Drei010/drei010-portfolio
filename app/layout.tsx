import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ViewProvider } from "@/lib/view-context";
import { ThemeProvider } from "@/lib/theme-context";
import { Header } from "@/components/Header";

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

const themeScript = `(function(){try{document.documentElement.classList.add("no-transition");var t=localStorage.getItem("theme");var ts=localStorage.getItem("theme-timestamp");if(t&&ts){var elapsed=Date.now()-Number(ts);if(elapsed<86400000){if(t==="dark")document.documentElement.classList.add("dark");return}}localStorage.removeItem("theme");localStorage.removeItem("theme-timestamp");var h=new Date().getHours();if(h<6||h>=18)document.documentElement.classList.add("dark")}catch(e){}})()`;

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
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider>
          <ViewProvider>
            <Header />
            <main className="flex flex-1 flex-col" role="main">
              {children}
            </main>
          </ViewProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
