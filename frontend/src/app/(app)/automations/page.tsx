'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Workflow,
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Activity,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { mockAutomations } from '@/lib/mock-data';
import { cn, formatDate, formatRelativeTime } from '@/lib/utils';
import { staggerContainer, staggerItem, cardHover } from '@/lib/animations';
import type { Automation, WorkflowStatus } from '@/types';

// ---- Status Config ----
const statusConfig: Record<WorkflowStatus, { label: string; icon: React.ElementType; color: string; badgeVariant: 'default' | 'success' | 'warning' | 'destructive' | 'info' }> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-500', badgeVariant: 'warning' },
  running: { label: 'Running', icon: Loader2, color: 'text-blue-500', badgeVariant: 'info' },
  success: { label: 'Success', icon: CheckCircle2, color: 'text-emerald-500', badgeVariant: 'success' },
  failed: { label: 'Failed', icon: XCircle, color: 'text-red-500', badgeVariant: 'destructive' },
};

// ---- Status Chip ----
function StatusChip({ status }: { status: WorkflowStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <Badge variant={config.badgeVariant} className="text-[10px] gap-1">
      <Icon className={cn('h-2.5 w-2.5', status === 'running' && 'animate-spin')} />
      {config.label}
    </Badge>
  );
}

// ---- Integration Status Row ----
function IntegrationRow({ label, icon: Icon, status }: { label: string; icon: React.ElementType; status: WorkflowStatus }) {
  const config = statusConfig[status];
  const StatusIcon = config.icon;
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2 text-sm">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <StatusIcon className={cn('h-3.5 w-3.5', config.color, status === 'running' && 'animate-spin')} />
        <span className={cn('text-xs font-medium', config.color)}>{config.label}</span>
      </div>
    </div>
  );
}

export default function AutomationsPage() {
  const { toast } = useToast();
  const [automations] = React.useState<Automation[]>(mockAutomations);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  // ---- Summary Stats ----
  const stats = React.useMemo(() => {
    const total = automations.length;
    const success = automations.filter((a) => a.status === 'success').length;
    const pending = automations.filter((a) => a.status === 'pending').length;
    const failed = automations.filter((a) => a.status === 'failed').length;
    return { total, success, pending, failed };
  }, [automations]);

  const handleRetrigger = (automation: Automation) => {
    toast({
      title: 'Automation Re-triggered',
      message: `${automation.workflowName} has been queued for execution`,
      type: 'info',
    });
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6 max-w-[1400px] mx-auto"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <Workflow className="h-6 w-6 text-primary" />
          My Automations
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Monitor your WhatsApp reminders & Google Calendar automation workflows
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={staggerItem} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Workflows', value: stats.total, icon: Workflow, color: 'text-indigo-500' },
          { label: 'Successful', value: stats.success, icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-500' },
          { label: 'Failed', value: stats.failed, icon: XCircle, color: 'text-red-500' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            {...cardHover}
          >
            <Card className="hover:border-primary/20 transition-colors">
              <CardContent className="p-4">
                <stat.icon className={cn('h-5 w-5 mb-2', stat.color)} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Automations */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Recent Automations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {automations.map((automation, idx) => (
              <motion.div
                key={automation.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + idx * 0.05 }}
              >
                <div
                  className={cn(
                    'rounded-xl border border-border/50 overflow-hidden transition-all duration-300',
                    expandedId === automation.id && 'border-primary/20 shadow-md shadow-primary/5'
                  )}
                >
                  {/* Main Row */}
                  <button
                    onClick={() => setExpandedId(expandedId === automation.id ? null : automation.id)}
                    className="flex items-center gap-4 w-full p-4 text-left hover:bg-muted/30 transition-colors"
                    aria-expanded={expandedId === automation.id}
                  >
                    {/* Status Icon */}
                    <div className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                      automation.status === 'success' ? 'bg-emerald-500/10' :
                      automation.status === 'failed' ? 'bg-red-500/10' :
                      automation.status === 'pending' ? 'bg-amber-500/10' :
                      'bg-blue-500/10'
                    )}>
                      <Zap className={cn(
                        'h-5 w-5',
                        statusConfig[automation.status].color
                      )} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {automation.workflowName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {automation.deadlineTitle} · {automation.subject}
                      </p>
                    </div>

                    {/* Status + Trigger + Chevron */}
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="text-[10px]">
                        {automation.trigger}
                      </Badge>
                      <StatusChip status={automation.status} />
                    </div>

                    <ChevronDown
                      className={cn(
                        'h-4 w-4 text-muted-foreground transition-transform shrink-0',
                        expandedId === automation.id && 'rotate-180'
                      )}
                    />
                  </button>

                  {/* Mobile status row */}
                  <div className="sm:hidden flex items-center gap-2 px-4 pb-3 flex-wrap">
                    <StatusChip status={automation.status} />
                    <Badge variant="secondary" className="text-[10px]">
                      {automation.trigger}
                    </Badge>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedId === automation.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4">
                          {/* Integration Status */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Card className="bg-muted/30">
                              <CardContent className="p-4">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                  Integration Status
                                </h4>
                                <div className="divide-y divide-border/50">
                                  <IntegrationRow label="WhatsApp" icon={MessageSquare} status={automation.whatsappStatus} />
                                  <IntegrationRow label="Google Calendar" icon={Calendar} status={automation.calendarStatus} />
                                </div>
                              </CardContent>
                            </Card>

                            <Card className="bg-muted/30">
                              <CardContent className="p-4">
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                  Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Executed</span>
                                    <span className="font-medium">{formatDate(automation.executedAt)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Time</span>
                                    <span className="font-medium">{formatRelativeTime(automation.executedAt)}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Execution Timeline */}
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                              Execution History
                            </h4>
                            <div className="space-y-2">
                              {automation.logs.map((log, logIdx) => {
                                const logConfig = statusConfig[log.status];
                                const LogIcon = logConfig.icon;
                                return (
                                  <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: logIdx * 0.08 }}
                                    className="flex items-start gap-3"
                                  >
                                    <div className="flex flex-col items-center">
                                      <div className={cn(
                                        'flex h-6 w-6 items-center justify-center rounded-full',
                                        log.status === 'success' ? 'bg-emerald-500/10' :
                                        log.status === 'failed' ? 'bg-red-500/10' :
                                        log.status === 'running' ? 'bg-blue-500/10' :
                                        'bg-amber-500/10'
                                      )}>
                                        <LogIcon className={cn('h-3 w-3', logConfig.color, log.status === 'running' && 'animate-spin')} />
                                      </div>
                                      {logIdx < automation.logs.length - 1 && (
                                        <div className="w-px h-6 bg-border mt-1" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0 pb-2">
                                      <p className="text-sm font-medium">{log.action}</p>
                                      <p className="text-xs text-muted-foreground">{log.message}</p>
                                      <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                                        {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                      </p>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Re-trigger Button */}
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1.5 text-xs"
                              onClick={() => handleRetrigger(automation)}
                            >
                              <RefreshCw className="h-3 w-3" />
                              Re-trigger Workflow
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
