import { Puzzle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import extensions from '@/lib/extensions.json';

const { extensions: marketplaceExtensions } = extensions;

export default function ExtensionsPage() {
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col items-center justify-between gap-4 mb-8 md:flex-row animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <h1 className="text-3xl font-bold tracking-tight">Extensions Marketplace</h1>
        <div className="w-full md:w-64">
          <Input placeholder="Search extensions..." />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marketplaceExtensions.map((ext, index) => (
          <div 
            key={ext.name} 
            className="card-hover-effect flex flex-col rounded-lg border bg-card text-card-foreground p-4 animate-slide-up"
            style={{ animationDelay: `${0.3 + index * 0.1}s` }}
          >
            <div className="flex items-start space-x-4">
              <div className="bg-muted p-3 rounded-lg">
                <Puzzle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{ext.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{ext.description}</p>
                <p className="text-xs text-muted-foreground mt-2">By {ext.publisher}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" size="sm">Manage</Button>
                <Button variant="secondary" size="sm">Install</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
