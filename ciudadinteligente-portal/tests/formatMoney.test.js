import { describe, it, expect } from 'vitest';

import { formatMoney, parseMoney } from '../src/utils/formatMoney.jsx';

describe('formatMoney', () => {
  it('formatea COP por defecto sin decimales', () => {
    expect(formatMoney(1234567)).toBe('$ 1.234.567');
  });

  it('permite otra moneda', () => {
    expect(formatMoney(2500, 'USD')).toContain('US$');
  });
});

describe('parseMoney', () => {
  it('retorna 0 para vacío o nulo', () => {
    expect(parseMoney('')).toBe(0);
    expect(parseMoney(null)).toBe(0);
  });

  it('convierte strings con símbolos a número', () => {
    expect(parseMoney('$ 1.234.567')).toBe(1234567);
  });

  it('convierte entradas numéricas', () => {
    expect(parseMoney(8900)).toBe(8900);
  });
});
