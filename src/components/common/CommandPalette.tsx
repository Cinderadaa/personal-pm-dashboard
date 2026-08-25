import React, { useState, useEffect, useRef } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { Search, LayoutDashboard, FolderKanban, Calendar, Plus, CheckSquare } from 'lucide-react';
import { CategoryBadge, PriorityBadge } from './Badge';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewTask: () => void;
  onOpenNewProject: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenNewTask,
  onOpenNewProject,
}) => {
  const { projects, tasks, setActiveView, toggleTask } = useProjectContext();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.tags?.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 5);

  const quickActions = [
    {
      id: 'act-new-task',
      title: 'Create new task...',
      icon: Plus,
      color: 'text-[#61afef]',
      action: () => {
        onClose();
        onOpenNewTask();
      },
    },
    {
      id: 'act-new-proj',
      title: 'Create new project...',
      icon: Plus,
      color: 'text-[#c678dd]',
      action: () => {
        onClose();
        onOpenNewProject();
      },
    },
    {
      id: 'act-dashboard',
      title: 'Go to Dashboard',
      icon: LayoutDashboard,
      color: 'text-[#61afef]',
      action: () => {
        setActiveView('dashboard');
        onClose();
      },
    },
    {
      id: 'act-projects',
      title: 'View all Projects',
      icon: FolderKanban,
      color: 'text-[#c678dd]',
      action: () => {
        setActiveView('projects');
        onClose();
      },
    },
    {
      id: 'act-calendar',
      title: 'Open Calendar',
      icon: Calendar,
      color: 'text-[#98c379]',
      action: () => {
        setActiveView('calendar');
        onClose();
      },
    },
  ].filter((a) => a.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 font-mono">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-[#1e2227] border border-[#282c34] rounded-xl shadow-2xl overflow-hidden z-10 animate-fade-in flex flex-col text-[#abb2bf]">
        {/* Search input bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#282c34] bg-[#181a1f]">
          <Search className="w-4 h-4 text-[#5c6370] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, jump to project, or search tasks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-[#abb2bf] placeholder-[#5c6370] focus:outline-hidden"
          />
          <kbd className="hidden sm:inline-block text-[10px] bg-[#14161a] text-[#5c6370] px-1.5 py-0.5 rounded border border-[#282c34]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-4">
          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-[#5c6370] uppercase tracking-wider px-2.5 py-1">
                Navigation & Actions
              </div>
              <div className="space-y-0.5">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#abb2bf] rounded-lg hover:bg-[#2c313a] transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-3.5 h-3.5 ${action.color}`} />
                        <span>{action.title}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Projects */}
          {filteredProjects.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-[#5c6370] uppercase tracking-wider px-2.5 py-1">
                Projects
              </div>
              <div className="space-y-0.5">
                {filteredProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveView('project_detail', p.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#abb2bf] rounded-lg hover:bg-[#2c313a] transition-colors text-left"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FolderKanban className="w-3.5 h-3.5 text-[#c678dd] shrink-0" />
                      <span className="truncate text-[#e5c07b]">{p.name}</span>
                    </div>
                    <CategoryBadge category={p.category} size="sm" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-[#5c6370] uppercase tracking-wider px-2.5 py-1">
                Tasks
              </div>
              <div className="space-y-0.5">
                {filteredTasks.map((t) => (
                  <div
                    key={t.id}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#abb2bf] rounded-lg hover:bg-[#2c313a] transition-colors cursor-pointer"
                    onClick={() => {
                      setActiveView('project_detail', t.projectId);
                      onClose();
                    }}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTask(t.id);
                        }}
                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                          t.status === 'completed'
                            ? 'bg-[#98c379] text-[#14161a] border-transparent'
                            : 'border-[#3e4451]'
                        }`}
                      >
                        {t.status === 'completed' && <CheckSquare className="w-3 h-3" />}
                      </button>
                      <span className={`truncate ${t.status === 'completed' ? 'line-through text-[#5c6370]' : ''}`}>
                        {t.title}
                      </span>
                    </div>
                    <PriorityBadge priority={t.priority} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {quickActions.length === 0 && filteredProjects.length === 0 && filteredTasks.length === 0 && (
            <div className="py-8 text-center text-xs text-[#5c6370]">
              No matching results found for "{query}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#14161a] border-t border-[#282c34] text-[11px] text-[#5c6370]">
          <span>Tip: Press <kbd className="bg-[#1e2227] px-1 py-0.5 rounded border border-[#282c34]">⌘K</kbd> anywhere</span>
          <span className="text-[#61afef]">One Dark Pro Night Flat</span>
        </div>
      </div>
    </div>
  );
};
