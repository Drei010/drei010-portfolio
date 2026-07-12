"use client";

import Image from "next/image";
import { ViewToggle } from "@/components/ViewToggle";
import { useView } from "@/lib/view-context";

export function Header() {
  const { view } = useView();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <a href="#about" className="flex items-center">
          <Image
            src="/1.svg"
            alt="Andrei Kyle Logo"
            width={160}
            height={32}
            className="h-12 w-auto"
            priority
          />
        </a>

        <ViewToggle />
      </div>
    </header>
  );
}