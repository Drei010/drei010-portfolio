"use client";

import { ViewToggle } from "@/components/ViewToggle";
import { useView } from "@/lib/view-context";

export function Header() {
  const { view } = useView();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span
            className={`text-lg font-bold tracking-tight ${
              view === "cli" ? "font-mono text-primary" : ""
            }`}
          >
            {view === "cli" ? "> andrei_" : "Andrei Kyle"}
          </span>
        </div>
        <ViewToggle />
      </div>
    </header>
  );
}
