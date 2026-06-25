// ============================================================
// CampusFlow — Mock Data
// Realistic student data for demonstration
// ============================================================

import type {
  Deadline,
  ScheduleItem,
  DashboardStats,
  Notification,
  ActivityItem,
  Automation,
  StudyPlan,
  AiTip,
  CalendarEvent,
  Student,
} from '@/types';

// ---- Current Student ----
export const mockStudent: Student = {
  id: 'stu-001',
  fullName: 'Shray Mathur',
  branch: 'Computer Science & Engineering',
  year: 3,
  subjects: [
    'Machine Learning',
    'Cloud Computing',
    'Operating Systems',
    'Database Management Systems',
    'Artificial Intelligence',
    'Computer Networks',
  ],
  phone: '+91 98765 43210',
  email: 'shray.mathur@university.edu',
  googleAccount: 'shray.mathur@gmail.com',
  avatarUrl: undefined,
  createdAt: '2026-01-15T10:00:00Z',
  updatedAt: '2026-06-25T04:00:00Z',
};

// ---- Deadlines ----
export const mockDeadlines: Deadline[] = [
  {
    id: 'dl-001',
    title: 'Machine Learning Assignment — CNN Implementation',
    description: 'Implement a Convolutional Neural Network for image classification using PyTorch. Include training pipeline, evaluation metrics, and a brief report.',
    subject: 'Machine Learning',
    dueDate: '2026-06-28T23:59:00Z',
    priority: 'critical',
    status: 'in-progress',
    reminderTime: '24h',
    whatsappReminder: true,
    googleCalendar: true,
    automationStatus: 'scheduled',
    createdAt: '2026-06-20T10:00:00Z',
    updatedAt: '2026-06-25T03:00:00Z',
  },
  {
    id: 'dl-002',
    title: 'Cloud Computing Project — AWS Deployment',
    description: 'Deploy a three-tier web application on AWS using EC2, RDS, and S3. Configure auto-scaling and load balancing. Submit architecture diagram.',
    subject: 'Cloud Computing',
    dueDate: '2026-06-30T17:00:00Z',
    priority: 'high',
    status: 'pending',
    reminderTime: '24h',
    whatsappReminder: true,
    googleCalendar: true,
    automationStatus: 'waiting',
    createdAt: '2026-06-18T14:00:00Z',
    updatedAt: '2026-06-24T09:00:00Z',
  },
  {
    id: 'dl-003',
    title: 'Operating Systems Quiz — Process Scheduling',
    description: 'Online quiz covering FCFS, SJF, Round Robin, and Priority scheduling algorithms. Duration: 30 minutes.',
    subject: 'Operating Systems',
    dueDate: '2026-06-27T10:00:00Z',
    priority: 'high',
    status: 'pending',
    reminderTime: '1h',
    whatsappReminder: true,
    googleCalendar: false,
    automationStatus: 'scheduled',
    createdAt: '2026-06-22T08:00:00Z',
    updatedAt: '2026-06-25T01:00:00Z',
  },
  {
    id: 'dl-004',
    title: 'DBMS Lab — Normalization & SQL Queries',
    description: 'Complete the normalization exercise (1NF to BCNF) and write complex SQL queries for the university database schema.',
    subject: 'Database Management Systems',
    dueDate: '2026-06-26T16:00:00Z',
    priority: 'medium',
    status: 'in-progress',
    reminderTime: '24h',
    whatsappReminder: false,
    googleCalendar: true,
    automationStatus: 'completed',
    createdAt: '2026-06-19T11:00:00Z',
    updatedAt: '2026-06-25T02:00:00Z',
  },
  {
    id: 'dl-005',
    title: 'AI Presentation — Reinforcement Learning',
    description: 'Prepare a 15-minute presentation on Reinforcement Learning covering Q-Learning, Policy Gradient, and real-world applications.',
    subject: 'Artificial Intelligence',
    dueDate: '2026-07-02T09:00:00Z',
    priority: 'medium',
    status: 'pending',
    reminderTime: '24h',
    whatsappReminder: true,
    googleCalendar: true,
    automationStatus: 'waiting',
    createdAt: '2026-06-21T16:00:00Z',
    updatedAt: '2026-06-24T10:00:00Z',
  },
  {
    id: 'dl-006',
    title: 'Computer Networks Assignment — TCP/IP Analysis',
    description: 'Capture and analyze TCP/IP packets using Wireshark. Write a detailed report on the three-way handshake and congestion control.',
    subject: 'Computer Networks',
    dueDate: '2026-07-01T23:59:00Z',
    priority: 'low',
    status: 'pending',
    reminderTime: '24h',
    whatsappReminder: false,
    googleCalendar: false,
    automationStatus: 'waiting',
    createdAt: '2026-06-23T09:00:00Z',
    updatedAt: '2026-06-24T15:00:00Z',
  },
  {
    id: 'dl-007',
    title: 'Software Engineering Viva — Design Patterns',
    description: 'Viva voce on Creational, Structural, and Behavioral design patterns with real-world code examples.',
    subject: 'Software Engineering',
    dueDate: '2026-06-25T14:00:00Z',
    priority: 'critical',
    status: 'overdue',
    reminderTime: '1h',
    whatsappReminder: true,
    googleCalendar: true,
    automationStatus: 'completed',
    createdAt: '2026-06-17T10:00:00Z',
    updatedAt: '2026-06-25T04:00:00Z',
  },
];

// ---- Today's Schedule ----
export const mockSchedule: ScheduleItem[] = [
  {
    id: 'sch-001',
    title: 'Machine Learning Lecture',
    time: '09:00 AM',
    type: 'class',
    subject: 'Machine Learning',
    location: 'Room 301',
  },
  {
    id: 'sch-002',
    title: 'DBMS Lab',
    time: '11:00 AM',
    type: 'lab',
    subject: 'Database Management Systems',
    location: 'Lab 204',
  },
  {
    id: 'sch-003',
    title: 'OS Quiz Prep — Study Group',
    time: '02:00 PM',
    type: 'meeting',
    subject: 'Operating Systems',
    location: 'Library',
  },
  {
    id: 'sch-004',
    title: 'Cloud Computing Lecture',
    time: '04:00 PM',
    type: 'class',
    subject: 'Cloud Computing',
    location: 'Room 105',
  },
];

// ---- Dashboard Stats ----
export const mockStats: DashboardStats = {
  totalDeadlines: 7,
  completedDeadlines: 1,
  pendingTasks: 5,
  upcomingExams: 2,
  automationsRun: 12,
  studyHoursThisWeek: 18,
};

// ---- Notifications ----
export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    title: 'Deadline Approaching',
    message: 'DBMS Lab submission is due tomorrow at 4:00 PM',
    type: 'warning',
    read: false,
    timestamp: '2026-06-25T03:30:00Z',
  },
  {
    id: 'notif-002',
    title: 'Study Plan Generated',
    message: 'AI has created a study plan for your OS Quiz preparation',
    type: 'success',
    read: false,
    timestamp: '2026-06-25T02:00:00Z',
  },
  {
    id: 'notif-003',
    title: 'WhatsApp Reminder Sent',
    message: 'Reminder for ML Assignment sent to your WhatsApp',
    type: 'info',
    read: true,
    timestamp: '2026-06-24T20:00:00Z',
  },
  {
    id: 'notif-004',
    title: 'Calendar Event Created',
    message: 'Cloud Computing Project deadline added to Google Calendar',
    type: 'success',
    read: true,
    timestamp: '2026-06-24T14:00:00Z',
  },
  {
    id: 'notif-005',
    title: 'Overdue Alert',
    message: 'Software Engineering Viva was due today — mark as completed?',
    type: 'error',
    read: false,
    timestamp: '2026-06-25T04:00:00Z',
  },
];

// ---- Recent Activity ----
export const mockActivity: ActivityItem[] = [
  {
    id: 'act-001',
    action: 'Deadline Created',
    description: 'Added "Computer Networks Assignment" with 24h reminder',
    timestamp: '2026-06-24T15:00:00Z',
    type: 'deadline',
  },
  {
    id: 'act-002',
    action: 'Automation Triggered',
    description: 'WhatsApp reminder sent for ML Assignment',
    timestamp: '2026-06-24T20:00:00Z',
    type: 'automation',
  },
  {
    id: 'act-003',
    action: 'Study Plan Generated',
    description: 'AI created 5-day study plan for Operating Systems Quiz',
    timestamp: '2026-06-25T02:00:00Z',
    type: 'study',
  },
  {
    id: 'act-004',
    action: 'Calendar Synced',
    description: 'Cloud Computing Project added to Google Calendar',
    timestamp: '2026-06-24T14:00:00Z',
    type: 'calendar',
  },
  {
    id: 'act-005',
    action: 'Deadline Updated',
    description: 'DBMS Lab status changed to In Progress',
    timestamp: '2026-06-25T02:30:00Z',
    type: 'deadline',
  },
];

// ---- Automations ----
export const mockAutomations: Automation[] = [
  {
    id: 'auto-001',
    workflowName: 'ML Assignment Reminder Pipeline',
    trigger: 'Scheduled — 24h before deadline',
    status: 'success',
    whatsappStatus: 'success',
    calendarStatus: 'success',
    executedAt: '2026-06-24T20:00:00Z',
    deadlineTitle: 'Machine Learning Assignment — CNN Implementation',
    subject: 'Machine Learning',
    logs: [
      { id: 'log-001', timestamp: '2026-06-24T20:00:00Z', action: 'Workflow started', status: 'running', message: 'Triggered by schedule' },
      { id: 'log-002', timestamp: '2026-06-24T20:00:05Z', action: 'WhatsApp message sent', status: 'success', message: 'Delivered to +91 98765 43210' },
      { id: 'log-003', timestamp: '2026-06-24T20:00:08Z', action: 'Calendar event verified', status: 'success', message: 'Event exists in Google Calendar' },
      { id: 'log-004', timestamp: '2026-06-24T20:00:10Z', action: 'Workflow completed', status: 'success', message: 'All steps executed successfully' },
    ],
  },
  {
    id: 'auto-002',
    workflowName: 'OS Quiz Reminder Pipeline',
    trigger: 'Scheduled — 1h before quiz',
    status: 'pending',
    whatsappStatus: 'pending',
    calendarStatus: 'success',
    executedAt: '2026-06-27T09:00:00Z',
    deadlineTitle: 'Operating Systems Quiz — Process Scheduling',
    subject: 'Operating Systems',
    logs: [
      { id: 'log-005', timestamp: '2026-06-25T08:00:00Z', action: 'Workflow scheduled', status: 'pending', message: 'Will execute on Jun 27, 9:00 AM' },
    ],
  },
  {
    id: 'auto-003',
    workflowName: 'DBMS Lab Reminder Pipeline',
    trigger: 'Scheduled — 24h before deadline',
    status: 'success',
    whatsappStatus: 'failed',
    calendarStatus: 'success',
    executedAt: '2026-06-25T16:00:00Z',
    deadlineTitle: 'DBMS Lab — Normalization & SQL Queries',
    subject: 'Database Management Systems',
    logs: [
      { id: 'log-006', timestamp: '2026-06-25T16:00:00Z', action: 'Workflow started', status: 'running', message: 'Triggered by schedule' },
      { id: 'log-007', timestamp: '2026-06-25T16:00:05Z', action: 'WhatsApp message failed', status: 'failed', message: 'WhatsApp API rate limit exceeded' },
      { id: 'log-008', timestamp: '2026-06-25T16:00:08Z', action: 'Calendar event created', status: 'success', message: 'Added to Google Calendar' },
      { id: 'log-009', timestamp: '2026-06-25T16:00:10Z', action: 'Workflow completed with warnings', status: 'success', message: '1 of 2 integrations succeeded' },
    ],
  },
  {
    id: 'auto-004',
    workflowName: 'AI Presentation Reminder Pipeline',
    trigger: 'Scheduled — 24h before deadline',
    status: 'pending',
    whatsappStatus: 'pending',
    calendarStatus: 'pending',
    executedAt: '2026-07-01T09:00:00Z',
    deadlineTitle: 'AI Presentation — Reinforcement Learning',
    subject: 'Artificial Intelligence',
    logs: [
      { id: 'log-010', timestamp: '2026-06-24T10:00:00Z', action: 'Workflow scheduled', status: 'pending', message: 'Will execute on Jul 1, 9:00 AM' },
    ],
  },
  {
    id: 'auto-005',
    workflowName: 'SE Viva Last-Hour Alert',
    trigger: 'Scheduled — 1h before viva',
    status: 'success',
    whatsappStatus: 'success',
    calendarStatus: 'success',
    executedAt: '2026-06-25T13:00:00Z',
    deadlineTitle: 'Software Engineering Viva — Design Patterns',
    subject: 'Software Engineering',
    logs: [
      { id: 'log-011', timestamp: '2026-06-25T13:00:00Z', action: 'Workflow started', status: 'running', message: 'Triggered by schedule' },
      { id: 'log-012', timestamp: '2026-06-25T13:00:04Z', action: 'WhatsApp message sent', status: 'success', message: 'Urgent reminder delivered' },
      { id: 'log-013', timestamp: '2026-06-25T13:00:06Z', action: 'Calendar notification triggered', status: 'success', message: 'Push notification sent' },
      { id: 'log-014', timestamp: '2026-06-25T13:00:08Z', action: 'Workflow completed', status: 'success', message: 'All steps executed successfully' },
    ],
  },
];

// ---- AI Study Plan ----
export const mockStudyPlan: StudyPlan = {
  id: 'sp-001',
  deadlineId: 'dl-003',
  subject: 'Operating Systems',
  days: [
    {
      day: 'Monday',
      tasks: ['Read Unit 1 — Process Concepts & States', 'Understand PCB and context switching', 'Review lecture slides'],
      duration: '2 hours',
      type: 'reading',
    },
    {
      day: 'Tuesday',
      tasks: ['Solve PYQs on FCFS & SJF algorithms', 'Practice Gantt chart problems', 'Calculate average waiting time'],
      duration: '2.5 hours',
      type: 'practice',
    },
    {
      day: 'Wednesday',
      tasks: ['Revise Round Robin & Priority Scheduling', 'Compare preemptive vs non-preemptive', 'Create summary notes'],
      duration: '1.5 hours',
      type: 'revision',
    },
    {
      day: 'Thursday',
      tasks: ['Practice mock quiz questions', 'Solve 20 MCQs timed', 'Review wrong answers'],
      duration: '2 hours',
      type: 'assessment',
    },
    {
      day: 'Friday',
      tasks: ['Final revision of all scheduling algorithms', 'Quick formula sheet review', 'Relax & stay confident'],
      duration: '1 hour',
      type: 'revision',
    },
  ],
  generatedAt: '2026-06-25T02:00:00Z',
  aiModel: 'Groq — LLaMA 3',
};

// ---- AI Tips ----
export const mockAiTip: AiTip = {
  id: 'tip-001',
  title: '💡 Smart Study Tip',
  content: 'You have 3 deadlines this week. Start with the DBMS Lab (due tomorrow) and use the Pomodoro technique — 25 min focus, 5 min break. Your ML assignment needs the most effort; allocate 3 hours for the CNN implementation.',
  category: 'productivity',
};

// ---- Calendar Events ----
export const mockCalendarEvents: CalendarEvent[] = [
  { id: 'ce-001', title: 'DBMS Lab Due', date: '2026-06-26', type: 'deadline', color: '#eab308' },
  { id: 'ce-002', title: 'OS Quiz', date: '2026-06-27', type: 'exam', color: '#ef4444' },
  { id: 'ce-003', title: 'ML Assignment Due', date: '2026-06-28', type: 'deadline', color: '#ef4444' },
  { id: 'ce-004', title: 'Cloud Project Due', date: '2026-06-30', type: 'deadline', color: '#f97316' },
  { id: 'ce-005', title: 'CN Assignment Due', date: '2026-07-01', type: 'deadline', color: '#22c55e' },
  { id: 'ce-006', title: 'AI Presentation', date: '2026-07-02', type: 'deadline', color: '#eab308' },
];
