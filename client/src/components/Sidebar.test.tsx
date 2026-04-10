import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '@/components/Sidebar';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ profile: { username: 'testuser', avatar_url: null }, signOut: vi.fn() }),
}));

const projects = [
  { id: 'p1', name: 'Projeto Alpha', color: '#07477c', description: null, created_by: 'u1', created_at: '', updated_at: '' },
];

describe('Sidebar — confirmação de delete', () => {
  it('não chama onDeleteProject ao clicar no ícone de lixeira diretamente', () => {
    const onDelete = vi.fn();
    render(
      <Sidebar
        projects={projects}
        selectedProjectId={null}
        onSelectProject={vi.fn()}
        onDeleteProject={onDelete}
        onCreateProject={vi.fn()}
        view="kanban"
        onViewChange={vi.fn()}
        taskCounts={{}}
      />
    );
    const deleteBtn = screen.getByTitle(/deletar projeto/i);
    fireEvent.click(deleteBtn);
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByText(/deletar projeto/i)).toBeInTheDocument();
  });

  it('chama onDeleteProject após confirmar no dialog', () => {
    const onDelete = vi.fn();
    render(
      <Sidebar
        projects={projects}
        selectedProjectId={null}
        onSelectProject={vi.fn()}
        onDeleteProject={onDelete}
        onCreateProject={vi.fn()}
        view="kanban"
        onViewChange={vi.fn()}
        taskCounts={{}}
      />
    );
    fireEvent.click(screen.getByTitle(/deletar projeto/i));
    fireEvent.click(screen.getByRole('button', { name: /^deletar$/i }));
    expect(onDelete).toHaveBeenCalledWith('p1');
  });

  it('não chama onDeleteProject ao cancelar', () => {
    const onDelete = vi.fn();
    render(
      <Sidebar
        projects={projects}
        selectedProjectId={null}
        onSelectProject={vi.fn()}
        onDeleteProject={onDelete}
        onCreateProject={vi.fn()}
        view="kanban"
        onViewChange={vi.fn()}
        taskCounts={{}}
      />
    );
    fireEvent.click(screen.getByTitle(/deletar projeto/i));
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(onDelete).not.toHaveBeenCalled();
  });
});
