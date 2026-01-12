"use client";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";

interface CodeEditorProps {
  value: string | undefined;
  onChange: (value: string) => void;
  isReadOnly: boolean;
}

export function CodeEditor({ value, onChange, isReadOnly }: CodeEditorProps) {
  const [lineCount, setLineCount] = useState(1);

  const safeValue = value ?? "";

  useEffect(() => {
    const count = safeValue.split("\n").length;
    setLineCount(count);
  }, [safeValue]);

  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="flex h-full w-full font-code text-sm">
      <div
        className="line-numbers bg-card p-4 text-right text-muted-foreground select-none"
        aria-hidden="true"
      >
        {lineNumbers.map((num) => (
          <div key={num}>{num}</div>
        ))}
      </div>
      <Textarea
        value={safeValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          isReadOnly
            ? "Select a file to start editing."
            : "Write your code here..."
        }
        readOnly={isReadOnly}
        className={cn(
          "h-full flex-1 resize-none rounded-none border-0 bg-background p-4 focus-visible:ring-0 font-code",
          "leading-normal"
        )}
      />
    </div>
  );
}
