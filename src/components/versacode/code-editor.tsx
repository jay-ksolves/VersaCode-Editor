
"use client";

import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  isReadOnly: boolean;
  language?: string;
}

export function CodeEditor({
  value,
  onChange,
  isReadOnly,
  language = "typescript",
}: CodeEditorProps) {
  // Hardcoding theme for now as next-themes is removed
  const monacoTheme = "vs-dark";

  return (
    <Editor
      height="100%"
      language={language}
      value={value ?? ""}
      onChange={onChange}
      theme={monacoTheme}
      options={{
        readOnly: isReadOnly,
        minimap: { enabled: true },
        wordWrap: "on",
        fontSize: 14,
        fontFamily: "Source Code Pro, monospace",
        scrollBeyondLastLine: false,
      }}
    />
  );
}
