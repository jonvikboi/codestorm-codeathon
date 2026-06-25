'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  Sparkles,
  TrendingUp,
  Zap,
  ArrowRight,
  BookOpen,
  MapPin,
  Calendar,
  Activity,
  Plus,
  Workflow,
  Brain,
  Bell,
  Percent,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  mockStudent,
  mockSchedule,
  mockStats,
  mockDeadlines,
  mockActivity,
  mockAiTip,
  mockCalendarEvents,
  mockAttendance,
} from '@/lib/mock-data';
import { cn, formatDate, formatRelativeTime } from '@/lib/utils';
import { staggerContainer, staggerItem, cardHover } from '@/lib/animations';

const scheduleTypeColors: Record<string, string> = {
  class: 'bg-blue-500',
  lab: 'bg-purple-500',
  assignment: 'bg-amber-500',
  exam: 'bg-red-500',
  meeting: 'bg-emerald-500',
};

const activityIcons: Record<string, React.ElementType> = {
  deadline: CalendarClock,
  automation: Zap,
  study: BookOpen,
  calendar: Calendar,
};

export default function DashboardPage() {
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  const firstName = mockStudent.fullName.split(' ')[0];

  // Attendance calculations
  const attendanceStats = React.useMemo(() => {
    const attended = mockAttendance.reduce((sum, item) => sum + item.classesAttended, 0);
    const total = mockAttendance.reduce((sum, item) => sum + item.totalClasses, 0);
    const percentage = total > 0 ? (attended / total) * 100 : 0;
    
    // find critical / at-risk subjects
    const warnings = mockAttendance
      .map((item) => {
        const pct = item.totalClasses > 0 ? (item.classesAttended / item.totalClasses) * 100 : 0;
        return {
          ...item,
          pct,
          status: pct >= 75 ? 'safe' : pct >= 65 ? 'at-risk' : 'critical'
        };
      })
      .filter((item) => item.status !== 'safe')
      .slice(0, 3);
      
    return { percentage, warnings };
  }, []);

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6 max-w-[1400px] mx-auto"
    >
      {/* Welcome Card */}
      <motion.div variants={staggerItem}>
        <Card className="overflow-hidden border-primary/10">
          <div className="relative">
            <div className="absolute inset-0 gradient-primary opacity-[0.06]" />
            <CardContent className="relative p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <motion.span
                      animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                      transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatDelay: 5 }}
                      className="text-2xl"
                    >
                      👋
                    </motion.span>
                    <h1 className="text-xl md:text-2xl font-bold">
                      {greeting}, {firstName}!
                    </h1>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You have{' '}
                    <span className="font-semibold text-foreground">
                      {mockStats.pendingTasks} pending tasks
                    </span>{' '}
                    and{' '}
                    <span className="font-semibold text-primary">
                      {mockStats.upcomingExams} upcoming exams
                    </span>{' '}
                    this week. Let&apos;s stay productive!
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/deadlines"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl text-sm font-medium h-8 px-3 gradient-primary text-white shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    New Deadline
                  </Link>
                  <Link
                    href="/deadlines"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl text-sm font-medium h-8 px-3 border border-border bg-transparent hover:bg-accent hover:text-accent-foreground transition-all"
                  >
                    View All
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        {[
          { label: 'Total Deadlines', value: mockStats.totalDeadlines, icon: FileText, color: 'text-indigo-500' },
          { label: 'Completed', value: mockStats.completedDeadlines, icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Pending Tasks', value: mockStats.pendingTasks, icon: Clock, color: 'text-amber-500' },
          { label: 'Upcoming Exams', value: mockStats.upcomingExams, icon: CalendarClock, color: 'text-red-500' },
          { label: 'Automations Run', value: mockStats.automationsRun, icon: Zap, color: 'text-purple-500' },
          { label: 'Study Hours', value: `${mockStats.studyHoursThisWeek}h`, icon: TrendingUp, color: 'text-blue-500' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + idx * 0.05 }}
            {...cardHover}
          >
            <Card className="hover:border-primary/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={cn('h-4 w-4', stat.color)} />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Grid: Schedule + Deadlines + AI Tip */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Schedule */}
        <motion.div variants={staggerItem} className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Today&apos;s Schedule
                </CardTitle>
                <Badge variant="secondary" className="text-[10px]">
                  {mockSchedule.length} events
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockSchedule.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.08 }}
                  className="flex items-start gap-3 group"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'h-2.5 w-2.5 rounded-full mt-1.5',
                        scheduleTypeColors[item.type]
                      )}
                    />
                    {idx < mockSchedule.length - 1 && (
                      <div className="w-px h-8 bg-border mt-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted-foreground">
                        {item.time}
                      </span>
                      {item.location && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                          <MapPin className="h-2.5 w-2.5" />
                          {item.location}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Deadlines */}
        <motion.div variants={staggerItem} className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  Upcoming Deadlines
                </CardTitle>
                <Link
                  href="/deadlines"
                  className="inline-flex items-center gap-1 rounded-xl text-xs font-medium h-7 px-3 hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {mockDeadlines
                .filter((d) => d.status !== 'completed')
                .slice(0, 4)
                .map((deadline, idx) => (
                  <motion.div
                    key={deadline.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.08 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/40 transition-colors group cursor-pointer"
                  >
                    <div
                      className={cn(
                        'h-2 w-2 rounded-full shrink-0',
                        deadline.priority === 'critical'
                          ? 'bg-red-500'
                          : deadline.priority === 'high'
                          ? 'bg-orange-500'
                          : deadline.priority === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {deadline.title.split('—')[0].trim()}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {deadline.subject} · {formatRelativeTime(deadline.dueDate)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        deadline.status === 'overdue'
                          ? 'destructive'
                          : deadline.status === 'in-progress'
                          ? 'info'
                          : 'secondary'
                      }
                      className="text-[10px] shrink-0"
                    >
                      {deadline.status}
                    </Badge>
                  </motion.div>
                ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Tip + Quick Actions */}
        <motion.div variants={staggerItem} className="lg:col-span-1 space-y-4">
          {/* AI Tip */}
          <Card className="border-primary/15 overflow-hidden">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/3 to-transparent" />
              <CardHeader className="relative pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </div>
                  {mockAiTip.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {mockAiTip.content}
                </p>
                <Button size="sm" variant="outline" className="mt-3 gap-1.5 text-xs">
                  <Brain className="h-3 w-3" />
                  Generate Study Plan
                </Button>
              </CardContent>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Plus, label: 'New Deadline', href: '/deadlines', color: 'text-indigo-500' },
                  { icon: Brain, label: 'AI Study Plan', href: '/deadlines', color: 'text-purple-500' },
                  { icon: Workflow, label: 'Automations', href: '/automations', color: 'text-blue-500' },
                  { icon: Bell, label: 'Reminders', href: '/deadlines', color: 'text-amber-500' },
                ].map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors text-sm"
                  >
                    <action.icon className={cn('h-4 w-4', action.color)} />
                    <span className="text-xs font-medium">{action.label}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Grid: Calendar + Attendance + Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Calendar Preview */}
        <motion.div variants={staggerItem} className="xl:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Calendar Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5">
                {mockCalendarEvents.map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.06 }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    <div
                      className="h-8 w-1 rounded-full shrink-0"
                      style={{ backgroundColor: event.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatDate(event.date)}
                      </p>
                    </div>
                    <Badge
                      variant={event.type === 'exam' ? 'destructive' : 'secondary'}
                      className="text-[10px] shrink-0"
                    >
                      {event.type}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Attendance Risk Widget */}
        <motion.div variants={staggerItem} className="xl:col-span-1">
          <Card className="h-full flex flex-col justify-between">
            <div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Percent className="h-4 w-4 text-primary" />
                    Attendance Risk
                  </CardTitle>
                  <Badge
                    variant={attendanceStats.percentage >= 75 ? 'success' : 'destructive'}
                    className="text-[10px]"
                  >
                    Overall: {attendanceStats.percentage.toFixed(1)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Overall Target Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Overall Target Progress</span>
                    <span className="font-semibold">{attendanceStats.percentage.toFixed(0)}% / 75%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        attendanceStats.percentage >= 75
                          ? 'bg-emerald-500'
                          : attendanceStats.percentage >= 65
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      )}
                      style={{ width: `${Math.min(100, attendanceStats.percentage)}%` }}
                    />
                  </div>
                </div>

                {/* Warnings List */}
                <div className="space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    At-Risk Subjects
                  </p>
                  {attendanceStats.warnings.length === 0 ? (
                    <div className="flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>All subjects have safe attendance (&ge;75%)!</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {attendanceStats.warnings.map((subject) => (
                        <div
                          key={subject.id}
                          className="flex items-start gap-2.5 p-2 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors"
                        >
                          <div className="mt-0.5">
                            {subject.status === 'critical' ? (
                              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                            ) : (
                              <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                              <p className="text-xs font-semibold truncate text-foreground">
                                {subject.subject}
                              </p>
                              <span className={cn('text-[10px] font-bold', subject.status === 'critical' ? 'text-red-500' : 'text-amber-500')}>
                                {subject.pct.toFixed(0)}%
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {subject.classesAttended} of {subject.totalClasses} classes attended
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </div>
            <div className="p-4 pt-0">
              <Link
                href="/attendance"
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl text-xs font-medium h-8 border border-border hover:bg-accent hover:text-accent-foreground transition-all"
              >
                Detailed Attendance Alerter
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={staggerItem} className="xl:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockActivity.map((item, idx) => {
                  const Icon = activityIcons[item.type] || Activity;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + idx * 0.06 }}
                      className="flex items-start gap-3"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/60 mt-0.5">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.action}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {item.description}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                          {formatRelativeTime(item.timestamp)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
