import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface PromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPrompt: string;
  onSave: (prompt: string) => void;
  title?: string;
}

export function PromptDialog({ open, onOpenChange, currentPrompt, onSave, title = 'Chat Prompt' }: PromptDialogProps) {
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    setPrompt(currentPrompt);
  }, [currentPrompt, open]);

  const handleSave = () => {
    onSave(prompt.trim());
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Custom instructions for this conversation..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[160px] rounded-xl resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This prompt will be included with every message in this conversation.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 rounded-xl">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}