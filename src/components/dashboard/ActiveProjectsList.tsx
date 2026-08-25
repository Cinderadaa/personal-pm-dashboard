import React from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { CategoryBadge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { formatRelativeDate, getDaysRemaining } from '../../utils/dateUtils';
import { ArrowUpRight, Plus } from 'lucide-react';

interface ActiveProjectsListProps {
  onOpenNewProject: () => void;
}

export const ActiveProjectsList: React.FC<ActiveProjectsListProps> = ({ onOpenNewProject }) => {
  const { projects, getProjectTasks, getProjectProgress, setActiveView } = useProjectContext();

  const activeProjects = projects.filter((p) => p.status === 'active');

  return (
    <div className="bg-[#1e2227] border border-[#282c34] rounded-xl p-5 shadow-xs text-[#abb2bf]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-[#abb2bf] font-mono tracking-tight flex items-center gap-2">
            <span>In-Progress Projects</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#14161a] text-[#c678dd] border border-[#21252b] font-normal">
              {activeProjects.length}
            </span>
          </h2>
          <p className="text-xs text-[#5c6370] mt-0.5">
            Key areas of focus across work, study, internship & life
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('projects')}
            className="text-xs font-mono text-[#5c6370] hover:text-[#61afef] flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {activeProjects.map((project) => {
          const tasks = getProjectTasks(project.id);
          const completedTasks = tasks.filter((t) => t.status === 'completed').length;
          const progress = getProjectProgress(project.id);
          const daysLeft = getDaysRemaining(project.deadline);

          return (
            <div
              key={project.id}
              onClick={() => setActiveView('project_detail', project.id)}
              className="p-4 rounded-xl border border-[#282c34] hover:border-[#3e4451] bg-[#181a1f]/60 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <CategoryBadge category={project.category} size="sm" />
                  <span
                    className={`text-[11px] font-mono ${
                      daysLeft < 0
                        ? 'text-[#e06c75] font-bold'
                        : 'text-[#5c6370]'
                    }`}
                  >
                    {formatRelativeDate(project.deadline)}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-[#abb2bf] font-mono group-hover:text-[#61afef] transition-colors truncate">
                  {project.name}
                </h3>
                <p className="text-xs text-[#5c6370] mt-1.5 line-clamp-2 leading-relaxed font-sans">
                  {project.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#21252b]">
                <div className="flex items-center justify-between text-xs text-[#5c6370] mb-1.5 font-mono">
                  <span>
                    {completedTasks} / {tasks.length} tasks
                  </span>
                  <span className="font-semibold text-[#abb2bf]">
                    {progress}%
                  </span>
                </div>
                <ProgressBar progress={progress} size="sm" />
              </div>
            </div>
          );
        })}

        {/* Create new project shortcut tile */}
        <button
          onClick={onOpenNewProject}
          className="p-4 rounded-xl border border-dashed border-[#282c34] hover:border-[#61afef]/60 hover:bg-[#61afef]/5 flex flex-col items-center justify-center text-center gap-2 group transition-all min-h-[140px]"
        >
          <div className="w-8 h-8 rounded-full bg-[#14161a] border border-[#282c34] flex items-center justify-center text-[#5c6370] group-hover:text-[#61afef] group-hover:border-[#61afef]/40 transition-colors">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-xs font-mono text-[#5c6370] group-hover:text-[#61afef]">
            + Create New Project
          </span>
        </button>
      </div>
    </div>
  );
};
