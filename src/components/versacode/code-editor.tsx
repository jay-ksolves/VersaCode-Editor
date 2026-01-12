
"use client";

import React from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import type * as monaco from 'monaco-editor';

interface CodeEditorProps {
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
  onMount?: OnMount;
}

export function CodeEditor({
  options = {},
  onMount
}: CodeEditorProps) {
  const monacoTheme = "vs-dark";

  const defaultOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    wordWrap: "on",
    fontFamily: "JetBrains Mono, monospace",
    scrollBeyondLastLine: false,
    minimap: { enabled: true },
    automaticLayout: true,
  };

  return (
    <Editor
      height="100%"
      theme={monacoTheme}
      options={{...defaultOptions, ...options}}
      onMount={onMount}
    />
  );
}
