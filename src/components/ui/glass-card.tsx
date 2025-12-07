import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'frosted' | 'solid';
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl transition-all duration-200",
          {
            'default': "bg-card/80 backdrop-blur-xl border border-border/50 shadow-lg",
            'frosted': "bg-accent/40 backdrop-blur-2xl border border-border/30 shadow-xl",
            'solid': "bg-card border border-border shadow-md",
          }[variant],
          className
        )}
        {...props}
      />
    );
  }
);
GlassCard.displayName = "GlassCard";

export { GlassCard };
