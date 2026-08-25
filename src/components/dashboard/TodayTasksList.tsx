import React, { useState } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { Task } from '../../types';
import { getTodayDateString, isOverdue } from '../../utils/dateUtils';
import { Check, Plus, AlertCircle, Clock, ChevronRight, ListChecks } from 'lucide-react';
import { PriorityBadge } from '../common/Badge';

interface TodayTasksListProps {
  onSelectTask?: (task: Task) => void;
}

export const TodayTasksList: React.FC<TodayTasksListProps> = ({ onSelectTask }) => {
  const { tasks, projects, toggleTask, addTask, setActiveView, getProject } = useProjectContext();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [quickTitle, setQuickTitle] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');

  const todayStr = getTodayDateString();

  // Filter tasks based on selection
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const overdueTasks = tasks.filter((t) => t.status !== 'completed' && isOverdue(t.dueDate, t.status));

  let displayedTasks: Task[] = [];
  if (filter === 'all') {
    const map = new Map<string, Task>();
    overdueTasks.forEach((t) => map.set(t.id, t));
    todayTasks.forEach((t) => map.set(t.id, t));
    displayedTasks = Array.from(map.values());
  } else if (filter === 'pending') {
    displayedTasks = todayTasks.filter((t) => t.status !== 'completed');
  } else if (filter === 'completed') {
    displayedTasks = todayTasks.filter((t) => t.status === 'completed');
  } else if (filter === 'overdue') {
    displayedTasks = overdueTasks;
  }

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle.trim(),
      projectId: selectedProjectId || projects[0]?.id || '',
      status: 'todo',
      priority: 'medium',
      dueDate: todayStr,
      subtasks: [],
      tags: [],
    });

    setQuickTitle('');
  };

  return (
    <div className="bg-[#1e2227] border border-[#282c34] rounded-xl p-5 shadow-xs text-[#abb2bf]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-[#abb2bf] font-mono tracking-tight flex items-center gap-2">
            <span>Today's Focus & Action List</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#14161a] text-[#61afef] border border-[#21252b] font-normal">
              {todayTasks.filter((t) => t.status === 'completed').length} / {todayTasks.length} done
            </span>
          </h2>
          <p className="text-xs text-[#5c6370] mt-0.5">
            Tasks scheduled for today or needing immediate attention
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-1 bg-[#14161a] p-0.5 rounded-lg border border-[#21252b] self-start sm:self-auto font-mono">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'To-do' },
              { id: 'completed', label: 'Done' },
              { id: 'overdue', label: `Overdue (${overdueTasks.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                filter === tab.id
                  ? 'bg-[#1e2227] text-[#61afef] border border-[#2c313a] shadow-xs'
                  : 'text-[#5c6370] hover:text-[#abb2bf]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Add Input */}
      <form onSubmit={handleQuickAdd} className="mb-4">
        <div className="flex items-center gap-2 p-1.5 rounded-lg border border-[#282c34] bg-[#14161a] focus-within:border-[#61afef] transition-colors">
          <input
            type="text"
            placeholder="Add a quick task for today and press Enter..."
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            className="flex-1 bg-transparent px-2.5 py-1 text-xs font-mono text-[#abb2bf] placeholder-[#5c6370] focus:outline-hidden"
          />

          {projects.length > 0 && (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-[#1e2227] text-[#abb2bf] text-[11px] font-mono px-2 py-1 rounded-md border border-[#282c34] focus:outline-hidden max-w-[130px] truncate"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          <button
            type="submit"
            disabled={!quickTitle.trim()}
            className="px-2.5 py-1 bg-[#61afef] text-[#14161a] text-xs font-mono font-semibold rounded-md disabled:opacity-40 hover:bg-[#52a1e0] transition-colors flex items-center gap-1 shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </form>

      {/* Task Rows */}
      <div className="divide-y divide-[#21252b]">
        {displayedTasks.length === 0 ? (
          <div className="py-10 text-center">
            <ListChecks className="w-8 h-8 mx-auto text-[#2c313a] mb-2" />
            <p className="text-xs text-[#5c6370] font-mono">
              No tasks scheduled for today. Type above to add your first task!
            </p>
          </div>
        ) : (
          displayedTasks.map((task) => {
            const project = getProject(task.projectId);
            const isTaskOverdue = isOverdue(task.dueDate, task.status);
            const isCompleted = task.status === 'completed';
            const completedSubtasks = task.subtasks.filter((st) => st.completed).length;

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask && onSelectTask(task)}
                className={`group flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-[#14161a]/60 transition-colors cursor-pointer ${
                  isCompleted ? 'opacity-50' : ''
                }`}
              >
                {/* Left: Checkbox + Title + Meta */}
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
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

                  <div className="flex flex-col min-w-0">
                    <span
                      className={`text-xs font-mono font-medium truncate ${
                        isCompleted
                          ? 'line-through text-[#5c6370]'
                          : 'text-[#abb2bf]'
                      }`}
                    >
                      {task.title}
                    </span>

                    <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono text-[#5c6370]">
                      {project && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveView('project_detail', project.id);
                          }}
                          className="hover:underline text-[#e5c07b] truncate max-w-[140px]"
                        >
                          {project.name}
                        </button>
                      )}

                      {task.dueTime && (
                        <span className="flex items-center gap-1 text-[10px]">
                          <Clock className="w-3 h-3 opacity-70" />
                          {task.dueTime}
                        </span>
                      )}

                      {task.subtasks.length > 0 && (
                        <span className="text-[10px] text-[#5c6370]">
                          [{completedSubtasks}/{task.subtasks.length}]
                        </span>
                      )}

                      {isTaskOverdue && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#e06c75] bg-[#e06c75]/15 px-1.5 py-0.2 rounded border border-[#e06c75]/30">
                          <AlertCircle className="w-2.5 h-2.5" /> Overdue
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Priority & Arrow */}
                <div className="flex items-center gap-2 shrink-0">
                  <PriorityBadge priority={task.priority} size="sm" />
                  <ChevronRight className="w-3.5 h-3.5 text-[#5c6370] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
