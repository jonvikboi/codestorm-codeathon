import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `${diffDays} days left`;
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks left`;
  return `${Math.ceil(diffDays / 30)} months left`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'critical':
      return 'text-red-500 bg-red-500/10 border-red-500/20';
    case 'high':
      return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    case 'medium':
      return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    case 'low':
      return 'text-green-500 bg-green-500/10 border-green-500/20';
    default:
      return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'completed':
    case 'success':
      return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    case 'in-progress':
    case 'running':
      return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    case 'pending':
    case 'waiting':
      return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    case 'overdue':
    case 'failed':
      return 'text-red-500 bg-red-500/10 border-red-500/20';
    case 'scheduled':
      return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
    default:
      return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}
