
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FileCode, Puzzle, Settings, Search, GitBranch, Bug, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ActivePanel = 'files' | 'extensions' | 'settings' | 'search' | 'ai-assistant' | 'source-control' | 'run-debug' | 'none';

interface ActivityBarProps {
  activePanel: ActivePanel;
  onSelectPanel: (panel: ActivePanel) => void;
}

const navItems = [
  { id: 'files', icon: FileCode, label: 'File Explorer' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'ai-assistant', icon: Bot, label: 'AI Assistant' },
  { id: 'source-control', icon: GitBranch, label: 'Source Control' },
  { id: 'run-debug', icon: Bug, label: 'Run and Debug' },
  { id: 'extensions', icon: Puzzle, label: 'Extensions' },
] as const;

const bottomNavItems = [{ id: 'settings', icon: Settings, label: 'Settings' }] as const;

export function ActivityBar({ activePanel, onSelectPanel }: ActivityBarProps) {
  const handlePanelSelection = (panel: (typeof navItems)[number]['id'] | (typeof bottomNavItems)[number]['id']) => {
    const actPanel = panel as ActivePanel;
    if (activePanel === actPanel) {
      onSelectPanel('none');
    } else {
      onSelectPanel(actPanel);
    }
  };

  return (
    <div className="w-12 flex flex-col items-center justify-between py-2 gap-2 bg-card border-r" data-testid="activity-bar">
      <div className="flex flex-col items-center gap-2">
        {navItems.map((item) => (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                data-testid={`activity-bar-${item.id}-button`}
                className={cn('h-10 w-10 relative', {
                  'text-accent-foreground': activePanel === item.id,
                })}
                onClick={() => handlePanelSelection(item.id)}
              >
                {activePanel === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 bg-primary rounded-r-full" />}
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
                data-testid={`activity-bar-${item.id}-button`}
                className={cn('h-10 w-10 relative', {
                  'text-accent-foreground': activePanel === item.id,
                })}
                onClick={() => handlePanelSelection(item.id)}
              >
                 {activePanel === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-0.5 bg-primary rounded-r-full" />}
                <item.icon className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
