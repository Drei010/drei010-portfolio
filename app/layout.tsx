import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ViewProvider } from "@/lib/view-context";
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
  title: "Andrei Hidalgo's Portfolio",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ViewProvider>
          <Header />
          <main className="flex flex-1 flex-col" role="main">
            {children}
          </main>
        </ViewProvider>
      </body>
    </html>
  );
}
