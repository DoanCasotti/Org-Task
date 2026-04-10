import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NewTaskDialog } from '@/components/NewTaskDialog';
import type { Profile } from '@shared/types';

const projects = [{ id: 'p1', name: 'Projeto 1', color: '#07477c', description: null, created_by: 'u1', created_at: '', updated_at: '' }];
const members: Profile[] = [];

describe('NewTaskDialog', () => {
  it('botão criar fica desabilitado sem título', () => {
    render(
      <NewTaskDialog
        projectId="p1"
        projects={projects}
        members={members}
        open={true}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /criar tarefa/i })).toBeDisabled();
  });

  it('botão criar fica habilitado com título preenchido', () => {
    render(
      <NewTaskDialog
        projectId="p1"
        projects={projects}
        members={members}
        open={true}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />
    );
    fireEvent.change(screen.getByPlaceholderText(/o que precisa ser feito/i), {
      target: { value: 'Nova tarefa' },
    });
    expect(screen.getByRole('button', { name: /criar tarefa/i })).not.toBeDisabled();
  });

  it('chama onSubmit com os dados corretos', () => {
    const onSubmit = vi.fn();
    render(
      <NewTaskDialog
        projectId="p1"
        projects={projects}
        members={members}
        open={true}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />
    );
    fireEvent.change(screen.getByPlaceholderText(/o que precisa ser feito/i), {
      target: { value: 'Minha tarefa' },
    });
    fireEvent.click(screen.getByRole('button', { name: /criar tarefa/i }));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Minha tarefa', project_id: 'p1' })
    );
  });

  it('não chama onSubmit com título vazio', () => {
    const onSubmit = vi.fn();
    render(
      <NewTaskDialog
        projectId="p1"
        projects={projects}
        members={members}
        open={true}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /criar tarefa/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
