import { describe, it, expect } from 'vitest';
import { computeReorder } from './kanban';

const tasks = [
  { id: 'a', status: 'todo' as const, order: 0 },
  { id: 'b', status: 'todo' as const, order: 1 },
  { id: 'c', status: 'in_progress' as const, order: 0 },
];

describe('computeReorder', () => {
  it('reordena dentro da mesma coluna', () => {
    const result = computeReorder(tasks, 'todo', 'todo', 0, 1);
    const todo = result.filter(t => t.status === 'todo').sort((a, b) => a.order - b.order);
    expect(todo[0].id).toBe('b');
    expect(todo[1].id).toBe('a');
  });

  it('move tarefa para outra coluna', () => {
    const result = computeReorder(tasks, 'todo', 'in_progress', 0, 0);
    const moved = result.find(t => t.id === 'a');
    expect(moved?.status).toBe('in_progress');
    expect(moved?.order).toBe(0);
  });

  it('atualiza order das tarefas restantes na coluna de origem', () => {
    const result = computeReorder(tasks, 'todo', 'in_progress', 0, 0);
    const remaining = result.find(t => t.id === 'b');
    expect(remaining?.order).toBe(0);
  });

  it('preserva tarefas não afetadas', () => {
    const result = computeReorder(tasks, 'todo', 'todo', 0, 1);
    const inProgress = result.find(t => t.id === 'c');
    expect(inProgress).toBeUndefined(); // não retorna tarefas não afetadas
  });

  it('move para posição específica na coluna de destino', () => {
    const result = computeReorder(tasks, 'todo', 'in_progress', 0, 1);
    const moved = result.find(t => t.id === 'a');
    expect(moved?.order).toBe(1);
  });
});
