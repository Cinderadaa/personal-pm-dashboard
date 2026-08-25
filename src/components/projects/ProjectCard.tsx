import React from 'react';
import { Project } from '../../types';
import { useProjectContext } from '../../context/ProjectContext';
import { CategoryBadge, StatusBadge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { formatRelativeDate } from '../../utils/dateUtils';
import { Calendar, MoreVertical, Edit2, Trash2 } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
  const { getProjectTasks, getProjectProgress, setActiveView } = useProjectContext();
  const [showMenu, setShowMenu] = React.useState(false);

  const tasks = getProjectTasks(project.id);
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const progress = getProjectProgress(project.id);

  return (
    <div
      onClick={() => setActiveView('project_detail', project.id)}
      className="bg-[#1e2227] border border-[#282c34] hover:border-[#3e4451] rounded-xl p-5 shadow-xs transition-all cursor-pointer group relative flex flex-col justify-between text-[#abb2bf]"
    >
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <CategoryBadge category={project.category} size="sm" />
            <StatusBadge status={project.status} size="sm" />
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded-md text-[#5c6370] hover:text-[#abb2bf] hover:bg-[#2c313a] transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div
                  className="absolute right-0 top-full mt-1 w-32 bg-[#181a1f] border border-[#282c34] rounded-lg shadow-xl py-1 z-30 animate-fade-in font-mono"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(project);
                    }}
                    className="w-full px-3 py-1.5 text-xs text-left text-[#abb2bf] hover:bg-[#2c313a] flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-[#61afef]" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(project.id);
                    }}
                    className="w-full px-3 py-1.5 text-xs text-left text-[#e06c75] hover:bg-[#2c313a] flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#e06c75]" />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Project Title & Description */}
        <h3 className="text-base font-semibold text-[#abb2bf] font-mono group-hover:text-[#61afef] transition-colors">
          {project.name}
        </h3>
        <p className="text-xs text-[#5c6370] mt-1.5 line-clamp-2 leading-relaxed font-sans">
          {project.description}
        </p>
      </div>

      {/* Footer Details: Deadline + Tasks Count + Progress */}
      <div className="mt-5 pt-3.5 border-t border-[#21252b]">
        <div className="flex items-center justify-between text-xs text-[#5c6370] mb-2 font-mono">
          <span className="flex items-center gap-1 text-[11px]">
            <Calendar className="w-3.5 h-3.5 opacity-70" />
            {formatRelativeDate(project.deadline)}
          </span>

          <span className="text-[11px]">
            {completedTasks}/{tasks.length} tasks
          </span>
        </div>

        <div className="space-y-1">
          <ProgressBar progress={progress} size="sm" />
          <div className="flex justify-between items-center text-[10px] font-mono text-[#5c6370]">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
