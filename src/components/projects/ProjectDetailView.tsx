import React, { useState } from 'react';
import { Task, TaskStatus } from '../../types';
import { useProjectContext } from '../../context/ProjectContext';
import { TaskKanbanBoard } from './TaskKanbanBoard';
import { TaskListView } from './TaskListView';
import { TaskModal } from './TaskModal';
import { ProjectModal } from './ProjectModal';
import { CategoryBadge, StatusBadge, PriorityBadge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { formatRelativeDate, formatDate } from '../../utils/dateUtils';
import {
  ArrowLeft,
  Kanban,
  List,
  Plus,
  Calendar,
  Edit2,
  Trash2,
} from 'lucide-react';

interface ProjectDetailViewProps {
  projectId: string;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ projectId }) => {
  const {
    getProject,
    getProjectTasks,
    getProjectProgress,
    setActiveView,
    deleteProject,
  } = useProjectContext();

  const [viewStyle, setViewStyle] = useState<'kanban' | 'list'>('kanban');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState<TaskStatus>('todo');

  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);

  const project = getProject(projectId);
  const tasks = getProjectTasks(projectId);
  const progress = getProjectProgress(projectId);

  if (!project) {
    return (
      <div className="py-16 text-center text-[#abb2bf]">
        <h2 className="text-base font-semibold font-mono">
          Project not found
        </h2>
        <button
          onClick={() => setActiveView('projects')}
          className="mt-4 px-3.5 py-1.5 text-xs font-mono font-semibold bg-[#61afef] text-[#14161a] rounded-lg"
        >
          Return to Projects
        </button>
      </div>
    );
  }

  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const todoTasks = tasks.filter((t) => t.status === 'todo');

  const handleOpenNewTask = (status: TaskStatus = 'todo') => {
    setTaskToEdit(null);
    setDefaultTaskStatus(status);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleDeleteProject = () => {
    if (window.confirm('Delete this project and all its tasks permanently?')) {
      deleteProject(project.id);
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in text-[#abb2bf]">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveView('projects')}
          className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#5c6370] hover:text-[#61afef] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Projects</span>
        </button>

        <div className="flex items-center gap-2 font-mono">
          <button
            onClick={() => setIsEditProjectOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#abb2bf] hover:text-[#61afef] rounded-md border border-[#282c34] hover:bg-[#2c313a] transition-colors"
          >
            <Edit2 className="w-3 h-3 text-[#61afef]" />
            <span>Edit</span>
          </button>
          <button
            onClick={handleDeleteProject}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#e06c75] rounded-md border border-[#282c34] hover:bg-[#2c313a] transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Project Banner & Stats */}
      <div className="bg-[#1e2227] border border-[#282c34] rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CategoryBadge category={project.category} size="md" />
              <StatusBadge status={project.status} size="md" />
              <PriorityBadge priority={project.priority} size="md" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#abb2bf] font-mono">
              {project.name}
            </h1>

            {project.description && (
              <p className="text-sm text-[#5c6370] max-w-2xl leading-relaxed font-sans">
                {project.description}
              </p>
            )}

            <div className="flex items-center gap-4 pt-1 text-xs text-[#5c6370] font-mono">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 opacity-70" />
                Target: {formatDate(project.deadline)} ({formatRelativeDate(project.deadline)})
              </span>
            </div>
          </div>

          {/* Real-time Auto-calculating Progress Card */}
          <div className="w-full lg:w-72 bg-[#181a1f] border border-[#282c34] rounded-xl p-4 shrink-0 font-mono">
            <div className="flex items-center justify-between text-xs text-[#5c6370] mb-2">
              <span className="font-semibold text-[#abb2bf]">
                Completion Rate
              </span>
              <span className="font-bold text-base text-[#61afef]">
                {progress}%
              </span>
            </div>

            <ProgressBar progress={progress} size="md" />

            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-[#282c34] text-center">
              <div>
                <span className="text-[10px] text-[#5c6370] uppercase">To-do</span>
                <p className="text-sm font-bold text-[#abb2bf]">
                  {todoTasks.length}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-[#5c6370] uppercase">In Progress</span>
                <p className="text-sm font-bold text-[#61afef]">
                  {inProgressTasks.length}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-[#5c6370] uppercase">Done</span>
                <p className="text-sm font-bold text-[#98c379]">
                  {completedTasks.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Toolbar: View Toggle & Add Task */}
      <div className="flex items-center justify-between gap-4 font-mono">
        {/* Switch Kanban vs List View */}
        <div className="flex items-center space-x-1 bg-[#14161a] p-0.5 rounded-lg border border-[#21252b]">
          <button
            onClick={() => setViewStyle('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              viewStyle === 'kanban'
                ? 'bg-[#1e2227] text-[#61afef] border border-[#2c313a] shadow-xs'
                : 'text-[#5c6370] hover:text-[#abb2bf]'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Board</span>
          </button>

          <button
            onClick={() => setViewStyle('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              viewStyle === 'list'
                ? 'bg-[#1e2227] text-[#61afef] border border-[#2c313a] shadow-xs'
                : 'text-[#5c6370] hover:text-[#abb2bf]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
        </div>

        {/* Add Task Button */}
        <button
          onClick={() => handleOpenNewTask('todo')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#61afef] text-[#14161a] rounded-lg hover:bg-[#52a1e0] transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Task Display (Kanban Board vs List View) */}
      {viewStyle === 'kanban' ? (
        <TaskKanbanBoard
          tasks={tasks}
          onOpenNewTaskWithStatus={handleOpenNewTask}
          onEditTask={handleEditTask}
        />
      ) : (
        <TaskListView
          tasks={tasks}
          projectId={project.id}
          onEditTask={handleEditTask}
        />
      )}

      {/* Task Modal for Creating / Editing */}
      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setTaskToEdit(null);
          }}
          taskToEdit={taskToEdit}
          defaultProjectId={project.id}
          defaultStatus={defaultTaskStatus}
        />
      )}

      {/* Project Edit Modal */}
      {isEditProjectOpen && (
        <ProjectModal
          isOpen={isEditProjectOpen}
          onClose={() => setIsEditProjectOpen(false)}
          projectToEdit={project}
        />
      )}
    </div>
  );
};
