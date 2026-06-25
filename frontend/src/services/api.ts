// ============================================================
// CampusFlow — API Service Layer (Placeholder)
// Backend team replaces mock data with real API calls
// ============================================================

import axios from 'axios';
import { API_BASE_URL } from '@/constants';
import type {
  Student,
  StudentOnboardingData,
  Deadline,
  CreateDeadlineData,
  StudyPlan,
  Automation,
  DashboardStats,
  Notification,
  ApiResponse,
  SubjectAttendance,
} from '@/types';
import {
  mockStudent,
  mockDeadlines,
  mockStudyPlan,
  mockAutomations,
  mockStats,
  mockNotifications,
  mockAttendance,
} from '@/lib/mock-data';

// ---- Axios Instance ----
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ---- Helper: Simulate API delay ----
const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================
// Student Service
// ============================================================
export const studentService = {
  async onboard(data: StudentOnboardingData): Promise<ApiResponse<Student>> {
    await delay(800);
    // TODO: Replace with — api.post('/students/onboard', data)
    return {
      data: { ...mockStudent, ...data, id: 'stu-new', year: parseInt(data.year) },
      success: true,
      message: 'Onboarding successful',
    };
  },

  async getProfile(): Promise<ApiResponse<Student>> {
    await delay();
    // TODO: Replace with — api.get('/students/profile')
    return { data: mockStudent, success: true, message: 'Profile fetched' };
  },
};

// ---- Local Storage Fallback Helpers ----
const TASKS_STORAGE_KEY = 'campusflow_tasks';
const ATTENDANCE_STORAGE_KEY = 'campusflow_attendance';

const getStoredTasks = (): Deadline[] => {
  if (typeof window === 'undefined') return mockDeadlines;
  const stored = localStorage.getItem(TASKS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(mockDeadlines));
    return mockDeadlines;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return mockDeadlines;
  }
};

const setStoredTasks = (tasks: Deadline[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }
};

const getStoredAttendance = (): SubjectAttendance[] => {
  if (typeof window === 'undefined') return mockAttendance;
  const stored = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(mockAttendance));
    return mockAttendance;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return mockAttendance;
  }
};

const setStoredAttendance = (attendance: SubjectAttendance[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(attendance));
  }
};

// ============================================================
// Deadline / Task Service
// ============================================================
export const deadlineService = {
  async getAll(): Promise<ApiResponse<Deadline[]>> {
    try {
      const response = await api.get<ApiResponse<Deadline[]>>('/tasks');
      if (response.data && response.data.success) {
        setStoredTasks(response.data.data);
        return response.data;
      }
      if (Array.isArray(response.data)) {
        const data = response.data as unknown as Deadline[];
        setStoredTasks(data);
        return { data, success: true, message: 'Tasks fetched from API' };
      }
      throw new Error('Invalid API response structure');
    } catch (error) {
      console.warn('GET /tasks failed, falling back to local state:', error);
      const data = getStoredTasks();
      return { data, success: true, message: 'Tasks fetched from local storage (offline mode)' };
    }
  },

  async getById(id: string): Promise<ApiResponse<Deadline>> {
    try {
      const response = await api.get<ApiResponse<Deadline>>(`/tasks/${id}`);
      if (response.data && response.data.success) {
        return response.data;
      }
      if (response.data) {
        return { data: response.data as unknown as Deadline, success: true, message: 'Task fetched from API' };
      }
      throw new Error('Invalid API response');
    } catch (error) {
      console.warn(`GET /tasks/${id} failed, falling back to local state:`, error);
      const tasks = getStoredTasks();
      const deadline = tasks.find((d) => d.id === id);
      return {
        data: deadline || tasks[0],
        success: !!deadline,
        message: deadline ? 'Deadline fetched' : 'Not found',
      };
    }
  },

  async create(data: CreateDeadlineData): Promise<ApiResponse<Deadline>> {
    try {
      const response = await api.post<ApiResponse<Deadline>>('/tasks', data);
      if (response.data && response.data.success) {
        const tasks = getStoredTasks();
        setStoredTasks([response.data.data, ...tasks]);
        return response.data;
      }
      if (response.data) {
        const task = response.data as unknown as Deadline;
        const tasks = getStoredTasks();
        setStoredTasks([task, ...tasks]);
        return { data: task, success: true, message: 'Task created on API' };
      }
      throw new Error('Invalid API response');
    } catch (error) {
      console.warn('POST /tasks failed, creating locally:', error);
      const newDeadline: Deadline = {
        ...data,
        id: `dl-${Date.now()}`,
        status: 'pending',
        automationStatus: 'waiting',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const tasks = getStoredTasks();
      const updated = [newDeadline, ...tasks];
      setStoredTasks(updated);
      return { data: newDeadline, success: true, message: 'Deadline created' };
    }
  },

  async update(id: string, data: Partial<CreateDeadlineData & { status: Deadline['status'] }>): Promise<ApiResponse<Deadline>> {
    try {
      const response = await api.put<ApiResponse<Deadline>>(`/tasks/${id}`, data);
      if (response.data && response.data.success) {
        const tasks = getStoredTasks();
        const updated = tasks.map((t) => (t.id === id ? response.data.data : t));
        setStoredTasks(updated);
        return response.data;
      }
      if (response.data) {
        const task = response.data as unknown as Deadline;
        const tasks = getStoredTasks();
        const updated = tasks.map((t) => (t.id === id ? task : t));
        setStoredTasks(updated);
        return { data: task, success: true, message: 'Task updated on API' };
      }
      throw new Error('Invalid API response');
    } catch (error) {
      console.warn(`PUT /tasks/${id} failed, updating locally:`, error);
      const tasks = getStoredTasks();
      const existing = tasks.find((d) => d.id === id) || tasks[0];
      const updatedDeadline = {
        ...existing,
        ...data,
        updatedAt: new Date().toISOString(),
      } as Deadline;
      const updated = tasks.map((t) => (t.id === id ? updatedDeadline : t));
      setStoredTasks(updated);
      return {
        data: updatedDeadline,
        success: true,
        message: 'Deadline updated',
      };
    }
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    try {
      await api.delete(`/tasks/${id}`);
      const tasks = getStoredTasks();
      setStoredTasks(tasks.filter((t) => t.id !== id));
      return { data: null, success: true, message: 'Deadline deleted on API' };
    } catch (error) {
      console.warn(`DELETE /tasks/${id} failed, deleting locally:`, error);
      const tasks = getStoredTasks();
      setStoredTasks(tasks.filter((t) => t.id !== id));
      return { data: null, success: true, message: 'Deadline deleted' };
    }
  },
};

// ============================================================
// Attendance Service
// ============================================================
export const attendanceService = {
  async getAll(): Promise<ApiResponse<SubjectAttendance[]>> {
    try {
      const response = await api.get<ApiResponse<SubjectAttendance[]>>('/attendance');
      if (response.data && response.data.success) {
        setStoredAttendance(response.data.data);
        return response.data;
      }
      if (Array.isArray(response.data)) {
        const data = response.data as unknown as SubjectAttendance[];
        setStoredAttendance(data);
        return { data, success: true, message: 'Attendance fetched from API' };
      }
      throw new Error('Invalid API response structure');
    } catch (error) {
      console.warn('GET /attendance failed, falling back to local state:', error);
      const data = getStoredAttendance();
      return { data, success: true, message: 'Attendance fetched from local storage (offline mode)' };
    }
  },

  async update(id: string, data: { classesAttended: number; totalClasses: number }): Promise<ApiResponse<SubjectAttendance>> {
    try {
      const response = await api.post<ApiResponse<SubjectAttendance>>('/attendance', { id, ...data });
      if (response.data && response.data.success) {
        const attendance = getStoredAttendance();
        const updated = attendance.map((a) => (a.id === id ? response.data.data : a));
        setStoredAttendance(updated);
        return response.data;
      }
      throw new Error('Invalid API response');
    } catch (error) {
      console.warn('POST /attendance failed, updating locally:', error);
      const attendance = getStoredAttendance();
      const existing = attendance.find((a) => a.id === id);
      if (!existing) {
        return { data: null as unknown as SubjectAttendance, success: false, message: 'Attendance record not found' };
      }
      const updatedItem: SubjectAttendance = {
        ...existing,
        ...data,
      };
      const updated = attendance.map((a) => (a.id === id ? updatedItem : a));
      setStoredAttendance(updated);
      return { data: updatedItem, success: true, message: 'Attendance updated locally (offline mode)' };
    }
  },
};

// ============================================================
// Study Plan Service
// ============================================================
export const studyPlanService = {
  async generate(deadlineId: string): Promise<ApiResponse<StudyPlan>> {
    await delay(2000); // Simulate AI generation time
    // TODO: Replace with — api.post('/study-plans/generate', { deadlineId })
    return {
      data: { ...mockStudyPlan, deadlineId },
      success: true,
      message: 'Study plan generated by AI',
    };
  },
};

// ============================================================
// Automation Service
// ============================================================
export const automationService = {
  async getAll(): Promise<ApiResponse<Automation[]>> {
    await delay();
    // TODO: Replace with — api.get('/automations')
    return { data: mockAutomations, success: true, message: 'Automations fetched' };
  },

  async trigger(automationId: string): Promise<ApiResponse<Automation>> {
    await delay(1000);
    // TODO: Replace with — api.post(`/automations/${automationId}/trigger`)
    const automation = mockAutomations.find((a) => a.id === automationId) || mockAutomations[0];
    return {
      data: { ...automation, status: 'running' },
      success: true,
      message: 'Automation triggered',
    };
  },
};

// ============================================================
// Dashboard Service
// ============================================================
export const dashboardService = {
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    await delay();
    // TODO: Replace with — api.get('/dashboard/stats')
    return { data: mockStats, success: true, message: 'Stats fetched' };
  },

  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    await delay();
    // TODO: Replace with — api.get('/notifications')
    return { data: mockNotifications, success: true, message: 'Notifications fetched' };
  },

  async markNotificationRead(id: string): Promise<ApiResponse<null>> {
    await delay(200);
    // TODO: Replace with — api.patch(`/notifications/${id}`, { read: true })
    void id;
    return { data: null, success: true, message: 'Notification marked as read' };
  },
};

export default api;
