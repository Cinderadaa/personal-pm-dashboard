export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatShortDate(dateString?: string): string {
  if (!dateString) return '';
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function isToday(dateString?: string): boolean {
  if (!dateString) return false;
  return dateString === getTodayDateString();
}

export function isPast(dateString?: string): boolean {
  if (!dateString) return false;
  return dateString < getTodayDateString();
}

export function isOverdue(dateString?: string, status?: string): boolean {
  if (!dateString || status === 'completed') return false;
  return isPast(dateString);
}

export function getDaysRemaining(deadlineString?: string): number {
  if (!deadlineString) return 0;
  const today = new Date(getTodayDateString());
  const target = new Date(deadlineString);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatRelativeDate(dateString?: string): string {
  if (!dateString) return '';
  const daysDiff = getDaysRemaining(dateString);
  
  if (daysDiff === 0) return 'Today';
  if (daysDiff === 1) return 'Tomorrow';
  if (daysDiff === -1) return 'Yesterday';
  if (daysDiff < -1) return `${Math.abs(daysDiff)}d overdue`;
  if (daysDiff <= 7) return `In ${daysDiff}d`;
  
  return formatShortDate(dateString);
}

export function getMonthDays(year: number, monthIndex: number) {
  // monthIndex 0-11
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);
  
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Previous month filler days
  const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
  const prevDays = [];
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const prevMonth = monthIndex === 0 ? 12 : monthIndex;
    const prevYear = monthIndex === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    prevDays.push({ day, isCurrentMonth: false, dateStr });
  }
  
  // Current month days
  const currentDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    currentDays.push({ day: i, isCurrentMonth: true, dateStr });
  }
  
  // Next month filler days (fill up to complete weeks)
  const totalDaysSoFar = prevDays.length + currentDays.length;
  const remainingCells = (7 - (totalDaysSoFar % 7)) % 7;
  const nextDays = [];
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonth = monthIndex === 11 ? 1 : monthIndex + 2;
    const nextYear = monthIndex === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    nextDays.push({ day: i, isCurrentMonth: false, dateStr });
  }
  
  return [...prevDays, ...currentDays, ...nextDays];
}
