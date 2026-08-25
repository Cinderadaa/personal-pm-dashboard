import React, { useState, useEffect } from 'react';
import { ProjectProvider, useProjectContext } from './context/ProjectContext';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProjectsView } from './components/projects/ProjectsView';
import { ProjectDetailView } from './components/projects/ProjectDetailView';
import { CalendarView } from './components/calendar/CalendarView';
import { CommandPalette } from './components/common/CommandPalette';
import { TaskModal } from './components/projects/TaskModal';
import { ProjectModal } from './components/projects/ProjectModal';
import { Task } from './types';

const MainAppContent: React.FC = () => {
  const { activeView, activeProjectId, isInitialLoading, supabaseError } = useProjectContext();

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isGlobalNewTaskOpen, setIsGlobalNewTaskOpen] = useState(false);
  const [isGlobalNewProjectOpen, setIsGlobalNewProjectOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K for command palette, 'c' for new task)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectTask = (task: Task) => {
    setTaskToEdit(task);
    setIsGlobalNewTaskOpen(true);
  };

  if (isInitialLoading) {
    return <div className="min-h-screen bg-white dark:bg-[#09090b] text-neutral-500 flex items-center justify-center font-mono text-sm">Loading workspace...</div>;
  }

  if (supabaseError) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#09090b] text-neutral-500 flex items-center justify-center p-6 font-mono text-sm">
        <div className="max-w-lg text-center space-y-3">
          <p className="text-[#e06c75]">Unable to load Supabase data.</p>
          <p>{supabaseError}</p>
          <p className="text-xs">Check your environment variables and database schema, then reload.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <Header
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenNewTask={() => {
          setTaskToEdit(null);
          setIsGlobalNewTaskOpen(true);
        }}
        onOpenNewProject={() => setIsGlobalNewProjectOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 md:pb-12">
        {activeView === 'dashboard' && (
          <DashboardView
            onOpenNewTask={() => {
              setTaskToEdit(null);
              setIsGlobalNewTaskOpen(true);
            }}
            onOpenNewProject={() => setIsGlobalNewProjectOpen(true)}
            onSelectTask={handleSelectTask}
          />
        )}

        {activeView === 'projects' && (
          <ProjectsView
            onOpenNewProject={() => setIsGlobalNewProjectOpen(true)}
          />
        )}

        {activeView === 'project_detail' && activeProjectId && (
          <ProjectDetailView projectId={activeProjectId} />
        )}

        {activeView === 'calendar' && <CalendarView />}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        onOpenNewTask={() => {
          setTaskToEdit(null);
          setIsGlobalNewTaskOpen(true);
        }}
      />

      {/* Global Command Palette (Cmd + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenNewTask={() => {
          setTaskToEdit(null);
          setIsGlobalNewTaskOpen(true);
        }}
        onOpenNewProject={() => setIsGlobalNewProjectOpen(true)}
      />

      {/* Global Task Creation / Editing Modal */}
      {isGlobalNewTaskOpen && (
        <TaskModal
          isOpen={isGlobalNewTaskOpen}
          onClose={() => {
            setIsGlobalNewTaskOpen(false);
            setTaskToEdit(null);
          }}
          taskToEdit={taskToEdit}
        />
      )}

      {/* Global Project Creation Modal */}
      {isGlobalNewProjectOpen && (
        <ProjectModal
          isOpen={isGlobalNewProjectOpen}
          onClose={() => setIsGlobalNewProjectOpen(false)}
        />
      )}
    </div>
  );
};

export function App() {
  return (
    <ProjectProvider>
      <MainAppContent />
    </ProjectProvider>
  );
}

export default App;
