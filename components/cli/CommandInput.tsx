"use client";

import { useRef, useEffect, type KeyboardEvent } from "react";

type CommandInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (command: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
};

export function CommandInput({ value, onChange, onSubmit, onKeyDown }: CommandInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit(value);
      return;
    }
    onKeyDown(e);
  };

  return (
    <div
      className="flex items-center gap-2"
      onClick={() => inputRef.current?.focus()}
    >
      <span className="text-terminal-prompt font-bold select-none">❯</span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent text-terminal-text outline-none caret-terminal-prompt placeholder:text-terminal-dim/50"
        placeholder="type 'help' to get started"
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
        aria-label="Terminal command input"
      />
    </div>
  );
}
