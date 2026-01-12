
"use client";

import React from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import type * as monaco from 'monaco-editor';

interface CodeEditorProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  language?: string;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
  onMount?: OnMount;
}

export function CodeEditor({
  value,
  onChange,
  language = "typescript",
  options = {},
  onMount
}: CodeEditorProps) {
  const monacoTheme = "vs-dark";

  const defaultOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    wordWrap: "on",
    fontFamily: "JetBrains Mono, monospace",
    scrollBeyondLastLine: false,
    minimap: { enabled: true },
    readOnly: false,
    automaticLayout: true,
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
