import React from 'react';
import { Conversation } from '@/types/chat';
import { Sparkles, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ConversationItemProps {
  conversation: Conversation;
  isActive?: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export function ConversationItem({ conversation, isActive, onClick, onDelete }: ConversationItemProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-200",
        isActive 
          ? "bg-primary/10 border border-primary/20" 
          : "hover:bg-accent/50 border border-transparent"
      )}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
        <Sparkles className="h-5 w-5 text-primary" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground truncate text-sm">
          {conversation.title}
        </h3>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {conversation.preview}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDistanceToNow(new Date(conversation.timestamp), { addSuffix: false })}
        </span>
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
