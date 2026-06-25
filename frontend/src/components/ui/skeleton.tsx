import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl bg-muted animate-skeleton',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
