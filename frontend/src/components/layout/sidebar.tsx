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
        'fixed left-0 top-0 z-40 h-screen border-r border-border/40 bg-sidebar transition-all duration-300 ease-in-out',
        'hidden lg:flex flex-col',
        collapsed ? 'w-[76px]' : 'w-[260px]'
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 px-6 border-b border-border/40">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
          <GraduationCap className="h-5 w-5" />
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
              <h1 className="text-lg font-bold tracking-tight text-foreground whitespace-nowrap">
                CampusFlow
              </h1>
              <p className="text-[10px] text-muted-foreground -mt-1 font-medium">
                AI Student Platform
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 focus-ring',
                isActive
                  ? 'text-primary bg-primary/[0.04]'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex items-center gap-3.5 relative z-10">
                <item.icon
                  className={cn(
                    'h-[20px] w-[20px] shrink-0 transition-colors',
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
                      className="whitespace-nowrap overflow-hidden font-semibold"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Blue dot indicator for active state (Dribbble style) */}
              {isActive && !collapsed && (
                <motion.div
                  layoutId="sidebar-active-dot"
                  className="h-1.5 w-1.5 rounded-full bg-primary relative z-10 mr-1"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-border/40 p-3">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center rounded-xl p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors focus-ring cursor-pointer"
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
