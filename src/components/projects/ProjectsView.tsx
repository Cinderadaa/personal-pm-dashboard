import React, { useState } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { Project, Category, ProjectStatus } from '../../types';
import { ProjectCard } from './ProjectCard';
import { ProjectModal } from './ProjectModal';
import { CATEGORIES } from '../../data/initialData';
import { Plus, Search, FolderKanban } from 'lucide-react';

interface ProjectsViewProps {
  onOpenNewProject: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onOpenNewProject }) => {
  const { projects, deleteProject, getProjectProgress, getProjectTasks } = useProjectContext();
  const [selectedCat, setSelectedCat] = useState<Category | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'deadline' | 'progress' | 'name' | 'tasks'>('deadline');
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Filter & Sort Projects
  const filteredProjects = projects
    .filter((p) => {
      const matchCat = selectedCat === 'all' || p.category === selectedCat;
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchStatus && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'deadline') return a.deadline.localeCompare(b.deadline);
      if (sortBy === 'progress') return getProjectProgress(b.id) - getProjectProgress(a.id);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'tasks') return getProjectTasks(b.id).length - getProjectTasks(a.id).length;
      return 0;
    });

  const handleEdit = (proj: Project) => {
    setProjectToEdit(proj);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this project and all associated tasks?')) {
      deleteProject(id);
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-fade-in text-[#abb2bf]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#21252b] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#abb2bf] font-mono">
            Projects & Milestones
          </h1>
          <p className="text-sm text-[#5c6370] mt-1 font-sans">
            Organize all major initiatives across work, university, internship, and personal growth.
          </p>
        </div>

        <button
          onClick={onOpenNewProject}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#61afef] text-[#14161a] text-xs font-mono font-semibold rounded-lg hover:bg-[#52a1e0] transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="space-y-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedCat === 'all'
                ? 'bg-[#1e2227] text-[#61afef] border border-[#2c313a] shadow-xs'
                : 'bg-[#14161a] text-[#5c6370] hover:text-[#abb2bf] border border-[#21252b]'
            }`}
          >
            All Projects ({projects.length})
          </button>

          {CATEGORIES.map((cat) => {
            const count = projects.filter((p) => p.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  selectedCat === cat.id
                    ? 'bg-[#1e2227] text-[#c678dd] border border-[#2c313a] shadow-xs'
                    : 'bg-[#14161a] text-[#5c6370] hover:text-[#abb2bf] border border-[#21252b]'
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Search, Status & Sort Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5c6370]" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-mono bg-[#14161a] border border-[#282c34] rounded-lg text-[#abb2bf] placeholder-[#5c6370] focus:outline-hidden focus:border-[#61afef]"
            />
          </div>

          {/* Status & Sort Selectors */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end font-mono">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
              className="px-2.5 py-1.5 text-xs bg-[#14161a] border border-[#282c34] rounded-lg text-[#abb2bf] focus:outline-hidden"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-[#14161a] border border-[#282c34] rounded-lg text-[#abb2bf] focus:outline-hidden font-mono"
            >
              <option value="deadline">Sort: Deadline</option>
              <option value="progress">Sort: Progress %</option>
              <option value="tasks">Sort: Task Count</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-[#282c34] rounded-xl bg-[#181a1f]/30">
          <FolderKanban className="w-10 h-10 mx-auto text-[#2c313a] mb-3" />
          <h3 className="text-sm font-semibold text-[#abb2bf] font-mono">
            No projects found
          </h3>
          <p className="text-xs text-[#5c6370] mt-1 max-w-sm mx-auto font-sans">
            Create your first project to start organizing your tasks and tracking progress.
          </p>
          <button
            onClick={onOpenNewProject}
            className="mt-4 px-3.5 py-1.5 text-xs font-mono font-semibold bg-[#61afef] text-[#14161a] rounded-lg inline-flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Create Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditModalOpen && (
        <ProjectModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setProjectToEdit(null);
          }}
          projectToEdit={projectToEdit}
        />
      )}
    </div>
  );
};
