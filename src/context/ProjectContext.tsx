import React, { createContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import { Project, Task, Category, ViewMode, DashboardMetrics, TaskStatus } from '../types';
import { INITIAL_PROJECTS, INITIAL_TASKS } from '../data/initialData';
import { getTodayDateString, isOverdue } from '../utils/dateUtils';
import { getSupabase, getStoredSupabaseConfig } from '../services/supabase';
import confetti from 'canvas-confetti';

interface ProjectContextType {
  projects: Project[];
  tasks: Task[];
  activeView: ViewMode;
  activeProjectId: string | null;
  selectedCategory: Category | 'all';
  searchQuery: string;
  isDarkMode: boolean;
  metrics: DashboardMetrics;

  // Supabase Cloud State & Sync
  isSupabaseConnected: boolean;
  isCloudSyncing: boolean;
  lastSyncedAt: string | null;
  isInitialLoading: boolean;
  supabaseError: string | null;
  checkSupabaseConnection: () => Promise<void>;
  pushLocalToCloud: () => Promise<boolean>;
  pullCloudToLocal: () => Promise<boolean>;

  // Navigation & Filtering
  setActiveView: (view: ViewMode, projectId?: string | null) => void;
  setSelectedCategory: (cat: Category | 'all') => void;
  setSearchQuery: (query: string) => void;
  toggleDarkMode: () => void;

  // Project Actions
  getProject: (id: string) => Project | undefined;
  getProjectTasks: (projectId: string) => Task[];
  getProjectProgress: (projectId: string) => number;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;

  // Task Actions
  getTask: (id: string) => Task | undefined;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<boolean>;
  toggleTask: (id: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => Promise<boolean>;

  // Subtasks
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;

  // System Actions
  resetToDefaults: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => boolean;
}

const STORAGE_PROJECTS_KEY = 'minimal_pm_projects_v2';
const STORAGE_TASKS_KEY = 'minimal_pm_tasks_v2';
const STORAGE_THEME_KEY = 'minimal_pm_theme_v2';

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme State: Default to VS Code Light Theme
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_THEME_KEY);
    if (saved !== null) return saved === 'dark';
    return false; // Default Light Mode (VS Code Light)
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_THEME_KEY, 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Projects State
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROJECTS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load projects from storage', e);
    }
    return INITIAL_PROJECTS;
  });

  // Tasks State
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TASKS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load tasks from storage', e);
    }
    return INITIAL_TASKS;
  });

  // Navigation State
  const [activeView, setActiveViewRaw] = useState<ViewMode>('dashboard');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Supabase State
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  // Persist Projects to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
  }, [projects]);

  // Persist Tasks to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // Check Supabase connection and optionally load data
  const checkSupabaseConnection = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) {
      setIsSupabaseConnected(false);
      return;
    }

    try {
      const { error } = await supabase.from('projects').select('id').limit(1);
      if (!error) {
        setIsSupabaseConnected(true);
        setSupabaseError(null);
      } else {
        setIsSupabaseConnected(false);
        setSupabaseError(error.message);
      }
    } catch (error) {
      setIsSupabaseConnected(false);
      setSupabaseError(error instanceof Error ? error.message : 'Supabase connection failed.');
    }
  }, []);

  // Pull data from Supabase Cloud
  const pullCloudToLocal = useCallback(async (): Promise<boolean> => {
    const supabase = getSupabase();
    if (!supabase) return false;

    setIsCloudSyncing(true);
    try {
      const [projRes, taskRes] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
      ]);

      if (projRes.error || taskRes.error) {
        console.error('Supabase pull error:', projRes.error || taskRes.error);
        setSupabaseError((projRes.error || taskRes.error)?.message || 'Failed to load Supabase data.');
        setIsCloudSyncing(false);
        return false;
      }

      if (projRes.data) {
        const mappedProjects: Project[] = projRes.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          category: p.category,
          status: p.status,
          deadline: p.deadline,
          priority: p.priority,
          icon: p.icon,
          createdAt: p.created_at ? p.created_at.split('T')[0] : getTodayDateString(),
        }));
        setProjects(mappedProjects);
      }

      if (taskRes.data) {
        const mappedTasks: Task[] = taskRes.data.map((t: any) => ({
          id: t.id,
          projectId: t.project_id,
          title: t.title,
          description: t.description || '',
          status: t.status,
          priority: t.priority,
          dueDate: t.due_date,
          dueTime: t.due_time || undefined,
          subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
          tags: Array.isArray(t.tags) ? t.tags : [],
          createdAt: t.created_at ? t.created_at.split('T')[0] : getTodayDateString(),
          completedAt: t.completed_at ? t.completed_at.split('T')[0] : undefined,
        }));
        setTasks(mappedTasks);
      }

      setLastSyncedAt(new Date().toISOString());
      setIsSupabaseConnected(true);
      setSupabaseError(null);
      setIsCloudSyncing(false);
      return true;
    } catch (err) {
      console.error('Pull cloud failed:', err);
      setSupabaseError(err instanceof Error ? err.message : 'Failed to load Supabase data.');
      setIsCloudSyncing(false);
      return false;
    }
  }, []);

  // Push local projects & tasks to Supabase Cloud
  const pushLocalToCloud = useCallback(async (): Promise<boolean> => {
    const supabase = getSupabase();
    if (!supabase) return false;

    setIsCloudSyncing(true);
    try {
      // 1. Upsert Projects
      const dbProjects = projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        status: p.status,
        deadline: p.deadline,
        priority: p.priority,
        icon: p.icon || null,
      }));

      const { error: pErr } = await supabase.from('projects').upsert(dbProjects, { onConflict: 'id' });
      if (pErr) {
        console.error('Push projects error:', pErr);
        setIsCloudSyncing(false);
        return false;
      }

      // 2. Upsert Tasks
      const dbTasks = tasks.map((t) => ({
        id: t.id,
        project_id: t.projectId,
        title: t.title,
        description: t.description || '',
        status: t.status,
        priority: t.priority,
        due_date: t.dueDate,
        due_time: t.dueTime || null,
        subtasks: t.subtasks,
        tags: t.tags,
        completed_at: t.completedAt || null,
      }));

      const { error: tErr } = await supabase.from('tasks').upsert(dbTasks, { onConflict: 'id' });
      if (tErr) {
        console.error('Push tasks error:', tErr);
        setIsCloudSyncing(false);
        return false;
      }

      setLastSyncedAt(new Date().toISOString());
      setIsSupabaseConnected(true);
      setIsCloudSyncing(false);
      return true;
    } catch (err) {
      console.error('Push local to cloud failed:', err);
      setIsCloudSyncing(false);
      return false;
    }
  }, [projects, tasks]);

  // On initial mount: test Supabase and pull if connected
  useEffect(() => {
    let cancelled = false;
    const initialize = async () => {
      const config = getStoredSupabaseConfig();
      if (!config.url || !config.anonKey) {
        if (!cancelled) setIsInitialLoading(false);
        return;
      }

      const supabase = getSupabase();
      if (!supabase) {
        if (!cancelled) {
          setSupabaseError('Supabase configuration is invalid.');
          setIsInitialLoading(false);
        }
        return;
      }

      const { error } = await supabase.from('projects').select('id').limit(1);
      if (error) {
        if (!cancelled) {
          setIsSupabaseConnected(false);
          setSupabaseError(error.message);
          setIsInitialLoading(false);
        }
        return;
      }

      await pullCloudToLocal();
      if (!cancelled) setIsInitialLoading(false);
    };
    initialize().catch((error) => {
      if (!cancelled) {
        setSupabaseError(error instanceof Error ? error.message : 'Failed to initialize Supabase.');
        setIsInitialLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [pullCloudToLocal]);

  const setActiveView = (view: ViewMode, projectId: string | null = null) => {
    setActiveViewRaw(view);
    if (projectId !== undefined) {
      setActiveProjectId(projectId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper selectors
  const getProject = (id: string) => projects.find((p) => p.id === id);
  const getTask = (id: string) => tasks.find((t) => t.id === id);
  const getProjectTasks = (projectId: string) => tasks.filter((t) => t.projectId === projectId);

  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter((t) => t.status === 'completed').length;
    return Math.round((completed / projectTasks.length) * 100);
  };

  // Metrics Calculation
  const metrics: DashboardMetrics = useMemo(() => {
    const todayStr = getTodayDateString();

    const tasksDueToday = tasks.filter((t) => t.dueDate === todayStr);
    const completedToday = tasks.filter(
      (t) => t.status === 'completed' && (t.completedAt === todayStr || t.dueDate === todayStr)
    );
    const overdueTasks = tasks.filter(
      (t) => t.status !== 'completed' && isOverdue(t.dueDate, t.status)
    );
    const activeProjects = projects.filter((p) => p.status === 'active');

    const completedTasksTotal = tasks.filter((t) => t.status === 'completed').length;
    const allTasksTotal = tasks.length;
    const overallProgressPercentage = allTasksTotal === 0 ? 0 : Math.round((completedTasksTotal / allTasksTotal) * 100);

    return {
      totalTasksToday: tasksDueToday.length,
      completedToday: completedToday.length,
      overdueTasks: overdueTasks.length,
      totalActiveProjects: activeProjects.length,
      overallProgressPercentage,
      completedTasksTotal,
      allTasksTotal,
    };
  }, [tasks, projects]);

  // Project CRUD
  const addProject = async (projectData: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      createdAt: getTodayDateString(),
    };

    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from('projects').insert({
        id: newProject.id,
        name: newProject.name,
        description: newProject.description,
        category: newProject.category,
        status: newProject.status,
        deadline: newProject.deadline,
        priority: newProject.priority,
        icon: newProject.icon || null,
      });
      if (error) {
        setSupabaseError(error.message);
        throw error;
      }
    }

    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  };

  const updateProject = async (id: string, updates: Partial<Project>): Promise<boolean> => {
    const supabase = getSupabase();
    if (supabase) {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;

      const { error } = await supabase.from('projects').update(dbUpdates).eq('id', id);
      if (error) {
        setSupabaseError(error.message);
        return false;
      }
    }
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    return true;
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) {
        setSupabaseError(error.message);
        return false;
      }
    }
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setTasks((prev) => prev.filter((t) => t.projectId !== id));
    if (activeProjectId === id) setActiveView('projects', null);
    return true;
  };

  // Task CRUD
  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>): Promise<Task> => {
    let targetProjectId = taskData.projectId;

    // If no projects exist or target project not found, auto-create a general project
    if (!projects.some((p) => p.id === targetProjectId)) {
      if (projects.length === 0) {
        const defaultProj = await addProject({
          name: 'General & Personal',
          description: 'Default project workspace for daily personal tasks and routines.',
          category: 'personal',
          status: 'active',
          deadline: getTodayDateString(),
          priority: 'medium',
        });
        targetProjectId = defaultProj.id;
      } else {
        targetProjectId = projects[0].id;
      }
    }

    const newTask: Task = {
      ...taskData,
      projectId: targetProjectId,
      id: `task-${Date.now()}`,
      createdAt: getTodayDateString(),
    };

    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from('tasks').insert({
        id: newTask.id,
        project_id: newTask.projectId,
        title: newTask.title,
        description: newTask.description || '',
        status: newTask.status,
        priority: newTask.priority,
        due_date: newTask.dueDate,
        due_time: newTask.dueTime || null,
        subtasks: newTask.subtasks,
        tags: newTask.tags,
        completed_at: newTask.status === 'completed' ? newTask.createdAt : null,
      });
      if (error) {
        setSupabaseError(error.message);
        throw error;
      }
    }

    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<Task>): Promise<boolean> => {
    const currentTask = tasks.find((task) => task.id === id);
    if (!currentTask) return false;
    const updatedTask: Task = { ...currentTask, ...updates };
    if (updates.status === 'completed' && currentTask.status !== 'completed') {
      updatedTask.completedAt = getTodayDateString();
    } else if (updates.status && updates.status !== 'completed') {
      updatedTask.completedAt = undefined;
    }

    const supabase = getSupabase();
    if (supabase) {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
      if (updates.dueTime !== undefined) dbUpdates.due_time = updates.dueTime || null;
      if (updates.subtasks !== undefined) dbUpdates.subtasks = updates.subtasks;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId;
      dbUpdates.completed_at = updatedTask.completedAt || null;

      const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', id);
      if (error) {
        setSupabaseError(error.message);
        return false;
      }
    }
    setTasks((prev) => prev.map((task) => task.id === id ? updatedTask : task));
    return true;
  };

  const setTaskStatus = (id: string, status: TaskStatus) => {
    updateTask(id, { status });
    if (status === 'completed') {
      try {
        confetti({
          particleCount: 35,
          spread: 45,
          origin: { y: 0.85 },
          colors: ['#000000', '#ffffff', '#888888', '#aaaaaa'],
        });
      } catch {
        // ignore confetti errors
      }
    }
  };

  const toggleTask = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const nextStatus: TaskStatus = task.status === 'completed' ? 'todo' : 'completed';
    setTaskStatus(id, nextStatus);
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) {
        setSupabaseError(error.message);
        return false;
      }
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
    return true;
  };

  // Subtask Actions
  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    updateTask(taskId, { subtasks: updatedSubtasks });
  };

  const addSubtask = (taskId: string, title: string) => {
    if (!title.trim()) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const newSubtask = {
      id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: title.trim(),
      completed: false,
    };
    updateTask(taskId, { subtasks: [...task.subtasks, newSubtask] });
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    updateTask(taskId, {
      subtasks: task.subtasks.filter((st) => st.id !== subtaskId),
    });
  };

  // Reset & Backup Actions
  const resetToDefaults = () => {
    setProjects(INITIAL_PROJECTS);
    setTasks(INITIAL_TASKS);
    localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(INITIAL_PROJECTS));
    localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(INITIAL_TASKS));
  };

  const exportDataJSON = () => {
    return JSON.stringify({ projects, tasks, exportedAt: new Date().toISOString() }, null, 2);
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.projects) && Array.isArray(data.tasks)) {
        setProjects(data.projects);
        setTasks(data.tasks);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        tasks,
        activeView,
        activeProjectId,
        selectedCategory,
        searchQuery,
        isDarkMode,
        metrics,
        isSupabaseConnected,
        isCloudSyncing,
        lastSyncedAt,
        isInitialLoading,
        supabaseError,
        checkSupabaseConnection,
        pushLocalToCloud,
        pullCloudToLocal,
        setActiveView,
        setSelectedCategory,
        setSearchQuery,
        toggleDarkMode,
        getProject,
        getTask,
        getProjectTasks,
        getProjectProgress,
        addProject,
        updateProject,
        deleteProject,
        addTask,
        updateTask,
        toggleTask,
        setTaskStatus,
        deleteTask,
        toggleSubtask,
        addSubtask,
        deleteSubtask,
        resetToDefaults,
        exportDataJSON,
        importDataJSON,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export { ProjectContext };
export { useProjectContext } from './useProjectContext';

