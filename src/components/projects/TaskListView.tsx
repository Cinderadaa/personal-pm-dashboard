import React, { useState } from 'react';
import { Task } from '../../types';
import { useProjectContext } from '../../context/ProjectContext';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import { formatRelativeDate, isOverdue } from '../../utils/dateUtils';
import { Check, Plus, Trash2, ListChecks } from 'lucide-react';

interface TaskListViewProps {
  tasks: Task[];
  projectId: string;
  onEditTask: (task: Task) => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  projectId,
  onEditTask,
}) => {
  const { toggleTask, deleteTask, addTask } = useProjectContext();
  const [quickTitle, setQuickTitle] = useState('');

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle.trim(),
      projectId,
      status: 'todo',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      subtasks: [],
      tags: [],
    });

    setQuickTitle('');
  };

  return (
    <div className="bg-[#1e2227] border border-[#282c34] rounded-xl overflow-hidden shadow-xs text-[#abb2bf] font-mono">
      {/* Quick Add Row at Top */}
      <form onSubmit={handleQuickAdd} className="p-3 border-b border-[#282c34] bg-[#181a1f]/70">
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#5c6370] shrink-0 ml-1" />
          <input
            type="text"
            placeholder="Add new task to this project (press Enter)..."
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            className="flex-1 bg-transparent text-xs text-[#abb2bf] placeholder-[#5c6370] focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={!quickTitle.trim()}
            className="px-2.5 py-1 text-xs font-semibold bg-[#61afef] text-[#14161a] rounded-md disabled:opacity-40"
          >
            Add Task
          </button>
        </div>
      </form>

      {/* Task Rows List */}
      <div className="divide-y divide-[#21252b]">
        {tasks.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#5c6370]">
            No tasks in this project yet. Add your first task above.
          </div>
        ) : (
          tasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isTaskOverdue = isOverdue(task.dueDate, task.status);
            const subtasksDone = task.subtasks.filter((st) => st.completed).length;

            return (
              <div
                key={task.id}
                onClick={() => onEditTask(task)}
                className={`group flex items-center justify-between p-3.5 hover:bg-[#14161a]/60 transition-colors cursor-pointer ${
                  isCompleted ? 'opacity-50' : ''
                }`}
              >
                {/* Left: Checkbox + Title + Subtask count */}
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTask(task.id);
                    }}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                      isCompleted
                        ? 'bg-[#98c379] text-[#14161a] border-transparent font-bold'
                        : 'border-[#3e4451] hover:border-[#61afef]'
                    }`}
                  >
                    {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <span
                      className={`text-xs font-medium ${
                        isCompleted
                          ? 'line-through text-[#5c6370]'
                          : 'text-[#abb2bf]'
                      }`}
                    >
                      {task.title}
                    </span>

                    {task.description && (
                      <p className="text-[11px] text-[#5c6370] truncate mt-0.5 font-sans">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Meta & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  {task.subtasks.length > 0 && (
                    <span className="text-[11px] text-[#5c6370] flex items-center gap-1 hidden sm:flex">
                      <ListChecks className="w-3 h-3" />
                      {subtasksDone}/{task.subtasks.length}
                    </span>
                  )}

                  <StatusBadge status={task.status} size="sm" />
                  <PriorityBadge priority={task.priority} size="sm" />

                  <span
                    className={`text-xs hidden md:inline-block ${
                      isTaskOverdue
                        ? 'text-[#e06c75] font-bold'
                        : 'text-[#5c6370]'
                    }`}
                  >
                    {formatRelativeDate(task.dueDate)}
                  </span>

                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(task.id);
                      }}
                      className="p-1 text-[#5c6370] hover:text-[#e06c75] rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
};
