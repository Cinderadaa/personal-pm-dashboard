import React, { useState } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import {
  LayoutDashboard,
  FolderKanban,
  Calendar as CalendarIcon,
  Search,
  Plus,
  Database,
  RotateCcw,
  Download,
  Upload,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { SupabaseModal } from '../common/SupabaseModal';

interface HeaderProps {
  onOpenCommandPalette: () => void;
  onOpenNewTask: () => void;
  onOpenNewProject: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCommandPalette,
  onOpenNewTask,
}) => {
  const {
    activeView,
    setActiveView,
    resetToDefaults,
    exportDataJSON,
    importDataJSON,
    metrics,
    isSupabaseConnected,
  } = useProjectContext();

  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExport = () => {
    const dataStr = exportDataJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `onedark-pm-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importJsonText.trim()) return;
    const success = importDataJSON(importJsonText);
    if (success) {
      setImportStatus('Data imported successfully!');
      setTimeout(() => {
        setIsDataModalOpen(false);
        setImportStatus(null);
        setImportJsonText('');
      }, 1200);
    } else {
      setImportStatus('Invalid JSON format. Please verify the content.');
    }
  };

  const handleReset = () => {
    if (window.confirm('Clear all projects and tasks back to fresh empty workspace?')) {
      resetToDefaults();
      setIsDataModalOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#21252b] bg-[#181a1f]/90 backdrop-blur-md transition-colors text-[#abb2bf]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          {/* Logo & Navigation Tabs */}
          <div className="flex items-center gap-6">
            <div
              onClick={() => setActiveView('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-6 h-6 rounded-md bg-[#61afef]/15 border border-[#61afef]/30 flex items-center justify-center text-[#61afef] font-mono font-bold text-xs">
                λ
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm tracking-tight text-[#abb2bf] group-hover:text-[#61afef] transition-colors leading-none font-mono">
                  OneDark<span className="text-[#61afef]">.PM</span>
                </span>
                <span className="text-[10px] text-[#5c6370] font-mono mt-0.5 hidden sm:inline">
                  Night Flat
                </span>
              </div>
            </div>

            {/* Nav Tabs */}
            <nav className="hidden md:flex items-center space-x-1 p-1 bg-[#14161a] rounded-lg border border-[#21252b]">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium rounded-md transition-all ${
                  activeView === 'dashboard'
                    ? 'bg-[#1e2227] text-[#61afef] shadow-xs border border-[#2c313a]'
                    : 'text-[#5c6370] hover:text-[#abb2bf]'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveView('projects')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium rounded-md transition-all ${
                  activeView === 'projects' || activeView === 'project_detail'
                    ? 'bg-[#1e2227] text-[#c678dd] shadow-xs border border-[#2c313a]'
                    : 'text-[#5c6370] hover:text-[#abb2bf]'
                }`}
              >
                <FolderKanban className="w-3.5 h-3.5" />
                <span>Projects</span>
              </button>

              <button
                onClick={() => setActiveView('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-medium rounded-md transition-all ${
                  activeView === 'calendar'
                    ? 'bg-[#1e2227] text-[#98c379] shadow-xs border border-[#2c313a]'
                    : 'text-[#5c6370] hover:text-[#abb2bf]'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Calendar</span>
                {metrics.overdueTasks > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e06c75]" />
                )}
              </button>
            </nav>
          </div>

          {/* Quick Search, Supabase Status & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Supabase Connection Status Pill */}
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors ${
                isSupabaseConnected
                  ? 'bg-[#98c379]/10 border-[#98c379]/30 text-[#98c379]'
                  : 'bg-[#14161a] border-[#21252b] text-[#5c6370] hover:border-[#2c313a]'
              }`}
              title="Supabase Cloud Database"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isSupabaseConnected ? 'bg-[#98c379]' : 'bg-[#5c6370]'
                }`}
              />
              <span className="hidden sm:inline">
                {isSupabaseConnected ? 'Supabase' : 'Connect DB'}
              </span>
            </button>

            {/* Quick Command Trigger */}
            <button
              onClick={onOpenCommandPalette}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-mono text-[#5c6370] bg-[#14161a] border border-[#21252b] rounded-lg hover:border-[#2c313a] hover:text-[#abb2bf] transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Quick search...</span>
              <kbd className="hidden sm:inline text-[10px] font-mono bg-[#1e2227] text-[#5c6370] px-1 py-0.2 rounded border border-[#2c313a]">
                ⌘K
              </kbd>
            </button>

            {/* Quick Add Task Button */}
            <button
              onClick={onOpenNewTask}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold bg-[#61afef] text-[#14161a] rounded-lg hover:bg-[#52a1e0] transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">New Task</span>
            </button>

            <div className="h-4 w-px bg-[#21252b] hidden sm:block" />

            {/* Data Management / Backup modal trigger */}
            <button
              onClick={() => setIsDataModalOpen(true)}
              title="Backup & JSON Data"
              className="p-1.5 text-[#5c6370] hover:text-[#abb2bf] rounded-lg hover:bg-[#1e2227] transition-colors"
            >
              <Database className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Supabase Connection Modal */}
      {isSupabaseModalOpen && (
        <SupabaseModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
        />
      )}

      {/* Data Backup / Settings Modal */}
      <Modal
        isOpen={isDataModalOpen}
        onClose={() => {
          setIsDataModalOpen(false);
          setImportStatus(null);
        }}
        title="Workspace Data & JSON Backup"
        description="Your projects and tasks are saved locally or synced to Supabase."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 p-3 text-xs font-mono font-medium rounded-lg border border-[#282c34] hover:bg-[#2c313a] text-[#abb2bf] transition-colors"
            >
              <Download className="w-4 h-4 text-[#61afef]" />
              <span>Export Backup JSON</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 p-3 text-xs font-mono font-medium rounded-lg border border-[#282c34] hover:bg-[#2c313a] text-[#e06c75] transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-[#e06c75]" />
              <span>Clear Workspace</span>
            </button>
          </div>

          <div className="pt-2 border-t border-[#282c34]">
            <label className="block text-xs font-mono text-[#abb2bf] mb-1.5">
              Import Backup (Paste JSON)
            </label>
            <textarea
              rows={4}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='Paste exported JSON content here...'
              className="w-full text-xs font-mono p-2.5 rounded-lg border border-[#282c34] bg-[#14161a] text-[#abb2bf] focus:outline-hidden focus:border-[#61afef]"
            />
            <div className="flex items-center justify-between mt-2">
              {importStatus && (
                <span className="text-xs font-mono text-[#98c379]">
                  {importStatus}
                </span>
              )}
              <button
                onClick={handleImport}
                disabled={!importJsonText.trim()}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold bg-[#61afef] text-[#14161a] rounded-lg disabled:opacity-40"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Restore Data</span>
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
