import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "../ui/badge";

const features = [
    { id: "feat-layout", label: "Basic IDE Layout", checked: true },
    { id: "feat-panels", label: "Collapsible Side Panels", checked: true },
    { id: "feat-theme", label: "Theme Toggle & Persistence", checked: true },
    { id: "feat-file-tree", label: "Dynamic File Tree", checked: true },
    { id: "feat-file-state", label: "Persist file system state", checked: true },
    { id: "feat-file-ops", label: "CRUD File Operations", checked: true },
    { id: "feat-file-dnd", label: "Drag-and-drop files", checked: false },
    { id: "feat-editor", label: "Code Editor with Syntax Highlighting", checked: true },
    { id: "feat-ai-suggest", label: "AI Code Suggestion", checked: true },
    { id: "feat-format", label: "Code Formatting", checked: true },
    { id: "feat-minimap", label: "Show/Hide Minimap", checked: true },
    { id: "feat-terminal-mock", label: "Mock Code Execution in Terminal", checked: true },
    { id: "feat-terminal-clear", label: "Clear terminal output", checked: true },
    { id: "feat-problems-link", label: "Link problems to code", checked: true },
    { id: "feat-webcontainers", label: "Implement WebContainers", checked: false },
    { id: "feat-settings-logic", label: "Implement setting logic", checked: true },
];

const bugs = [
    { id: "bug-1", label: "Terminal does not clear", checked: true, status: "Resolved" },
    { id: "bug-2", label: "Theme toggle is not persisted", checked: true, status: "Resolved" },
];


export function TasksPanel() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold tracking-tight">Tasks</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-6">
        <div className="space-y-3">
          <h3 className="font-medium">Features Checklist</h3>
          {features.map((feature) => (
            <div key={feature.id} className="flex items-center space-x-2">
              <Checkbox id={feature.id} checked={feature.checked} disabled />
              <Label htmlFor={feature.id} className={`text-sm ${feature.checked ? 'line-through text-muted-foreground' : ''}`}>
                {feature.label}
              </Label>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <h3 className="font-medium">Bug Tracker</h3>
          {bugs.map((bug) => (
            <div key={bug.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Checkbox id={bug.id} checked={bug.checked} disabled />
                    <Label htmlFor={bug.id} className={`text-sm ${bug.checked ? 'line-through text-muted-foreground' : ''}`}>
                        {bug.label}
                    </Label>
                </div>
                {bug.checked && <Badge variant="secondary">{bug.status}</Badge>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
