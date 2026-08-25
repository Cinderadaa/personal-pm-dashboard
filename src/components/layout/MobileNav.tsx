import React from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { LayoutDashboard, FolderKanban, Calendar, Plus } from 'lucide-react';

interface MobileNavProps {
  onOpenNewTask: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenNewTask }) => {
  const { activeView, setActiveView } = useProjectContext();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#181a1f]/95 backdrop-blur-lg border-t border-[#21252b] px-6 py-2 flex items-center justify-between text-[#abb2bf]">
      <button
        onClick={() => setActiveView('dashboard')}
        className={`flex flex-col items-center gap-1 text-[10px] font-mono font-medium ${
          activeView === 'dashboard' ? 'text-[#61afef]' : 'text-[#5c6370]'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Dashboard</span>
      </button>

      <button
        onClick={() => setActiveView('projects')}
        className={`flex flex-col items-center gap-1 text-[10px] font-mono font-medium ${
          activeView === 'projects' || activeView === 'project_detail'
            ? 'text-[#c678dd]'
            : 'text-[#5c6370]'
        }`}
      >
        <FolderKanban className="w-5 h-5" />
        <span>Projects</span>
      </button>

      {/* Floating Add Button */}
      <button
        onClick={onOpenNewTask}
        className="w-10 h-10 -mt-5 rounded-full bg-[#61afef] text-[#14161a] flex items-center justify-center shadow-lg active:scale-95 transition-transform font-bold"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
      </button>

      <button
        onClick={() => setActiveView('calendar')}
        className={`flex flex-col items-center gap-1 text-[10px] font-mono font-medium ${
          activeView === 'calendar' ? 'text-[#98c379]' : 'text-[#5c6370]'
        }`}
      >
        <Calendar className="w-5 h-5" />
        <span>Calendar</span>
      </button>
    </div>
  );
};
