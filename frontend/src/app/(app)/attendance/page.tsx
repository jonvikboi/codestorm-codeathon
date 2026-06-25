'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Percent,
  Plus,
  Minus,
  RefreshCw,
  Calendar,
  AlertCircle,
  Pencil,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { useToast } from '@/components/ui/toast';
import { useAsync } from '@/hooks';
import { attendanceService } from '@/services';
import type { SubjectAttendance } from '@/types';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem, cardHover } from '@/lib/animations';

// Helper to determine risk status
const getRiskStatus = (pct: number): 'safe' | 'at-risk' | 'critical' => {
  if (pct >= 75) return 'safe';
  if (pct >= 65) return 'at-risk';
  return 'critical';
};

const getRiskBadgeVariant = (status: 'safe' | 'at-risk' | 'critical'): 'success' | 'warning' | 'destructive' => {
  switch (status) {
    case 'safe':
      return 'success';
    case 'at-risk':
      return 'warning';
    case 'critical':
      return 'destructive';
  }
};

const calculateClassesNeeded = (attended: number, total: number, target: number): number => {
  if (total === 0) return 0;
  const current = attended / total;
  if (current >= target) return 0;
  return Math.ceil((target * total - attended) / (1 - target));
};

export default function AttendancePage() {
  const { toast } = useToast();
  const [attendance, setAttendance] = React.useState<SubjectAttendance[]>([]);
  const [editSubject, setEditSubject] = React.useState<SubjectAttendance | null>(null);
  const [editAttended, setEditAttended] = React.useState<string>('0');
  const [editTotal, setEditTotal] = React.useState<string>('0');
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  // Async data fetching
  const { loading, error, execute: fetchAttendance } = useAsync<SubjectAttendance[]>();

  const loadData = React.useCallback(async () => {
    const res = await fetchAttendance(() => attendanceService.getAll());
    if (res.success) {
      setAttendance(res.data);
    }
  }, [fetchAttendance]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  // Handle Edit modal opening
  const handleOpenEdit = (subject: SubjectAttendance) => {
    setEditSubject(subject);
    setEditAttended(subject.classesAttended.toString());
    setEditTotal(subject.totalClasses.toString());
  };

  // Submit edit form
  const handleSaveEdit = async () => {
    if (!editSubject) return;
    const attendedNum = parseInt(editAttended) || 0;
    const totalNum = parseInt(editTotal) || 0;

    if (attendedNum > totalNum) {
      toast({
        title: 'Validation Error',
        message: 'Attended classes cannot be greater than total classes.',
        type: 'error',
      });
      return;
    }

    const res = await attendanceService.update(editSubject.id, {
      classesAttended: attendedNum,
      totalClasses: totalNum,
    });

    if (res.success) {
      setAttendance((prev) => prev.map((item) => (item.id === editSubject.id ? res.data : item)));
      setEditSubject(null);
      toast({
        title: 'Attendance Updated',
        message: `${editSubject.subject} attendance has been saved.`,
        type: 'success',
      });
    } else {
      toast({
        title: 'Update Failed',
        message: res.message,
        type: 'error',
      });
    }
  };

  // Quick Attend / Miss class actions (Optimistic UI)
  const handleQuickLog = async (id: string, attendedDelta: number, totalDelta: number) => {
    const record = attendance.find((a) => a.id === id);
    if (!record) return;

    const newAttended = Math.max(0, record.classesAttended + attendedDelta);
    const newTotal = Math.max(newAttended, record.totalClasses + totalDelta);

    setUpdatingId(id);
    const res = await attendanceService.update(id, {
      classesAttended: newAttended,
      totalClasses: newTotal,
    });
    setUpdatingId(null);

    if (res.success) {
      setAttendance((prev) => prev.map((item) => (item.id === id ? res.data : item)));
      // Success notification with n8n trigger simulation message
      toast({
        title: 'Attendance Logged',
        message: `${record.subject} attendance modified! n8n automated warning check triggered.`,
        type: 'success',
      });
    } else {
      toast({
        title: 'Logging Failed',
        message: res.message,
        type: 'error',
      });
    }
  };

  // Calculate Overall Statistics
  const overallStats = React.useMemo(() => {
    if (attendance.length === 0) {
      return { percentage: 0, attended: 0, total: 0, safe: 0, atRisk: 0, critical: 0 };
    }
    const attended = attendance.reduce((sum, item) => sum + item.classesAttended, 0);
    const total = attendance.reduce((sum, item) => sum + item.totalClasses, 0);
    const percentage = total > 0 ? (attended / total) * 100 : 0;

    let safe = 0;
    let atRisk = 0;
    let critical = 0;

    attendance.forEach((item) => {
      const pct = item.totalClasses > 0 ? (item.classesAttended / item.totalClasses) * 100 : 0;
      const status = getRiskStatus(pct);
      if (status === 'safe') safe++;
      else if (status === 'at-risk') atRisk++;
      else critical++;
    });

    return { percentage, attended, total, safe, atRisk, critical };
  }, [attendance]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6 max-w-[1400px] mx-auto"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Percent className="h-6 w-6 text-primary" />
            Attendance Risk Alerter
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor and track your subject-wise class attendance requirements.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="gap-2 self-start sm:self-auto">
          <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          Refresh
        </Button>
      </motion.div>

      {/* Skeletons when loading */}
      {loading && attendance.length === 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="h-[100px]">
                <CardContent className="p-5 flex flex-col justify-between h-full">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-7 w-12" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-[250px]">
                <CardContent className="p-5 space-y-4">
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="space-y-2 pt-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : error && attendance.length === 0 ? (
        <ErrorState
          title="Failed to load attendance"
          message={error}
          onRetry={loadData}
        />
      ) : (
        <>
          {/* Statistics Grid */}
          <motion.div variants={staggerItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Overall Card */}
            <Card className="relative overflow-hidden border-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/3 to-transparent" />
              <CardContent className="p-5 relative flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Overall Attendance</p>
                  <p className="text-2xl font-bold mt-1">
                    {overallStats.percentage.toFixed(1)}%
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {overallStats.attended} of {overallStats.total} classes attended
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            {/* Safe Card */}
            <Card className="border-emerald-500/10">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Safe Subjects (&ge;75%)</p>
                  <p className="text-2xl font-bold mt-1 text-emerald-500">
                    {overallStats.safe}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Meeting the required criteria
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            {/* At Risk Card */}
            <Card className="border-amber-500/10">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">At Risk (65% - 75%)</p>
                  <p className="text-2xl font-bold mt-1 text-amber-500">
                    {overallStats.atRisk}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Borderline attendance status
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <AlertCircle className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            {/* Critical Card */}
            <Card className="border-red-500/10">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Critical (&lt;65%)</p>
                  <p className="text-2xl font-bold mt-1 text-red-500">
                    {overallStats.critical}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Requires immediate improvement
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Subjects Grid */}
          <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {attendance.map((item, idx) => {
              const pct = item.totalClasses > 0 ? (item.classesAttended / item.totalClasses) * 100 : 0;
              const status = getRiskStatus(pct);
              const classesNeeded75 = calculateClassesNeeded(item.classesAttended, item.totalClasses, 0.75);
              const classesNeeded80 = calculateClassesNeeded(item.classesAttended, item.totalClasses, 0.80);
              const classesNeeded85 = calculateClassesNeeded(item.classesAttended, item.totalClasses, 0.85);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  {...cardHover}
                >
                  <Card className="group h-full flex flex-col hover:border-primary/20 transition-all duration-300">
                    <CardContent className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Title Row */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                            {item.subject}
                          </h3>
                          <Badge variant={getRiskBadgeVariant(status)} className="shrink-0 text-[10px] tracking-wide uppercase font-bold">
                            {status === 'safe' ? 'Safe' : status === 'at-risk' ? 'At Risk' : 'Critical'}
                          </Badge>
                        </div>

                        {/* Circular Progress & Info Row */}
                        <div className="flex items-center gap-4 mb-4">
                          {/* Percentage Progress Bar & Details */}
                          <div className="flex-1">
                            <div className="flex justify-between items-baseline mb-1">
                              <span className="text-2xl font-bold tracking-tight">
                                {pct.toFixed(1)}%
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {item.classesAttended} / {item.totalClasses} classes
                              </span>
                            </div>
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full transition-all duration-500 rounded-full',
                                  status === 'safe'
                                    ? 'bg-emerald-500'
                                    : status === 'at-risk'
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                                )}
                                style={{ width: `${Math.min(100, pct)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Calculations needed list */}
                        <div className="space-y-2 border-t border-border/50 pt-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Classes needed for 75%:</span>
                            {classesNeeded75 === 0 ? (
                              <span className="text-emerald-500 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Safe
                              </span>
                            ) : (
                              <span className="text-foreground font-semibold">
                                Attend {classesNeeded75} more
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Classes needed for 80%:</span>
                            {classesNeeded80 === 0 ? (
                              <span className="text-emerald-500 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Safe
                              </span>
                            ) : (
                              <span className="text-foreground font-semibold">
                                Attend {classesNeeded80} more
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Classes needed for 85%:</span>
                            {classesNeeded85 === 0 ? (
                              <span className="text-emerald-500 font-semibold flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Safe
                              </span>
                            ) : (
                              <span className="text-foreground font-semibold">
                                Attend {classesNeeded85} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick Adjustments */}
                      <div className="flex gap-2 mt-4 border-t border-border/50 pt-3.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-[11px] gap-1.5 h-8 hover:bg-emerald-500/10 hover:text-emerald-500"
                          onClick={() => handleQuickLog(item.id, 1, 1)}
                          disabled={updatingId === item.id}
                        >
                          <Plus className="h-3.5 w-3.5" /> Attended
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-[11px] gap-1.5 h-8 hover:bg-red-500/10 hover:text-red-500"
                          onClick={() => handleQuickLog(item.id, 0, 1)}
                          disabled={updatingId === item.id}
                        >
                          <Minus className="h-3.5 w-3.5" /> Missed
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => handleOpenEdit(item)}
                          aria-label="Edit attendance count"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Weekly Attendance Preview Widget */}
          <motion.div variants={staggerItem}>
            <Card className="overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm font-semibold">Weekly Attendance Preview & Alerter</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border/50 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        <th className="px-5 py-3.5">Subject</th>
                        <th className="px-5 py-3.5">Mon</th>
                        <th className="px-5 py-3.5">Tue</th>
                        <th className="px-5 py-3.5">Wed</th>
                        <th className="px-5 py-3.5">Thu</th>
                        <th className="px-5 py-3.5">Fri</th>
                        <th className="px-5 py-3.5 text-right">Weekly Attendance Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {attendance.map((item) => {
                        const pct = item.totalClasses > 0 ? (item.classesAttended / item.totalClasses) * 100 : 0;
                        const status = getRiskStatus(pct);
                        return (
                          <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                            <td className="px-5 py-4 font-medium">{item.subject}</td>
                            <td className="px-5 py-4">
                              <Badge variant="success" className="text-[9px] px-1.5 py-0.5">Attended</Badge>
                            </td>
                            <td className="px-5 py-4">
                              <Badge variant="success" className="text-[9px] px-1.5 py-0.5">Attended</Badge>
                            </td>
                            <td className="px-5 py-4">
                              {status === 'critical' ? (
                                <Badge variant="destructive" className="text-[9px] px-1.5 py-0.5">Missed</Badge>
                              ) : (
                                <Badge variant="success" className="text-[9px] px-1.5 py-0.5">Attended</Badge>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <Badge variant="success" className="text-[9px] px-1.5 py-0.5">Attended</Badge>
                            </td>
                            <td className="px-5 py-4">
                              {status === 'safe' ? (
                                <Badge variant="success" className="text-[9px] px-1.5 py-0.5">Attended</Badge>
                              ) : (
                                <Badge variant="destructive" className="text-[9px] px-1.5 py-0.5">Missed</Badge>
                              )}
                            </td>
                            <td className="px-5 py-4 text-right">
                              {status === 'safe' ? (
                                <span className="text-xs font-semibold text-emerald-500 flex items-center justify-end gap-1">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> High Attendance
                                </span>
                              ) : status === 'at-risk' ? (
                                <span className="text-xs font-semibold text-amber-500 flex items-center justify-end gap-1">
                                  <AlertCircle className="h-3.5 w-3.5" /> At Risk Alert
                                </span>
                              ) : (
                                <span className="text-xs font-semibold text-red-500 flex items-center justify-end gap-1">
                                  <AlertTriangle className="h-3.5 w-3.5 animate-bounce" /> Critical warning sent
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {/* Edit Dialog */}
      <AnimatePresence>
        {editSubject && (
          <Dialog open={!!editSubject} onClose={() => setEditSubject(null)}>
            <DialogClose onClose={() => setEditSubject(null)} />
            <DialogHeader>
              <DialogTitle>Edit Attendance</DialogTitle>
              <DialogDescription>
                Modify class attendance details for <strong>{editSubject.subject}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2 mt-2">
              <div>
                <Label htmlFor="edit-attended">Classes Attended</Label>
                <Input
                  id="edit-attended"
                  type="number"
                  min="0"
                  value={editAttended}
                  onChange={(e) => setEditAttended(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="edit-total">Total Classes</Label>
                <Input
                  id="edit-total"
                  type="number"
                  min="0"
                  value={editTotal}
                  onChange={(e) => setEditTotal(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditSubject(null)}>Cancel</Button>
              <Button variant="gradient" onClick={handleSaveEdit}>Save Attendance</Button>
            </DialogFooter>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
