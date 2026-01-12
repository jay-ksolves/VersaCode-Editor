import { Puzzle } from 'lucide-react';

const installedExtensions = [
  { name: 'Prettier - Code formatter', description: 'The opinionated code formatter.', publisher: 'Prettier' },
  { name: 'ESLint', description: 'Integrates ESLint into VS Code.', publisher: 'Microsoft' },
  { name: 'Live Server', description: 'Launch a local development server with live reload feature.', publisher: 'Ritwick Dey' },
  { name: 'GitLens — Git supercharged', description: 'Supercharge Git within VS Code.', publisher: 'GitKraken' },
];

export default function ExtensionsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Extensions Marketplace</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {installedExtensions.map((ext) => (
          <div key={ext.name} className="flex items-start space-x-4 rounded-lg border bg-card text-card-foreground p-4">
            <div className="bg-muted p-3 rounded-lg">
              <Puzzle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{ext.name}</p>
              <p className="text-sm text-muted-foreground">{ext.description}</p>
              <p className="text-xs text-muted-foreground mt-2">By {ext.publisher}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
