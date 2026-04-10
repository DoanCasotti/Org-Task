import { describe, it, expect } from 'vitest';
import { isTaskOverdue } from './dates';

describe('isTaskOverdue', () => {
  it('retorna false quando due_date é null', () => {
    expect(isTaskOverdue(null, 'todo')).toBe(false);
  });

  it('retorna false quando status é done', () => {
    expect(isTaskOverdue('2020-01-01', 'done')).toBe(false);
  });

  it('retorna true para data passada com status todo', () => {
    expect(isTaskOverdue('2020-01-01', 'todo')).toBe(true);
  });

  it('retorna true para data passada com status in_progress', () => {
    expect(isTaskOverdue('2020-01-01', 'in_progress')).toBe(true);
  });

  it('retorna false para data futura', () => {
    expect(isTaskOverdue('2099-12-31', 'todo')).toBe(false);
  });

  it('retorna false para hoje (não está atrasado ainda)', () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    expect(isTaskOverdue(`${yyyy}-${mm}-${dd}`, 'todo')).toBe(false);
  });
});
