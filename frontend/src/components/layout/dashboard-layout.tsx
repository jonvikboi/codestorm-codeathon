'use client';

import * as React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { cn } from '@/lib/utils';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="min-h-screen bg-background gradient-mesh selection:bg-primary/10">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div
        className={cn(
          'min-h-screen transition-all duration-300 ease-in-out',
          collapsed ? 'lg:ml-[76px]' : 'lg:ml-[260px]'
        )}
      >
        <Navbar />
        <main className="p-6 lg:p-8 max-w-[1500px] mx-auto">{children}</main>
      </div>
    </div>
  );
}
