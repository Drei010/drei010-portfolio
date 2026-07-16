"use client";

import Image from "next/image";
import { ViewToggle } from "@/components/ViewToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GameToggle } from "@/components/GameToggle";
import { useView } from "@/lib/view-context";
import { useTheme } from "@/lib/theme-context";

export function Header() {
  const { view } = useView();
  const { theme, mounted } = useTheme();

  // Use light logo (/2.svg) as default for SSR to match the server-rendered HTML.
  // After mount, switch to the correct logo based on theme/view.
  const logoSrc = mounted
    ? (view === "cli" || theme === "dark" ? "/1.svg" : "/2.svg")
    : "/2.svg";

  return (
    <header className={`sticky top-0 z-50 border-b ${view === "cli" ? "dark border-[#2a2a2a] bg-[#0a0a0a] text-[#ededed]" : "border-border bg-white backdrop-blur-sm dark:bg-background/80"}`}>
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <a href="#about" className="flex items-center">
          <Image
            src={logoSrc}
            alt="Andrei Kyle Logo"
            width={160}
            height={32}
            className="h-12 w-auto"
            priority
            suppressHydrationWarning
          />
        </a>

        <div className="flex items-center">
          <ThemeToggle />
          <ViewToggle />
          <GameToggle />
        </div>
      </div>
    </header>
  );
}
