import { TaskStatus } from '@shared/types';

export function computeReorder(
  tasks: { id: string; status: TaskStatus; order: number }[],
  sourceStatus: TaskStatus,
  destStatus: TaskStatus,
  sourceIndex: number,
  destIndex: number
): { id: string; status: TaskStatus; order: number }[] {
  const getCol = (s: TaskStatus) =>
    tasks.filter(t => t.status === s).sort((a, b) => a.order - b.order);

  const sourceTasks = [...getCol(sourceStatus)];
  const destTasks = sourceStatus === destStatus ? sourceTasks : [...getCol(destStatus)];

  const [moved] = sourceTasks.splice(sourceIndex, 1);

  if (sourceStatus === destStatus) {
    sourceTasks.splice(destIndex, 0, moved);
    return sourceTasks.map((t, i) => ({ id: t.id, status: sourceStatus, order: i }));
  } else {
    destTasks.splice(destIndex, 0, { ...moved, status: destStatus });
    const sourceUpdates = sourceTasks.map((t, i) => ({ id: t.id, status: sourceStatus, order: i }));
    const destUpdates = destTasks.map((t, i) => ({ id: t.id, status: destStatus, order: i }));
    return [...sourceUpdates, ...destUpdates];
  }
}
