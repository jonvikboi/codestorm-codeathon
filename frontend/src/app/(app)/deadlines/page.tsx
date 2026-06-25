'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Search,
  Plus,
  Filter,
  LayoutGrid,
  List,
  Calendar,
  CalendarClock,
  Clock,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Pencil,
  Trash2,
  Brain,
  X,
  Bell,
  BookOpen,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import {
  cn,
  formatDate,
  formatRelativeTime,
  getPriorityColor,
  getStatusColor,
} from '@/lib/utils';
import { staggerContainer, staggerItem, cardHover } from '@/lib/animations';
import { SUBJECTS, PRIORITY_OPTIONS, STATUS_OPTIONS, REMINDER_OPTIONS } from '@/constants';
import type { Deadline, DeadlineView, DeadlineFilters, DeadlinePriority, StudyPlan } from '@/types';
import { useAsync } from '@/hooks';
import { deadlineService, studyPlanService } from '@/services';

// ---- Zod Schema for Create/Edit Deadline ----
const deadlineSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(5, 'Description is required'),
  subject: z.string().min(1, 'Select a subject'),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.string().min(1, 'Select priority'),
  reminderTime: z.string().min(1, 'Select reminder time'),
  whatsappReminder: z.boolean(),
  googleCalendar: z.boolean(),
});

type DeadlineFormData = z.infer<typeof deadlineSchema>;

// ---- Priority Icon ----
function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
  };
  return <div className={cn('h-2 w-2 rounded-full shrink-0', colors[priority] || 'bg-gray-400')} />;
}

// ---- Automation Status Badge ----
function AutomationBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'destructive' | 'info' }> = {
    waiting: { label: 'Waiting', variant: 'warning' },
    scheduled: { label: 'Scheduled', variant: 'info' },
    completed: { label: 'Completed', variant: 'success' },
    failed: { label: 'Failed', variant: 'destructive' },
  };
  const c = config[status] || config.waiting;
  return <Badge variant={c.variant} className="text-[10px]">{c.label}</Badge>;
}

export default function DeadlinesPage() {
  const { toast } = useToast();
  const [deadlines, setDeadlines] = React.useState<Deadline[]>([]);
  const [view, setView] = React.useState<DeadlineView>('grid');
  const [filters, setFilters] = React.useState<DeadlineFilters>({
    status: 'all',
    priority: 'all',
    subject: 'all',
    search: '',
  });
  const [showFilters, setShowFilters] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editDeadline, setEditDeadline] = React.useState<Deadline | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<Deadline | null>(null);
  const [detailDeadline, setDetailDeadline] = React.useState<Deadline | null>(null);
  const [studyPlan, setStudyPlan] = React.useState<StudyPlan | null>(null);
  const [generatingPlan, setGeneratingPlan] = React.useState<string | null>(null);

  // Async task fetching
  const { loading, error, execute: fetchDeadlines } = useAsync<Deadline[]>();

  const loadData = React.useCallback(async () => {
    const res = await fetchDeadlines(() => deadlineService.getAll());
    if (res.success) {
      setDeadlines(res.data);
    }
  }, [fetchDeadlines]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  // ---- Filtered deadlines ----
  const filteredDeadlines = React.useMemo(() => {
    return deadlines.filter((d) => {
      if (filters.status !== 'all' && d.status !== filters.status) return false;
      if (filters.priority !== 'all' && d.priority !== filters.priority) return false;
      if (filters.subject !== 'all' && d.subject !== filters.subject) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        return (
          d.title.toLowerCase().includes(q) ||
          d.subject.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [deadlines, filters]);

  // ---- Unique subjects from deadlines ----
  const subjects = React.useMemo(
    () => [...new Set(deadlines.map((d) => d.subject))],
    [deadlines]
  );

  // ---- Generate Study Plan ----
  const handleGeneratePlan = async (deadlineId: string) => {
    setGeneratingPlan(deadlineId);
    const res = await studyPlanService.generate(deadlineId);
    setGeneratingPlan(null);
    if (res.success) {
      setStudyPlan(res.data);
      toast({ title: 'Study Plan Generated!', message: 'AI has created a personalized study plan', type: 'success' });
    } else {
      toast({ title: 'AI Generation Failed', message: res.message, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await deadlineService.delete(deleteTarget.id);
    if (res.success) {
      setDeadlines((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setDeleteTarget(null);
      // Close details if deleted
      if (detailDeadline?.id === deleteTarget.id) {
        setDetailDeadline(null);
      }
      toast({ title: 'Deadline Deleted', message: deleteTarget.title, type: 'info' });
    } else {
      toast({ title: 'Delete Failed', message: res.message, type: 'error' });
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-5 max-w-[1400px] mx-auto"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-primary" />
            Smart Deadline Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filteredDeadlines.length} of {deadlines.length} deadlines
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} variant="gradient" className="gap-2">
          <Plus className="h-4 w-4" />
          New Deadline
        </Button>
      </motion.div>

      {/* Search + Filters + View Toggle */}
      <motion.div variants={staggerItem} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 flex items-center gap-2 bg-card border border-border/50 rounded-xl px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search deadlines..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground"
              aria-label="Search deadlines"
            />
            {filters.search && (
              <button onClick={() => setFilters({ ...filters, search: '' })} className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            size="default"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {(filters.status !== 'all' || filters.priority !== 'all' || filters.subject !== 'all') && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                {[filters.status, filters.priority, filters.subject].filter((f) => f !== 'all').length}
              </span>
            )}
          </Button>

          {/* View Toggle */}
          <div className="flex items-center gap-0.5 rounded-xl bg-muted/60 p-1 border border-border/50">
            {([
              { value: 'grid' as const, icon: LayoutGrid, label: 'Grid view' },
              { value: 'timeline' as const, icon: List, label: 'Timeline view' },
              { value: 'calendar' as const, icon: Calendar, label: 'Calendar view' },
            ]).map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setView(value)}
                className={cn(
                  'relative flex items-center justify-center h-8 w-8 rounded-lg transition-colors focus-ring',
                  view === value ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
                aria-label={label}
                aria-pressed={view === value}
              >
                {view === value && (
                  <motion.div
                    layoutId="view-indicator"
                    className="absolute inset-0 rounded-lg bg-background shadow-sm border border-border/50"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <Icon className="relative z-10 h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Filter Chips */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-card border border-border/50">
                {/* Status Filter */}
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Status</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['all', ...STATUS_OPTIONS.map((s) => s.value)].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilters({ ...filters, status: status as DeadlineFilters['status'] })}
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-medium border transition-all',
                          filters.status === status
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted'
                        )}
                      >
                        {status === 'all' ? 'All' : STATUS_OPTIONS.find((s) => s.value === status)?.label || status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority Filter */}
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Priority</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['all', ...PRIORITY_OPTIONS.map((p) => p.value)].map((priority) => (
                      <button
                        key={priority}
                        onClick={() => setFilters({ ...filters, priority: priority as DeadlineFilters['priority'] })}
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-medium border transition-all',
                          filters.priority === priority
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted'
                        )}
                      >
                        {priority === 'all' ? 'All' : PRIORITY_OPTIONS.find((p) => p.value === priority)?.label || priority}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject Filter */}
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Subject</label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setFilters({ ...filters, subject: 'all' })}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium border transition-all',
                        filters.subject === 'all'
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted'
                      )}
                    >
                      All
                    </button>
                    {subjects.map((subject) => (
                      <button
                        key={subject}
                        onClick={() => setFilters({ ...filters, subject })}
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-medium border transition-all',
                          filters.subject === subject
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted'
                        )}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {(filters.status !== 'all' || filters.priority !== 'all' || filters.subject !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilters({ ...filters, status: 'all', priority: 'all', subject: 'all' })}
                    className="text-xs text-muted-foreground self-end"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {loading && deadlines.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-[280px]">
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <div className="border-t border-border/50 pt-4 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-5 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error && deadlines.length === 0 ? (
        <ErrorState
          title="Failed to load deadlines"
          message={error}
          onRetry={loadData}
        />
      ) : (
        <>
          {/* ---- GRID VIEW ---- */}
          {view === 'grid' && (
            <motion.div variants={staggerItem}>
              {filteredDeadlines.length === 0 ? (
                <EmptyState
                  icon={<CalendarClock className="h-8 w-8 text-muted-foreground" />}
                  title="No deadlines found"
                  description="Try adjusting your filters or create a new deadline to get started."
                  action={{ label: 'Create Deadline', onClick: () => setCreateOpen(true) }}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredDeadlines.map((deadline, idx) => (
                    <motion.div
                      key={deadline.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      {...cardHover}
                    >
                      <Card
                        className="group hover:border-primary/20 transition-all duration-300 h-full flex flex-col cursor-pointer"
                        onClick={() => setDetailDeadline(deadline)}
                      >
                        <CardContent className="p-5 flex-1 flex flex-col">
                          {/* Top Row: Priority + Status + Actions */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <PriorityDot priority={deadline.priority} />
                              <Badge className={cn('text-[10px] border', getPriorityColor(deadline.priority))}>
                                {deadline.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditDeadline(deadline);
                                }}
                                className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                                aria-label={`Edit ${deadline.title}`}
                              >
                                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTarget(deadline);
                                }}
                                className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                                aria-label={`Delete ${deadline.title}`}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </button>
                            </div>
                          </div>

                          {/* Title + Description */}
                          <h3 className="text-sm font-semibold mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                            {deadline.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                            {deadline.description}
                          </p>

                          {/* Subject Chip */}
                          <div className="mb-3">
                            <Badge variant="secondary" className="text-[10px]">
                              {deadline.subject}
                            </Badge>
                          </div>

                          {/* Spacer */}
                          <div className="flex-1" />

                          {/* Date + Reminder + Integration Badges */}
                          <div className="space-y-2 pt-3 border-t border-border/50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatDate(deadline.dueDate)}
                              </div>
                              <span className={cn('text-xs font-medium', deadline.status === 'overdue' ? 'text-red-500' : 'text-muted-foreground')}>
                                {formatRelativeTime(deadline.dueDate)}
                              </span>
                            </div>

                            {/* Badges Row */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge variant="secondary" className="text-[10px] gap-1">
                                <Bell className="h-2.5 w-2.5" />
                                {REMINDER_OPTIONS.find((r) => r.value === deadline.reminderTime)?.label || deadline.reminderTime}
                              </Badge>
                              {deadline.whatsappReminder && (
                                <Badge variant="success" className="text-[10px] gap-1">
                                  <MessageSquare className="h-2.5 w-2.5" />
                                  WhatsApp
                                </Badge>
                              )}
                              {deadline.googleCalendar && (
                                <Badge variant="info" className="text-[10px] gap-1">
                                  <Calendar className="h-2.5 w-2.5" />
                                  Calendar
                                </Badge>
                              )}
                            </div>

                            {/* Status + Automation Row */}
                            <div className="flex items-center justify-between">
                              <Badge className={cn('text-[10px] border', getStatusColor(deadline.status))}>
                                {deadline.status === 'completed' && <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />}
                                {deadline.status === 'overdue' && <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />}
                                {deadline.status}
                              </Badge>
                              <AutomationBadge status={deadline.automationStatus} />
                            </div>
                          </div>

                          {/* AI Study Plan Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-3 w-full gap-1.5 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGeneratePlan(deadline.id);
                            }}
                            disabled={generatingPlan === deadline.id}
                          >
                            {generatingPlan === deadline.id ? (
                              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                <Sparkles className="h-3 w-3" />
                              </motion.div>
                            ) : (
                              <Brain className="h-3 w-3" />
                            )}
                            {generatingPlan === deadline.id ? 'Generating...' : 'Generate Study Plan'}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ---- TIMELINE VIEW ---- */}
          {view === 'timeline' && (
            <motion.div variants={staggerItem} className="space-y-2">
              {filteredDeadlines.length === 0 ? (
                <EmptyState
                  icon={<CalendarClock className="h-8 w-8 text-muted-foreground" />}
                  title="No deadlines found"
                  description="Try adjusting your filters or create a new deadline."
                  action={{ label: 'Create Deadline', onClick: () => setCreateOpen(true) }}
                />
              ) : (
                filteredDeadlines
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .map((deadline, idx) => (
                    <motion.div
                      key={deadline.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      className="flex gap-4"
                    >
                      {/* Timeline Line */}
                      <div className="flex flex-col items-center pt-2">
                        <PriorityDot priority={deadline.priority} />
                        {idx < filteredDeadlines.length - 1 && (
                          <div className="w-px flex-1 bg-border mt-2" />
                        )}
                      </div>

                      {/* Card */}
                      <Card
                        className="flex-1 mb-2 hover:border-primary/20 transition-colors group cursor-pointer"
                        onClick={() => setDetailDeadline(deadline)}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                {deadline.title}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {deadline.subject} · {formatDate(deadline.dueDate)} · {formatRelativeTime(deadline.dueDate)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge className={cn('text-[10px] border', getPriorityColor(deadline.priority))}>
                                {deadline.priority}
                              </Badge>
                              <Badge className={cn('text-[10px] border', getStatusColor(deadline.status))}>
                                {deadline.status}
                              </Badge>
                              {deadline.whatsappReminder && (
                                <Badge variant="success" className="text-[10px] gap-0.5">
                                  <MessageSquare className="h-2.5 w-2.5" />
                                </Badge>
                              )}
                              {deadline.googleCalendar && (
                                <Badge variant="info" className="text-[10px] gap-0.5">
                                  <Calendar className="h-2.5 w-2.5" />
                                </Badge>
                              )}
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditDeadline(deadline);
                                  }}
                                  className="p-1 rounded-md hover:bg-muted"
                                  aria-label="Edit"
                                >
                                  <Pencil className="h-3 w-3 text-muted-foreground" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteTarget(deadline);
                                  }}
                                  className="p-1 rounded-md hover:bg-destructive/10"
                                  aria-label="Delete"
                                >
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
              )}
            </motion.div>
          )}

          {/* ---- CALENDAR VIEW ---- */}
          {view === 'calendar' && (
            <motion.div variants={staggerItem}>
              <CalendarView deadlines={filteredDeadlines} onViewDetails={setDetailDeadline} />
            </motion.div>
          )}
        </>
      )}

      {/* ---- AI STUDY PLAN DISPLAY ---- */}
      <AnimatePresence>
        {studyPlan && (
          <StudyPlanCard plan={studyPlan} onClose={() => setStudyPlan(null)} />
        )}
      </AnimatePresence>

      {/* ---- TASK DETAILS DIALOG ---- */}
      <AnimatePresence>
        {detailDeadline && (
          <TaskDetailsDialog
            open={!!detailDeadline}
            onClose={() => setDetailDeadline(null)}
            deadline={detailDeadline}
            onEdit={setEditDeadline}
            onDelete={setDeleteTarget}
            onStatusChange={async (id, status) => {
              const res = await deadlineService.update(id, { status });
              if (res.success) {
                setDeadlines((prev) => prev.map((d) => (d.id === id ? res.data : d)));
                setDetailDeadline(res.data);
                toast({ title: 'Status Updated!', message: `Task status changed to ${status}`, type: 'success' });
              } else {
                toast({ title: 'Update Failed', message: res.message, type: 'error' });
              }
            }}
            onGenerateStudyPlan={handleGeneratePlan}
          />
        )}
      </AnimatePresence>

      {/* ---- CREATE DEADLINE DIALOG ---- */}
      <CreateEditDeadlineDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={async (data) => {
          const res = await deadlineService.create({
            ...data,
            priority: data.priority as DeadlinePriority,
            reminderTime: data.reminderTime as Deadline['reminderTime'],
          });
          if (res.success) {
            setDeadlines((prev) => [res.data, ...prev]);
            setCreateOpen(false);
            toast({ title: 'Deadline Created!', message: `${data.title} - n8n Workflow Triggered!`, type: 'success' });
          } else {
            toast({ title: 'Creation Failed', message: res.message, type: 'error' });
          }
        }}
      />

      {/* ---- EDIT DEADLINE DIALOG ---- */}
      {editDeadline && (
        <CreateEditDeadlineDialog
          open={!!editDeadline}
          onClose={() => setEditDeadline(null)}
          defaultValues={editDeadline}
          onSubmit={async (data) => {
            const res = await deadlineService.update(editDeadline.id, {
              ...data,
              priority: data.priority as DeadlinePriority,
              reminderTime: data.reminderTime as Deadline['reminderTime'],
            });
            if (res.success) {
              setDeadlines((prev) =>
                prev.map((d) => (d.id === editDeadline.id ? res.data : d))
              );
              setEditDeadline(null);
              toast({ title: 'Deadline Updated!', message: data.title, type: 'success' });
            } else {
              toast({ title: 'Update Failed', message: res.message, type: 'error' });
            }
          }}
        />
      )}


      {/* ---- DELETE CONFIRMATION DIALOG ---- */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogClose onClose={() => setDeleteTarget(null)} />
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Deadline
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>&quot;{deleteTarget?.title}&quot;</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete}>Delete</Button>
        </DialogFooter>
      </Dialog>
    </motion.div>
  );
}

// ============================================================
// Create / Edit Deadline Dialog
// ============================================================
function CreateEditDeadlineDialog({
  open,
  onClose,
  onSubmit,
  defaultValues,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DeadlineFormData) => void;
  defaultValues?: Deadline;
}) {
  const isEdit = !!defaultValues;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DeadlineFormData>({
    resolver: zodResolver(deadlineSchema),
    defaultValues: defaultValues
      ? {
          title: defaultValues.title,
          description: defaultValues.description,
          subject: defaultValues.subject,
          dueDate: defaultValues.dueDate.slice(0, 16),
          priority: defaultValues.priority,
          reminderTime: defaultValues.reminderTime,
          whatsappReminder: defaultValues.whatsappReminder,
          googleCalendar: defaultValues.googleCalendar,
        }
      : {
          title: '',
          description: '',
          subject: '',
          dueDate: '',
          priority: 'medium',
          reminderTime: '24h',
          whatsappReminder: true,
          googleCalendar: true,
        },
  });

  const whatsapp = watch('whatsappReminder');
  const calendar = watch('googleCalendar');

  React.useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  return (
    <Dialog open={open} onClose={onClose} className="max-w-xl">
      <DialogClose onClose={onClose} />
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Deadline' : 'Create New Deadline'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Update the deadline details below.' : 'Fill in the details to create a new deadline.'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
        <div>
          <Label htmlFor="dl-title">Title</Label>
          <Input id="dl-title" placeholder="e.g. Machine Learning Assignment" className="mt-1.5" {...register('title')} />
          {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <Label htmlFor="dl-desc">Description</Label>
          <Textarea id="dl-desc" placeholder="What needs to be done..." className="mt-1.5" {...register('description')} />
          {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dl-subject">Subject</Label>
            <Select id="dl-subject" className="mt-1.5" {...register('subject')}>
              <option value="">Select subject</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
            {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject.message}</p>}
          </div>
          <div>
            <Label htmlFor="dl-date">Due Date</Label>
            <Input id="dl-date" type="datetime-local" className="mt-1.5" {...register('dueDate')} />
            {errors.dueDate && <p className="text-xs text-destructive mt-1">{errors.dueDate.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dl-priority">Priority</Label>
            <Select id="dl-priority" className="mt-1.5" {...register('priority')}>
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="dl-reminder">Reminder</Label>
            <Select id="dl-reminder" className="mt-1.5" {...register('reminderTime')}>
              {REMINDER_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </Select>
          </div>
        </div>

        {/* Toggle Integrations */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setValue('whatsappReminder', !whatsapp)}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm border transition-all',
              whatsapp
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-muted/50 border-border/50 text-muted-foreground'
            )}
          >
            <MessageSquare className="h-4 w-4" />
            WhatsApp Reminder
            {whatsapp && <CheckCircle2 className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setValue('googleCalendar', !calendar)}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm border transition-all',
              calendar
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
                : 'bg-muted/50 border-border/50 text-muted-foreground'
            )}
          >
            <Calendar className="h-4 w-4" />
            Google Calendar
            {calendar && <CheckCircle2 className="h-3.5 w-3.5" />}
          </button>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="gradient">{isEdit ? 'Save Changes' : 'Create Deadline'}</Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

// ============================================================
// Calendar View
// ============================================================
// ============================================================
// Calendar View
// ============================================================
function CalendarView({
  deadlines,
  onViewDetails,
}: {
  deadlines: Deadline[];
  onViewDetails: (d: Deadline) => void;
}) {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDeadlinesForDay = (day: number) => {
    const date = new Date(today.getFullYear(), today.getMonth(), day);
    return deadlines.filter((d) => {
      const dd = new Date(d.dueDate);
      return dd.getDate() === day && dd.getMonth() === date.getMonth() && dd.getFullYear() === date.getFullYear();
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">{monthName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-px">
          {dayNames.map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground py-2 uppercase">
              {d}
            </div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayDeadlines = getDeadlinesForDay(day);
            const isToday = day === today.getDate();
            return (
              <div
                key={day}
                onClick={() => {
                  if (dayDeadlines.length > 0) {
                    onViewDetails(dayDeadlines[0]);
                  }
                }}
                className={cn(
                  'aspect-square p-1 rounded-lg border border-transparent text-center relative',
                  isToday && 'bg-primary/5 border-primary/20',
                  dayDeadlines.length > 0 && 'cursor-pointer hover:bg-muted/50'
                )}
              >
                <span className={cn('text-xs', isToday && 'font-bold text-primary')}>
                  {day}
                </span>
                {dayDeadlines.length > 0 && (
                  <div className="flex justify-center gap-0.5 mt-0.5 flex-wrap">
                    {dayDeadlines.slice(0, 3).map((d) => (
                      <div key={d.id} className="h-1 w-1 rounded-full" style={{ backgroundColor: d.priority === 'critical' ? '#ef4444' : d.priority === 'high' ? '#f97316' : d.priority === 'medium' ? '#eab308' : '#22c55e' }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// AI Study Plan Card
// ============================================================
function StudyPlanCard({ plan, onClose }: { plan: StudyPlan; onClose: () => void }) {
  const typeColors: Record<string, string> = {
    reading: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
    practice: 'from-purple-500/10 to-purple-500/5 border-purple-500/20',
    revision: 'from-amber-500/10 to-amber-500/5 border-amber-500/20',
    assessment: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20',
  };

  const typeIcons: Record<string, React.ElementType> = {
    reading: BookOpen,
    practice: Pencil,
    revision: Brain,
    assessment: CheckCircle2,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
    >
      <Card className="border-primary/20 overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/3 to-transparent" />
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl gradient-primary">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <span className="text-base">AI Study Plan</span>
                  <p className="text-xs text-muted-foreground font-normal mt-0.5">
                    {plan.subject} · Generated by {plan.aiModel}
                  </p>
                </div>
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close study plan">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {plan.days.map((day, idx) => {
                const Icon = typeIcons[day.type] || BookOpen;
                return (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + idx * 0.1 }}
                    className={cn(
                      'rounded-xl border p-4 bg-gradient-to-b',
                      typeColors[day.type] || typeColors.reading
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <h4 className="text-sm font-semibold">{day.day}</h4>
                    </div>
                    <Badge variant="secondary" className="text-[10px] mb-2">
                      {day.duration} · {day.type}
                    </Badge>
                    <ul className="space-y-1">
                      {day.tasks.map((task, tIdx) => (
                        <li key={tIdx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0 text-primary/50" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}

// ============================================================
// Task Details Dialog
// ============================================================
function TaskDetailsDialog({
  open,
  onClose,
  deadline,
  onEdit,
  onDelete,
  onStatusChange,
  onGenerateStudyPlan,
}: {
  open: boolean;
  onClose: () => void;
  deadline: Deadline | null;
  onEdit: (d: Deadline) => void;
  onDelete: (d: Deadline) => void;
  onStatusChange: (id: string, status: Deadline['status']) => void;
  onGenerateStudyPlan: (id: string) => void;
}) {
  if (!deadline) return null;

  return (
    <Dialog open={open} onClose={onClose} className="max-w-lg">
      <DialogClose onClose={onClose} />
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Task Details
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4 mt-3">
        {/* Title */}
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Title</span>
          <h3 className="text-base font-bold mt-0.5 text-foreground">{deadline.title}</h3>
        </div>

        {/* Subject */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Subject</span>
            <div className="mt-1">
              <Badge variant="secondary" className="text-xs font-medium px-2.5 py-0.5">
                {deadline.subject}
              </Badge>
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority</span>
            <div className="mt-1 flex items-center gap-1.5">
              <div className={cn(
                'h-2 w-2 rounded-full shrink-0',
                deadline.priority === 'critical' ? 'bg-red-500' : deadline.priority === 'high' ? 'bg-orange-500' : deadline.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
              )} />
              <Badge className={cn('text-xs border px-2 py-0.5', getPriorityColor(deadline.priority))}>
                {deadline.priority}
              </Badge>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</span>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed whitespace-pre-line bg-muted/30 p-3 rounded-xl border border-border/30">
            {deadline.description}
          </p>
        </div>

        {/* Due Date & Reminder */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Due Date</span>
            <p className="text-sm font-medium text-foreground mt-1 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {formatDate(deadline.dueDate)}
            </p>
            <span className={cn('text-[11px] font-medium block mt-0.5', deadline.status === 'overdue' ? 'text-red-500' : 'text-muted-foreground')}>
              ({formatRelativeTime(deadline.dueDate)})
            </span>
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reminder Time</span>
            <p className="text-sm font-medium text-foreground mt-1 flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-muted-foreground" />
              {REMINDER_OPTIONS.find((r) => r.value === deadline.reminderTime)?.label || deadline.reminderTime}
            </p>
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="grid grid-cols-2 gap-4 border-t border-border/30 pt-3">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Integrations</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {deadline.whatsappReminder ? (
                <Badge variant="success" className="text-[11px] gap-1 px-2">
                  <MessageSquare className="h-3 w-3" />
                  WhatsApp sandbox
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[11px] px-2 text-muted-foreground">
                  WhatsApp Off
                </Badge>
              )}
              {deadline.googleCalendar ? (
                <Badge variant="info" className="text-[11px] gap-1 px-2">
                  <Calendar className="h-3 w-3" />
                  Calendar Sync
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[11px] px-2 text-muted-foreground">
                  Calendar Off
                </Badge>
              )}
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Status</span>
            <div className="mt-1">
              <Select
                value={deadline.status}
                onChange={(e) => onStatusChange(deadline.id, e.target.value as Deadline['status'])}
                className="h-8 text-xs py-0"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* AI Study Plan Action */}
        <div className="bg-gradient-to-br from-primary/5 via-purple-500/3 to-transparent border border-primary/10 rounded-xl p-3.5 flex items-center justify-between gap-3 mt-1">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              AI Study Plan
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Generate a personalized study roadmap for this task.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs shrink-0 bg-background"
            onClick={() => {
              onGenerateStudyPlan(deadline.id);
              onClose();
            }}
          >
            <Brain className="h-3.5 w-3.5" />
            Generate
          </Button>
        </div>
      </div>

      <DialogFooter className="mt-4 border-t border-border/30 pt-3">
        <div className="flex w-full items-center justify-between gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onDelete(deadline);
              onClose();
            }}
            className="gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onEdit(deadline);
                onClose();
              }}
              className="gap-1.5"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogFooter>
    </Dialog>
  );
}



