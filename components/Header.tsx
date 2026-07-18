"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ViewToggle } from "@/components/ViewToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GameToggle } from "@/components/GameToggle";
import { useView } from "@/lib/view-context";
import { useTheme } from "@/lib/theme-context";

export function Header() {
  const { view, setView } = useView();
  const { theme, mounted } = useTheme();
  const [aboutRequest, setAboutRequest] = useState(0);

  useEffect(() => {
    if (aboutRequest === 0 || view !== "web") return;

    let attempt = 0;
    let timer = 0;
    const scrollToAbout = () => {
      const about = document.getElementById("about");
      if (about) {
        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        about.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
        about.focus({ preventScroll: true });
        return;
      }
      attempt += 1;
      if (attempt < 12) {
        timer = window.setTimeout(scrollToAbout, 50);
      }
    };

    scrollToAbout();
    return () => window.clearTimeout(timer);
  }, [aboutRequest, view]);

  function handleLogoClick() {
    setAboutRequest((request) => request + 1);
    if (view !== "web") {
      setView("web");
    }
  }

  // Use light logo (/2.svg) as default for SSR to match the server-rendered HTML.
  // After mount, switch to the correct logo based on theme/view.
  const logoSrc = mounted
    ? (view === "cli" || theme === "dark" ? "/1.svg" : "/2.svg")
    : "/2.svg";

  return (
    <header className={`sticky top-0 z-50 border-b ${view === "cli" ? "dark border-[#2a2a2a] bg-[#0a0a0a] text-[#ededed]" : "border-border bg-white backdrop-blur-sm dark:bg-background/80"}`}>
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <button
          type="button"
          onClick={handleLogoClick}
          className="flex items-center focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
          aria-label="Go to About section"
        >
          <Image
            src={logoSrc}
            alt="Andrei Kyle Logo"
            width={160}
            height={32}
            className="h-12 w-auto"
            priority
            suppressHydrationWarning
          />
        </button>

        <div className="flex items-center">
          <ThemeToggle />
          <ViewToggle />
          <GameToggle />
        </div>
      </div>
    </header>
  );
}
