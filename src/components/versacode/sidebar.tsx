"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FileCode, Puzzle, Settings, Sun, Moon, CheckSquare } from "lucide-react";
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
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('versacode-theme') || 'light';
    setTheme(storedTheme);
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('versacode-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  const handlePanelSelection = (panel: typeof navItems[number]['id']) => {
    if (activePanel === panel) {
      onSelectPanel('none');
    } else {
      onSelectPanel(panel);
    }
  };

  return (
    <aside className="w-16 flex flex-col items-center py-4 gap-4 bg-card border-r">
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
         <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Toggle Theme</p>
            </TooltipContent>
          </Tooltip>
      </div>
    </aside>
  );
}
