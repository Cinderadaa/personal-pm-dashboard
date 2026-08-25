export type Category = 'internship' | 'work' | 'study' | 'personal' | 'life';

export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export type ProjectStatus = 'active' | 'on_hold' | 'completed';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  subtasks: Subtask[];
  tags: string[];
  createdAt: string;
  completedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: Category;
  status: ProjectStatus;
  deadline: string; // YYYY-MM-DD
  priority: Priority;
  icon?: string;
  createdAt: string;
  color?: string; // monochrome accent variant
}

export type ViewMode = 'dashboard' | 'projects' | 'project_detail' | 'calendar';

export interface DashboardMetrics {
  totalTasksToday: number;
  completedToday: number;
  overdueTasks: number;
  totalActiveProjects: number;
  overallProgressPercentage: number;
  completedTasksTotal: number;
  allTasksTotal: number;
}

export interface CategoryMeta {
  id: Category;
  label: string;
  icon: string;
  badge: string;
}
