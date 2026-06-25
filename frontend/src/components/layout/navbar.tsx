'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Search,
  Menu,
  X,
  LayoutDashboard,
  CalendarClock,
  Workflow,
  GraduationCap,
  LogOut,
  Settings,
  User,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { mockNotifications, mockStudent } from '@/lib/mock-data';
import { getInitials, formatRelativeTime } from '@/lib/utils';
import { APP_NAME } from '@/constants';

const mobileNavItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Deadlines', href: '/deadlines', icon: CalendarClock },
  { title: 'Automations', href: '/automations', icon: Workflow },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const notifRef = React.useRef<HTMLDivElement>(null);
  const profileRef = React.useRef<HTMLDivElement>(null);

  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Page title
  const pageTitle = React.useMemo(() => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname === '/deadlines') return 'Smart Deadline Manager';
    if (pathname === '/automations') return 'My Automations';
    return 'CampusFlow';
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden flex items-center justify-center h-9 w-9 rounded-xl hover:bg-muted transition-colors focus-ring"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        {/* Mobile Logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-sm">{APP_NAME}</span>
        </div>

        {/* Page Title (Desktop) */}
        <h2 className="hidden lg:block text-lg font-semibold">{pageTitle}</h2>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2 border border-border/50 w-full max-w-xs">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search deadlines, tasks..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
            aria-label="Search"
          />
          <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-border/50 bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
            className="relative flex items-center justify-center h-9 w-9 rounded-xl hover:bg-muted transition-colors focus-ring"
            aria-label={`Notifications, ${unreadCount} unread`}
            aria-expanded={notifOpen}
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 rounded-2xl border border-border/50 bg-card shadow-xl overflow-hidden"
                role="menu"
                aria-label="Notifications"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                  <Badge variant="default">{unreadCount} new</Badge>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {mockNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        'flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer border-b border-border/30 last:border-0',
                        !notif.read && 'bg-primary/3'
                      )}
                      role="menuitem"
                    >
                      <div
                        className={cn(
                          'mt-0.5 h-2 w-2 shrink-0 rounded-full',
                          notif.read ? 'bg-transparent' : 'bg-primary'
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{notif.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 mt-1">
                          {formatRelativeTime(notif.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-muted transition-colors focus-ring"
            aria-label="User menu"
            aria-expanded={profileOpen}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-xs font-bold text-white">
              {getInitials(mockStudent.fullName)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium leading-tight">{mockStudent.fullName}</p>
              <p className="text-[10px] text-muted-foreground">{mockStudent.branch.split(' ')[0]}</p>
            </div>
            <ChevronDown className="hidden md:block h-3.5 w-3.5 text-muted-foreground" />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 rounded-2xl border border-border/50 bg-card shadow-xl overflow-hidden"
                role="menu"
              >
                <div className="px-4 py-3 border-b border-border/50">
                  <p className="text-sm font-semibold">{mockStudent.fullName}</p>
                  <p className="text-xs text-muted-foreground">{mockStudent.email}</p>
                </div>
                <div className="py-1">
                  {[
                    { icon: User, label: 'Profile', href: '#' },
                    { icon: Settings, label: 'Settings', href: '#' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors"
                      role="menuitem"
                    >
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      {item.label}
                    </Link>
                  ))}
                </div>
                <div className="border-t border-border/50 py-1">
                  <button
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                    role="menuitem"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed left-0 top-0 z-50 h-full w-72 bg-card border-r border-border/50 p-4 lg:hidden"
              aria-label="Mobile navigation"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold">{APP_NAME}</h1>
                  <p className="text-[10px] text-muted-foreground">AI Student Platform</p>
                </div>
              </div>
              <div className="space-y-1">
                {mobileNavItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'text-primary bg-primary/8'
                          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
