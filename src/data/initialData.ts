import { Project, Task, CategoryMeta } from '../types';

export const CATEGORIES: CategoryMeta[] = [
  { id: 'internship', label: 'Internship', icon: 'Briefcase', badge: 'bg-[#c678dd]/10 text-[#c678dd] border-[#c678dd]/30' },
  { id: 'study', label: 'Study & Thesis', icon: 'GraduationCap', badge: 'bg-[#61afef]/10 text-[#61afef] border-[#61afef]/30' },
  { id: 'work', label: 'Work & Clients', icon: 'Laptop', badge: 'bg-[#98c379]/10 text-[#98c379] border-[#98c379]/30' },
  { id: 'personal', label: 'Personal Projects', icon: 'Code', badge: 'bg-[#e5c07b]/10 text-[#e5c07b] border-[#e5c07b]/30' },
  { id: 'life', label: 'Life & Health', icon: 'Heart', badge: 'bg-[#e06c75]/10 text-[#e06c75] border-[#e06c75]/30' },
];

export const INITIAL_PROJECTS: Project[] = [];

export const INITIAL_TASKS: Task[] = [];
