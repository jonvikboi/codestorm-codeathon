// ============================================================
// CampusFlow — App Constants
// ============================================================

export const APP_NAME = 'CampusFlow';
export const APP_DESCRIPTION = 'AI-Powered Student Productivity Platform';
export const APP_VERSION = '1.0.0';

export const BRANCHES = [
  'Computer Science & Engineering',
  'Information Technology',
  'Artificial Intelligence & ML',
  'Data Science',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Biotechnology',
  'Chemical Engineering',
] as const;

export const YEARS = [
  { value: '1', label: '1st Year' },
  { value: '2', label: '2nd Year' },
  { value: '3', label: '3rd Year' },
  { value: '4', label: '4th Year' },
] as const;

export const SUBJECTS = [
  'Machine Learning',
  'Cloud Computing',
  'Operating Systems',
  'Database Management Systems',
  'Artificial Intelligence',
  'Computer Networks',
  'Software Engineering',
  'Data Structures & Algorithms',
  'Web Development',
  'Cyber Security',
  'Compiler Design',
  'Theory of Computation',
  'Digital Electronics',
  'Discrete Mathematics',
] as const;

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: '#22c55e' },
  { value: 'medium', label: 'Medium', color: '#eab308' },
  { value: 'high', label: 'High', color: '#f97316' },
  { value: 'critical', label: 'Critical', color: '#ef4444' },
] as const;

export const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
] as const;

export const REMINDER_OPTIONS = [
  { value: '24h', label: '24 Hours Before' },
  { value: '1h', label: '1 Hour Before' },
  { value: '30m', label: '30 Minutes Before' },
  { value: 'custom', label: 'Custom Time' },
] as const;

export const NAV_ITEMS = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    title: 'Deadlines',
    href: '/deadlines',
    icon: 'CalendarClock',
  },
  {
    title: 'Automations',
    href: '/automations',
    icon: 'Workflow',
  },
] as const;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
