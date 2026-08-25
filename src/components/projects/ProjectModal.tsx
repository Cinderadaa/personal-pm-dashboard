import React, { useState, useEffect } from 'react';
import { Project, Category, Priority, ProjectStatus } from '../../types';
import { useProjectContext } from '../../context/ProjectContext';
import { Modal } from '../common/Modal';
import { CATEGORIES } from '../../data/initialData';
import { getTodayDateString } from '../../utils/dateUtils';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  projectToEdit,
}) => {
  const { addProject, updateProject } = useProjectContext();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('internship');
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [priority, setPriority] = useState<Priority>('medium');
  const [deadline, setDeadline] = useState(getTodayDateString());

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description);
      setCategory(projectToEdit.category);
      setStatus(projectToEdit.status);
      setPriority(projectToEdit.priority);
      setDeadline(projectToEdit.deadline);
    } else {
      setName('');
      setDescription('');
      setCategory('internship');
      setStatus('active');
      setPriority('medium');
      const d = new Date();
      d.setDate(d.getDate() + 14);
      setDeadline(d.toISOString().split('T')[0]);
    }
  }, [projectToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      if (projectToEdit) {
        const saved = await updateProject(projectToEdit.id, {
        name: name.trim(),
        description: description.trim(),
        category,
        status,
        priority,
        deadline,
        });
        if (!saved) throw new Error('Unable to save project to Supabase.');
      } else {
        await addProject({
        name: name.trim(),
        description: description.trim(),
        category,
        status,
        priority,
        deadline,
        });
      }
      onClose();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save project.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={projectToEdit ? 'Edit Project' : 'Create New Project'}
      description="Organize your tasks under this milestone or domain."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-mono">
        {saveError && <p className="text-xs text-[#e06c75]">{saveError}</p>}
        {/* Project Name */}
        <div>
          <label className="block text-xs text-[#abb2bf] mb-1">
            Project Name <span className="text-[#e06c75]">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. AI Thesis, FinTech Internship, Personal PM Dashboard"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-[#282c34] bg-[#14161a] text-[#abb2bf] focus:outline-hidden focus:border-[#61afef]"
          />
        </div>

        {/* Category & Status Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#abb2bf] mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full text-xs p-2.5 rounded-lg border border-[#282c34] bg-[#14161a] text-[#abb2bf] focus:outline-hidden"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-[#abb2bf] mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full text-xs p-2.5 rounded-lg border border-[#282c34] bg-[#14161a] text-[#abb2bf] focus:outline-hidden"
            >
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Priority & Deadline Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#abb2bf] mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full text-xs p-2.5 rounded-lg border border-[#282c34] bg-[#14161a] text-[#abb2bf] focus:outline-hidden"
            >
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-[#abb2bf] mb-1">
              Target Deadline
            </label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-[#282c34] bg-[#14161a] text-[#abb2bf] focus:outline-hidden"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs text-[#abb2bf] mb-1">
            Description & Notes
          </label>
          <textarea
            rows={3}
            placeholder="Key objectives, milestones, or context for this project..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-[#282c34] bg-[#14161a] text-[#abb2bf] focus:outline-hidden focus:border-[#61afef] font-sans"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#282c34]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-[#5c6370] hover:text-[#abb2bf] rounded-lg hover:bg-[#21252b] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-1.5 text-xs font-semibold bg-[#61afef] text-[#14161a] rounded-lg hover:bg-[#52a1e0] transition-colors shadow-xs"
          >
            {isSaving ? 'Saving...' : projectToEdit ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
