import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const features = [
  { id: "feat-1", label: "Dynamic File Explorer", checked: false },
  { id: "feat-2", label: "Interactive Settings Panel", checked: false },
  { id: "feat-3", label: "Code Execution Environment", checked: false },
  { id: "feat-4", label: "Real-time AI Suggestions", checked: true },
];

const bugs = [
    { id: "bug-1", label: "Terminal does not clear", checked: false },
    { id: "bug-2", label: "Theme toggle is not persisted", checked: false },
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
              <Checkbox id={feature.id} defaultChecked={feature.checked} />
              <Label htmlFor={feature.id} className="text-sm">
                {feature.label}
              </Label>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <h3 className="font-medium">Bug Tracker</h3>
          {bugs.map((bug) => (
            <div key={bug.id} className="flex items-center space-x-2">
              <Checkbox id={bug.id} defaultChecked={bug.checked} />
              <Label htmlFor={bug.id} className="text-sm">
                {bug.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
