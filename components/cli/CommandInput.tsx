"use client";

import { useRef, useEffect, type KeyboardEvent } from "react";

type CommandInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (command: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  busy?: boolean;
};

export function CommandInput({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  busy = false,
}: CommandInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!busy) onSubmit(value);
      return;
    }
    onKeyDown(event);
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
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent text-terminal-text outline-none caret-terminal-prompt placeholder:text-terminal-dim/50"
        placeholder={
          busy ? "AI is responding — press Ctrl+C or Escape to cancel" : "type 'help' to get started"
        }
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
        aria-label="Terminal command input"
        aria-busy={busy}
        aria-readonly={busy}
        readOnly={busy}
      />
    </div>
  );
}
