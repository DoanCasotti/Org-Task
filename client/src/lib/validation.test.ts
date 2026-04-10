import { describe, it, expect } from 'vitest';
import {
  validateTaskTitle,
  validateProjectName,
  validateUsername,
  validatePassword,
} from './validation';

describe('validateTaskTitle', () => {
  it('aceita título válido', () => expect(validateTaskTitle('Minha tarefa')).toBeNull());
  it('rejeita título vazio', () => expect(validateTaskTitle('')).toBeTruthy());
  it('rejeita título só com espaços', () => expect(validateTaskTitle('   ')).toBeTruthy());
  it('rejeita título muito longo', () => expect(validateTaskTitle('a'.repeat(501))).toBeTruthy());
  it('aceita título com exatamente 500 chars', () => expect(validateTaskTitle('a'.repeat(500))).toBeNull());
});

describe('validateProjectName', () => {
  it('aceita nome válido', () => expect(validateProjectName('Meu Projeto')).toBeNull());
  it('rejeita nome vazio', () => expect(validateProjectName('')).toBeTruthy());
  it('rejeita nome muito longo', () => expect(validateProjectName('a'.repeat(201))).toBeTruthy());
});

describe('validateUsername', () => {
  it('aceita username válido', () => expect(validateUsername('joao_silva')).toBeNull());
  it('aceita username com hífen', () => expect(validateUsername('joao-silva')).toBeNull());
  it('rejeita username vazio', () => expect(validateUsername('')).toBeTruthy());
  it('rejeita username curto', () => expect(validateUsername('ab')).toBeTruthy());
  it('rejeita username com espaço', () => expect(validateUsername('joao silva')).toBeTruthy());
  it('rejeita username com caractere especial', () => expect(validateUsername('joao@silva')).toBeTruthy());
  it('rejeita username muito longo', () => expect(validateUsername('a'.repeat(31))).toBeTruthy());
});

describe('validatePassword', () => {
  it('aceita senha válida', () => expect(validatePassword('senha123')).toBeNull());
  it('rejeita senha curta', () => expect(validatePassword('12345')).toBeTruthy());
  it('aceita senha com exatamente 6 chars', () => expect(validatePassword('123456')).toBeNull());
});
