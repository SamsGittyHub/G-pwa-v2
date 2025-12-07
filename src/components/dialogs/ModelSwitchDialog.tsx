import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AIModel } from '@/types/chat';
import { Check, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModelSwitchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  models: AIModel[];
  selectedModelId: string;
  onSelect: (modelId: string) => void;
}

export function ModelSwitchDialog({ open, onOpenChange, models, selectedModelId, onSelect }: ModelSwitchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Switch AI Model
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-4">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                onSelect(model.id);
                onOpenChange(false);
              }}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl transition-all",
                selectedModelId === model.id
                  ? "bg-primary/10 border border-primary/20"
                  : "bg-accent/30 hover:bg-accent/50 border border-transparent"
              )}
            >
              <div className="text-left">
                <p className="font-medium text-foreground">{model.name}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {model.endpoint || 'Default endpoint'}
                </p>
              </div>
              {selectedModelId === model.id && (
                <Check className="h-5 w-5 text-primary" />
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}