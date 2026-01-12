
"use client";

import React from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import type * as monaco from 'monaco-editor';

interface CodeEditorProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  isReadOnly: boolean;
  language?: string;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
  onMount?: OnMount;
}

export function CodeEditor({
  value,
  onChange,
  isReadOnly,
  language = "typescript",
  options = {},
  onMount
}: CodeEditorProps) {
  // Hardcoding theme for now as next-themes is removed
  const monacoTheme = "vs-dark";

  const defaultOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    readOnly: isReadOnly,
    wordWrap: "on",
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
      onMount={onMount}
    />
  );
}
