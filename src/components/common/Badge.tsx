import React from 'react';
import { Category, Priority, TaskStatus, ProjectStatus } from '../../types';

export const CategoryBadge: React.FC<{ category: Category; size?: 'sm' | 'md' }> = ({ category, size = 'sm' }) => {
  const styles: Record<Category, { label: string; dot: string; bg: string; text: string; border: string }> = {
    internship: { label: 'Internship', dot: 'bg-[#c678dd]', bg: 'bg-[#c678dd]/15', text: 'text-[#c678dd]', border: 'border-[#c678dd]/30' },
    study: { label: 'Study & Thesis', dot: 'bg-[#61afef]', bg: 'bg-[#61afef]/15', text: 'text-[#61afef]', border: 'border-[#61afef]/30' },
    work: { label: 'Work & Clients', dot: 'bg-[#98c379]', bg: 'bg-[#98c379]/15', text: 'text-[#98c379]', border: 'border-[#98c379]/30' },
    personal: { label: 'Personal Projects', dot: 'bg-[#e5c07b]', bg: 'bg-[#e5c07b]/15', text: 'text-[#e5c07b]', border: 'border-[#e5c07b]/30' },
    life: { label: 'Life & Health', dot: 'bg-[#e06c75]', bg: 'bg-[#e06c75]/15', text: 'text-[#e06c75]', border: 'border-[#e06c75]/30' },
  };

  const item = styles[category] || styles.personal;
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium font-mono rounded-md border ${item.bg} ${item.text} ${item.border} tracking-tight ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
      {item.label}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority; size?: 'sm' | 'md' }> = ({ priority, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  const styles: Record<Priority, { label: string; icon: string; classes: string }> = {
    urgent: {
      label: 'Urgent',
      icon: '▲▲',
      classes: 'bg-[#e06c75]/20 text-[#e06c75] border border-[#e06c75]/40 font-semibold',
    },
    high: {
      label: 'High',
      icon: '▲',
      classes: 'bg-[#d19a66]/20 text-[#d19a66] border border-[#d19a66]/40 font-medium',
    },
    medium: {
      label: 'Medium',
      icon: '■',
      classes: 'bg-[#61afef]/20 text-[#61afef] border border-[#61afef]/40 font-medium',
    },
    low: {
      label: 'Low',
      icon: '▼',
      classes: 'bg-[#2c313a]/60 text-[#5c6370] border border-[#3e4451]/60 font-medium',
    },
  };

  const item = styles[priority] || styles.medium;

  return (
    <span className={`inline-flex items-center gap-1 rounded-md font-mono tracking-tight ${item.classes} ${sizeClass}`}>
      <span className="text-[9px]">{item.icon}</span>
      {item.label}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: TaskStatus | ProjectStatus; size?: 'sm' | 'md' }> = ({ status, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  const styles: Record<string, { label: string; dot: string; classes: string }> = {
    todo: {
      label: 'To-do',
      dot: 'bg-[#5c6370]',
      classes: 'bg-[#1e2227] border border-[#2c313a] text-[#abb2bf]',
    },
    in_progress: {
      label: 'In Progress',
      dot: 'bg-[#61afef] animate-pulse',
      classes: 'bg-[#61afef]/15 border border-[#61afef]/30 text-[#61afef] font-medium',
    },
    completed: {
      label: 'Done',
      dot: 'bg-[#98c379]',
      classes: 'bg-[#98c379]/15 border border-[#98c379]/30 text-[#98c379] font-medium',
    },
    active: {
      label: 'Active',
      dot: 'bg-[#61afef]',
      classes: 'bg-[#61afef]/15 border border-[#61afef]/30 text-[#61afef] font-medium',
    },
    on_hold: {
      label: 'On Hold',
      dot: 'bg-[#d19a66]',
      classes: 'bg-[#d19a66]/15 border border-[#d19a66]/30 text-[#d19a66]',
    },
  };

  const item = styles[status] || styles.todo;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md font-mono ${item.classes} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
      {item.label}
    </span>
  );
};
