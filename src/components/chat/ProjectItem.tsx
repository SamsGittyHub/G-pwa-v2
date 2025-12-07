import React, { useState } from 'react';
import { Project, Conversation } from '@/types/chat';
import { Folder, ChevronDown, ChevronRight, Trash2, Plus, Edit2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { ConversationItem } from './ConversationItem';
import { Button } from '@/components/ui/button';

interface ProjectItemProps {
  project: Project;
  conversations: Conversation[];
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onNewChat: () => void;
  onEditProject: () => void;
  onDeleteProject: () => void;
}

export function ProjectItem({ 
  project, 
  conversations, 
  onSelectChat, 
  onDeleteChat,
  onNewChat,
  onEditProject,
  onDeleteProject
}: ProjectItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-1">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="group flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-accent/50 border border-transparent"
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
          <Folder className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate text-sm">
            {project.name}
          </h3>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {conversations.length} chat{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground whitespace-nowrap mr-2">
            {formatDistanceToNow(new Date(project.timestamp), { addSuffix: false })}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onNewChat(); }}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEditProject(); }}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteProject(); }}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="pl-6 space-y-1">
          {conversations.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2 px-4">No chats in this project</p>
          ) : (
            conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                onClick={() => onSelectChat(conv.id)}
                onDelete={() => onDeleteChat(conv.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}