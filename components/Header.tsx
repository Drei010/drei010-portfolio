"use client";

import Image from "next/image";
import { ViewToggle } from "@/components/ViewToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useView } from "@/lib/view-context";
import { useTheme } from "@/lib/theme-context";

export function Header() {
  const { view } = useView();
  const { theme } = useTheme();

  const logoSrc = view === "cli" || theme === "dark" ? "/1.svg" : "/2.svg";

  return (
    <header className={`sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm ${view === "cli" ? "dark" : ""}`}>
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <a href="#about" className="flex items-center">
          <Image
            src={logoSrc}
            alt="Andrei Kyle Logo"
            width={160}
            height={32}
            className="h-12 w-auto"
            priority
          />
        </a>

        <div className="flex items-center">
          <ThemeToggle />
          <ViewToggle />
        </div>
      </div>
    </header>
  );
}
