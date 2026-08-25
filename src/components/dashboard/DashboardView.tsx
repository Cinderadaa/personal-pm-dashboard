import React from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { MetricCards } from './MetricCards';
import { TodayTasksList } from './TodayTasksList';
import { ActiveProjectsList } from './ActiveProjectsList';
import { MiniCalendarStrip } from './MiniCalendarStrip';
import { DonutChart } from '../common/DonutChart';
import { ProgressBar } from '../common/ProgressBar';
import { CATEGORIES } from '../../data/initialData';
import { Task } from '../../types';
import { Plus } from 'lucide-react';

interface DashboardViewProps {
  onOpenNewTask: () => void;
  onOpenNewProject: () => void;
  onSelectTask: (task: Task) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewTask,
  onOpenNewProject,
  onSelectTask,
}) => {
  const { metrics, projects, tasks } = useProjectContext();

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Calculate category progress
  const categoryStats = CATEGORIES.map((cat) => {
    const catProjects = projects.filter((p) => p.category === cat.id);
    const catProjectIds = catProjects.map((p) => p.id);
    const catTasks = tasks.filter((t) => catProjectIds.includes(t.projectId));
    const completedCatTasks = catTasks.filter((t) => t.status === 'completed').length;
    const progress = catTasks.length === 0 ? 0 : Math.round((completedCatTasks / catTasks.length) * 100);

    const colors: Record<string, string> = {
      internship: 'bg-[#c678dd]',
      study: 'bg-[#61afef]',
      work: 'bg-[#98c379]',
      personal: 'bg-[#e5c07b]',
      life: 'bg-[#e06c75]',
    };

    return {
      ...cat,
      color: colors[cat.id] || 'bg-[#61afef]',
      projectCount: catProjects.length,
      taskCount: catTasks.length,
      completedTaskCount: completedCatTasks,
      progress,
    };
  }).filter((c) => c.projectCount > 0 || c.taskCount > 0);

  return (
    <div className="space-y-6 pb-16 animate-fade-in text-[#abb2bf]">
      {/* Top Welcome & Daily Goal Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#21252b] pb-5">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-[#5c6370] mb-1">
            {currentDate}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#abb2bf] font-mono">
            Control Center
          </h1>
          <p className="text-sm text-[#5c6370] mt-1 font-sans">
            Track your tasks, university thesis, internship, and personal milestones in One Dark Pro.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewTask}
            className="px-4 py-2 text-xs font-mono font-semibold bg-[#61afef] text-[#14161a] rounded-lg hover:bg-[#52a1e0] transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <MetricCards />

      {/* Main Grid: Left (Today's Tasks & Projects), Right (Donut Chart & Category Breakdown & Mini Calendar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Today's Tasks + In-Progress Projects */}
        <div className="lg:col-span-8 space-y-6">
          <TodayTasksList onSelectTask={onSelectTask} />
          <ActiveProjectsList onOpenNewProject={onOpenNewProject} />
        </div>

        {/* Right Column (4 cols): Visualizations & Schedule */}
        <div className="lg:col-span-4 space-y-6">
          {/* Overall Momentum Donut Chart Card */}
          <div className="bg-[#1e2227] border border-[#282c34] rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#abb2bf] font-mono tracking-tight">
                Overall Progress
              </h2>
              <span className="text-xs font-mono text-[#5c6370]">
                {metrics.completedTasksTotal} / {metrics.allTasksTotal} Tasks
              </span>
            </div>

            <div className="py-2 flex justify-center">
              <DonutChart
                percentage={metrics.overallProgressPercentage}
                size={150}
                strokeWidth={14}
                label="Complete"
              />
            </div>

            {/* Category breakdown bars */}
            <div className="mt-4 pt-4 border-t border-[#21252b] space-y-3">
              <div className="text-[11px] font-semibold text-[#5c6370] uppercase tracking-wider font-mono">
                Category Momentum
              </div>
              {categoryStats.length === 0 ? (
                <div className="py-2 text-center text-xs font-mono text-[#5c6370]">
                  No active categories yet.
                </div>
              ) : (
                categoryStats.map((cat) => (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#abb2bf]">
                        {cat.label}
                      </span>
                      <span className="text-[#5c6370] text-[11px]">
                        {cat.progress}%
                      </span>
                    </div>
                    <ProgressBar progress={cat.progress} size="sm" color={cat.color} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 7-Day Mini Calendar Strip Widget */}
          <MiniCalendarStrip />
        </div>
      </div>
    </div>
  );
};
