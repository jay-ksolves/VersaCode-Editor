
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";

interface SettingsPanelProps {
  settings: {
    minimap: boolean;
    fontSize: number;
  },
  onSettingsChange: (newSettings: Partial<{ minimap: boolean; fontSize: number; }>) => void;
  onResetSettings: () => void;
}

export function SettingsPanel({ settings, onSettingsChange, onResetSettings }: SettingsPanelProps) {
  return (
    <div className="h-full flex flex-col" data-testid="settings-panel">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold tracking-tight">Settings</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-6">
        <div className="space-y-4">
            <h3 className="font-medium">Appearance</h3>
            <div className="flex items-center justify-between">
                <Label htmlFor="theme-mode">Theme</Label>
                <Select defaultValue="dark" disabled data-testid="settings-theme-select">
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="flex items-center justify-between">
                <Label htmlFor="font-size">Font Size</Label>
                <Select 
                  value={String(settings.fontSize)} 
                  onValueChange={(value) => onSettingsChange({ fontSize: Number(value) })}
                  data-testid="settings-font-size-select"
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="12">12px</SelectItem>
                        <SelectItem value="14">14px</SelectItem>
                        <SelectItem value="16">16px</SelectItem>
                        <SelectItem value="18">18px</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <div className="space-y-4">
            <h3 className="font-medium">Editor</h3>
            <div className="flex items-center justify-between">
                <Label htmlFor="word-wrap">Word Wrap</Label>
                <Switch id="word-wrap" defaultChecked disabled data-testid="settings-word-wrap-switch" />
            </div>
             <div className="flex items-center justify-between">
                <Label htmlFor="minimap">Show Minimap</Label>
                <Switch 
                  id="minimap" 
                  checked={settings.minimap}
                  onCheckedChange={(checked) => onSettingsChange({ minimap: checked })}
                  data-testid="settings-minimap-switch"
                />
            </div>
        </div>
      </div>
       <div className="p-4 border-t">
        <Button className="w-full" onClick={onResetSettings} data-testid="settings-reset-button">Reset to Defaults</Button>
      </div>
    </div>
  );
}
