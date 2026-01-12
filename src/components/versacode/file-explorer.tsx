"use client";

import { Folder, File as FileIcon, ChevronRight, ChevronDown } from "lucide-react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

type FileSystemNode = {
  name: string;
  type: 'folder' | 'file';
  children?: FileSystemNode[];
};

const fileSystem: FileSystemNode[] = [
  {
    name: "src",
    type: "folder",
    children: [
      { name: "app.tsx", type: "file" },
      { name: "components", type: "folder", children: [
        { name: "button.tsx", type: "file"},
        { name: "card.tsx", type: "file"}
      ]},
      { name: "lib", type: "folder", children: [
        { name: "utils.ts", type: "file" }
      ]},
    ],
  },
  { name: "public", type: "folder", children: [
    { name: "logo.svg", type: "file" }
  ]},
  { name: "package.json", type: "file" },
  { name: "tailwind.config.ts", type: "file" },
  { name: "README.md", type: "file" },
];

function FileNode({ node, level = 0 }: { node: FileSystemNode; level?: number }) {
  const [isOpen, setIsOpen] = useState(node.type === "folder");

  if (node.type === 'folder') {
    return (
      <div>
        <div
          className="flex items-center space-x-2 py-1.5 px-2 rounded-md hover:bg-muted cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
          style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        >
          {isOpen ? <ChevronDown className="w-4 h-4 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 flex-shrink-0" />}
          <Folder className="w-4 h-4 text-accent" />
          <span className="truncate text-sm">{node.name}</span>
        </div>
        {isOpen && node.children && (
          <div>
            {node.children.map((child) => (
              <FileNode key={child.name} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex items-center space-x-2 py-1.5 px-2 rounded-md hover:bg-muted"
      style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
    >
        <div style={{ width: '1rem' }} />
        <FileIcon className="w-4 h-4 text-muted-foreground" />
        <span className="truncate text-sm">{node.name}</span>
    </div>
  );
}


export function FileExplorer() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold tracking-tight">Explorer</h2>
      </div>
      <div className="flex-1 p-2 overflow-y-auto">
        <div className="space-y-1">
          {fileSystem.map((node) => (
            <FileNode key={node.name} node={node} />
          ))}
        </div>
      </div>
    </div>
  );
}
