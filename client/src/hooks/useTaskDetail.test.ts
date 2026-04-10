import { describe, it, expect } from 'vitest';

// Testa a lógica de detecção de @menção (extraída como função pura para teste)
function detectMention(text: string): string | null {
  const atIndex = text.lastIndexOf('@');
  if (atIndex === -1) return null;
  const after = text.slice(atIndex + 1);
  if (after === '' || /^\w+$/.test(after)) return after;
  return null;
}

describe('detectMention', () => {
  it('retorna null quando não há @', () => {
    expect(detectMention('olá mundo')).toBeNull();
  });

  it('retorna string vazia quando @ está no final', () => {
    expect(detectMention('olá @')).toBe('');
  });

  it('retorna o termo após @', () => {
    expect(detectMention('olá @joao')).toBe('joao');
  });

  it('retorna null quando há espaço após @mention', () => {
    expect(detectMention('olá @joao silva')).toBeNull();
  });

  it('detecta @ no meio do texto', () => {
    expect(detectMention('texto @ana')).toBe('ana');
  });
});

// Testa a lógica de inserção de mention
function insertMention(text: string, username: string): string {
  const atIndex = text.lastIndexOf('@');
  return text.slice(0, atIndex) + `@${username} `;
}

describe('insertMention', () => {
  it('substitui @ pelo @username', () => {
    expect(insertMention('olá @', 'joao')).toBe('olá @joao ');
  });

  it('substitui @parcial pelo @username completo', () => {
    expect(insertMention('olá @jo', 'joao')).toBe('olá @joao ');
  });

  it('adiciona espaço após o username', () => {
    const result = insertMention('@', 'ana');
    expect(result.endsWith(' ')).toBe(true);
  });
});
