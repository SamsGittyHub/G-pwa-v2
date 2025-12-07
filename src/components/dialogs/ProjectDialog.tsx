import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Project } from '@/types/chat';

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSave: (name: string, primaryPrompt: string) => void;
}

export function ProjectDialog({ open, onOpenChange, project, onSave }: ProjectDialogProps) {
  const [name, setName] = useState('');
  const [primaryPrompt, setPrimaryPrompt] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setPrimaryPrompt(project.primaryPrompt);
    } else {
      setName('');
      setPrimaryPrompt('');
    }
  }, [project, open]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), primaryPrompt.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'New Project'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Project Name</label>
            <Input
              placeholder="My Project"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Primary Prompt</label>
            <Textarea
              placeholder="Instructions that apply to all chats in this project..."
              value={primaryPrompt}
              onChange={(e) => setPrimaryPrompt(e.target.value)}
              className="min-h-[120px] rounded-xl resize-none"
            />
            <p className="text-xs text-muted-foreground">
              This prompt will be applied to all conversations within this project.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 rounded-xl" disabled={!name.trim()}>
            {project ? 'Save' : 'Create'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}