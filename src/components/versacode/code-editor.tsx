
"use client";

import React from "react";
import Editor from "@monaco-editor/react";

interface CodeEditorProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  isReadOnly: boolean;
  language?: string;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
}

export function CodeEditor({
  value,
  onChange,
  isReadOnly,
  language = "typescript",
  options = {},
}: CodeEditorProps) {
  // Hardcoding theme for now as next-themes is removed
  const monacoTheme = "vs-dark";

  const defaultOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    readOnly: isReadOnly,
    wordWrap: "on",
    fontSize: 14,
    fontFamily: "Source Code Pro, monospace",
    scrollBeyondLastLine: false,
    minimap: { enabled: true },
  };

  return (
    <Editor
      height="100%"
      language={language}
      value={value ?? ""}
      onChange={onChange}
      theme={monacoTheme}
      options={{...defaultOptions, ...options}}
    />
  );
}
