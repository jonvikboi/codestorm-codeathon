'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-xl bg-muted animate-skeleton" />
    );
  }

  const options = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ] as const;

  return (
    <div
      className="flex items-center gap-0.5 rounded-xl bg-muted/60 p-1 border border-border/50"
      role="radiogroup"
      aria-label="Theme selection"
    >
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          role="radio"
          aria-checked={theme === value}
          aria-label={`${label} theme`}
          onClick={() => setTheme(value)}
          className={cn(
            'relative flex items-center justify-center h-7 w-7 rounded-lg transition-colors focus-ring',
            theme === value
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {theme === value && (
            <motion.div
              layoutId="theme-indicator"
              className="absolute inset-0 rounded-lg bg-background shadow-sm border border-border/50"
              transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
            />
          )}
          <Icon className="relative z-10 h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
