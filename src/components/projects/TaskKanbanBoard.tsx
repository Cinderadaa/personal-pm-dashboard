import React from 'react';
import { Task, TaskStatus } from '../../types';
import { useProjectContext } from '../../context/ProjectContext';
import { PriorityBadge } from '../common/Badge';
import { formatRelativeDate, isOverdue } from '../../utils/dateUtils';
import {
  Plus,
  Clock,
  ArrowRight,
  ArrowLeft,
  Trash2,
  ListChecks,
} from 'lucide-react';

interface TaskKanbanBoardProps {
  tasks: Task[];
  onOpenNewTaskWithStatus: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
}

export const TaskKanbanBoard: React.FC<TaskKanbanBoardProps> = ({
  tasks,
  onOpenNewTaskWithStatus,
  onEditTask,
}) => {
  const { setTaskStatus, deleteTask } = useProjectContext();

  const columns: { id: TaskStatus; title: string; color: string }[] = [
    { id: 'todo', title: 'To-do', color: 'text-[#abb2bf]' },
    { id: 'in_progress', title: 'In Progress', color: 'text-[#61afef]' },
    { id: 'completed', title: 'Completed', color: 'text-[#98c379]' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
      {columns.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);

        return (
          <div
            key={column.id}
            className="bg-[#181a1f]/80 border border-[#282c34] rounded-xl p-3.5 flex flex-col min-h-[450px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <h3 className={`text-xs font-semibold uppercase tracking-wider ${column.color}`}>
                  {column.title}
                </h3>
                <span className="text-[11px] px-1.5 py-0.2 rounded-md bg-[#14161a] border border-[#21252b] text-[#5c6370]">
                  {columnTasks.length}
                </span>
              </div>

              <button
                onClick={() => onOpenNewTaskWithStatus(column.id)}
                className="p-1 text-[#5c6370] hover:text-[#61afef] rounded hover:bg-[#2c313a] transition-colors"
                title={`Add task to ${column.title}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Tasks Container */}
            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {columnTasks.length === 0 ? (
                <div className="h-32 border border-dashed border-[#282c34] rounded-lg flex flex-col items-center justify-center text-center p-3">
                  <p className="text-[11px] text-[#5c6370]">No tasks in this stage</p>
                  <button
                    onClick={() => onOpenNewTaskWithStatus(column.id)}
                    className="mt-1 text-[11px] font-medium text-[#61afef] hover:underline"
                  >
                    + Add task
                  </button>
                </div>
              ) : (
                columnTasks.map((task) => {
                  const isTaskOverdue = isOverdue(task.dueDate, task.status);
                  const subtasksDone = task.subtasks.filter((st) => st.completed).length;

                  return (
                    <div
                      key={task.id}
                      onClick={() => onEditTask(task)}
                      className="bg-[#1e2227] border border-[#282c34] hover:border-[#3e4451] rounded-lg p-3 shadow-xs transition-all cursor-pointer group text-[#abb2bf]"
                    >
                      {/* Priority & Due Date */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <PriorityBadge priority={task.priority} size="sm" />
                        <span
                          className={`text-[10px] ${
                            isTaskOverdue
                              ? 'text-[#e06c75] font-bold'
                              : 'text-[#5c6370]'
                          }`}
                        >
                          {formatRelativeDate(task.dueDate)}
                        </span>
                      </div>

                      {/* Title */}
                      <h4
                        className={`text-xs font-semibold leading-snug mb-1 ${
                          task.status === 'completed' ? 'line-through text-[#5c6370]' : 'text-[#abb2bf]'
                        }`}
                      >
                        {task.title}
                      </h4>

                      {/* Description preview */}
                      {task.description && (
                        <p className="text-[11px] text-[#5c6370] line-clamp-2 mb-2 leading-relaxed font-sans">
                          {task.description}
                        </p>
                      )}

                      {/* Subtasks and tags */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#21252b] text-[10px] text-[#5c6370]">
                        <div className="flex items-center gap-2">
                          {task.subtasks.length > 0 && (
                            <span className="flex items-center gap-1">
                              <ListChecks className="w-3 h-3" />
                              {subtasksDone}/{task.subtasks.length}
                            </span>
                          )}
                          {task.dueTime && (
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {task.dueTime}
                            </span>
                          )}
                        </div>

                        {/* Quick Status Shift buttons */}
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          {column.id !== 'todo' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTaskStatus(
                                  task.id,
                                  column.id === 'completed' ? 'in_progress' : 'todo'
                                );
                              }}
                              className="p-1 rounded hover:bg-[#2c313a] text-[#5c6370] hover:text-[#abb2bf]"
                              title="Move back"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}

                          {column.id !== 'completed' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTaskStatus(
                                  task.id,
                                  column.id === 'todo' ? 'in_progress' : 'completed'
                                );
                              }}
                              className="p-1 rounded hover:bg-[#2c313a] text-[#5c6370] hover:text-[#61afef]"
                              title={column.id === 'todo' ? 'Move to In Progress' : 'Mark as Completed'}
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTask(task.id);
                            }}
                            className="p-1 rounded hover:bg-[#2c313a] text-[#5c6370] hover:text-[#e06c75]"
                            title="Delete task"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
