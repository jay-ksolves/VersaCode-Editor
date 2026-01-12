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

export function SettingsPanel() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold tracking-tight">Settings</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-6">
        <div className="space-y-4">
            <h3 className="font-medium">Appearance</h3>
            <div className="flex items-center justify-between">
                <Label htmlFor="theme-mode">Theme</Label>
                <Select defaultValue="system">
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
                <Select defaultValue="14px">
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="12px">12px</SelectItem>
                        <SelectItem value="14px">14px</SelectItem>
                        <SelectItem value="16px">16px</SelectItem>
                        <SelectItem value="18px">18px</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <div className="space-y-4">
            <h3 className="font-medium">Editor</h3>
            <div className="flex items-center justify-between">
                <Label htmlFor="word-wrap">Word Wrap</Label>
                <Switch id="word-wrap" />
            </div>
             <div className="flex items-center justify-between">
                <Label htmlFor="minimap">Show Minimap</Label>
                <Switch id="minimap" defaultChecked />
            </div>
        </div>
      </div>
       <div className="p-4 border-t">
        <Button className="w-full">Reset to Defaults</Button>
      </div>
    </div>
  );
}
