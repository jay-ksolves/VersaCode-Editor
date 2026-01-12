
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FileCode, Puzzle, Settings, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type ActivePanel = "files" | "extensions" | "settings" | "search" | "none";

interface SidebarProps {
  activePanel: ActivePanel;
  onSelectPanel: (panel: ActivePanel) => void;
}

const navItems = [
  { id: "files", icon: FileCode, label: "File Explorer" },
  { id: "search", icon: Search, label: "Search" },
  { id: "extensions", icon: Puzzle, label: "Extensions" },
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
       <div className="flex flex-col items-center gap-2 mb-4" title="VersaCode">
          <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary"
            >
              <path
                d="M14.4645 19.232L21.3698 12.3267L23.1421 14.099L16.2368 21.0043L14.4645 19.232Z"
                fill="currentColor"
              />
              <path
                d="M1.00439 14.099L7.90969 21.0043L9.68198 19.232L2.77668 12.3267L1.00439 14.099Z"
                fill="currentColor"
              />
              <path
                d="M9.17188 3L2.26658 9.9053L4.03887 11.6776L10.9442 4.7723L9.17188 3Z"
                fill="currentColor"
              />
              <path
                d="M21.8579 9.9053L14.9526 3L13.1803 4.7723L20.0856 11.6776L21.8579 9.9053Z"
                fill="currentColor"
              />
            </svg>
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
