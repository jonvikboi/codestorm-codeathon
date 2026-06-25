'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CalendarClock,
  CheckCircle2,
  Clock,
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
  Crown,
  Cloud,
  Cpu,
  Database,
  Layers,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  mockStudent,
  mockSchedule,
  mockStats,
  mockDeadlines,
  mockActivity,
  mockAiTip,
  mockAttendance,
} from '@/lib/mock-data';
import { cn, formatRelativeTime } from '@/lib/utils';
import { staggerContainer, staggerItem, cardHover } from '@/lib/animations';

// Subject configurations with icon and theme colors from the warm and refreshing design
const subjectThemes: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  'Machine Learning': { icon: Brain, color: '#0d9488', bg: 'bg-[#0d9488]/10 text-[#0d9488]' },
  'Cloud Computing': { icon: Cloud, color: '#10b981', bg: 'bg-[#10b981]/10 text-[#10b981]' },
  'Operating Systems': { icon: Cpu, color: '#e05a47', bg: 'bg-[#e05a47]/10 text-[#e05a47]' },
  'Database Management Systems': { icon: Database, color: '#f59e0b', bg: 'bg-[#f59e0b]/10 text-[#f59e0b]' },
  'Artificial Intelligence': { icon: Sparkles, color: '#ea580c', bg: 'bg-[#ea580c]/10 text-[#ea580c]' },
  'Computer Networks': { icon: Layers, color: '#0ea5e9', bg: 'bg-[#0ea5e9]/10 text-[#0ea5e9]' },
  'Software Engineering': { icon: BookOpen, color: '#b45309', bg: 'bg-[#b45309]/10 text-[#b45309]' },
};

// Weekly activity mock data
const weeklyActivity = [
  { day: 'Mon', target: 3.5, completed: 2.8 },
  { day: 'Tue', target: 3.5, completed: 3.8 },
  { day: 'Wed', target: 4.0, completed: 4.2 },
  { day: 'Thu', target: 3.0, completed: 2.0 },
  { day: 'Fri', target: 4.5, completed: 5.0 },
  { day: 'Sat', target: 2.0, completed: 1.5 },
  { day: 'Sun', target: 2.0, completed: 2.5 },
];

// Leaderboard mock data (inspired by the right-hand panel of the Dribbble design)
const leaderboardData = [
  { rank: 1, name: 'Shray Mathur', xp: '1,240 XP', avatar: 'SM', isCurrentUser: true, crown: true },
  { rank: 2, name: 'Lucy Yernal', xp: '1,180 XP', avatar: 'LY' },
  { rank: 3, name: 'Vikram Singh', xp: '950 XP', avatar: 'VS' },
  { rank: 4, name: 'Anya Sharma', xp: '880 XP', avatar: 'AS' },
];

export default function DashboardPage() {
  const firstName = mockStudent.fullName.split(' ')[0];

  // Attendance calculations
  const attendanceStats = React.useMemo(() => {
    const attended = mockAttendance.reduce((sum, item) => sum + item.classesAttended, 0);
    const total = mockAttendance.reduce((sum, item) => sum + item.totalClasses, 0);
    const percentage = total > 0 ? (attended / total) * 100 : 0;
    
    // Find critical / at-risk subjects (attendance < 75%)
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
      .slice(0, 2);
      
    return { percentage, warnings, attended, total };
  }, []);

  // Compute stroke dash offset for circular progress (radius = 40, circumference = 251.2)
  const strokeDashoffset = 251.2 - (251.2 * attendanceStats.percentage) / 100;

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Hero Welcome Banner (Dribbble styled) */}
      <motion.div variants={staggerItem}>
        <div className="relative rounded-[28px] overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/10 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-md relative z-10">
            <Badge variant="default" className="mb-4 bg-primary/15 text-primary border-primary/10 rounded-full font-bold px-3 py-1 text-[11px] tracking-wide uppercase">
              ✨ Welcome Back
            </Badge>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight tracking-tight mb-2">
              Let&apos;s Start Your Productive Day, {firstName}!
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-medium">
              You have <span className="text-foreground font-bold">{mockStats.pendingTasks} pending tasks</span> and <span className="text-primary font-bold">{mockStats.upcomingExams} upcoming exams</span> this week. Let&apos;s keep up the momentum!
            </p>
            <div className="flex gap-3">
              <Link
                href="/deadlines"
                className="inline-flex items-center justify-center gap-2 rounded-xl text-xs font-bold h-10 px-5 bg-primary text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-[0.98]"
              >
                Explore Deadlines
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* QR Code Container (inspired by Dribbble's "Get news on your phone" module) */}
          <div className="bg-card rounded-2xl p-4 border border-border/40 flex items-center gap-4 max-w-sm shadow-sm relative shrink-0">
            <div className="h-16 w-16 bg-[#1b1d28]/5 rounded-xl flex items-center justify-center p-1.5 shrink-0 dark:bg-white/5 border border-border/30">
              <svg className="w-full h-full text-foreground" viewBox="0 0 100 100" fill="currentColor">
                <rect x="0" y="0" width="30" height="30" />
                <rect x="10" y="10" width="10" height="10" fill="white" />
                <rect x="70" y="0" width="30" height="30" />
                <rect x="80" y="10" width="10" height="10" fill="white" />
                <rect x="0" y="70" width="30" height="30" />
                <rect x="10" y="80" width="10" height="10" fill="white" />
                <rect x="40" y="40" width="20" height="20" />
                <rect x="50" y="50" width="5" height="5" fill="white" />
                <rect x="40" y="70" width="10" height="10" />
                <rect x="60" y="80" width="15" height="10" />
                <rect x="85" y="75" width="15" height="15" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-xs font-bold text-foreground">Sync WhatsApp Alerts</h4>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Scan this QR code with your phone to receive live calendar and deadline updates directly on WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Grid: 3-column Layout structure (Center panel took 2 cols, Right panel took 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Center Column (Takes 2 Columns of Width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Dashboard Quick Stats */}
          <motion.div variants={staggerItem} className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Study Hours', value: `${mockStats.studyHoursThisWeek}h`, icon: TrendingUp, color: 'text-teal-600 dark:text-teal-400', trend: '+2.4h this week' },
              { label: 'Completed Tasks', value: mockStats.completedDeadlines, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', trend: '85% success rate' },
              { label: 'Automations Run', value: mockStats.automationsRun, icon: Zap, color: 'text-orange-500 dark:text-orange-400', trend: 'Auto-sync active' },
            ].map((stat) => (
              <Card key={stat.label} className="hover:border-primary/20 transition-colors shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-muted-foreground">{stat.label}</span>
                    <div className="p-2 rounded-xl bg-secondary/50">
                      <stat.icon className={cn('h-4 w-4', stat.color)} />
                    </div>
                  </div>
                  <p className="text-2xl font-extrabold text-foreground leading-none">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">{stat.trend}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Weekly Activity Double Bar Chart */}
          <motion.div variants={staggerItem}>
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b border-border/30">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">Weekly study activity</CardTitle>
                    <CardDescription className="text-xs mt-0.5">Comparing target study hours vs. actual completed hours</CardDescription>
                  </div>
                  <div className="flex gap-4 text-xs font-bold select-none">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
                      Target
                    </span>
                    <span className="flex items-center gap-1.5 text-primary">
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                      Completed
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex justify-between items-end h-48 pt-4">
                  {weeklyActivity.map((d) => {
                    const maxVal = 6.0;
                    const targetHeight = `${(d.target / maxVal) * 100}%`;
                    const completedHeight = `${(d.completed / maxVal) * 100}%`;
                    return (
                      <div key={d.day} className="flex flex-col items-center gap-2 group flex-1 h-full">
                        <div className="flex items-end justify-center gap-1.5 h-[90%] w-full relative">
                          {/* Target Bar */}
                          <div
                            className="w-2.5 bg-secondary hover:bg-secondary/80 rounded-full transition-all duration-300 relative group-hover:scale-y-105 origin-bottom cursor-help"
                            style={{ height: targetHeight }}
                            title={`Target: ${d.target}h`}
                          />
                          {/* Completed Bar */}
                          <div
                            className="w-2.5 bg-primary hover:opacity-90 rounded-full transition-all duration-300 relative group-hover:scale-y-105 origin-bottom shadow-[0_4px_10px_rgba(231,111,81,0.2)] cursor-help"
                            style={{ height: completedHeight }}
                            title={`Completed: ${d.completed}h`}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground font-bold mt-1">{d.day}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Deadlines & Tasks (Styled like "Your Courses" list in Dribbble) */}
          <motion.div variants={staggerItem}>
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b border-border/30 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground">Active Deadlines</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Tasks synced to WhatsApp and Google Calendar</CardDescription>
                </div>
                <Link
                  href="/deadlines"
                  className="inline-flex items-center gap-1 rounded-xl text-xs font-bold text-primary hover:underline"
                >
                  View all
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-border/30">
                {mockDeadlines
                  .filter((d) => d.status !== 'completed')
                  .slice(0, 4)
                  .map((deadline) => {
                    const theme = subjectThemes[deadline.subject] || {
                      icon: BookOpen,
                      color: '#6b7280',
                      bg: 'bg-gray-500/10 text-gray-500',
                    };
                    const IconComponent = theme.icon;

                    // calculate mock progress percentage for visual layout
                    let progress = 15;
                    if (deadline.status === 'in-progress') progress = 60;
                    if (deadline.status === 'overdue') progress = 5;

                    return (
                      <div
                        key={deadline.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Subject icon box (Dribbble styled category box) */}
                          <div className={cn('h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-black/5 dark:border-white/5', theme.bg)}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                              {deadline.title.split('—')[0].trim()}
                            </h4>
                            <p className="text-[11px] text-muted-foreground font-medium mt-0.5 flex items-center gap-2">
                              <span>{deadline.subject}</span>
                              <span>·</span>
                              <span>{formatRelativeTime(deadline.dueDate)}</span>
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar (Dribbble styled) */}
                        <div className="flex items-center gap-5 justify-between sm:justify-end">
                          <div className="w-28 space-y-1 hidden sm:block">
                            <div className="flex justify-between text-[10px] text-muted-foreground font-bold">
                              <span>Progress</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${progress}%`, backgroundColor: theme.color }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <Badge
                              variant={
                                deadline.priority === 'critical'
                                  ? 'destructive'
                                  : deadline.priority === 'high'
                                  ? 'warning'
                                  : deadline.priority === 'medium'
                                  ? 'default'
                                  : 'info'
                              }
                              className="text-[10px] font-bold rounded-full px-2.5 py-0.5 shrink-0"
                            >
                              {deadline.priority}
                            </Badge>
                            
                            {deadline.whatsappReminder && (
                              <Badge className="bg-emerald-500/10 text-emerald-600 border-none rounded-full px-2 py-0.5 text-[9px] font-bold flex items-center gap-0.5">
                                <Zap className="h-2.5 w-2.5 fill-emerald-600" /> WA
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          </motion.div>

        </div>

        {/* Right Column: Activity, Gamification, and AI widgets */}
        <div className="space-y-6">
          
          {/* Daily Attendance Progress (Dribbble styled split layout & mini rings) */}
          <motion.div variants={staggerItem}>
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b border-border/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Percent className="h-4 w-4 text-primary" />
                    Attendance Tracker
                  </CardTitle>
                  <Badge
                    variant={attendanceStats.percentage >= 75 ? 'success' : 'destructive'}
                    className="text-[10px] font-bold rounded-full"
                  >
                    {attendanceStats.percentage.toFixed(1)}% Overall
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="flex items-center gap-5 py-2">
                  {/* Left: Overall Ring */}
                  <div className="relative h-24 w-24 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-secondary fill-transparent"
                        strokeWidth="9"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-primary fill-transparent transition-all duration-500 ease-out"
                        strokeWidth="9"
                        strokeDasharray="251.2"
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-xl font-black text-foreground">
                        {attendanceStats.percentage.toFixed(0)}%
                      </span>
                      <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">
                        Attended
                      </span>
                    </div>
                  </div>

                  {/* Right: Breakdown details */}
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="text-xs">
                      <p className="text-muted-foreground font-bold">Total classes</p>
                      <p className="font-extrabold text-foreground text-sm mt-0.5">
                        {attendanceStats.attended} / {attendanceStats.total}
                      </p>
                    </div>
                    <div className="text-xs">
                      <p className="text-muted-foreground font-bold">Target status</p>
                      <p className={cn(
                        'font-extrabold text-xs mt-0.5 flex items-center gap-1',
                        attendanceStats.percentage >= 75 ? 'text-emerald-500' : 'text-primary'
                      )}>
                        {attendanceStats.percentage >= 75 ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Safe zone
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3.5 w-3.5 text-primary animate-pulse" /> At-risk (75% min)
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subtitle / Label */}
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-4 mb-2 select-none">
                  Core Subjects Attendance
                </div>

                {/* Concentric-like mini progress rings (Dribbble styled side-by-side gauges) */}
                <div className="grid grid-cols-3 gap-2 w-full pt-3 border-t border-border/40">
                  {/* Gauge 1: Machine Learning */}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative h-14 w-14 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
                        <circle cx="30" cy="30" r="23" className="stroke-secondary fill-transparent" strokeWidth="4.5" />
                        <circle
                          cx="30"
                          cy="30"
                          r="23"
                          className="stroke-primary fill-transparent transition-all duration-500 ease-out"
                          strokeWidth="4.5"
                          strokeDasharray="144.5"
                          strokeDashoffset={144.5 - (144.5 * 72) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-[10px] font-extrabold text-foreground">72%</span>
                    </div>
                    <span className="text-[10px] font-bold text-foreground mt-1 truncate w-full">ML</span>
                    <span className="text-[8px] text-primary font-bold mt-0.5">At-risk</span>
                  </div>

                  {/* Gauge 2: Cloud Computing */}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative h-14 w-14 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
                        <circle cx="30" cy="30" r="23" className="stroke-secondary fill-transparent" strokeWidth="4.5" />
                        <circle
                          cx="30"
                          cy="30"
                          r="23"
                          className="stroke-emerald-500 fill-transparent transition-all duration-500 ease-out"
                          strokeWidth="4.5"
                          strokeDasharray="144.5"
                          strokeDashoffset={144.5 - (144.5 * 88) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-[10px] font-extrabold text-foreground">88%</span>
                    </div>
                    <span className="text-[10px] font-bold text-foreground mt-1 truncate w-full">Cloud</span>
                    <span className="text-[8px] text-emerald-500 font-bold mt-0.5">Safe</span>
                  </div>

                  {/* Gauge 3: Operating Systems */}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative h-14 w-14 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 60 60">
                        <circle cx="30" cy="30" r="23" className="stroke-secondary fill-transparent" strokeWidth="4.5" />
                        <circle
                          cx="30"
                          cy="30"
                          r="23"
                          className="stroke-red-500 fill-transparent transition-all duration-500 ease-out"
                          strokeWidth="4.5"
                          strokeDasharray="144.5"
                          strokeDashoffset={144.5 - (144.5 * 58) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-[10px] font-extrabold text-foreground">58%</span>
                    </div>
                    <span className="text-[10px] font-bold text-foreground mt-1 truncate w-full">OS</span>
                    <span className="text-[8px] text-red-500 font-bold mt-0.5">Critical</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Classes List */}
          <motion.div variants={staggerItem}>
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b border-border/30">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Today&apos;s Classes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {mockSchedule.slice(0, 3).map((item, idx) => {
                  const theme = subjectThemes[item.subject] || { color: '#2b5bff' };
                  return (
                    <div key={item.id} className="flex items-start gap-3.5 group p-1.5 rounded-xl hover:bg-muted/40 transition-all duration-200">
                      <div className="flex flex-col items-center">
                        <div
                          className="h-2.5 w-2.5 rounded-full mt-1.5"
                          style={{ backgroundColor: theme.color }}
                        />
                        {idx < 2 && <div className="w-px h-10 bg-border mt-1.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {item.title}
                        </p>
                        <div className="flex items-center gap-2.5 mt-0.5 text-[10px] text-muted-foreground font-semibold">
                          <span>{item.time}</span>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-2.5 w-2.5" />
                            {item.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>

          {/* Gamified Peer Leaderboard (Dribbble styled right panel) */}
          <motion.div variants={staggerItem}>
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b border-border/30">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-500" />
                  Class Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3.5">
                {leaderboardData.map((user) => (
                  <div
                    key={user.rank}
                    className={cn(
                      'flex items-center justify-between p-2 rounded-xl transition-all',
                      user.isCurrentUser ? 'bg-primary/[0.03] border border-primary/10' : 'hover:bg-muted/30'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Rank / Crown */}
                      <div className="w-5 flex justify-center shrink-0">
                        {user.crown ? (
                          <Crown className="h-4 w-4 text-amber-500 fill-amber-500/30" />
                        ) : (
                          <span className="text-xs font-extrabold text-muted-foreground">#{user.rank}</span>
                        )}
                      </div>
                      
                      {/* Avatar */}
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 border border-primary/5 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {user.avatar}
                      </div>

                      <div className="min-w-0">
                        <p className={cn('text-xs truncate', user.isCurrentUser ? 'font-bold text-foreground' : 'font-semibold text-muted-foreground')}>
                          {user.name}
                        </p>
                      </div>
                    </div>

                    {/* Score Capsule */}
                    <div className="shrink-0">
                      <span className="inline-flex bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] rounded-full px-2.5 py-0.5">
                        {user.xp}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Productivity tips card */}
          <motion.div variants={staggerItem}>
            <Card className="border-primary/15 overflow-hidden shadow-sm relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </div>
                  {mockAiTip.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                  {mockAiTip.content}
                </p>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="gradient" className="w-full gap-1.5 text-xs font-bold h-9">
                    <Brain className="h-3.5 w-3.5" />
                    AI Study Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
