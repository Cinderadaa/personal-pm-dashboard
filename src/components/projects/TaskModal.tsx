import React, { useState, useEffect } from 'react';
import { Task, Priority, TaskStatus, Subtask } from '../../types';
import { useProjectContext } from '../../context/ProjectContext';
import { Modal } from '../common/Modal';
import { getTodayDateString } from '../../utils/dateUtils';
import { Plus, Trash2, CheckSquare, Square, Tag } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
  defaultProjectId?: string;
  defaultStatus?: TaskStatus;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  defaultProjectId,
  defaultStatus = 'todo',
}) => {
  const { projects, addTask, updateTask } = useProjectContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId || projects[0]?.id || '');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [dueTime, setDueTime] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setProjectId(taskToEdit.projectId);
      setStatus(taskToEdit.status);
      setPriority(taskToEdit.priority);
      setDueDate(taskToEdit.dueDate);
      setDueTime(taskToEdit.dueTime || '');
      setTagsInput((taskToEdit.tags || []).join(', '));
      setSubtasks(taskToEdit.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setProjectId(defaultProjectId || projects[0]?.id || '');
      setStatus(defaultStatus);
      setPriority('medium');
      setDueDate(getTodayDateString());
      setDueTime('');
      setTagsInput('');
      setSubtasks([]);
      setNewSubtaskTitle('');
    }
  }, [taskToEdit, isOpen, defaultProjectId, defaultStatus, projects]);

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSt: Subtask = {
      id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, newSt]);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st))
    );
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title: title.trim(),
        description: description.trim(),
        projectId,
        status,
        priority,
        dueDate,
        dueTime: dueTime || undefined,
        tags,
        subtasks,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        projectId,
        status,
        priority,
        dueDate,
        dueTime: dueTime || undefined,
        tags,
        subtasks,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? 'Edit Task' : 'Create New Task'}
      description="Define task details, checklist items, priority, and timeline."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-mono">
        {/* Title */}
        <div>
          <label className="block text-xs text-[#abb2bf] mb-1">
            Task Title <span className="text-[#e06c75]">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Implement OAuth Flow, Review Thesis Notes, Prepare Presentation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-[#282c34] bg-[#14161a] text-[#abb2bf] focus:outline-hidden focus:border-[#61afef]"
          />
        </div>

        {/* Project & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#abb2bf] mb-1">
              Project Workspace
            </label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-[#282c34] bg-[#14161a] text-[#abb2bf] focus:outline-hidden"
            >
              {projects.length === 0 && (
                <option value="">(Will create General Project)</option>
              )}
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
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
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full text-xs p-2.5 rounded-lg border border-[#282c34] bg-[#14161a] text-[#abb2bf] focus:outline-hidden"
            >
              <option value="todo">To-do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Priority, Due Date, Due Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              Due Date
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-[#282c34] bg-[#14161a] text-[#abb2bf] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs text-[#abb2bf] mb-1">
              Time (Optional)
            </label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
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
            rows={2}
            placeholder="Details, references, steps..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-[#282c34] bg-[#14161a] text-[#abb2bf] focus:outline-hidden focus:border-[#61afef] font-sans"
          />
        </div>

        {/* Subtasks / Checklist */}
        <div className="pt-2 border-t border-[#282c34]">
          <label className="block text-xs text-[#abb2bf] mb-1.5 flex items-center justify-between">
            <span>Checklist & Subtasks</span>
            {subtasks.length > 0 && (
              <span className="text-[10px] text-[#5c6370]">
                {subtasks.filter((s) => s.completed).length}/{subtasks.length} done
              </span>
            )}
          </label>

          <div className="space-y-1.5 mb-2.5 max-h-36 overflow-y-auto">
            {subtasks.map((st) => (
              <div
                key={st.id}
                className="flex items-center justify-between p-1.5 rounded-md bg-[#14161a] border border-[#21252b] text-xs"
              >
                <button
                  type="button"
                  onClick={() => handleToggleSubtask(st.id)}
                  className="flex items-center gap-2 text-left flex-1 min-w-0"
                >
                  {st.completed ? (
                    <CheckSquare className="w-3.5 h-3.5 text-[#98c379] shrink-0" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-[#5c6370] shrink-0" />
                  )}
                  <span
                    className={`truncate ${
                      st.completed ? 'line-through text-[#5c6370]' : 'text-[#abb2bf]'
                    }`}
                  >
                    {st.title}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteSubtask(st.id)}
                  className="text-[#5c6370] hover:text-[#e06c75] p-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add subtask item..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubtask();
                }
              }}
              className="flex-1 text-xs p-2 rounded-lg border border-[#282c34] bg-[#14161a] text-[#abb2bf] focus:outline-hidden"
            />
            <button
              type="button"
              onClick={handleAddSubtask}
              className="px-3 py-1.5 text-xs font-semibold bg-[#21252b] text-[#61afef] border border-[#282c34] rounded-lg hover:bg-[#2c313a] flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs text-[#abb2bf] mb-1 flex items-center gap-1">
            <Tag className="w-3 h-3 text-[#5c6370]" />
            <span>Tags (comma separated)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. backend, docs, thesis, urgent"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full text-xs p-2 rounded-lg border border-[#282c34] bg-[#14161a] text-[#abb2bf] focus:outline-hidden"
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
            className="px-4 py-1.5 text-xs font-semibold bg-[#61afef] text-[#14161a] rounded-lg hover:bg-[#52a1e0] transition-colors shadow-xs"
          >
            {taskToEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
