import React, { useState } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { Task, Category } from '../../types';
import { getMonthDays, getTodayDateString, formatDate } from '../../utils/dateUtils';
import { CategoryBadge, PriorityBadge } from '../common/Badge';
import { TaskModal } from '../projects/TaskModal';
import { CATEGORIES } from '../../data/initialData';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  Calendar as CalendarIcon,
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const {
    projects,
    tasks,
    toggleTask,
    setActiveView,
    getProject,
  } = useProjectContext();

  const todayStr = getTodayDateString();
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');

  // Task Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    const d = new Date();
    setCurrentYear(d.getFullYear());
    setCurrentMonth(d.getMonth());
    setSelectedDate(todayStr);
  };

  const filteredTasks = tasks.filter((task) => {
    const project = getProject(task.projectId);
    const matchProject = selectedProjectId === 'all' || task.projectId === selectedProjectId;
    const matchCategory = selectedCategory === 'all' || (project && project.category === selectedCategory);
    return matchProject && matchCategory;
  });

  const monthName = new Date(currentYear, currentMonth).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const days = getMonthDays(currentYear, currentMonth);

  const selectedDayTasks = filteredTasks.filter((t) => t.dueDate === selectedDate);
  const selectedDayDeadlines = projects.filter((p) => {
    const matchProj = selectedProjectId === 'all' || p.id === selectedProjectId;
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    return p.deadline === selectedDate && matchProj && matchCat;
  });

  return (
    <div className="space-y-6 pb-16 animate-fade-in text-[#abb2bf]">
      {/* Header Banner & Month Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#21252b] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#abb2bf] font-mono">
            Unified Calendar
          </h1>
          <p className="text-sm text-[#5c6370] mt-1 font-sans">
            All your tasks, exams, internships, and project deadlines in a single view.
          </p>
        </div>

        {/* Month Picker & Today Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto font-mono">
          <button
            onClick={handleJumpToToday}
            className="px-3 py-1.5 text-xs font-medium border border-[#282c34] bg-[#1e2227] rounded-lg hover:border-[#3e4451] transition-colors"
          >
            Today
          </button>

          <div className="flex items-center bg-[#181a1f] border border-[#282c34] rounded-lg p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 text-[#5c6370] hover:text-[#abb2bf] rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-semibold px-3 min-w-[120px] text-center text-[#61afef]">
              {monthName}
            </span>

            <button
              onClick={handleNextMonth}
              className="p-1 text-[#5c6370] hover:text-[#abb2bf] rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 font-mono">
        {/* Filter by Category */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-[#1e2227] text-[#61afef] border border-[#2c313a] shadow-xs'
                : 'bg-[#14161a] text-[#5c6370] hover:text-[#abb2bf] border border-[#21252b]'
            }`}
          >
            All Domains
          </button>

          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-[#1e2227] text-[#c678dd] border border-[#2c313a] shadow-xs'
                  : 'bg-[#14161a] text-[#5c6370] hover:text-[#abb2bf] border border-[#21252b]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Filter by Project */}
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="ml-auto px-2.5 py-1 text-xs bg-[#14161a] border border-[#282c34] rounded-lg text-[#abb2bf] focus:outline-hidden"
        >
          <option value="all">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Main Grid: Calendar Month Grid (8 cols) + Selected Day Agenda (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono">
        {/* Calendar Month Grid */}
        <div className="lg:col-span-8 bg-[#1e2227] border border-[#282c34] rounded-xl p-4 sm:p-5 shadow-xs">
          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[#5c6370] uppercase mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Month Day Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((d, index) => {
              const dayTasks = filteredTasks.filter((t) => t.dueDate === d.dateStr);
              const dayDeadlines = projects.filter((p) => p.deadline === d.dateStr);
              const isSelected = d.dateStr === selectedDate;
              const isToday = d.dateStr === todayStr;

              return (
                <div
                  key={`${d.dateStr}-${index}`}
                  onClick={() => setSelectedDate(d.dateStr)}
                  className={`min-h-[75px] sm:min-h-[90px] p-1.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'ring-2 ring-[#61afef] border-[#61afef] bg-[#61afef]/10'
                      : isToday
                      ? 'border-[#61afef]/50 bg-[#181a1f]'
                      : d.isCurrentMonth
                      ? 'border-[#282c34] hover:border-[#3e4451] bg-[#181a1f]/40'
                      : 'border-[#21252b]/40 opacity-20 bg-transparent'
                  }`}
                >
                  {/* Day number & milestone flag */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-[#61afef] text-[#14161a] flex items-center justify-center text-[10px] font-bold'
                          : isSelected
                          ? 'text-[#61afef] font-bold'
                          : 'text-[#abb2bf]'
                      }`}
                    >
                      {d.day}
                    </span>

                    {dayDeadlines.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#e5c07b]" title="Project Milestone" />
                    )}
                  </div>

                  {/* Task Preview Badges */}
                  <div className="space-y-1 my-1 overflow-hidden">
                    {dayDeadlines.slice(0, 1).map((p) => (
                      <div
                        key={p.id}
                        className="text-[9px] px-1 py-0.5 rounded truncate font-semibold bg-[#e5c07b]/20 text-[#e5c07b] border border-[#e5c07b]/30"
                      >
                        🚩 {p.name}
                      </div>
                    ))}

                    {dayTasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        className={`text-[9px] px-1 py-0.5 rounded truncate ${
                          t.status === 'completed'
                            ? 'line-through text-[#5c6370] bg-[#14161a]'
                            : 'bg-[#61afef]/15 text-[#61afef] border border-[#61afef]/30'
                        }`}
                      >
                        {t.title}
                      </div>
                    ))}

                    {dayTasks.length > 2 && (
                      <span className="text-[9px] text-[#5c6370] block px-0.5">
                        +{dayTasks.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Drawer (4 cols) */}
        <div className="lg:col-span-4 bg-[#1e2227] border border-[#282c34] rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#282c34] pb-3 mb-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#5c6370]">
                  Agenda for
                </span>
                <h3 className="text-base font-semibold text-[#abb2bf]">
                  {formatDate(selectedDate)}
                </h3>
              </div>

              <button
                onClick={() => {
                  setTaskToEdit(null);
                  setIsTaskModalOpen(true);
                }}
                className="p-1.5 bg-[#61afef] text-[#14161a] rounded-lg hover:bg-[#52a1e0] transition-colors shadow-xs"
                title="Add task for this date"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Project Deadlines on this day */}
            {selectedDayDeadlines.length > 0 && (
              <div className="mb-4 space-y-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#5c6370]">
                  Project Milestones
                </div>
                {selectedDayDeadlines.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setActiveView('project_detail', p.id)}
                    className="p-2.5 rounded-lg border border-[#e5c07b]/40 bg-[#e5c07b]/10 cursor-pointer hover:border-[#e5c07b] transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-[#e5c07b]">
                      <span>🚩 {p.name}</span>
                      <CategoryBadge category={p.category} size="sm" />
                    </div>
                    <p className="text-[11px] text-[#abb2bf] mt-1 line-clamp-1 font-sans">
                      {p.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Tasks on this day */}
            <div className="space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[#5c6370]">
                Tasks Scheduled ({selectedDayTasks.length})
              </div>

              {selectedDayTasks.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-[#282c34] rounded-lg bg-[#181a1f]/30">
                  <CalendarIcon className="w-6 h-6 mx-auto text-[#2c313a] mb-1" />
                  <p className="text-xs text-[#5c6370]">No tasks on this date.</p>
                  <button
                    onClick={() => {
                      setTaskToEdit(null);
                      setIsTaskModalOpen(true);
                    }}
                    className="mt-2 text-xs font-medium text-[#61afef] hover:underline"
                  >
                    + Schedule a task
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#21252b]">
                  {selectedDayTasks.map((task) => {
                    const project = getProject(task.projectId);
                    const isCompleted = task.status === 'completed';

                    return (
                      <div
                        key={task.id}
                        className="py-2.5 flex items-start gap-2.5 group cursor-pointer"
                        onClick={() => {
                          setTaskToEdit(task);
                          setIsTaskModalOpen(true);
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTask(task.id);
                          }}
                          className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            isCompleted
                              ? 'bg-[#98c379] text-[#14161a] border-transparent font-bold'
                              : 'border-[#3e4451] hover:border-[#61afef]'
                          }`}
                        >
                          {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>

                        <div className="min-w-0 flex-1">
                          <h4
                            className={`text-xs font-medium ${
                              isCompleted
                                ? 'line-through text-[#5c6370]'
                                : 'text-[#abb2bf]'
                            }`}
                          >
                            {task.title}
                          </h4>

                          <div className="flex items-center gap-2 mt-1 text-[11px] text-[#5c6370]">
                            {project && (
                              <span className="truncate max-w-[100px] text-[#e5c07b]">
                                {project.name}
                              </span>
                            )}
                            {task.dueTime && (
                              <span className="text-[10px]">
                                {task.dueTime}
                              </span>
                            )}
                            <PriorityBadge priority={task.priority} size="sm" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#282c34] text-[11px] text-[#5c6370] text-center">
            {selectedDayTasks.filter((t) => t.status === 'completed').length} of {selectedDayTasks.length} tasks completed
          </div>
        </div>
      </div>

      {/* Task Modal for Creating / Editing on selected date */}
      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setTaskToEdit(null);
          }}
          taskToEdit={taskToEdit}
        />
      )}
    </div>
  );
};
