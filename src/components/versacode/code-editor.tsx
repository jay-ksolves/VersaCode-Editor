"use client";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function CodeEditor({ value, onChange }: CodeEditorProps) {
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    const count = value.split("\n").length;
    setLineCount(count);
  }, [value]);

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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your code here..."
        className={cn(
          "h-full flex-1 resize-none rounded-none border-0 bg-background p-4 focus-visible:ring-0 font-code",
          "leading-normal"
        )}
      />
    </div>
  );
}
