import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold font-mono transition-colors',
  {
    variants: {
      variant: {
        default:  'bg-primary/20 text-primary border border-primary/40',
        outline:  'border border-border text-foreground',
        green:    'rag-green',
        amber:    'rag-amber',
        red:      'rag-red',
        gold:     'bg-[var(--amber-bg)] text-[var(--accent-gold)] border border-[var(--amber-border)]',
        blue:     'bg-primary/15 text-primary border border-primary/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export function Badge({ className, variant, children, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  );
}

export { badgeVariants };
