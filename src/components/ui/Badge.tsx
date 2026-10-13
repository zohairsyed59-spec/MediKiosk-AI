import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'border-border bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20',
        outline: 'border-border bg-transparent',
        secondary: 'border-secondary bg-secondary text-secondary-foreground',
        success: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700',
        warning: 'border-amber-500/50 bg-amber-500/10 text-amber-700',
        emergency: 'border-red-500/50 bg-red-500/10 text-red-700',
        priority: 'border-amber-500/50 bg-amber-500/10 text-amber-700',
        routine: 'border-teal-500/50 bg-teal-500/10 text-teal-700',
        purple: 'border-violet-500/50 bg-violet-500/10 text-violet-700',
        error: 'border-destructive/50 bg-destructive/10 text-destructive',
        info: 'border-primary/50 bg-primary/10 text-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'success' | 'warning' | 'emergency' | 'priority' | 'routine' | 'purple' | 'error' | 'info';
}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };