// ============================================================
// CampusFlow — Type Definitions
// All interfaces are API-ready for backend integration
// ============================================================

// ---- Student ----
export interface Student {
  id: string;
  fullName: string;
  branch: string;
  year: number;
  subjects: string[];
  phone: string;
  email: string;
  googleAccount: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentOnboardingData {
  fullName: string;
  branch: string;
  year: string;
  subjects: string[];
  phone: string;
  email: string;
  googleAccount: string;
}

// ---- Deadline ----
export type DeadlinePriority = 'low' | 'medium' | 'high' | 'critical';
export type DeadlineStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';
export type ReminderTime = '24h' | '1h' | '30m' | 'custom';
export type AutomationStatus = 'waiting' | 'scheduled' | 'completed' | 'failed';

export interface Deadline {
  id: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string;
  priority: DeadlinePriority;
  status: DeadlineStatus;
  reminderTime: ReminderTime;
  whatsappReminder: boolean;
  googleCalendar: boolean;
  automationStatus: AutomationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDeadlineData {
  title: string;
  description: string;
  subject: string;
  dueDate: string;
  priority: DeadlinePriority;
  reminderTime: ReminderTime;
  whatsappReminder: boolean;
  googleCalendar: boolean;
}

// ---- Study Plan ----
export interface StudyPlanDay {
  day: string;
  tasks: string[];
  duration: string;
  type: 'reading' | 'practice' | 'revision' | 'assessment';
}

export interface StudyPlan {
  id: string;
  deadlineId: string;
  subject: string;
  days: StudyPlanDay[];
  generatedAt: string;
  aiModel: string;
}

// ---- Automation ----
export type WorkflowStatus = 'pending' | 'running' | 'success' | 'failed';

export interface Automation {
  id: string;
  workflowName: string;
  trigger: string;
  status: WorkflowStatus;
  whatsappStatus: WorkflowStatus;
  calendarStatus: WorkflowStatus;
  executedAt: string;
  deadlineTitle: string;
  subject: string;
  logs: AutomationLog[];
}

export interface AutomationLog {
  id: string;
  timestamp: string;
  action: string;
  status: WorkflowStatus;
  message: string;
}

// ---- Dashboard ----
export interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  type: 'class' | 'lab' | 'assignment' | 'exam' | 'meeting';
  subject: string;
  location?: string;
}

export interface DashboardStats {
  totalDeadlines: number;
  completedDeadlines: number;
  pendingTasks: number;
  upcomingExams: number;
  automationsRun: number;
  studyHoursThisWeek: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  timestamp: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  type: 'deadline' | 'automation' | 'study' | 'calendar';
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  href: string;
  color: string;
}

// ---- Calendar ----
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'deadline' | 'exam' | 'class' | 'reminder';
  color: string;
}

// ---- AI Tip ----
export interface AiTip {
  id: string;
  title: string;
  content: string;
  category: string;
}

// ---- API Response Wrappers ----
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---- View modes ----
export type DeadlineView = 'grid' | 'timeline' | 'calendar';

// ---- Filter/Sort ----
export interface DeadlineFilters {
  status: DeadlineStatus | 'all';
  priority: DeadlinePriority | 'all';
  subject: string | 'all';
  search: string;
}
