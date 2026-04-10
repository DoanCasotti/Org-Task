import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Auth from '@/pages/Auth';

// Mock do AuthContext
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockResetPassword = vi.fn();
const mockUpdatePassword = vi.fn();
const mockUploadAvatar = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signUp: mockSignUp,
    resetPassword: mockResetPassword,
    updatePassword: mockUpdatePassword,
    uploadAvatar: mockUploadAvatar,
  }),
}));

// Mock do sonner
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(window, 'location', {
    value: { hash: '', pathname: '/' },
    writable: true,
  });
});

describe('Auth — modo login', () => {
  it('renderiza o formulário de login', () => {
    render(<Auth />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('chama signIn com email e senha', async () => {
    mockSignIn.mockResolvedValue({ error: null });
    render(<Auth />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'senha123' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() => expect(mockSignIn).toHaveBeenCalledWith('user@test.com', 'senha123'));
  });

  it('exibe link de esqueci minha senha', () => {
    render(<Auth />);
    expect(screen.getByText(/esqueci minha senha/i)).toBeInTheDocument();
  });

  it('navega para modo reset ao clicar em esqueci minha senha', () => {
    render(<Auth />);
    fireEvent.click(screen.getByText(/esqueci minha senha/i));
    expect(screen.getByRole('button', { name: /enviar link/i })).toBeInTheDocument();
  });
});

describe('Auth — modo cadastro', () => {
  it('navega para modo cadastro', () => {
    render(<Auth />);
    fireEvent.click(screen.getByText(/criar conta/i));
    expect(screen.getByLabelText(/nome de usuário/i)).toBeInTheDocument();
  });

  it('rejeita username inválido', async () => {
    const { toast } = await import('sonner');
    render(<Auth />);
    fireEvent.click(screen.getByText(/criar conta/i));
    fireEvent.change(screen.getByLabelText(/nome de usuário/i), { target: { value: 'ab' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/senha/i), { target: { value: 'senha123' } });
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
  });
});

describe('Auth — modo reset', () => {
  it('chama resetPassword com o email', async () => {
    mockResetPassword.mockResolvedValue({ error: null });
    render(<Auth />);
    fireEvent.click(screen.getByText(/esqueci minha senha/i));
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar link/i }));
    await waitFor(() => expect(mockResetPassword).toHaveBeenCalledWith('user@test.com'));
  });
});
