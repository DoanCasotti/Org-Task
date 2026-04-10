import { isPast, isToday, parseISO } from 'date-fns';

export function isTaskOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === 'done') return false;
  const date = parseISO(dueDate + 'T00:00:00');
  return isPast(date) && !isToday(date);
}
