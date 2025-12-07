import React from 'react';

export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-muted/30 backdrop-blur-sm border border-border/50 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
