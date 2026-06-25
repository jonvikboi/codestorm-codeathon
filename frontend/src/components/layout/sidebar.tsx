'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarClock,
  Workflow,
  GraduationCap,
  ChevronLeft,
  Sparkles,
  Percent,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/constants';

const navItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Deadlines', href: '/deadlines', icon: CalendarClock },
  { title: 'Attendance', href: '/attendance', icon: Percent },
  { title: 'Automations', href: '/automations', icon: Workflow },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-border/50 bg-sidebar transition-all duration-300 ease-in-out',
        'hidden lg:flex flex-col',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-border/50">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl gradient-primary">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <h1 className="text-base font-bold tracking-tight whitespace-nowrap">
                {APP_NAME}
              </h1>
              <p className="text-[10px] text-muted-foreground -mt-0.5">
                AI Student Platform
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 focus-ring',
                isActive
                  ? 'text-primary bg-primary/8'
                  : 'text-sidebar-foreground hover:bg-muted/60 hover:text-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-primary/8 border border-primary/15"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                />
              )}
              <item.icon
                className={cn(
                  'relative z-10 h-[18px] w-[18px] shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="relative z-10 whitespace-nowrap overflow-hidden"
                  >
                    {item.title}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* AI Branding */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-3"
          >
            <div className="rounded-xl bg-gradient-to-br from-primary/10 via-purple-500/5 to-blue-500/10 border border-primary/10 p-3">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold">Powered by AI</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Smart study plans, automated reminders, and intelligent scheduling.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse Toggle */}
      <div className="border-t border-border/50 p-3">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-xl p-2 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors focus-ring"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            className={cn(
              'h-4 w-4 transition-transform duration-300',
              collapsed && 'rotate-180'
            )}
          />
        </button>
      </div>
    </aside>
  );
}
