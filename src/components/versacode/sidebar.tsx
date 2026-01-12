
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FileCode, Puzzle, Settings, Search, GitBranch, Bug } from "lucide-react";
import { cn } from "@/lib/utils";

type ActivePanel = "files" | "extensions" | "settings" | "search" | "none";

interface SidebarProps {
  activePanel: ActivePanel;
  onSelectPanel: (panel: ActivePanel) => void;
}

const navItems = [
  { id: "files", icon: FileCode, label: "File Explorer" },
  { id: "search", icon: Search, label: "Search" },
  { id: "source-control", icon: GitBranch, label: "Source Control", disabled: true },
  { id: "run-debug", icon: Bug, label: "Run and Debug", disabled: true },
  { id: "extensions", icon: Puzzle, label: "Extensions" },
] as const;

const bottomNavItems = [
    { id: "settings", icon: Settings, label: "Settings" },
] as const;

export function Sidebar({ activePanel, onSelectPanel }: SidebarProps) {

  const handlePanelSelection = (panel: typeof navItems[number]['id'] | typeof bottomNavItems[number]['id']) => {
    if (activePanel === panel) {
      onSelectPanel('none');
    } else {
      onSelectPanel(panel as ActivePanel);
    }
  };

  return (
    <aside className="w-16 flex flex-col items-center justify-between py-4 gap-4 bg-card border-r">
      <div className="flex flex-col items-center gap-2">
        {navItems.map((item) => (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={item.disabled}
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

      <div className="flex flex-col items-center gap-2">
         {bottomNavItems.map((item) => (
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
    </aside>
  );
}
