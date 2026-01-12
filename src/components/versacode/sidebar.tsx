
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FileCode, Puzzle, Settings, Code, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

type ActivePanel = "files" | "extensions" | "settings" | "tasks" | "none";

interface SidebarProps {
  activePanel: ActivePanel;
  onSelectPanel: (panel: ActivePanel) => void;
}

const navItems = [
  { id: "files", icon: FileCode, label: "File Explorer" },
  { id: "extensions", icon: Puzzle, label: "Extensions" },
  { id: "tasks", icon: CheckSquare, label: "Tasks" },
  { id: "settings", icon: Settings, label: "Settings" },
] as const;

export function Sidebar({ activePanel, onSelectPanel }: SidebarProps) {

  const handlePanelSelection = (panel: typeof navItems[number]['id']) => {
    if (activePanel === panel) {
      onSelectPanel('none');
    } else {
      onSelectPanel(panel);
    }
  };

  return (
    <aside className="w-16 flex flex-col items-center py-4 gap-4 bg-card border-r">
       <div className="flex flex-col items-center gap-2 mb-4">
          <Code className="h-7 w-7 text-primary" />
          <h1 className="text-xs font-bold tracking-tight">VersaCode</h1>
        </div>

      <div className="flex-1 flex flex-col items-center gap-4">
        {navItems.map((item) => (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-10 w-10", {
                  "bg-accent text-accent-foreground": activePanel === item.id,
                })}
                onClick={() => handlePanelSelection(item.id)}
              >
                <item.icon className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      <div className="mt-auto">
         {/* Theme toggle functionality is temporarily disabled */}
      </div>
    </aside>
  );
}
